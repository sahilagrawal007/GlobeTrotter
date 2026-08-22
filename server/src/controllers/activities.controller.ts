import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { sendSuccess, sendError } from "../utils/response";

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

// POST /api/activities - create a custom activity for any city
export async function createActivity(req: Request, res: Response): Promise<void> {
  const { cityId, name, type, cost, durationMin, description } = req.body as {
    cityId: string;
    name: string;
    type: string;
    cost?: number;
    durationMin?: number;
    description?: string;
  };

  if (!cityId || !name || !type) {
    sendError(res, 400, "BAD_REQUEST", "cityId, name, and type are required");
    return;
  }

  // Verify city exists
  const city = await prisma.city.findUnique({ where: { id: cityId } });
  if (!city) {
    sendError(res, 404, "NOT_FOUND", "City not found");
    return;
  }

  const activity = await prisma.activity.create({
    data: {
      cityId,
      name: name.trim(),
      type,
      cost: cost ?? 0,
      durationMin: durationMin ?? 60,
      description: description?.trim() ?? null,
    },
    include: { city: { select: { name: true, country: true } } },
  });

  sendSuccess(res, { activity }, 201);
}
