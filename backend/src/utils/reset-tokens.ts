import { createHmac, timingSafeEqual } from "node:crypto";

const secret = process.env.RESET_TOKEN_SECRET ?? "hmz-dev-reset-secret";
const ttlMs = 1000 * 60 * 30;

function sign(payload: string): string {
  return createHmac("sha256", secret).update(payload).digest("hex");
}

export function createResetToken(userId: number): string {
  const expiresAt = Date.now() + ttlMs;
  const payload = `${userId}.${expiresAt}`;
  return `${payload}.${sign(payload)}`;
}

export function verifyResetToken(token: string): number | null {
  const parts = token.split(".");
  if (parts.length !== 3) {
    return null;
  }

  const [rawId, rawExpiresAt, signature] = parts;
  const expected = sign(`${rawId}.${rawExpiresAt}`);
  const given = Buffer.from(signature, "hex");
  const wanted = Buffer.from(expected, "hex");
  if (given.length !== wanted.length || !timingSafeEqual(given, wanted)) {
    return null;
  }

  const expiresAt = Number(rawExpiresAt);
  if (!Number.isFinite(expiresAt) || expiresAt < Date.now()) {
    return null;
  }

  const userId = Number(rawId);
  return Number.isInteger(userId) ? userId : null;
}
