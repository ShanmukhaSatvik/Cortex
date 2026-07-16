import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import PDFDocument from "pdfkit";
import { LESSONS } from "./lessonContent.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pdfDir = path.join(__dirname, "../uploads/pdfs");

function writeLessonPdf(filePath: string, lesson: (typeof LESSONS)[number]) {
  return new Promise<void>((resolve, reject) => {
    const doc = new PDFDocument({
      size: "A4",
      margins: { top: 56, bottom: 56, left: 56, right: 56 },
      info: {
        Title: lesson.title,
        Author: "Greenwood High · Cortex",
        Subject: lesson.subtitle,
      },
    });

    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    doc
      .fillColor("#0f172a")
      .font("Helvetica-Bold")
      .fontSize(22)
      .text(lesson.title, { align: "left" });

    doc.moveDown(0.3);
    doc
      .fillColor("#0369a1")
      .font("Helvetica")
      .fontSize(11)
      .text(lesson.subtitle);

    doc.moveDown(0.4);
    doc
      .strokeColor("#cbd5e1")
      .lineWidth(1)
      .moveTo(56, doc.y)
      .lineTo(539, doc.y)
      .stroke();

    doc.moveDown(0.8);
    doc
      .fillColor("#64748b")
      .fontSize(9)
      .text(
        "Greenwood High  ·  Lesson notes for classroom use  ·  Keep with your notebook"
      );

    for (const section of lesson.sections) {
      doc.moveDown(1);
      doc
        .fillColor("#0f172a")
        .font("Helvetica-Bold")
        .fontSize(13)
        .text(section.heading);

      doc.moveDown(0.35);
      doc.fillColor("#334155").font("Helvetica").fontSize(11);

      for (const line of section.body) {
        doc.text(line, { align: "left", lineGap: 3 });
        doc.moveDown(0.25);
      }
    }

    doc.moveDown(1.2);
    doc
      .fillColor("#94a3b8")
      .fontSize(9)
      .text(
        "End of lesson notes. Complete the practice questions before the next class.",
        { align: "left" }
      );

    doc.end();
    stream.on("finish", () => resolve());
    stream.on("error", reject);
  });
}

export async function generateLessonPdfs() {
  fs.mkdirSync(pdfDir, { recursive: true });

  for (const lesson of LESSONS) {
    const filePath = path.join(pdfDir, lesson.file);
    await writeLessonPdf(filePath, lesson);
    console.log("PDF ready:", lesson.file);
  }

  return pdfDir;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  generateLessonPdfs()
    .then(() => console.log("All lesson PDFs generated."))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
