import { asyncHandler, created, ok, AppError } from "../utils/http.js";
import * as authService from "../services/authService.js";
import { prisma } from "../config/db.js";
import { publicUser } from "../utils/tokens.js";

export const register = asyncHandler(async (req, res) => {
  const data = await authService.register(req.body);
  created(res, data);
});

export const login = asyncHandler(async (req, res) => {
  const data = await authService.login(req.body);
  ok(res, data);
});

export const refresh = asyncHandler(async (req, res) => {
  const token = req.body.refreshToken || req.cookies?.refreshToken;
  const data = await authService.refresh(token);
  ok(res, data);
});

export const forgot = asyncHandler(async (req, res) => {
  const data = await authService.forgotPassword(req.body.email);
  ok(res, data);
});

export const reset = asyncHandler(async (req, res) => {
  const data = await authService.resetPassword(req.body.token, req.body.password);
  ok(res, data);
});

export const me = asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user.sub } });
  // A token can outlive its row (a reseed deletes every account), and publicUser(null) would
  // crash into a masked 500. 401 makes the app drop the dead session and show the sign-in page.
  if (!user) {
    throw new AppError("This account no longer exists. Please sign in again.", 401, "ACCOUNT_MISSING");
  }
  ok(res, publicUser(user));
});

export const updateMe = asyncHandler(async (req, res) => {
  const user = await authService.updateProfile(req.user.sub, req.body);
  ok(res, user);
});
