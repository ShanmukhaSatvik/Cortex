import type { Request, Response } from "express";
import * as userService from "../services/user.service.js";

export const listTeachers = async (req: Request, res: Response) => {
  try {
    const rows = await userService.listTeachers(req.user!.schoolId!);
    res.json(rows);
  } catch (e: any) {
    res.status(400).json({ message: e.message || "Failed to list teachers." });
  }
};

export const createTeacher = async (req: Request, res: Response) => {
  try {
    const { email, name } = req.body as { email?: string; name?: string };
    if (!email?.trim()) {
      res.status(400).json({ message: "Email is required." });
      return;
    }
    const teacher = await userService.createTeacher(req.user!.schoolId!, email, name);
    res.status(201).json(teacher);
  } catch (e: any) {
    res.status(400).json({ message: e.message || "Failed to create teacher." });
  }
};

export const listStudents = async (req: Request, res: Response) => {
  try {
    const rows = await userService.listStudents(req.user!.schoolId!);
    res.json(rows);
  } catch (e: any) {
    res.status(400).json({ message: e.message || "Failed to list students." });
  }
};

export const createStudent = async (req: Request, res: Response) => {
  try {
    const { email, name, gradeId, classId } = req.body as {
      email?: string;
      name?: string;
      gradeId?: string;
      classId?: string;
    };
    if (!email?.trim() || !gradeId || !classId) {
      res.status(400).json({ message: "Email, gradeId, and classId are required." });
      return;
    }
    const student = await userService.createStudent(req.user!.schoolId!, {
      email,
      name,
      gradeId,
      classId,
    });
    res.status(201).json(student);
  } catch (e: any) {
    res.status(400).json({ message: e.message || "Failed to create student." });
  }
};
