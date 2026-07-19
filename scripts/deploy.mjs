/* Déploiement GitHub Pages : builde l'export statique sous /vesta
   et pousse le contenu de out/ sur la branche gh-pages.
   Usage : npm run deploy */

import { execSync } from "node:child_process";
import { rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const racine = process.cwd();
const out = join(racine, "out");

const run = (cmd, cwd = racine) =>
  execSync(cmd, { stdio: "inherit", cwd, env: { ...process.env, NEXT_PUBLIC_BASE_PATH: "/vesta" } });

run("npm run build");

/* .nojekyll : Pages ne doit pas passer _next/ au filtre Jekyll. */
writeFileSync(join(out, ".nojekyll"), "");

/* Dépôt jetable dans out/, poussé de force sur gh-pages. */
rmSync(join(out, ".git"), { recursive: true, force: true });
run("git init -b gh-pages", out);
run('git -c user.name="Vesta" -c user.email="stirling3134@gmail.com" add -A', out);
run('git -c user.name="Vesta" -c user.email="stirling3134@gmail.com" commit -m "Déploiement Pages"', out);
run("git push --force https://github.com/natblt34-tech/vesta.git gh-pages", out);
rmSync(join(out, ".git"), { recursive: true, force: true });

console.log("\nDéployé : https://natblt34-tech.github.io/vesta/");
