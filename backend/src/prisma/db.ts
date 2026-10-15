import postgres from "@prisma/orm-postgres/runtime";

import "temporal-polyfill/global";

import type { Contract } from "./contract.d.ts";
import contractJson from "./contract.json" with { type: "json" };

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error("DATABASE_URL is not set. The API cannot reach PostgreSQL.");
}

export const db = postgres<Contract>({
  contractJson,
  url: databaseUrl,
});