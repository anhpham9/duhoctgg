#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import db from "../../src/config/db.js";

const MIGRATIONS_DIR = new URL("./", import.meta.url);
const MIGRATIONS_DIR_PATH = fileURLToPath(MIGRATIONS_DIR);

const isMigrationFile = (fileName) => /^\d{4}-\d{2}-\d{2}.*\.sql$/i.test(fileName);

const ensureMigrationsTable = async () => {
  await db.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id SERIAL PRIMARY KEY,
      file_name VARCHAR(255) UNIQUE NOT NULL,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);
};

const getAppliedMigrations = async () => {
  const result = await db.query("SELECT file_name FROM schema_migrations");
  return new Set(result.rows.map((row) => row.file_name));
};

const readMigrationFiles = async () => {
  const files = await fs.readdir(MIGRATIONS_DIR_PATH);
  return files.filter(isMigrationFile).sort((a, b) => a.localeCompare(b));
};

const applyMigration = async (fileName) => {
  const filePath = path.join(MIGRATIONS_DIR_PATH, fileName);
  const sql = await fs.readFile(filePath, "utf8");

  await db.query("BEGIN");
  try {
    await db.query(sql);
    await db.query(
      "INSERT INTO schema_migrations (file_name) VALUES ($1) ON CONFLICT (file_name) DO NOTHING",
      [fileName]
    );
    await db.query("COMMIT");
    console.log(`[OK] Applied ${fileName}`);
  } catch (error) {
    await db.query("ROLLBACK");
    throw new Error(`Migration ${fileName} failed: ${error.message}`);
  }
};

const run = async () => {
  try {
    await ensureMigrationsTable();

    const [files, applied] = await Promise.all([
      readMigrationFiles(),
      getAppliedMigrations()
    ]);

    const pending = files.filter((file) => !applied.has(file));

    if (pending.length === 0) {
      console.log("No pending migrations.");
      return;
    }

    console.log(`Pending migrations: ${pending.length}`);
    for (const fileName of pending) {
      await applyMigration(fileName);
    }

    console.log("Migrations completed successfully.");
  } catch (error) {
    console.error(`[ERROR] ${error.message}`);
    process.exitCode = 1;
  } finally {
    await db.pool.end();
  }
};

run();
