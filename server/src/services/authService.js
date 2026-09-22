import bcrypt from "bcryptjs";
import { prisma } from "../config/db.js";
import { env } from "../config/env.js";
import { AppError } from "../utils/http.js";
import { logger } from "../utils/logger.js";
import {
  hashToken,
  publicUser,
  randomToken,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "../utils/tokens.js";

export async function register(input) {
  const existing = await prisma.user.findUnique({ where: { email: input.email.toLowerCase() } });
  if (existing) throw new AppError("An account with that email already exists.", 409, "EMAIL_TAKEN");
  const passwordHash = await bcrypt.hash(input.password, 12);
  const user = await prisma.user.create({
    data: {
      name: input.name.trim(),
      email: input.email.toLowerCase(),
      phone: input.phone || null,
      passwordHash,
      role: "CUSTOMER",
    },
  });
  return issueSession(user);
}

export async function login(input) {
  const user = await prisma.user.findUnique({ where: { email: input.email.toLowerCase() } });
  if (!user) throw new AppError("Incorrect email or password.", 401, "INVALID_CREDENTIALS");
  const match = await bcrypt.compare(input.password, user.passwordHash);
  if (!match) throw new AppError("Incorrect email or password.", 401, "INVALID_CREDENTIALS");
  return issueSession(user);
}

export async function refresh(token) {
  try {
    const payload = verifyRefreshToken(token);
    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user) throw new Error("missing");
    return issueSession(user);
  } catch {
    throw new AppError("Your session expired. Please sign in again.", 401, "TOKEN_INVALID");
  }
}

export async function forgotPassword(email) {
  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (!user) return { sent: true };
  const token = randomToken();
  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordResetToken: hashToken(token),
      passwordResetExpires: new Date(Date.now() + 1000 * 60 * 30),
    },
  });
  const resetUrl = `${env.FRONTEND_URL}/reset-password?token=${token}`;
  logger.info("Password reset requested", { email: user.email, resetUrl: env.NODE_ENV === "development" ? resetUrl : undefined });
  return {
    sent: true,
    ...(env.NODE_ENV !== "production" ? { resetUrl, token } : {}),
  };
}

export async function resetPassword(token, password) {
  const hashed = hashToken(token);
  const user = await prisma.user.findFirst({
    where: { passwordResetToken: hashed, passwordResetExpires: { gt: new Date() } },
  });
  if (!user) throw new AppError("This reset link is invalid or has expired.", 400, "RESET_INVALID");
  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordHash: await bcrypt.hash(password, 12),
      passwordResetToken: null,
      passwordResetExpires: null,
    },
  });
  return { reset: true };
}

export async function updateProfile(userId, input) {
  const user = await prisma.user.update({
    where: { id: userId },
    data: { name: input.name, phone: input.phone ?? null },
  });
  return publicUser(user);
}

function issueSession(user) {
  return {
    user: publicUser(user),
    accessToken: signAccessToken(user),
    refreshToken: signRefreshToken(user),
  };
}
