import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { sendSuccess, sendError } from "../utils/response";

const prisma = new PrismaClient();

function safeUser(user: {
  id: string; email: string; name: string;
  avatarUrl: string | null; language: string; role: string; createdAt: Date;
}) {
  return {
    id: user.id, email: user.email, name: user.name,
    avatarUrl: user.avatarUrl, language: user.language,
    role: user.role, createdAt: user.createdAt.toISOString(),
  };
}

// GET /api/users/me
export async function getMe(req: Request, res: Response): Promise<void> {
  const user = await prisma.user.findUnique({ where: { id: req.user!.userId } });
  if (!user) { sendError(res, 404, "NOT_FOUND", "User not found"); return; }
  sendSuccess(res, { user: safeUser(user) });
}

// PATCH /api/users/me
export async function updateMe(req: Request, res: Response): Promise<void> {
  const { name, avatarUrl, language } = req.body;
  const user = await prisma.user.update({
    where: { id: req.user!.userId },
    data: {
      ...(name !== undefined && { name }),
      ...(avatarUrl !== undefined && { avatarUrl }),
      ...(language !== undefined && { language }),
    },
  });
  sendSuccess(res, { user: safeUser(user) });
}

// DELETE /api/users/me
export async function deleteMe(req: Request, res: Response): Promise<void> {
  await prisma.user.delete({ where: { id: req.user!.userId } });
  sendSuccess(res, { success: true });
}
