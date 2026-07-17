import { Role } from "@prisma/client";
import prisma from "../config/prisma.js";
import { allocateActivationCode } from "../utils/activationCode.js";

export const listTeachers = async (schoolId: string) => {
  return prisma.user.findMany({
    where: {
      schoolId,
      role: { in: [Role.TEACHER, Role.SCHOOL_ADMIN] },
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      activationCode: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });
};

export const createTeacher = async (
  schoolId: string,
  email: string,
  name?: string
) => {
  const normalized = email.toLowerCase().trim();
  const existing = await prisma.user.findUnique({ where: { email: normalized } });
  if (existing) throw new Error("Email already registered.");

  const activationCode = await allocateActivationCode();

  return prisma.user.create({
    data: {
      email: normalized,
      name: name?.trim() || "Teacher",
      role: Role.TEACHER,
      schoolId,
      activationCode,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      activationCode: true,
    },
  });
};

export const listStudents = async (schoolId: string) => {
  return prisma.user.findMany({
    where: { schoolId, role: Role.STUDENT },
    select: {
      id: true,
      name: true,
      email: true,
      activationCode: true,
      gradeId: true,
      classId: true,
      grade: { select: { id: true, name: true, level: true } },
      class: { select: { id: true, name: true } },
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });
};

export const createStudent = async (
  schoolId: string,
  data: { email: string; name?: string; gradeId: string; classId: string }
) => {
  const grade = await prisma.grade.findFirst({
    where: { id: data.gradeId, schoolId },
  });
  if (!grade) throw new Error("Invalid grade for this school.");

  const classSection = await prisma.classSection.findFirst({
    where: { id: data.classId, gradeId: data.gradeId },
  });
  if (!classSection) throw new Error("Invalid class for this grade.");

  const normalized = data.email.toLowerCase().trim();
  const existing = await prisma.user.findUnique({ where: { email: normalized } });
  if (existing) throw new Error("Email already registered.");

  const activationCode = await allocateActivationCode();

  return prisma.user.create({
    data: {
      email: normalized,
      name: data.name?.trim() || "Student",
      role: Role.STUDENT,
      schoolId,
      gradeId: data.gradeId,
      classId: data.classId,
      activationCode,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      activationCode: true,
      gradeId: true,
      classId: true,
    },
  });
};
