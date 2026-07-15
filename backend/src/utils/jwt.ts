import jwt from "jsonwebtoken";
import type { Role } from "@prisma/client";

const JWT_SECRET = process.env.JWT_SECRET || "cortex-dev-jwt-secret-change-me";

export type JwtPayload = {
  id: string;
  role: Role;
  schoolId: string | null;
  gradeId: string | null;
  classId: string | null;
};

export const generateToken = (payload: JwtPayload) =>
  jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });

export const verifyToken = (token: string) =>
  jwt.verify(token, JWT_SECRET) as JwtPayload;
