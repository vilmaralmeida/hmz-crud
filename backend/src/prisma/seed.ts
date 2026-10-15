import { db } from "./db.ts";
import { DEFAULT_PASSWORD, hashPassword } from "../utils/passwords.ts";
import { slugify } from "../utils/slug.ts";
import usersJson from "../../users.json" with { type: "json" };

type SeedUser = {
  email: string;
  firstName: string;
  lastName: string;
  avatar: string | null;
};

const users: SeedUser[] = usersJson.data.map((user) => ({
  email: user.email,
  firstName: user.first_name,
  lastName: user.last_name,
  avatar: user.avatar ?? null,
}));

let pendingSeed: Promise<void> | undefined;

async function runSeed(): Promise<void> {
  const password = hashPassword(DEFAULT_PASSWORD);
  for (const user of users) {
    await db.orm.public.User.upsert({
      create: {
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        avatar: user.avatar,
        slug: slugify(`${user.firstName} ${user.lastName}`),
        password,
      },
      update: {},
      conflictOn: { email: user.email },
    });
  }
}

export function seed(): Promise<void> {
  pendingSeed ??= runSeed().catch((error: unknown) => {
    pendingSeed = undefined;
    throw error;
  });
  return pendingSeed;
}