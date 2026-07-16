import "dotenv/config";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { ContentType, PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcrypt";
import { generateLessonPdfs } from "./generatePdfs.js";
import { LESSONS } from "./lessonContent.js";
import { LESSON_VIDEOS } from "./lessonVideos.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function ensureDemoAnimation() {
  const source = path.join(__dirname, "../seed-media/sample.mp4");
  const destDir = path.join(__dirname, "../uploads/animations");
  const dest = path.join(destDir, "demo.mp4");
  if (!fs.existsSync(source)) {
    throw new Error(`Missing seed video at ${source}`);
  }
  fs.mkdirSync(destDir, { recursive: true });
  fs.copyFileSync(source, dest);
  console.log("Demo animation ready: uploads/animations/demo.mp4");
}

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

  await generateLessonPdfs();
  ensureDemoAnimation();

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
  const adminPassword = process.env.PLATFORM_ADMIN_PASSWORD || "admin123";
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
      name: "Greenwood High",
      isActive: true,
    },
  });

  await prisma.activationCode.create({
    data: {
      code: "SCHOOL26",
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

  const schoolAdmin = await prisma.user.create({
    data: {
      name: "School Admin",
      email: "admin@greenwood.in",
      role: Role.SCHOOL_ADMIN,
      schoolId: school.id,
    },
  });

  await prisma.user.create({
    data: {
      name: "Teacher 1",
      email: "teacher1@greenwood.in",
      role: Role.TEACHER,
      schoolId: school.id,
    },
  });

  await prisma.user.create({
    data: {
      name: "Student 1",
      email: "student1@greenwood.in",
      role: Role.STUDENT,
      schoolId: school.id,
      gradeId: grade8.id,
      classId: class8!.id,
    },
  });

  // Attach lesson PDFs to matching topics for every grade (same files, topic-relevant titles)
  const lessonByTopic = new Map(LESSONS.map((l) => [l.topic, l]));
  const topics = await prisma.topic.findMany({
    include: {
      chapter: {
        include: {
          subject: true,
        },
      },
    },
  });

  let pdfCount = 0;
  let videoCount = 0;
  const videoByTopic = new Map(LESSON_VIDEOS.map((v) => [v.topic, v]));

  for (const topic of topics) {
    if (topic.chapter.subject.schoolId !== school.id) continue;

    const lesson = lessonByTopic.get(topic.name);
    if (lesson) {
      await prisma.content.create({
        data: {
          title: `${lesson.title} — Lesson Notes`,
          description: `${lesson.subtitle} · Greenwood High classroom PDF`,
          type: ContentType.PDF,
          filePath: `pdfs/${lesson.file}`,
          topicId: topic.id,
          schoolId: school.id,
          uploadedById: schoolAdmin.id,
        },
      });
      pdfCount += 1;
    }

    const video = videoByTopic.get(topic.name);
    if (video) {
      await prisma.content.create({
        data: {
          title: video.title,
          description: video.description ?? null,
          type: ContentType.VIDEO,
          filePath: `animations/${video.file}`,
          topicId: topic.id,
          schoolId: school.id,
          uploadedById: schoolAdmin.id,
        },
      });
      videoCount += 1;
    }
  }

  console.log("Seed complete.");
  console.log("Lesson PDFs attached:", pdfCount);
  console.log("Local lesson animations linked:", videoCount);
  console.log("Admin:", adminEmail, "/", adminPassword);
  console.log("Code: SCHOOL26");
  console.log("School admin: admin@greenwood.in");
  console.log("Teacher: teacher1@greenwood.in");
  console.log("Student: student1@greenwood.in (Grade 8)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
