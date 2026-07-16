import type { Request, Response, NextFunction } from "express";
import prisma from "../config/prisma.js";
import { verifyToken } from "../utils/jwt.js";

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Header preferred; query `token` allowed for media players that cannot send Authorization
    const authHeader = req.headers.authorization;
    const queryToken =
      typeof req.query.token === "string" && req.query.token.trim()
        ? req.query.token.trim()
        : null;
    const token = authHeader?.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : queryToken;

    if (!token) {
      res.status(401).json({ message: "Access token missing." });
      return;
    }

    const decoded = verifyToken(token);
    const user = await prisma.user.findUnique({ where: { id: decoded.id } });

    if (!user) {
      res.status(401).json({ message: "User not found." });
      return;
    }

    if (user.role !== "PLATFORM_ADMIN" && user.schoolId) {
      const school = await prisma.school.findUnique({ where: { id: user.schoolId } });
      if (!school?.isActive) {
        res.status(403).json({ message: "School is not active." });
        return;
      }
    }

    req.user = user;
    next();
  } catch {
    res.status(401).json({ message: "Invalid token." });
  }
};
