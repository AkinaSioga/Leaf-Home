import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const astro = fileURLToPath(new URL('../node_modules/astro/bin/astro.mjs', import.meta.url));
const env = { ...process.env, CONTENT_PREVIEW: 'true' };
for (const args of [
  ['build', '--outDir', './dist-drafts'],
  ['preview', '--outDir', './dist-drafts', '--host', '127.0.0.1', '--port', '4323'],
]) {
  const result = spawnSync(process.execPath, [astro, ...args], { cwd: root, env, stdio: 'inherit' });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}
