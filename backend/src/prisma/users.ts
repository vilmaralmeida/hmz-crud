import { db } from "./db.ts";
import { seed } from "./seed.ts";
import { DEFAULT_PASSWORD, hashPassword, verifyPassword } from "../utils/passwords.ts";
import { createSessionToken } from "../utils/session-tokens.ts";
import { slugify } from "../utils/slug.ts";

export { db };

export type User = Awaited<ReturnType<typeof listUsers>>["data"][number];

const userColumns = [
  "id",
  "email",
  "firstName",
  "lastName",
  "avatar",
  "slug",
  "createdAt",
  "updatedAt",
] as const;

function toUser(row: {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  avatar: string | null;
  slug: string;
  createdAt: string;
  updatedAt: string;
}) {
  return {
    id: String(row.id),
    email: row.email,
    first_name: row.firstName,
    last_name: row.lastName,
    avatar: row.avatar,
    slug: row.slug,
    created_at: row.createdAt,
    updated_at: row.updatedAt,
  };
}

export async function listUsers(page = 1, perPage = 10) {
  await seed();
  const { total } = await db.orm.public.User.aggregate((aggregate) => ({
    total: aggregate.count(),
  }));
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const users = await db.orm.public.User
    .select(...userColumns)
    .orderBy((user) => user.id.asc())
    .limit(perPage)
    .offset((page - 1) * perPage)
    .all();

  return {
    page,
    per_page: perPage,
    total,
    total_pages: totalPages,
    data: users.map(toUser),
  };
}

export async function getUser(id: number) {
  await seed();
  const user = await db.orm.public.User.select(...userColumns).first({ id });
  return user ? toUser(user) : null;
}

export async function getUserBySlug(slug: string) {
  await seed();
  const user = await db.orm.public.User.select(...userColumns).first({ slug });
  return user ? toUser(user) : null;
}

export async function getUserByEmail(email: string) {
  await seed();
  const user = await db.orm.public.User.select(...userColumns).first({ email });
  return user ? toUser(user) : null;
}

export type UserInput = {
  email: string;
  first_name: string;
  last_name: string;
  avatar?: string | null;
  slug?: string;
  password?: string;
};

async function uniqueSlug(base: string, excludeId?: number): Promise<string> {
  let candidate = base;
  for (let suffix = 0; ; suffix += 1) {
    if (suffix > 0) {
      candidate = `${base}-${suffix}`;
    }
    const existing = await db.orm.public.User.select("id").where({ slug: candidate }).first();
    if (!existing || existing.id === excludeId) {
      return candidate;
    }
  }
}

export async function createUser(input: UserInput) {
  await seed();
  const slug = await uniqueSlug(
    input.slug?.trim() || slugify(`${input.first_name} ${input.last_name}`)
  );
  const user = await db.orm.public.User
    .select(...userColumns)
    .create({
      email: input.email,
      firstName: input.first_name,
      lastName: input.last_name,
      avatar: input.avatar ?? null,
      slug,
      password: hashPassword(
        input.password && input.password.length > 0 ? input.password : DEFAULT_PASSWORD
      ),
    });
  return toUser(user);
}

export async function updateUser(id: number, input: Partial<UserInput>) {
  await seed();
  const update: Record<string, string | null> = {};
  if (input.email !== undefined) update.email = input.email;
  if (input.first_name !== undefined) update.firstName = input.first_name;
  if (input.last_name !== undefined) update.lastName = input.last_name;
  if (input.avatar !== undefined) update.avatar = input.avatar ?? null;
  if (input.password !== undefined && input.password.length > 0) {
    update.password = hashPassword(input.password);
  }
  if (input.slug !== undefined && input.slug.trim().length > 0) {
    update.slug = await uniqueSlug(slugify(input.slug), id);
  }

  const user = await db.orm.public.User
    .select(...userColumns)
    .where({ id })
    .update(update);
  return user ? toUser(user) : null;
}

export async function deleteUser(id: number): Promise<boolean> {
  await seed();
  const deleted = await db.orm.public.User.where({ id }).delete();
  return deleted !== null;
}

export async function login(email: string, password: string) {
  await seed();
  const user = await db.orm.public.User
    .select("id", "email", "password")
    .where({ email })
    .first();

  if (!user || !verifyPassword(password, user.password)) {
    return null;
  }

  return { token: createSessionToken(user.id), id: String(user.id) };
}