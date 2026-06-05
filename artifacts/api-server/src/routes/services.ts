import { Router, Request, Response } from "express";
import { Service } from "../models/Service";

const router = Router();

function formatService(s: any) {
  return {
    id: s._id.toString(),
    title: s.title,
    description: s.description,
    thumbnail: s.thumbnail || null,
    pointsCost: s.pointsCost,
    deliveryTime: s.deliveryTime,
    category: s.category,
    subcategory: s.subcategory,
    status: s.status,
    features: s.features || [],
    highlights: s.highlights || [],
    deliverables: s.deliverables || [],
    requirements: s.requirements || [],
    packages: s.packages || [],
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
    const subcategory = req.query["subcategory"] as string;
    const search = req.query["search"] as string;

    const matchQuery: Record<string, unknown> = { status: "active" };
    if (category) matchQuery["category"] = category;
    if (subcategory) matchQuery["subcategory"] = subcategory;
    if (search) matchQuery["$text"] = { $search: search };

    const [services, total] = await Promise.all([
      Service.aggregate([
        { $match: matchQuery },
        {
          $addFields: {
            categoryOrder: {
              $switch: {
                branches: [
                  { case: { $eq: ["$category", "YouTube Services"] }, then: 1 },
                  { case: { $eq: ["$category", "Web & App Development"] }, then: 2 },
                  { case: { $eq: ["$category", "Meta Ads"] }, then: 3 },
                ],
                default: 99,
              },
            },
          },
        },
        { $sort: { categoryOrder: 1, createdAt: -1 } },
        { $skip: skip },
        { $limit: limit },
      ]),
      Service.countDocuments(matchQuery),
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
  subcategory: s.subcategory,
  status: s.status,

  features: s.features || [],
  highlights: s.highlights || [],
  deliverables: s.deliverables || [],
  requirements: s.requirements || [],
  packages: s.packages || [],

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

// GET /api/services/grouped
router.get("/services/grouped", async (req: Request, res: Response) => {
  try {
    const result = await Service.aggregate([
      { $match: { status: "active" } },
      {
        $group: {
          _id: { category: "$category", subcategory: "$subcategory" },
          count: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: "$_id.category",
          subcategories: {
            $push: { name: "$_id.subcategory", count: "$count" },
          },
          totalServices: { $sum: "$count" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json(
      result.map((r) => ({
        category: r._id,
        totalServices: r.totalServices,
        subcategories: r.subcategories,
      }))
    );
  } catch (err) {
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