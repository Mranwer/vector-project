import { Router, Response } from "express";
import { requireAuth, AuthRequest } from "../middlewares/auth";
import { Payment } from "../models/Payment";

const router = Router();

function formatPayment(p: InstanceType<typeof Payment>) {
  return {
    id: p._id.toString(),
    userId: p.userId.toString(),
    amount: p.amount,
    pointsAdded: p.pointsAdded,
    razorpayOrderId: p.razorpayOrderId,
    razorpayPaymentId: p.razorpayPaymentId || null,
    status: p.status,
    createdAt: p.createdAt.toISOString(),
  };
}

// GET /api/payments
router.get("/payments", requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const payments = await Payment.find({ userId: req.user!.id })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    res.json(
      payments.map((p) => ({
        id: p._id.toString(),
        userId: p.userId.toString(),
        amount: p.amount,
        pointsAdded: p.pointsAdded,
        razorpayOrderId: p.razorpayOrderId,
        razorpayPaymentId: p.razorpayPaymentId || null,
        status: p.status,
        createdAt: p.createdAt.toISOString(),
      }))
    );
  } catch (err) {
    req.log.error({ err }, "Get payments error");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
