import { Role } from "@prisma/client";
import prisma from "../config/prisma.js";
import { comparePassword } from "../utils/hash.js";
import { generateToken } from "../utils/jwt.js";

const publicUser = (
  user: {
    id: string;
    name: string | null;
    email: string;
    role: Role;
    schoolId: string | null;
    gradeId: string | null;
    classId: string | null;
    activationCode?: string | null;
  },
  extras?: { schoolName?: string | null }
) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  schoolId: user.schoolId,
  gradeId: user.gradeId,
  classId: user.classId,
  schoolName: extras?.schoolName ?? null,
  activationCode: user.activationCode ?? null,
});

async function schoolNameFor(schoolId: string | null) {
  if (!schoolId) return null;
  const school = await prisma.school.findUnique({
    where: { id: schoolId },
    select: { name: true },
  });
  return school?.name ?? null;
}

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
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase().trim() },
    include: { school: true },
  });

  if (!user || !user.activationCode) {
    throw new Error("Invalid email or activation code.");
  }

  if (user.activationCode.trim().toUpperCase() !== activationCode.trim().toUpperCase()) {
    throw new Error("Invalid email or activation code.");
  }

  if (!user.schoolId || !user.school) {
    throw new Error("User is not linked to a school.");
  }

  if (!user.school.isActive) throw new Error("School is not active.");

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

  return {
    token,
    user: publicUser(user, { schoolName: user.school.name }),
  };
};

export const getMe = async (userId: string) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("User not found.");
  const schoolName = await schoolNameFor(user.schoolId);
  return publicUser(user, { schoolName });
};
