import { Role } from "@prisma/client";
import prisma from "../config/prisma.js";
import { allocateActivationCode } from "../utils/activationCode.js";

export const listSchools = async () => {
  const schools = await prisma.school.findMany({
    orderBy: { createdAt: "desc" },
  });

  return Promise.all(
    schools.map(async (school) => {
      const [teacherCount, studentCount, schoolAdminCount, loginCount, distinctLogins] =
        await Promise.all([
          prisma.user.count({
            where: { schoolId: school.id, role: Role.TEACHER },
          }),
          prisma.user.count({
            where: { schoolId: school.id, role: Role.STUDENT },
          }),
          prisma.user.count({
            where: { schoolId: school.id, role: Role.SCHOOL_ADMIN },
          }),
          prisma.loginEvent.count({ where: { schoolId: school.id } }),
          prisma.loginEvent.groupBy({
            by: ["userId"],
            where: { schoolId: school.id },
          }),
        ]);

      const schoolAdmin = await prisma.user.findFirst({
        where: { schoolId: school.id, role: Role.SCHOOL_ADMIN },
        select: {
          id: true,
          email: true,
          name: true,
          activationCode: true,
        },
      });

      return {
        id: school.id,
        name: school.name,
        isActive: school.isActive,
        createdAt: school.createdAt,
        /** School admin's personal code (null until an admin is assigned). */
        activationCode: schoolAdmin?.activationCode ?? null,
        schoolAdmin,
        stats: {
          teacherCount,
          studentCount,
          schoolAdminCount,
          loginCount,
          distinctLoginUsers: distinctLogins.length,
        },
      };
    })
  );
};

export const createSchool = async (name: string) => {
  const school = await prisma.school.create({
    data: { name: name.trim(), isActive: true },
  });

  // Seed grades 6-10 + Section A + subject tree for new schools
  const SUBJECT_TREE: Record<string, { chapters: { name: string; topics: string[] }[] }> = {
    Mathematics: {
      chapters: [
        { name: "Algebra Basics", topics: ["Linear Equations", "Polynomials"] },
        { name: "Geometry", topics: ["Triangles", "Circles"] },
      ],
    },
    Science: {
      chapters: [
        { name: "Physics Intro", topics: ["Motion", "Force"] },
        { name: "Chemistry Basics", topics: ["Atoms", "Reactions"] },
      ],
    },
    English: {
      chapters: [
        { name: "Grammar", topics: ["Tenses", "Parts of Speech"] },
        { name: "Literature", topics: ["Short Stories", "Poetry"] },
      ],
    },
  };

  for (let level = 6; level <= 10; level++) {
    const grade = await prisma.grade.create({
      data: { name: `Grade ${level}`, level, schoolId: school.id },
    });
    await prisma.classSection.create({
      data: { name: "Section A", gradeId: grade.id },
    });
    for (const [subjectName, tree] of Object.entries(SUBJECT_TREE)) {
      const subject = await prisma.subject.create({
        data: { name: subjectName, schoolId: school.id, gradeId: grade.id },
      });
      for (const chapterDef of tree.chapters) {
        const chapter = await prisma.chapter.create({
          data: { name: chapterDef.name, subjectId: subject.id },
        });
        for (const topicName of chapterDef.topics) {
          await prisma.topic.create({
            data: { name: topicName, chapterId: chapter.id },
          });
        }
      }
    }
  }

  return {
    id: school.id,
    name: school.name,
    isActive: school.isActive,
    activationCode: null as string | null,
  };
};

export const setSchoolActive = async (schoolId: string, isActive: boolean) => {
  return prisma.school.update({
    where: { id: schoolId },
    data: { isActive },
  });
};

export const assignSchoolAdmin = async (schoolId: string, email: string, name?: string) => {
  const school = await prisma.school.findUnique({ where: { id: schoolId } });
  if (!school) throw new Error("School not found.");

  const normalized = email.toLowerCase().trim();
  const existing = await prisma.user.findUnique({ where: { email: normalized } });

  if (existing) {
    if (existing.role === Role.PLATFORM_ADMIN) {
      throw new Error("Cannot assign platform admin as school admin.");
    }
    if (existing.schoolId && existing.schoolId !== schoolId) {
      throw new Error("Email already belongs to another school.");
    }

    await prisma.user.updateMany({
      where: {
        schoolId,
        role: Role.SCHOOL_ADMIN,
        NOT: { id: existing.id },
      },
      data: { role: Role.TEACHER },
    });

    const activationCode =
      existing.activationCode || (await allocateActivationCode());

    return prisma.user.update({
      where: { id: existing.id },
      data: {
        role: Role.SCHOOL_ADMIN,
        schoolId,
        name: name?.trim() || existing.name || "School Admin",
        gradeId: null,
        classId: null,
        activationCode,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        activationCode: true,
      },
    });
  }

  await prisma.user.updateMany({
    where: { schoolId, role: Role.SCHOOL_ADMIN },
    data: { role: Role.TEACHER },
  });

  const activationCode = await allocateActivationCode();

  return prisma.user.create({
    data: {
      email: normalized,
      name: name?.trim() || "School Admin",
      role: Role.SCHOOL_ADMIN,
      schoolId,
      activationCode,
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      activationCode: true,
    },
  });
};
