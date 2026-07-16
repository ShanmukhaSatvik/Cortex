import type { Request, Response } from "express";
import path from "path";
import fs from "fs";
import { ContentType } from "@prisma/client";
import * as contentService from "../services/content.service.js";
import { uploadsRootPath } from "../config/multer.js";
import { param } from "../utils/params.js";

export const list = async (req: Request, res: Response) => {
  try {
    const topicId = String(req.query.topicId || "");
    const typeRaw = req.query.type ? String(req.query.type).toUpperCase() : undefined;
    if (!topicId) {
      res.status(400).json({ message: "topicId is required." });
      return;
    }
    let type: ContentType | undefined;
    if (typeRaw) {
      if (typeRaw !== "PDF" && typeRaw !== "VIDEO") {
        res.status(400).json({ message: "type must be PDF or VIDEO." });
        return;
      }
      type = typeRaw;
    }
    const rows = await contentService.listContent(req.user!, topicId, type);
    res.json(rows);
  } catch (e: any) {
    res.status(403).json({ message: e.message || "Access denied." });
  }
};

export const create = async (req: Request, res: Response) => {
  try {
    const { title, description, type, topicId } = req.body as {
      title?: string;
      description?: string;
      type?: string;
      topicId?: string;
    };
    if (!req.file || !title || !type || !topicId) {
      res.status(400).json({ message: "title, type, topicId, and file are required." });
      return;
    }
    const normalized = type.toUpperCase();
    if (normalized !== "PDF" && normalized !== "VIDEO") {
      res.status(400).json({ message: "type must be PDF or VIDEO." });
      return;
    }

    const isPdf =
      normalized === "PDF" ||
      req.file.mimetype === "application/pdf" ||
      req.file.originalname.toLowerCase().endsWith(".pdf");
    const folder = isPdf ? "pdfs" : "animations";
    // filename is already inside the chosen folder from multer destination
    const relativePath = `${folder}/${req.file.filename}`;


    const content = await contentService.createContent(req.user!, {
      title,
      description,
      type: normalized,
      topicId,
      relativePath,
    });
    res.status(201).json(content);
  } catch (e: any) {
    res.status(400).json({ message: e.message || "Upload failed." });
  }
};

export const remove = async (req: Request, res: Response) => {
  try {
    const result = await contentService.deleteContent(req.user!, param(req, "id"));
    res.json(result);
  } catch (e: any) {
    res.status(400).json({ message: e.message || "Delete failed." });
  }
};

export const media = async (req: Request, res: Response) => {
  try {
    const content = await contentService.getContentForMedia(req.user!, param(req, "contentId"));
    if (!content) {
      res.status(404).json({ message: "Content not found." });
      return;
    }

    const external =
      content.filePath.startsWith("http://") || content.filePath.startsWith("https://");
    if (external || String(req.query.meta || "") === "1") {
      res.json({
        externalUrl: external ? content.filePath : null,
        type: content.type,
      });
      return;
    }

    const absolute = path.join(uploadsRootPath, content.filePath);
    if (!fs.existsSync(absolute)) {
      res.status(404).json({ message: "File missing." });
      return;
    }

    res.sendFile(absolute);
  } catch (e: any) {
    res.status(400).json({ message: e.message || "Media access failed." });
  }
};
