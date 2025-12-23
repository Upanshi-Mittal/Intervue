import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: { userId: string };
    }
  }
}

export function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.log('[Auth Middleware] All cookies:', req.cookies);
  console.log('[Auth Middleware] Cookie headers:', req.headers.cookie);
  
  const token = req.cookies?.token as string | undefined;

  if (!token) {
    console.log('[Auth Middleware] No token found in cookies');
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET!
    );

    if (
      typeof decoded !== "object" ||
      !("userId" in decoded)
    ) {
      console.log('[Auth Middleware] Invalid token structure');
      return res.status(401).json({ message: "Invalid token" });
    }

    req.user = decoded as { userId: string };
    console.log('[Auth Middleware] User authenticated:', req.user.userId);
    next();
  } catch (err) {
    console.log('[Auth Middleware] Token verification failed:', err);
    return res.status(401).json({ message: "Invalid token" });
  }
}
