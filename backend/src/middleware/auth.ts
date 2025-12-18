import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

export function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const token = req.cookies?.auth_token as string | undefined;

  if (!token) {
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
  return res.status(401).json({ message: "Invalid token" });
}

req.user = decoded as { userId: string };
next();

  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
}
