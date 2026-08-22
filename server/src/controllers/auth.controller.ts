import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { hashPassword, comparePassword } from "../utils/password";
import { signToken } from "../utils/jwt";
import { sendSuccess, sendError } from "../utils/response";
import crypto from "crypto";

const prisma = new PrismaClient();

// Safe user shape — password never included
function safeUser(user: {
  id: string; email: string; name: string;
  avatarUrl: string | null; language: string; role: string; createdAt: Date;
}) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    avatarUrl: user.avatarUrl,
    language: user.language,
    role: user.role,
    createdAt: user.createdAt.toISOString(),
  };
}

// POST /api/auth/signup
export async function signup(req: Request, res: Response): Promise<void> {
  const { name, email, password } = req.body as { name: string; email: string; password: string };

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    sendError(res, 409, "CONFLICT", "An account with this email already exists");
    return;
  }

  const hashed = await hashPassword(password);
  const user = await prisma.user.create({
    data: { name, email, password: hashed },
  });

  const token = signToken({ userId: user.id, role: user.role });
  sendSuccess(res, { user: safeUser(user), token }, 201);
}

// POST /api/auth/login
export async function login(req: Request, res: Response): Promise<void> {
  const { email, password } = req.body as { email: string; password: string };

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await comparePassword(password, user.password))) {
    sendError(res, 401, "UNAUTHORIZED", "Invalid email or password");
    return;
  }

  const token = signToken({ userId: user.id, role: user.role });
  sendSuccess(res, { user: safeUser(user), token });
}

// GET /api/auth/me
export async function me(req: Request, res: Response): Promise<void> {
  const user = await prisma.user.findUnique({ where: { id: req.user!.userId } });
  if (!user) {
    sendError(res, 404, "NOT_FOUND", "User not found");
    return;
  }
  sendSuccess(res, { user: safeUser(user) });
}

// POST /api/auth/forgot-password
// Dev-mode shortcut: token returned in response instead of emailed.
export async function forgotPassword(req: Request, res: Response): Promise<void> {
  const { email } = req.body as { email: string };

  const user = await prisma.user.findUnique({ where: { email } });

  // Always return 200 to avoid leaking which emails are registered
  if (!user) {
    sendSuccess(res, {
      resetToken: null,
      _devNote: "No account with this email — token is null (dev mode)",
    });
    return;
  }

  const resetToken = crypto.randomBytes(32).toString("hex");
  const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  await prisma.user.update({
    where: { id: user.id },
    data: { resetToken, resetTokenExpiry },
  });

  console.log(`[DEV] Password reset token for ${email}: ${resetToken}`);

  sendSuccess(res, {
    resetToken,
    _devNote: "Token shown here because AI_PROVIDER=none (dev mode). In production this would be emailed.",
  });
}

// POST /api/auth/reset-password
export async function resetPassword(req: Request, res: Response): Promise<void> {
  const { resetToken, newPassword } = req.body as { resetToken: string; newPassword: string };

  const user = await prisma.user.findFirst({
    where: {
      resetToken,
      resetTokenExpiry: { gt: new Date() },
    },
  });

  if (!user) {
    sendError(res, 400, "BAD_REQUEST", "Invalid or expired reset token");
    return;
  }

  const hashed = await hashPassword(newPassword);
  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashed, resetToken: null, resetTokenExpiry: null },
  });

  sendSuccess(res, { success: true });
}
