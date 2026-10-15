import bcrypt from "bcryptjs";

export const DEFAULT_PASSWORD = "123456";

export function hashPassword(password: string): string {
  return bcrypt.hashSync(password, 10);
}

export function verifyPassword(password: string, stored: string): boolean {
  return bcrypt.compareSync(password, stored);
}