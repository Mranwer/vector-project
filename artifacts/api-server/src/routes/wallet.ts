import { Router, Response } from "express";
import Razorpay from "razorpay";
import crypto from "crypto";
import { requireAuth, AuthRequest } from "../middlewares/auth";
import { User } from "../models/User";
import { Transaction } from "../models/Transaction";
import { Payment } from "../models/Payment";

const router = Router();

/* =========================
   RAZORPAY INSTANCE (SAFE SINGLETON)
========================= */
let razorpayInstance: Razorpay | null = null;

function getRazorpay() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    throw new Error("❌ Razorpay environment variables are missing");
  }

  if (!razorpayInstance) {
    razorpayInstance = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });
  }

  return razorpayInstance;
}

/* =========================
   GET WALLET
========================= */
router.get("/wallet", requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user!.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    const [recharge, spent] = await Promise.all([
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
      totalRecharged: recharge[0]?.total ?? 0,
      totalSpent: spent[0]?.total ?? 0,
    });
  } catch (err) {
    req.log.error({ err }, "Wallet error");
    res.status(500).json({ error: "Internal server error" });
  }
});

/* =========================
   TRANSACTIONS
========================= */
router.get("/wallet/transactions", requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Number(req.query.limit) || 10);
    const skip = (page - 1) * limit;

    const [transactions, total] = await Promise.all([
      Transaction.find({ userId: req.user!.id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Transaction.countDocuments({ userId: req.user!.id }),
    ]);

    res.json({
      transactions,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (err) {
    req.log.error({ err }, "Transactions error");
    res.status(500).json({ error: "Internal server error" });
  }
});

/* =========================
   CREATE ORDER
========================= */
router.post("/wallet/recharge/order", requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { amount,points } = req.body;

    if (!amount || amount < 10) {
      return res.status(400).json({ error: "Minimum recharge is ₹10" });
    }

    const razorpay = getRazorpay();

    const order = await razorpay.orders.create({
      amount: amount * 100,
      currency: "INR",
      receipt: `rcpt_${Date.now()}`,
    });

await Payment.create({
  userId: req.user!.id,
  amount,
  pointsAdded: points,   // ✅ rupees nahi, actual points save honge
  razorpayOrderId: order.id,
  status: "created",
});

    res.json({
      orderId: order.id,
      amount: amount * 100,
      currency: "INR",
      keyId: process.env.RAZORPAY_KEY_ID || "",
    });
  } catch (err) {
    req.log.error({ err }, "Order creation error");
    res.status(500).json({ error: "Failed to create order" });
  }
});

/* =========================
   VERIFY PAYMENT
========================= */
router.post("/wallet/recharge/verify", requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return res.status(400).json({ error: "Missing payment data" });
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
      return res.status(500).json({ error: "Razorpay secret missing" });
    }

    const expectedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest("hex");

    if (expectedSignature !== razorpaySignature) {
      await Payment.findOneAndUpdate(
        { razorpayOrderId },
        { status: "failed", razorpayPaymentId }
      );
      return res.status(400).json({ error: "Invalid signature" });
    }

    const payment = await Payment.findOne({ razorpayOrderId });

    if (!payment) return res.status(404).json({ error: "Payment not found" });
    if (payment.status === "paid") return res.status(400).json({ error: "Already processed" });

    if (payment.userId.toString() !== req.user!.id) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const [user] = await Promise.all([
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
        description: "Wallet recharge via Razorpay",
        status: "success",
        referenceId: razorpayPaymentId,
      }),
    ]);

    if (!user) {
      return res.status(500).json({ error: "Wallet update failed" });
    }

    res.json({
      balance: user.walletBalance,
      userId: user._id.toString(),
    });
  } catch (err) {
    req.log.error({ err }, "Verify payment error");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;