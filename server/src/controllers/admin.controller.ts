import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { sendSuccess } from "../utils/response";

const prisma = new PrismaClient();

// GET /api/admin/stats
export async function getStats(_req: Request, res: Response): Promise<void> {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [totalUsers, totalTrips, tripsLast7d, topCitiesRaw, topActivitiesRaw] =
    await Promise.all([
      prisma.user.count(),
      prisma.trip.count(),
      prisma.trip.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
      prisma.stop.groupBy({
        by: ["cityId"],
        _count: { cityId: true },
        orderBy: { _count: { cityId: "desc" } },
        take: 5,
      }),
      prisma.stopActivity.groupBy({
        by: ["activityId"],
        _count: { activityId: true },
        orderBy: { _count: { activityId: "desc" } },
        take: 5,
      }),
    ]);

  // Resolve city names
  const topCityIds = topCitiesRaw.map((r) => r.cityId);
  const citiesMap = await prisma.city.findMany({ where: { id: { in: topCityIds } } });
  const topCities = topCitiesRaw.map((r) => ({
    cityName: citiesMap.find((c) => c.id === r.cityId)?.name ?? r.cityId,
    count: r._count.cityId,
  }));

  // Resolve activity names
  const topActIds = topActivitiesRaw.map((r) => r.activityId);
  const activitiesMap = await prisma.activity.findMany({ where: { id: { in: topActIds } } });
  const topActivities = topActivitiesRaw.map((r) => ({
    activityName: activitiesMap.find((a) => a.id === r.activityId)?.name ?? r.activityId,
    count: r._count.activityId,
  }));

  sendSuccess(res, {
    totalUsers,
    totalTrips,
    topCities,
    topActivities,
    tripsCreatedLast7d: tripsLast7d,
  });
}

// GET /api/admin/users
export async function listUsers(req: Request, res: Response): Promise<void> {
  const page = parseInt((req.query.page as string) ?? "1", 10);
  const limit = parseInt((req.query.limit as string) ?? "20", 10);
  const skip = (page - 1) * limit;

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      select: {
        id: true, email: true, name: true, role: true,
        language: true, avatarUrl: true, createdAt: true,
        _count: { select: { trips: true } },
      },
    }),
    prisma.user.count(),
  ]);

  sendSuccess(res, {
    users: users.map((u) => ({
      id: u.id, email: u.email, name: u.name, role: u.role,
      language: u.language, avatarUrl: u.avatarUrl,
      createdAt: u.createdAt.toISOString(),
      tripCount: u._count.trips,
    })),
    total,
  });
}

// GET /api/admin/trips
export async function listTrips(req: Request, res: Response): Promise<void> {
  const page = parseInt((req.query.page as string) ?? "1", 10);
  const limit = parseInt((req.query.limit as string) ?? "20", 10);
  const skip = (page - 1) * limit;

  const [trips, total] = await Promise.all([
    prisma.trip.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true, email: true } },
        _count: { select: { stops: true } },
      },
    }),
    prisma.trip.count(),
  ]);

  sendSuccess(res, {
    trips: trips.map((t) => ({
      id: t.id, name: t.name,
      startDate: t.startDate.toISOString(),
      endDate: t.endDate.toISOString(),
      isPublic: t.isPublic,
      createdAt: t.createdAt.toISOString(),
      owner: t.user,
      stopCount: t._count.stops,
    })),
    total,
  });
}
