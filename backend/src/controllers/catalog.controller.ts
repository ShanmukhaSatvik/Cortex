import type { Request, Response } from "express";
import * as catalogService from "../services/catalog.service.js";
import { param } from "../utils/params.js";

export const grades = async (req: Request, res: Response) => {
  try {
    const rows = await catalogService.listGrades(req.user!);
    res.json(rows);
  } catch (e: any) {
    res.status(400).json({ message: e.message || "Failed to list grades." });
  }
};

export const classes = async (req: Request, res: Response) => {
  try {
    const rows = await catalogService.listClasses(req.user!, param(req, "gradeId"));
    res.json(rows);
  } catch (e: any) {
    res.status(400).json({ message: e.message || "Failed to list classes." });
  }
};

export const subjects = async (req: Request, res: Response) => {
  try {
    const gradeId = String(req.query.gradeId || "");
    if (!gradeId) {
      res.status(400).json({ message: "gradeId is required." });
      return;
    }
    const rows = await catalogService.listSubjects(req.user!, gradeId);
    res.json(rows);
  } catch (e: any) {
    res.status(403).json({ message: e.message || "Access denied." });
  }
};

export const chapters = async (req: Request, res: Response) => {
  try {
    const rows = await catalogService.listChapters(req.user!, param(req, "subjectId"));
    res.json(rows);
  } catch (e: any) {
    res.status(403).json({ message: e.message || "Access denied." });
  }
};

export const topics = async (req: Request, res: Response) => {
  try {
    const rows = await catalogService.listTopics(req.user!, param(req, "chapterId"));
    res.json(rows);
  } catch (e: any) {
    res.status(403).json({ message: e.message || "Access denied." });
  }
};
