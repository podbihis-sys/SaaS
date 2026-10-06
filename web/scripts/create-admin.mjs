#!/usr/bin/env node
// create-admin.mjs
// Legt ein BIT-CMS-Admin-Konto an oder aktualisiert dessen Passwort/Rolle.
// Passwort wird mit bcrypt gehasht und in bit_admins gespeichert.
//
// Aufruf:
//   node scripts/create-admin.mjs <email> <passwort> [admin|editor]
// oder ueber Umgebungsvariablen:
//   BIT_ADMIN_EMAIL=... BIT_ADMIN_PASSWORD=... BIT_ADMIN_ROLE=admin \
//     node scripts/create-admin.mjs
//
// DB-Zugang: BIT_DB_* (Fallback DB_*), wie in der App.

import mysql from "mysql2/promise";
import bcrypt from "bcryptjs";

function env(name, fallback) {
  return process.env[`BIT_${name}`] ?? process.env[name] ?? fallback;
}

const email = (process.argv[2] ?? process.env.BIT_ADMIN_EMAIL ?? "").trim().toLowerCase();
const password = process.argv[3] ?? process.env.BIT_ADMIN_PASSWORD ?? "";
const role = (process.argv[4] ?? process.env.BIT_ADMIN_ROLE ?? "admin").trim();

if (!email || !password) {
  console.error("Aufruf: node scripts/create-admin.mjs <email> <passwort> [admin|editor]");
  process.exit(1);
}
if (!["admin", "editor"].includes(role)) {
  console.error(`Ungueltige Rolle: ${role} (erlaubt: admin, editor)`);
  process.exit(1);
}

const conn = await mysql.createConnection({
  host: env("DB_HOST", "127.0.0.1"),
  port: Number(env("DB_PORT", "3306")),
  user: env("DB_USER"),
  password: env("DB_PASSWORD"),
  database: env("DB_NAME"),
});

const hash = await bcrypt.hash(password, 10);

await conn.execute(
  `INSERT INTO bit_admins (id, email, password_hash, role)
     VALUES (UUID(), ?, ?, ?)
   ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash), role = VALUES(role)`,
  [email, hash, role],
);

console.log(`Admin-Konto gespeichert: ${email} (${role})`);
await conn.end();
