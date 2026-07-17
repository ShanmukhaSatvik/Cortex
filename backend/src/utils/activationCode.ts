import crypto from "crypto";
import prisma from "../config/prisma.js";

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const DIGITS = "0123456789";

function pickChar(alphabet: string): string {
  return alphabet[crypto.randomInt(0, alphabet.length)]!;
}

/** Shuffle in place using Fisher–Yates with crypto randomness. */
function shuffle<T>(items: T[]): T[] {
  for (let i = items.length - 1; i > 0; i--) {
    const j = crypto.randomInt(0, i + 1);
    [items[i], items[j]] = [items[j]!, items[i]!];
  }
  return items;
}

/** Build a 6-char code: exactly 3 letters + 3 digits, order randomized. */
export function generateActivationCode(): string {
  const chars = [
    pickChar(LETTERS),
    pickChar(LETTERS),
    pickChar(LETTERS),
    pickChar(DIGITS),
    pickChar(DIGITS),
    pickChar(DIGITS),
  ];
  return shuffle(chars).join("");
}

/** Allocate a unique personal activation code for a school user. */
export async function allocateActivationCode(): Promise<string> {
  for (let attempt = 0; attempt < 24; attempt++) {
    const code = generateActivationCode();
    const taken = await prisma.user.findUnique({ where: { activationCode: code } });
    if (!taken) return code;
  }
  throw new Error("Could not allocate a unique activation code.");
}
