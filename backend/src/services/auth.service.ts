import { Role } from "@prisma/client";
import prisma from "../config/prisma.js";
import { comparePassword } from "../utils/hash.js";
import { generateToken } from "../utils/jwt.js";

const publicUser = (user: {
  id: string;
  name: string | null;
  email: string;
  role: Role;
  schoolId: string | null;
  gradeId: string | null;
  classId: string | null;
}) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  schoolId: user.schoolId,
  gradeId: user.gradeId,
  classId: user.classId,
});

export const platformLogin = async (email: string, password: string) => {
  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
  if (!user || user.role !== Role.PLATFORM_ADMIN || !user.password) {
    throw new Error("Invalid credentials.");
  }

  const ok = await comparePassword(password, user.password);
  if (!ok) throw new Error("Invalid credentials.");

  await prisma.loginEvent.create({
    data: { userId: user.id, role: user.role, schoolId: null },
  });

  const token = generateToken({
    id: user.id,
    role: user.role,
    schoolId: null,
    gradeId: null,
    classId: null,
  });

  return { token, user: publicUser(user) };
};

export const codeLogin = async (
  email: string,
  activationCode: string,
  expectedRoles: Role[]
) => {
  const code = await prisma.activationCode.findUnique({
    where: { code: activationCode.trim() },
    include: { school: true },
  });

  if (!code) throw new Error("Invalid activation code.");
  if (code.expiresAt && code.expiresAt < new Date()) {
    throw new Error("Activation code expired.");
  }
  if (!code.school.isActive) throw new Error("School is not active.");

  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase().trim() },
  });

  if (!user || user.schoolId !== code.schoolId) {
    throw new Error("Email is not registered for this school.");
  }

  if (!expectedRoles.includes(user.role)) {
    throw new Error("Role does not match selected login tab.");
  }

  await prisma.loginEvent.create({
    data: {
      userId: user.id,
      role: user.role,
      schoolId: user.schoolId,
    },
  });

  const token = generateToken({
    id: user.id,
    role: user.role,
    schoolId: user.schoolId,
    gradeId: user.gradeId,
    classId: user.classId,
  });

  return { token, user: publicUser(user) };
};

export const getMe = async (userId: string) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("User not found.");
  return publicUser(user);
};
