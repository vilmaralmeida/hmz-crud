import "dotenv/config";
import { serve } from "@hono/node-server";
import { zValidator } from "@hono/zod-validator";
import { Hono, type MiddlewareHandler } from "hono";
import { basicAuth } from "hono/basic-auth";
import { cors } from "hono/cors";
import { prettyJSON } from "hono/pretty-json";
import { z } from "zod";

import {
  createUser,
  deleteUser,
  getUser,
  getUserByEmail,
  getUserBySlug,
  listUsers,
  login,
  updateUser,
} from "./prisma/users.ts";
import { sendPasswordResetEmail } from "./utils/mailer.ts";
import { createResetToken, verifyResetToken } from "./utils/reset-tokens.ts";
import { verifySessionToken } from "./utils/session-tokens.ts";

const app = new Hono();

app.use(
  "*",
  cors({
    origin: "*",
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
  })
);

app.get("/", (c) => c.json({ message: "hmz-crud API" }));

app.get("/health", (c) => c.json({ status: "ok" }));

const api = new Hono();

api.use("*", prettyJSON());

const requireAuth: MiddlewareHandler = async (c, next) => {
  const header = c.req.header("Authorization") ?? "";
  const token = header.replace(/^Bearer\s+/i, "");
  if (!header.toLowerCase().startsWith("bearer ") || verifySessionToken(token) === null) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  await next();
};

function jsonBody<T extends z.ZodType>(schema: T) {
  return zValidator("json", schema, (result, c) => {
    if (!result.success) {
      return c.json({ error: "Invalid request body" }, 400);
    }
  });
}

function readBasicCredentials(header: string | undefined): [string, string] {
  const encoded = (header ?? "").replace(/^Basic\s+/i, "");
  const decoded = Buffer.from(encoded, "base64").toString("utf8");
  const separator = decoded.indexOf(":");
  if (separator === -1) {
    return [decoded, ""];
  }
  return [decoded.slice(0, separator), decoded.slice(separator + 1)];
}

const loginBody = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
});

const loginBasicAuth = basicAuth({
  verifyUser: async (email, password) => (await login(email.trim(), password)) !== null,
});

api.post(
  "/login",
  async (c, next) => {
    if ((c.req.header("Authorization") ?? "").toLowerCase().startsWith("basic ")) {
      return loginBasicAuth(c, next);
    }
    await next();
  },
  async (c) => {
    const header = c.req.header("Authorization") ?? "";
    let credentials: [string, string] | null;

    if (header.toLowerCase().startsWith("basic ")) {
      credentials = readBasicCredentials(header);
    } else {
      const parsed = loginBody.safeParse(await c.req.json().catch(() => null));
      credentials = parsed.success ? [parsed.data.email, parsed.data.password] : null;
    }

    if (!credentials) {
      return c.json({ error: "Invalid request body" }, 400);
    }

    const session = await login(credentials[0].trim(), credentials[1]);
    if (!session) {
      return c.json({ error: "Invalid email or password" }, 401);
    }

    return c.json(session);
  }
);

const forgotPasswordBody = z.object({
  email: z.string().trim().email(),
});

function resolveBaseUrl(origin: string | undefined): string {
  const fallback = (process.env.APP_URL ?? "http://localhost:8085").replace(/\/$/, "");
  if (!origin) {
    return fallback;
  }
  try {
    return new URL(origin).origin;
  } catch {
    return fallback;
  }
}

api.post("/forgot-password", jsonBody(forgotPasswordBody), async (c) => {
  const { email } = c.req.valid("json");
  const user = await getUserByEmail(email);
  if (user) {
    const base = resolveBaseUrl(c.req.header("Origin") ?? c.req.header("Referer"));
    const token = createResetToken(Number(user.id));
    await sendPasswordResetEmail(user.email, `${base}/reset-password?token=${token}`);
  }

  return c.json({ ok: true });
});

const resetPasswordBody = z.object({
  token: z.string().min(1),
  password: z.string().min(1),
});

api.post("/reset-password", jsonBody(resetPasswordBody), async (c) => {
  const { token, password } = c.req.valid("json");
  const userId = verifyResetToken(token);
  if (userId === null) {
    return c.json({ error: "Invalid or expired token" }, 400);
  }

  const user = await updateUser(userId, { password });
  if (!user) {
    return c.json({ error: "User not found" }, 404);
  }

  return c.json({ ok: true });
});

function readPositiveInt(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

api.get("/users", requireAuth, async (c) => {
  const page = readPositiveInt(c.req.query("page"), 1);
  const perPage = readPositiveInt(c.req.query("per_page"), 10);
  const result = await listUsers(page, perPage);
  return c.json(result);
});

api.get("/users/:slug", requireAuth, async (c) => {
  const identifier = c.req.param("slug");
  const id = Number(identifier);
  const user = Number.isInteger(id) ? await getUser(id) : await getUserBySlug(identifier);
  if (!user) {
    return c.json({ error: "User not found" }, 404);
  }

  return c.json({ data: user });
});

const userBody = z.object({
  email: z.string().trim().email(),
  first_name: z.string().trim().min(1),
  last_name: z.string().trim().min(1),
  avatar: z.string().nullable().optional(),
  slug: z.string().optional(),
  password: z.string().optional(),
});

api.post("/users", requireAuth, jsonBody(userBody), async (c) => {
  const input = c.req.valid("json");
  try {
    const user = await createUser(input);
    return c.json({ data: user }, 201);
  } catch (error) {
    return c.json({ error: (error as Error).message ?? "Could not create user" }, 409);
  }
});

api.put("/users/:id", requireAuth, jsonBody(userBody.partial()), async (c) => {
  const id = Number(c.req.param("id"));
  if (!Number.isInteger(id)) {
    return c.json({ error: "Invalid id" }, 400);
  }

  const input = c.req.valid("json");
  try {
    const user = await updateUser(id, input);
    if (!user) {
      return c.json({ error: "User not found" }, 404);
    }
    return c.json({ data: user });
  } catch (error) {
    return c.json({ error: (error as Error).message ?? "Could not update user" }, 409);
  }
});

api.delete("/users/:id", requireAuth, async (c) => {
  const id = Number(c.req.param("id"));
  if (!Number.isInteger(id)) {
    return c.json({ error: "Invalid id" }, 400);
  }

  const deleted = await deleteUser(id);
  if (!deleted) {
    return c.json({ error: "User not found" }, 404);
  }

  return c.body(null, 204);
});

app.route("/api", api);

const rawPort = (process.env.PORT ?? "").trim();
const parsedPort = rawPort.length > 0 ? Number(rawPort) : Number.NaN;
const port =
  Number.isInteger(parsedPort) && parsedPort >= 0 && parsedPort <= 65535 ? parsedPort : 3000;

serve({ fetch: app.fetch, port, hostname: "0.0.0.0" });

console.log(`Server running at http://localhost:${port}`);
