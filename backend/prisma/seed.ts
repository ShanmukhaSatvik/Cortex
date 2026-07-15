import "dotenv/config";
import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

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

async function main() {
  console.log("Seeding Cortex database...");

  await prisma.loginEvent.deleteMany();
  await prisma.content.deleteMany();
  await prisma.topic.deleteMany();
  await prisma.chapter.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.user.deleteMany();
  await prisma.classSection.deleteMany();
  await prisma.grade.deleteMany();
  await prisma.activationCode.deleteMany();
  await prisma.school.deleteMany();

  const adminEmail = process.env.PLATFORM_ADMIN_EMAIL || "admin@cortex.in";
  const adminPassword = process.env.PLATFORM_ADMIN_PASSWORD || "cortex123";
  const hashed = await bcrypt.hash(adminPassword, 10);

  await prisma.user.create({
    data: {
      name: "Platform Admin",
      email: adminEmail,
      password: hashed,
      role: Role.PLATFORM_ADMIN,
    },
  });

  const school = await prisma.school.create({
    data: {
      name: "Cortex Demo School",
      isActive: true,
    },
  });

  await prisma.activationCode.create({
    data: {
      code: "CORTEX-DEMO-2026",
      schoolId: school.id,
      expiresAt: new Date("2028-12-31"),
    },
  });

  const grades = [];
  for (let level = 6; level <= 10; level++) {
    const grade = await prisma.grade.create({
      data: {
        name: `Grade ${level}`,
        level,
        schoolId: school.id,
      },
    });
    await prisma.classSection.create({
      data: {
        name: "Section A",
        gradeId: grade.id,
      },
    });
    grades.push(grade);
  }

  for (const grade of grades) {
    for (const [subjectName, tree] of Object.entries(SUBJECT_TREE)) {
      const subject = await prisma.subject.create({
        data: {
          name: subjectName,
          schoolId: school.id,
          gradeId: grade.id,
        },
      });
      for (const chapterDef of tree.chapters) {
        const chapter = await prisma.chapter.create({
          data: {
            name: chapterDef.name,
            subjectId: subject.id,
          },
        });
        for (const topicName of chapterDef.topics) {
          await prisma.topic.create({
            data: {
              name: topicName,
              chapterId: chapter.id,
            },
          });
        }
      }
    }
  }

  const grade8 = grades.find((g) => g.level === 8)!;
  const class8 = await prisma.classSection.findFirst({
    where: { gradeId: grade8.id },
  });

  await prisma.user.create({
    data: {
      name: "Demo School Admin",
      email: "schooladmin@demo.cortex.in",
      role: Role.SCHOOL_ADMIN,
      schoolId: school.id,
    },
  });

  await prisma.user.create({
    data: {
      name: "Demo Teacher",
      email: "teacher@demo.cortex.in",
      role: Role.TEACHER,
      schoolId: school.id,
    },
  });

  await prisma.user.create({
    data: {
      name: "Demo Student",
      email: "student@demo.cortex.in",
      role: Role.STUDENT,
      schoolId: school.id,
      gradeId: grade8.id,
      classId: class8!.id,
    },
  });

  console.log("Seed complete.");
  console.log("Platform admin:", adminEmail, "/", adminPassword);
  console.log("Activation code: CORTEX-DEMO-2026");
  console.log("School admin: schooladmin@demo.cortex.in");
  console.log("Teacher: teacher@demo.cortex.in");
  console.log("Student: student@demo.cortex.in (Grade 8)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
