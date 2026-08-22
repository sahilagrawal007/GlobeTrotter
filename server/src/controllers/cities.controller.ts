import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { sendSuccess } from "../utils/response";

const prisma = new PrismaClient();

// GET /api/cities
export async function listCities(req: Request, res: Response): Promise<void> {
  const { search, country, page, limit } = req.query as {
    search?: string; country?: string; page: number; limit: number;
  };

  const skip = (Number(page) - 1) * Number(limit);

  const where = {
    ...(search && {
      name: { contains: search },
    }),
    ...(country && { country }),
  };

  const [cities, total] = await Promise.all([
    prisma.city.findMany({
      where,
      skip,
      take: Number(limit),
      orderBy: { name: "asc" },
    }),
    prisma.city.count({ where }),
  ]);

  sendSuccess(res, { cities, total });
}
