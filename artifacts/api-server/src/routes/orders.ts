import { Router, Response } from "express";
import { requireAuth, AuthRequest } from "../middlewares/auth";
import { Order } from "../models/Order";
import { Service } from "../models/Service";
import { User } from "../models/User";
import { Transaction } from "../models/Transaction";
import { sendOrderConfirmationEmail } from "../lib/email";

const router = Router();

function formatOrder(o: InstanceType<typeof Order>) {
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

// GET /api/orders
router.get("/orders", requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const page = Math.max(1, parseInt(req.query["page"] as string) || 1);
    const limit = Math.min(50, parseInt(req.query["limit"] as string) || 10);
    const skip = (page - 1) * limit;
    const status = req.query["status"] as string;

    const query: Record<string, unknown> = {
      userId: req.user!.id,
    };

    if (status) {
      query["status"] = status;
    }

    const [orders, total] = await Promise.all([
      Order.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),

      Order.countDocuments(query),
    ]);

    res.json({
      orders: orders.map((o: any) => ({
        id: o._id.toString(),
        userId: o.userId.toString(),
        serviceId: o.serviceId.toString(),
        serviceName: o.serviceName,
        serviceCategory: o.serviceCategory || null,
        pointsCost: o.pointsCost,
        status: o.status,
        notes: o.notes || null,
        deliveryTime: o.deliveryTime || null,
        createdAt: new Date(o.createdAt).toISOString(),
        updatedAt: new Date(o.updatedAt).toISOString(),
      })),
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (err) {
    req.log.error({ err }, "Get orders error");

    res.status(500).json({
      error: "Internal server error",
    });
  }
});

// POST /api/orders
router.post("/orders", requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { serviceId, notes } = req.body;

    // Validation
    if (!serviceId) {
      res.status(400).json({
        error: "serviceId is required",
      });
      return;
    }

    // Find service and user
    const [service, user] = await Promise.all([
      Service.findById(serviceId),
      User.findById(req.user!.id),
    ]);

    // Service check
    if (!service || service.status !== "active") {
      res.status(404).json({
        error: "Service not found or unavailable",
      });
      return;
    }

    // User check
    if (!user) {
      res.status(404).json({
        error: "User not found",
      });
      return;
    }

    // Wallet balance check
    const walletBalance = user.walletBalance ?? 0;
    const pointsCost = service.pointsCost ?? 0;

    if (walletBalance < pointsCost) {
      res.status(400).json({
        error: "Insufficient wallet balance. Please recharge your wallet.",
      });
      return;
    }

    // Deduct balance
    user.walletBalance = walletBalance - pointsCost;

    await user.save();

    // Create order
    const order = await Order.create({
      userId: user._id,
      serviceId: service._id,
      serviceName: service.title,
      serviceCategory: service.category,
      pointsCost: service.pointsCost,
      status: "pending",
      notes: notes || undefined,
      deliveryTime: service.deliveryTime,
    });

    // Create transaction
    await Transaction.create({
      userId: user._id,
      type: "debit",
      amount: service.pointsCost,
      description: `Purchased: ${service.title}`,
      status: "success",
      referenceId: order._id.toString(),
    });

    // Send email (non-blocking)
    sendOrderConfirmationEmail(
      user.email,
      user.name,
      service.title,
      order._id.toString()
    ).catch((err) => {
      console.error("Email send failed:", err);
    });

    // Success response
    res.status(201).json(formatOrder(order));
  } catch (err) {
    console.error("Create order error:", err);

    req.log.error({ err }, "Create order error");

    res.status(500).json({
      error: "Internal server error",
    });
  }
});

// GET /api/orders/:id
router.get("/orders/:id", requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const order = await Order.findOne({
      _id: req.params["id"],
      userId: req.user!.id,
    });

    if (!order) {
      res.status(404).json({
        error: "Order not found",
      });
      return;
    }

    res.json(formatOrder(order));
  } catch (err) {
    console.error("Get order error:", err);

    res.status(404).json({
      error: "Order not found",
    });
  }
});

export default router;