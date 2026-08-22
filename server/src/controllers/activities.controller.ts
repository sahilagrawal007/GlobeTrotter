import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { sendSuccess } from "../utils/response";

const prisma = new PrismaClient();

// GET /api/activities
export async function listActivities(req: Request, res: Response): Promise<void> {
  const { cityId, type, maxCost, page, limit } = req.query as {
    cityId?: string; type?: string; maxCost?: number; page: number; limit: number;
  };

  const skip = (Number(page) - 1) * Number(limit);

  const where = {
    ...(cityId && { cityId }),
    ...(type && { type }),
    ...(maxCost !== undefined && { cost: { lte: Number(maxCost) } }),
  };

  const [activities, total] = await Promise.all([
    prisma.activity.findMany({
      where,
      skip,
      take: Number(limit),
      orderBy: { name: "asc" },
      include: { city: { select: { name: true, country: true } } },
    }),
    prisma.activity.count({ where }),
  ]);

  sendSuccess(res, { activities, total });
}
