import { Role, type User } from "@prisma/client";
import prisma from "../config/prisma.js";

export const listGrades = async (user: User) => {
  if (user.role === Role.PLATFORM_ADMIN) {
    throw new Error("Platform admin has no grades.");
  }
  if (!user.schoolId) throw new Error("No school assigned.");

  if (user.role === Role.STUDENT) {
    if (!user.gradeId) return [];
    return prisma.grade.findMany({
      where: { id: user.gradeId, schoolId: user.schoolId },
      orderBy: { level: "asc" },
      include: { classes: true },
    });
  }

  return prisma.grade.findMany({
    where: { schoolId: user.schoolId },
    orderBy: { level: "asc" },
    include: { classes: true },
  });
};

export const listClasses = async (user: User, gradeId: string) => {
  if (!user.schoolId) throw new Error("No school assigned.");
  const grade = await prisma.grade.findFirst({
    where: { id: gradeId, schoolId: user.schoolId },
  });
  if (!grade) throw new Error("Grade not found.");

  return prisma.classSection.findMany({
    where: { gradeId },
    orderBy: { name: "asc" },
  });
};

const assertGradeAccess = async (user: User, gradeId: string) => {
  if (!user.schoolId) throw new Error("No school assigned.");
  if (user.role === Role.STUDENT && user.gradeId !== gradeId) {
    throw new Error("Access denied to this grade.");
  }
  const grade = await prisma.grade.findFirst({
    where: { id: gradeId, schoolId: user.schoolId },
  });
  if (!grade) throw new Error("Grade not found.");
  return grade;
};

export const listSubjects = async (user: User, gradeId: string) => {
  await assertGradeAccess(user, gradeId);
  return prisma.subject.findMany({
    where: { gradeId, schoolId: user.schoolId! },
    orderBy: { name: "asc" },
  });
};

export const listChapters = async (user: User, subjectId: string) => {
  const subject = await prisma.subject.findUnique({ where: { id: subjectId } });
  if (!subject || subject.schoolId !== user.schoolId) {
    throw new Error("Access denied.");
  }
  if (user.role === Role.STUDENT && subject.gradeId !== user.gradeId) {
    throw new Error("Access denied.");
  }
  return prisma.chapter.findMany({
    where: { subjectId },
    orderBy: { name: "asc" },
  });
};

export const listTopics = async (user: User, chapterId: string) => {
  const chapter = await prisma.chapter.findUnique({
    where: { id: chapterId },
    include: { subject: true },
  });
  if (!chapter || chapter.subject.schoolId !== user.schoolId) {
    throw new Error("Access denied.");
  }
  if (user.role === Role.STUDENT && chapter.subject.gradeId !== user.gradeId) {
    throw new Error("Access denied.");
  }
  return prisma.topic.findMany({
    where: { chapterId },
    orderBy: { name: "asc" },
  });
};

export const resolveTopicAccess = async (user: User, topicId: string) => {
  const topic = await prisma.topic.findUnique({
    where: { id: topicId },
    include: {
      chapter: { include: { subject: true } },
    },
  });
  if (!topic) return null;
  const subject = topic.chapter.subject;
  if (subject.schoolId !== user.schoolId) return null;
  if (user.role === Role.STUDENT && subject.gradeId !== user.gradeId) return null;
  return topic;
};
