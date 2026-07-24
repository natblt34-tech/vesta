/* Vérifie l'état du schéma Vesta sur Supabase. */
import { readFileSync } from "node:fs";
import pg from "pg";

const txt = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
const e = Object.fromEntries(
  txt.split(/\r?\n/).map((l) => l.match(/^([A-Z0-9_]+)=(.*)$/)).filter(Boolean).map((m) => [m[1], m[2]]),
);
const ref = new URL(e.NEXT_PUBLIC_SUPABASE_URL).hostname.split(".")[0];

const client = new pg.Client({
  host: "aws-0-eu-central-1.pooler.supabase.com",
  port: 5432,
  user: `postgres.${ref}`,
  password: e.SUPABASE_DB_PASSWORD,
  database: "postgres",
  ssl: { rejectUnauthorized: false },
});
await client.connect();

const tables = await client.query(
  `select table_name from information_schema.tables where table_schema='public' order by table_name`,
);
const policies = await client.query(
  `select tablename, count(*) n from pg_policies where schemaname in ('public','storage') group by tablename order by tablename`,
);
const buckets = await client.query(`select id, public from storage.buckets order by id`);

console.log("Tables publiques :", tables.rows.map((r) => r.table_name).join(", "));
console.log("Policies RLS :", policies.rows.map((r) => `${r.tablename}(${r.n})`).join(", "));
console.log("Buckets :", buckets.rows.map((r) => `${r.id}[${r.public ? "public" : "privé"}]`).join(", "));

await client.end();
