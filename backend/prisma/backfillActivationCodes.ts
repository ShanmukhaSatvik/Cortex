/**
 * One-shot: assign personal activation codes to school users missing them,
 * or replace old prefix-style codes (ADM-/TCH-/STU-).
 * Known demo emails get stable 6-char codes matching LoginScreen defaults.
 */
import "dotenv/config";
import { PrismaClient, Role } from "@prisma/client";
import { allocateActivationCode } from "../src/utils/activationCode.js";

const prisma = new PrismaClient();

const DEMO: Record<string, string> = {
  "admin@greenwood.in": "A7K2M9",
  "teacher1@greenwood.in": "B3P8Q1",
  "student1@greenwood.in": "C5R4T6",
};

const OLD_PREFIX = /^(ADM|TCH|STU)-/i;

async function main() {
  const users = await prisma.user.findMany({
    where: { role: { not: Role.PLATFORM_ADMIN } },
  });

  let updated = 0;
  for (const user of users) {
    const email = user.email.toLowerCase();
    const needsNew =
      !user.activationCode ||
      OLD_PREFIX.test(user.activationCode) ||
      Boolean(DEMO[email] && user.activationCode !== DEMO[email]);

    if (!needsNew) continue;

    const activationCode = DEMO[email] || (await allocateActivationCode());
    await prisma.user.update({
      where: { id: user.id },
      data: { activationCode },
    });
    updated += 1;
  }

  console.log(`Backfill complete. Updated ${updated} user(s).`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
