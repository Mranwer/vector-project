import { Router, Request, Response } from "express";
import { requireAdmin, AuthRequest } from "../middlewares/auth";
import { User } from "../models/User";
import { Service } from "../models/Service";
import { Order, IOrder } from "../models/Order";
import { Payment, IPayment } from "../models/Payment";
import { Transaction } from "../models/Transaction";
import { signToken } from "../lib/jwt";

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

function formatService(s: InstanceType<typeof Service>) {
  return {
    id: s._id.toString(),
    title: s.title,
    description: s.description,
    thumbnail: s.thumbnail || null,
    pointsCost: s.pointsCost,
    deliveryTime: s.deliveryTime,
    category: s.category,
    status: s.status,
    features: s.features || [],
    createdAt: s.createdAt.toISOString(),
  };
}

function formatOrder(o: IOrder & { _id: { toString(): string }; updatedAt: Date; createdAt: Date }) {
  return {
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
  };
}

function formatPayment(p: IPayment & { _id: { toString(): string }; createdAt: Date }) {
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

// POST /api/admin/login
router.post("/admin/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: "Email and password required" });
      return;
    }

    const user = await User.findOne({ email: email.toLowerCase(), role: "admin" }).select("+password");
    if (!user) {
      res.status(401).json({ error: "Invalid admin credentials" });
      return;
    }

    const valid = await user.comparePassword(password);
    if (!valid) {
      res.status(401).json({ error: "Invalid admin credentials" });
      return;
    }

    const token = signToken({ id: user._id.toString(), role: "admin" });
    res.json({ token, user: formatUser(user) });
  } catch (err) {
    req.log.error({ err }, "Admin login error");
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/admin/stats
router.get("/admin/stats", requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const [totalUsers, totalOrders, activeServices, pendingOrders, revenueAgg, recentOrders, recentPayments] =
      await Promise.all([
        User.countDocuments({ role: "user" }),
        Order.countDocuments(),
        Service.countDocuments({ status: "active" }),
        Order.countDocuments({ status: "pending" }),
        Payment.aggregate([
          { $match: { status: "paid" } },
          { $group: { _id: null, total: { $sum: "$amount" } } },
        ]),
        Order.find().sort({ createdAt: -1 }).limit(5).lean(),
        Payment.find({ status: "paid" }).sort({ createdAt: -1 }).limit(5).lean(),
      ]);

    res.json({
      totalUsers,
      totalOrders,
      totalRevenue: revenueAgg[0]?.total ?? 0,
      activeServices,
      pendingOrders,
      recentOrders: recentOrders.map(formatOrder),
      recentPayments: recentPayments.map(formatPayment),
    });
  } catch (err) {
    req.log.error({ err }, "Admin stats error");
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/admin/users
router.get("/admin/users", requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const page = Math.max(1, parseInt(req.query["page"] as string) || 1);
    const limit = Math.min(100, parseInt(req.query["limit"] as string) || 20);
    const skip = (page - 1) * limit;
    const search = req.query["search"] as string;

    const query: Record<string, unknown> = {};
    if (search) {
      query["$or"] = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const [users, total] = await Promise.all([
      User.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      User.countDocuments(query),
    ]);

    res.json({
      users: users.map((u) => ({
        id: u._id.toString(),
        name: u.name,
        email: u.email,
        phone: u.phone || null,
        role: u.role,
        status: u.status,
        walletBalance: u.walletBalance,
        avatar: u.avatar || null,
        createdAt: u.createdAt.toISOString(),
      })),
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (err) {
    req.log.error({ err }, "Admin get users error");
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/admin/users/:id
router.get("/admin/users/:id", requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.params["id"]);
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const [orders, transactions] = await Promise.all([
      Order.find({ userId: user._id }).sort({ createdAt: -1 }).limit(20).lean(),
      Transaction.find({ userId: user._id }).sort({ createdAt: -1 }).limit(20).lean(),
    ]);

    res.json({
      user: formatUser(user),
      orders: orders.map(formatOrder),
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
    });
  } catch {
    res.status(404).json({ error: "User not found" });
  }
});

// PATCH /api/admin/users/:id
router.patch("/admin/users/:id", requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { status, role } = req.body;
    const updates: Record<string, string> = {};
    if (status) updates["status"] = status;
    if (role) updates["role"] = role;

    const user = await User.findByIdAndUpdate(req.params["id"], updates, { new: true });
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    res.json(formatUser(user));
  } catch (err) {
    req.log.error({ err }, "Admin update user error");
    res.status(500).json({ error: "Internal server error" });
  }
});

// PATCH /api/admin/users/:id/wallet
router.patch("/admin/users/:id/wallet", requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { amount, type, description } = req.body;
    if (!amount || !type || !description) {
      res.status(400).json({ error: "amount, type and description are required" });
      return;
    }

    const user = await User.findById(req.params["id"]);
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    if (type === "debit" && user.walletBalance < amount) {
      res.status(400).json({ error: "Insufficient balance for debit" });
      return;
    }

    const delta = type === "credit" ? amount : -amount;
    const updatedUser = await User.findByIdAndUpdate(
      req.params["id"],
      { $inc: { walletBalance: delta } },
      { new: true }
    );

    await Transaction.create({
      userId: user._id,
      type,
      amount,
      description: `Admin adjustment: ${description}`,
      status: "success",
    });

    res.json({
      balance: updatedUser!.walletBalance,
      userId: updatedUser!._id.toString(),
      totalRecharged: 0,
      totalSpent: 0,
    });
  } catch (err) {
    req.log.error({ err }, "Admin adjust wallet error");
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/admin/services
router.get("/admin/services", requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const services = await Service.find().sort({ createdAt: -1 }).lean();
    res.json(
      services.map((s) => ({
        id: s._id.toString(),
        title: s.title,
        description: s.description,
        thumbnail: s.thumbnail || null,
        pointsCost: s.pointsCost,
        deliveryTime: s.deliveryTime,
        category: s.category,
        status: s.status,
        features: s.features || [],
        createdAt: s.createdAt.toISOString(),
      }))
    );
  } catch (err) {
    req.log.error({ err }, "Admin get services error");
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/admin/services
router.post("/admin/services", requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, thumbnail, pointsCost, deliveryTime, category, features, status } = req.body;
    if (!title || !description || !pointsCost || !deliveryTime || !category) {
      res.status(400).json({ error: "Missing required fields" });
      return;
    }

    const service = await Service.create({
      title,
      description,
      thumbnail,
      pointsCost,
      deliveryTime,
      category,
      features: features || [],
      status: status || "active",
    });

    res.status(201).json(formatService(service));
  } catch (err) {
    req.log.error({ err }, "Admin create service error");
    res.status(500).json({ error: "Internal server error" });
  }
});

// PATCH /api/admin/services/:id
router.patch("/admin/services/:id", requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const service = await Service.findByIdAndUpdate(req.params["id"], req.body, { new: true, runValidators: true });
    if (!service) {
      res.status(404).json({ error: "Service not found" });
      return;
    }
    res.json(formatService(service));
  } catch (err) {
    req.log.error({ err }, "Admin update service error");
    res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE /api/admin/services/:id
router.delete("/admin/services/:id", requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const service = await Service.findByIdAndDelete(req.params["id"]);
    if (!service) {
      res.status(404).json({ error: "Service not found" });
      return;
    }
    res.json({ message: "Service deleted successfully" });
  } catch (err) {
    req.log.error({ err }, "Admin delete service error");
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/admin/orders
router.get("/admin/orders", requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const page = Math.max(1, parseInt(req.query["page"] as string) || 1);
    const limit = Math.min(100, parseInt(req.query["limit"] as string) || 20);
    const skip = (page - 1) * limit;
    const status = req.query["status"] as string;

    const query: Record<string, unknown> = {};
    if (status) query["status"] = status;

    const [orders, total] = await Promise.all([
      Order.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Order.countDocuments(query),
    ]);

    res.json({
      orders: orders.map(formatOrder),
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (err) {
    req.log.error({ err }, "Admin get orders error");
    res.status(500).json({ error: "Internal server error" });
  }
});

// PATCH /api/admin/orders/:id/status
router.patch("/admin/orders/:id/status", requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { status } = req.body;
    const validStatuses = ["pending", "processing", "completed", "cancelled"];
    if (!status || !validStatuses.includes(status)) {
      res.status(400).json({ error: "Invalid status" });
      return;
    }

    const order = await Order.findByIdAndUpdate(req.params["id"], { status }, { new: true });
    if (!order) {
      res.status(404).json({ error: "Order not found" });
      return;
    }

    res.json({
      id: order._id.toString(),
      userId: order.userId.toString(),
      serviceId: order.serviceId.toString(),
      serviceName: order.serviceName,
      serviceCategory: order.serviceCategory || null,
      pointsCost: order.pointsCost,
      status: order.status,
      notes: order.notes || null,
      deliveryTime: order.deliveryTime || null,
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
    });
  } catch (err) {
    req.log.error({ err }, "Admin update order status error");
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/admin/payments
router.get("/admin/payments", requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const payments = await Payment.find().sort({ createdAt: -1 }).limit(100).lean();
    res.json(payments.map(formatPayment));
  } catch (err) {
    req.log.error({ err }, "Admin get payments error");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
