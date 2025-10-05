import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Use HTTP connection without timeout to handle Neon database wake-up from sleep
// Neon databases can be suspended and may take 30+ seconds to reactivate
const sql = neon(process.env.DATABASE_URL);

export const db = drizzle(sql, { schema });