import type { Request, Response, NextFunction } from "express";
import type { Role } from "@prisma/client";

export const requireRoles =
  (...roles: Role[]) =>
  (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({ message: "Forbidden." });
      return;
    }
    next();
  };
