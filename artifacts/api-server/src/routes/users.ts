import { Router, Response } from "express";
import { requireAuth, AuthRequest } from "../middlewares/auth";
import { User } from "../models/User";
import { Order } from "../models/Order";
import { Transaction } from "../models/Transaction";

const router = Router();

function formatUser(user: InstanceType<typeof User>) {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    phone: user.phone || null,
    role: user.role,
    status: user.status,
    walletBalance: user.walletBalance,
    avatar: user.avatar || null,
    createdAt: user.createdAt.toISOString(),
  };
}

// PATCH /api/users/profile
router.patch("/users/profile", requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { name, phone, avatar } = req.body;
    const updates: Record<string, string> = {};
    if (name) updates["name"] = name;
    if (phone !== undefined) updates["phone"] = phone;
    if (avatar !== undefined) updates["avatar"] = avatar;

    const user = await User.findByIdAndUpdate(req.user!.id, updates, { new: true, runValidators: true });
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    res.json(formatUser(user));
  } catch (err) {
    req.log.error({ err }, "Update profile error");
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/dashboard/summary
router.get("/dashboard/summary", requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const [totalOrders, activeOrders, completedOrders, totalSpentAgg, recentTransactions, recentOrders] =
      await Promise.all([
        Order.countDocuments({ userId }),
        Order.countDocuments({ userId, status: { $in: ["pending", "processing"] } }),
        Order.countDocuments({ userId, status: "completed" }),
        Transaction.aggregate([
          { $match: { userId: user._id, type: "debit", status: "success" } },
          { $group: { _id: null, total: { $sum: "$amount" } } },
        ]),
        Transaction.find({ userId }).sort({ createdAt: -1 }).limit(5).lean(),
        Order.find({ userId }).sort({ createdAt: -1 }).limit(5).lean(),
      ]);

    const totalSpent = totalSpentAgg[0]?.total ?? 0;

    res.json({
      walletBalance: user.walletBalance,
      totalOrders,
      activeOrders,
      completedOrders,
      totalSpent,
      recentTransactions: recentTransactions.map((t) => ({
        id: t._id.toString(),
        userId: t.userId.toString(),
        type: t.type,
        amount: t.amount,
        description: t.description,
        status: t.status,
        referenceId: t.referenceId || null,
        createdAt: t.createdAt.toISOString(),
      })),
      recentOrders: recentOrders.map((o) => ({
        id: o._id.toString(),
        userId: o.userId.toString(),
        serviceId: o.serviceId.toString(),
        serviceName: o.serviceName,
        serviceCategory: o.serviceCategory || null,
        pointsCost: o.pointsCost,
        status: o.status,
        notes: o.notes || null,
        deliveryTime: o.deliveryTime || null,
        createdAt: o.createdAt.toISOString(),
        updatedAt: o.updatedAt.toISOString(),
      })),
    });
  } catch (err) {
    req.log.error({ err }, "Dashboard summary error");
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/contact
router.post("/contact", async (req: AuthRequest, res: Response) => {
  try {
    const { name, email, subject, message } = req.body;
    if (!name || !email || !message) {
      res.status(400).json({ error: "Name, email and message are required" });
      return;
    }
    req.log.info({ name, email, subject }, "Contact form submitted");
    res.json({ message: "Your message has been received. We will get back to you shortly." });
  } catch (err) {
    req.log.error({ err }, "Contact error");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
