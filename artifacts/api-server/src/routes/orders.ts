import { Router, Response } from "express";
import mongoose from "mongoose";
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

    const query: Record<string, unknown> = { userId: req.user!.id };
    if (status) query["status"] = status;

    const [orders, total] = await Promise.all([
      Order.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Order.countDocuments(query),
    ]);

    res.json({
      orders: orders.map((o) => ({
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
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (err) {
    req.log.error({ err }, "Get orders error");
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/orders — purchase a service
router.post("/orders", requireAuth, async (req: AuthRequest, res: Response) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { serviceId, notes } = req.body;
    if (!serviceId) {
      res.status(400).json({ error: "serviceId is required" });
      return;
    }

    const [service, user] = await Promise.all([
      Service.findById(serviceId).session(session),
      User.findById(req.user!.id).session(session),
    ]);

    if (!service || service.status !== "active") {
      await session.abortTransaction();
      res.status(404).json({ error: "Service not found or unavailable" });
      return;
    }

    if (!user) {
      await session.abortTransaction();
      res.status(404).json({ error: "User not found" });
      return;
    }

    if (user.walletBalance < service.pointsCost) {
      await session.abortTransaction();
      res.status(400).json({ error: "Insufficient wallet balance. Please recharge your wallet." });
      return;
    }

    // Deduct points
    user.walletBalance -= service.pointsCost;
    await user.save({ session });

    // Create order
    const [order] = await Order.create(
      [
        {
          userId: user._id,
          serviceId: service._id,
          serviceName: service.title,
          serviceCategory: service.category,
          pointsCost: service.pointsCost,
          status: "pending",
          notes: notes || undefined,
          deliveryTime: service.deliveryTime,
        },
      ],
      { session }
    );

    // Create debit transaction
    await Transaction.create(
      [
        {
          userId: user._id,
          type: "debit",
          amount: service.pointsCost,
          description: `Purchased: ${service.title}`,
          status: "success",
          referenceId: order._id.toString(),
        },
      ],
      { session }
    );

    await session.commitTransaction();

    // Send confirmation email (non-blocking)
    sendOrderConfirmationEmail(user.email, user.name, service.title, order._id.toString()).catch(() => {});

    res.status(201).json(formatOrder(order));
  } catch (err) {
    await session.abortTransaction();
    req.log.error({ err }, "Create order error");
    res.status(500).json({ error: "Internal server error" });
  } finally {
    session.endSession();
  }
});

// GET /api/orders/:id
router.get("/orders/:id", requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const order = await Order.findOne({ _id: req.params["id"], userId: req.user!.id });
    if (!order) {
      res.status(404).json({ error: "Order not found" });
      return;
    }
    res.json(formatOrder(order));
  } catch {
    res.status(404).json({ error: "Order not found" });
  }
});

export default router;
