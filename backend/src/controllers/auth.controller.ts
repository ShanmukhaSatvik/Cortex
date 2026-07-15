import type { Request, Response } from "express";
import { Role } from "@prisma/client";
import * as authService from "../services/auth.service.js";

export const platformLogin = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body as { email?: string; password?: string };
    if (!email || !password) {
      res.status(400).json({ message: "Email and password are required." });
      return;
    }
    const result = await authService.platformLogin(email, password);
    res.json(result);
  } catch (e: any) {
    res.status(401).json({ message: e.message || "Login failed." });
  }
};

export const codeLogin = async (req: Request, res: Response) => {
  try {
    const { email, activationCode, mode } = req.body as {
      email?: string;
      activationCode?: string;
      mode?: "teacher" | "student";
    };
    if (!email || !activationCode || !mode) {
      res.status(400).json({ message: "Email, activation code, and mode are required." });
      return;
    }

    const expectedRoles =
      mode === "student"
        ? [Role.STUDENT]
        : [Role.TEACHER, Role.SCHOOL_ADMIN];

    const result = await authService.codeLogin(email, activationCode, expectedRoles);
    res.json(result);
  } catch (e: any) {
    res.status(401).json({ message: e.message || "Login failed." });
  }
};

export const me = async (req: Request, res: Response) => {
  try {
    const user = await authService.getMe(req.user!.id);
    res.json({ user });
  } catch (e: any) {
    res.status(404).json({ message: e.message || "Not found." });
  }
};

export const logout = async (_req: Request, res: Response) => {
  res.json({ success: true });
};
