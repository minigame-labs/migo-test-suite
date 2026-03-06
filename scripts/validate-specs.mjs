import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const SPECS_DIR = path.join(ROOT, 'tests', 'specs');

const ALLOWED_MATCHERS = new Set([
  '@string',
  '@number',
  '@boolean',
  '@object',
  '@function',
  '@array',
  '@exists',
  '@arraybuffer',
  '@ArrayBuffer',
  '@typedarray'
]);

function walk(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...walk(full));
    } else if (entry.isFile() && entry.name.endsWith('.js')) {
      out.push(full);
    }
  }
  return out;
}

function rel(file) {
  return path.relative(ROOT, file).replaceAll('\\', '/');
}

function main() {
  if (!fs.existsSync(SPECS_DIR)) {
    console.error('[validate-specs] tests/specs not found');
    process.exit(1);
  }

  const files = walk(SPECS_DIR);
  const errors = [];
  const idMap = new Map();

  for (const file of files) {
    const text = fs.readFileSync(file, 'utf8');
    const lines = text.split(/\r?\n/);

    const idRe = /\bid\s*:\s*['"`]([^'"`]+)['"`]/g;
    for (const match of text.matchAll(idRe)) {
      const id = match[1];
      if (!idMap.has(id)) idMap.set(id, []);
      idMap.get(id).push(rel(file));
    }

    lines.forEach((line, index) => {
      const ln = index + 1;

      if (/expect\s*:\s*['"`]PASSA['"`]/.test(line)) {
        errors.push(`${rel(file)}:${ln} typo: expect should be PASS, not PASSA`);
      }

      const matcherRe = /['"`](@[A-Za-z]+)['"`]/g;
      for (const m of line.matchAll(matcherRe)) {
        const token = m[1];
        if (!ALLOWED_MATCHERS.has(token)) {
          errors.push(`${rel(file)}:${ln} unsupported matcher token: ${token}`);
        }
      }
    });
  }

  for (const [id, locations] of idMap.entries()) {
    const uniq = Array.from(new Set(locations));
    if (uniq.length > 1) {
      errors.push(`duplicate test id "${id}" in: ${uniq.join(', ')}`);
    }
  }

  if (errors.length > 0) {
    console.error(`[validate-specs] failed with ${errors.length} error(s):`);
    for (const e of errors) console.error(`- ${e}`);
    process.exit(1);
  }

  console.log(`[validate-specs] OK (${files.length} files scanned)`);
}

main();
