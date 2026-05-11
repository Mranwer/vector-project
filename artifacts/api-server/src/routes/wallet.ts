import { Router, Response } from "express";
import Razorpay from "razorpay";
import crypto from "crypto";
import { requireAuth, AuthRequest } from "../middlewares/auth";
import { User } from "../models/User";
import { Transaction } from "../models/Transaction";
import { Payment } from "../models/Payment";

const router = Router();

const razorpay = new Razorpay({
  key_id: process.env["RAZORPAY_KEY_ID"] || "",
  key_secret: process.env["RAZORPAY_KEY_SECRET"] || "",
});

// GET /api/wallet
router.get("/wallet", requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user!.id);
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const [totalRechargedAgg, totalSpentAgg] = await Promise.all([
      Transaction.aggregate([
        { $match: { userId: user._id, type: "credit", status: "success" } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      Transaction.aggregate([
        { $match: { userId: user._id, type: "debit", status: "success" } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
    ]);

    res.json({
      balance: user.walletBalance,
      userId: user._id.toString(),
      totalRecharged: totalRechargedAgg[0]?.total ?? 0,
      totalSpent: totalSpentAgg[0]?.total ?? 0,
    });
  } catch (err) {
    req.log.error({ err }, "Get wallet error");
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/wallet/transactions
router.get("/wallet/transactions", requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const page = Math.max(1, parseInt(req.query["page"] as string) || 1);
    const limit = Math.min(50, parseInt(req.query["limit"] as string) || 10);
    const skip = (page - 1) * limit;

    const [transactions, total] = await Promise.all([
      Transaction.find({ userId: req.user!.id }).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Transaction.countDocuments({ userId: req.user!.id }),
    ]);

    res.json({
      transactions: transactions.map((t) => ({
        id: t._id.toString(),
        userId: t.userId.toString(),
        type: t.type,
        amount: t.amount,
        description: t.description,
        status: t.status,
        referenceId: t.referenceId || null,
        createdAt: t.createdAt.toISOString(),
      })),
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (err) {
    req.log.error({ err }, "Get transactions error");
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/wallet/recharge/order — creates Razorpay order
router.post("/wallet/recharge/order", requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { amount } = req.body;
    if (!amount || amount < 10) {
      res.status(400).json({ error: "Minimum recharge amount is ₹10 (10 points)" });
      return;
    }

    const order = await razorpay.orders.create({
      amount: amount * 100, // paise
      currency: "INR",
      receipt: `rcpt_${Date.now()}`,
    });

    // Create a pending payment record
    await Payment.create({
      userId: req.user!.id,
      amount,
      pointsAdded: amount, // ₹1 = 1 point
      razorpayOrderId: order.id,
      status: "created",
    });

    res.json({
      orderId: order.id,
      amount: amount * 100,
      currency: "INR",
      keyId: process.env["RAZORPAY_KEY_ID"] || "",
    });
  } catch (err) {
    req.log.error({ err }, "Create recharge order error");
    res.status(500).json({ error: "Failed to create payment order" });
  }
});

// POST /api/wallet/recharge/verify — verifies payment and credits wallet
router.post("/wallet/recharge/verify", requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      res.status(400).json({ error: "Missing payment verification data" });
      return;
    }

    // Verify signature
    const expectedSignature = crypto
      .createHmac("sha256", process.env["RAZORPAY_KEY_SECRET"] || "")
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest("hex");

    if (expectedSignature !== razorpaySignature) {
      // Mark payment as failed
      await Payment.findOneAndUpdate(
        { razorpayOrderId },
        { status: "failed", razorpayPaymentId }
      );
      res.status(400).json({ error: "Payment verification failed: Invalid signature" });
      return;
    }

    // Check if already processed
    const payment = await Payment.findOne({ razorpayOrderId });
    if (!payment) {
      res.status(404).json({ error: "Payment record not found" });
      return;
    }
    if (payment.status === "paid") {
      res.status(400).json({ error: "Payment already processed" });
      return;
    }

    // Ensure payment belongs to this user
    if (payment.userId.toString() !== req.user!.id) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    // Update payment and credit wallet atomically
    const [updatedUser] = await Promise.all([
      User.findByIdAndUpdate(
        req.user!.id,
        { $inc: { walletBalance: payment.pointsAdded } },
        { new: true }
      ),
      Payment.findOneAndUpdate(
        { razorpayOrderId },
        { status: "paid", razorpayPaymentId }
      ),
      Transaction.create({
        userId: req.user!.id,
        type: "credit",
        amount: payment.pointsAdded,
        description: `Wallet recharge via Razorpay`,
        status: "success",
        referenceId: razorpayPaymentId,
      }),
    ]);

    if (!updatedUser) {
      res.status(500).json({ error: "Failed to update wallet" });
      return;
    }

    res.json({
      balance: updatedUser.walletBalance,
      userId: updatedUser._id.toString(),
      totalRecharged: 0, // not needed here
      totalSpent: 0,
    });
  } catch (err) {
    req.log.error({ err }, "Verify recharge error");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
