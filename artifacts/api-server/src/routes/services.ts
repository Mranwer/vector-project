import { Router, Request, Response } from "express";
import { Service } from "../models/Service";

const router = Router();

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

// GET /api/services
router.get("/services", async (req: Request, res: Response) => {
  try {
    const page = Math.max(1, parseInt(req.query["page"] as string) || 1);
    const limit = Math.min(50, parseInt(req.query["limit"] as string) || 12);
    const skip = (page - 1) * limit;
    const category = req.query["category"] as string;
    const search = req.query["search"] as string;

    const query: Record<string, unknown> = { status: "active" };
    if (category) query["category"] = category;
    if (search) query["$text"] = { $search: search };

    const [services, total] = await Promise.all([
      Service.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Service.countDocuments(query),
    ]);

    res.json({
      services: services.map((s) => ({
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
      })),
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (err) {
    req.log.error({ err }, "Get services error");
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/services/categories
router.get("/services/categories", async (req: Request, res: Response) => {
  try {
    const result = await Service.aggregate([
      { $match: { status: "active" } },
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    res.json(result.map((r) => ({ name: r._id, count: r.count })));
  } catch (err) {
    req.log.error({ err }, "Get categories error");
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/services/:id
router.get("/services/:id", async (req: Request, res: Response) => {
  try {
    const service = await Service.findById(req.params["id"]);
    if (!service || service.status !== "active") {
      res.status(404).json({ error: "Service not found" });
      return;
    }
    res.json(formatService(service));
  } catch {
    res.status(404).json({ error: "Service not found" });
  }
});

export default router;
