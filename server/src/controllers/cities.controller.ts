import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { sendSuccess, sendError } from "../utils/response";

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

// POST /api/cities - create a custom city (upsert by name+country)
export async function createCity(req: Request, res: Response): Promise<void> {
  const { name, country, costIndex } = req.body as {
    name: string;
    country?: string;
    costIndex?: number;
  };

  if (!name || name.trim().length < 1) {
    sendError(res, 400, "BAD_REQUEST", "City name is required");
    return;
  }

  const trimmedName = name.trim();
  const trimmedCountry = (country ?? "Custom").trim();

  // SQLite doesn't support mode:'insensitive', so fetch candidates and compare in JS
  const candidates = await prisma.city.findMany({
    where: { name: { contains: trimmedName } },
  });
  const existing = candidates.find(
    (c) =>
      c.name.toLowerCase() === trimmedName.toLowerCase() &&
      c.country.toLowerCase() === trimmedCountry.toLowerCase(),
  );

  if (existing) {
    sendSuccess(res, { city: existing }, 200);
    return;
  }

  const city = await prisma.city.create({
    data: {
      name: trimmedName,
      country: trimmedCountry,
      costIndex: costIndex ?? 3,
    },
  });

  sendSuccess(res, { city }, 201);
}
