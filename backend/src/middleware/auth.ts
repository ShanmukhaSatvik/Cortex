import type { Request, Response, NextFunction } from "express";
import prisma from "../config/prisma.js";
import { verifyToken } from "../utils/jwt.js";

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      res.status(401).json({ message: "Access token missing." });
      return;
    }

    const token = authHeader.split(" ")[1];
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
