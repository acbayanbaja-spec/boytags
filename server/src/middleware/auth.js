import { AppError } from "../utils/http.js";
import { verifyAccessToken } from "../utils/tokens.js";

export function authenticate(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : req.cookies?.accessToken;
  if (!token) return next(new AppError("Please sign in to continue.", 401, "UNAUTHENTICATED"));
  try {
    req.user = verifyAccessToken(token);
    next();
  } catch {
    next(new AppError("Your session expired. Please sign in again.", 401, "TOKEN_INVALID"));
  }
}

export function optionalAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return next();
  try {
    req.user = verifyAccessToken(token);
  } catch {
    req.user = null;
  }
  next();
}

export function requireRoles(...roles) {
  return (req, res, next) => {
    if (!req.user) return next(new AppError("Please sign in to continue.", 401, "UNAUTHENTICATED"));
    if (!roles.includes(req.user.role)) {
      return next(new AppError("You do not have permission to do that.", 403, "FORBIDDEN"));
    }
    next();
  };
}
