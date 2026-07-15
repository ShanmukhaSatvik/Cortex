import { ContentType, Role, type User } from "@prisma/client";
import fs from "fs";
import path from "path";
import prisma from "../config/prisma.js";
import { resolveTopicAccess } from "./catalog.service.js";
import { uploadsRootPath } from "../config/multer.js";

export const listContent = async (
  user: User,
  topicId: string,
  type?: ContentType
) => {
  const topic = await resolveTopicAccess(user, topicId);
  if (!topic) throw new Error("Access denied.");

  return prisma.content.findMany({
    where: {
      topicId,
      schoolId: user.schoolId!,
      ...(type ? { type } : {}),
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      description: true,
      type: true,
      topicId: true,
      schoolId: true,
      uploadedById: true,
      createdAt: true,
    },
  });
};

export const createContent = async (
  user: User,
  data: {
    title: string;
    description?: string;
    type: ContentType;
    topicId: string;
    relativePath: string;
  }
) => {
  if (user.role === Role.STUDENT || user.role === Role.PLATFORM_ADMIN) {
    throw new Error("Forbidden.");
  }

  const topic = await resolveTopicAccess(user, data.topicId);
  if (!topic) throw new Error("Access denied.");

  return prisma.content.create({
    data: {
      title: data.title.trim(),
      description: data.description?.trim() || null,
      type: data.type,
      filePath: data.relativePath,
      topicId: data.topicId,
      schoolId: user.schoolId!,
      uploadedById: user.id,
    },
  });
};

export const deleteContent = async (user: User, contentId: string) => {
  if (user.role === Role.STUDENT || user.role === Role.PLATFORM_ADMIN) {
    throw new Error("Forbidden.");
  }

  const content = await prisma.content.findUnique({ where: { id: contentId } });
  if (!content || content.schoolId !== user.schoolId) {
    throw new Error("Content not found.");
  }

  const topic = await resolveTopicAccess(user, content.topicId);
  if (!topic) throw new Error("Access denied.");

  const absolute = path.join(uploadsRootPath, content.filePath);
  if (fs.existsSync(absolute)) {
    fs.unlinkSync(absolute);
  }

  await prisma.content.delete({ where: { id: contentId } });
  return { success: true };
};

export const getContentForMedia = async (user: User, contentId: string) => {
  const content = await prisma.content.findUnique({ where: { id: contentId } });
  if (!content) return null;

  if (user.role === Role.PLATFORM_ADMIN) return null;

  if (content.schoolId !== user.schoolId) return null;

  const topic = await resolveTopicAccess(user, content.topicId);
  if (!topic) return null;

  return content;
};
