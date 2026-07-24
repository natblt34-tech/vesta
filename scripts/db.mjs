/* Applique un fichier SQL sur la base Supabase.
   Usage : node scripts/db.mjs supabase/schema.sql
   Lit les identifiants depuis .env.local. Essaie la connexion directe
   (db.<ref>.supabase.co) puis, à défaut, le pooler de session. */

import { readFileSync } from "node:fs";
import pg from "pg";

function env() {
  const txt = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
  const map = {};
  for (const ligne of txt.split(/\r?\n/)) {
    const m = ligne.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m) map[m[1]] = m[2];
  }
  return map;
}

const fichier = process.argv[2];
if (!fichier) {
  console.error("Usage : node scripts/db.mjs <fichier.sql>");
  process.exit(1);
}

const e = env();
const ref = new URL(e.NEXT_PUBLIC_SUPABASE_URL).hostname.split(".")[0];
const password = e.SUPABASE_DB_PASSWORD;
const sql = readFileSync(new URL(`../${fichier}`, import.meta.url), "utf8");

/* Hôtes candidats : direct, puis poolers des régions EU courantes. */
const candidats = [
  { host: `db.${ref}.supabase.co`, port: 5432, user: "postgres" },
  ...["eu-west-1", "eu-west-2", "eu-west-3", "eu-central-1", "eu-central-2", "eu-north-1"].flatMap((r) => [
    { host: `aws-0-${r}.pooler.supabase.com`, port: 5432, user: `postgres.${ref}` },
    { host: `aws-1-${r}.pooler.supabase.com`, port: 5432, user: `postgres.${ref}` },
  ]),
];

async function essayer(cfg) {
  const client = new pg.Client({
    host: cfg.host,
    port: cfg.port,
    user: cfg.user,
    password,
    database: "postgres",
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 8000,
    query_timeout: 60000,
  });
  await client.connect();
  return client;
}

let client = null;
for (const cfg of candidats) {
  try {
    client = await essayer(cfg);
    console.log(`Connecté via ${cfg.host}`);
    break;
  } catch (err) {
    console.log(`  ${cfg.host} : ${err.code || err.message}`);
  }
}

if (!client) {
  console.error("\nAucune connexion directe. Collez le SQL dans Supabase > SQL Editor.");
  process.exit(2);
}

try {
  await client.query(sql);
  console.log(`\nOK : ${fichier} appliqué.`);
} catch (err) {
  console.error(`\nErreur SQL : ${err.message}`);
  process.exitCode = 3;
} finally {
  await client.end();
}
