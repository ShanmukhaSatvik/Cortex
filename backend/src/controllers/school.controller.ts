import type { Request, Response } from "express";
import * as schoolService from "../services/school.service.js";
import { param } from "../utils/params.js";

export const list = async (_req: Request, res: Response) => {
  try {
    const schools = await schoolService.listSchools();
    res.json(schools);
  } catch (e: any) {
    res.status(500).json({ message: e.message || "Failed to list schools." });
  }
};

export const create = async (req: Request, res: Response) => {
  try {
    const { name } = req.body as { name?: string };
    if (!name?.trim()) {
      res.status(400).json({ message: "School name is required." });
      return;
    }
    const school = await schoolService.createSchool(name);
    res.status(201).json(school);
  } catch (e: any) {
    res.status(400).json({ message: e.message || "Failed to create school." });
  }
};

export const setActive = async (req: Request, res: Response) => {
  try {
    const { isActive } = req.body as { isActive?: boolean };
    if (typeof isActive !== "boolean") {
      res.status(400).json({ message: "isActive boolean required." });
      return;
    }
    const school = await schoolService.setSchoolActive(param(req, "id"), isActive);
    res.json(school);
  } catch (e: any) {
    res.status(400).json({ message: e.message || "Failed to update school." });
  }
};

export const assignAdmin = async (req: Request, res: Response) => {
  try {
    const { email, name } = req.body as { email?: string; name?: string };
    if (!email?.trim()) {
      res.status(400).json({ message: "Email is required." });
      return;
    }
    const admin = await schoolService.assignSchoolAdmin(param(req, "id"), email, name);
    res.json(admin);
  } catch (e: any) {
    res.status(400).json({ message: e.message || "Failed to assign school admin." });
  }
};
