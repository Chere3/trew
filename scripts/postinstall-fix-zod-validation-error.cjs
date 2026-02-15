/*
  Workaround for eslint-plugin-react-hooks@7.x depending on `zod-validation-error/v4`.
  Some zod-validation-error versions ship a `v4/` folder but do not export it via package.json `exports`,
  which breaks Node's package exports resolution.

  This script patches any installed `zod-validation-error` package.json to export the ./v4 subpath
  when the folder exists.

  NOTE: This is a temporary workaround until upstream packages fix their exports.
*/

const fs = require('node:fs');
const path = require('node:path');

function safeReadJson(p) {
  try {
    return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch {
    return null;
  }
}

function safeWriteJson(p, obj) {
  fs.writeFileSync(p, JSON.stringify(obj, null, 2) + '\n', 'utf8');
}

function patchPackageJson(pkgJsonPath) {
  const pkgDir = path.dirname(pkgJsonPath);
  const v4Dir = path.join(pkgDir, 'v4');
  if (!fs.existsSync(v4Dir)) return false;

  const pkg = safeReadJson(pkgJsonPath);
  if (!pkg) return false;

  // Ensure exports exists
  if (!pkg.exports || typeof pkg.exports !== 'object') pkg.exports = {};

  // If already exported, no-op
  if (pkg.exports['./v4']) return false;

  // Try common file layouts
  const candidates = [
    {
      types: './v4/index.d.ts',
      require: './v4/index.js',
      import: './v4/index.mjs',
    },
    {
      types: './v4/index.d.ts',
      require: './v4/index.cjs',
      import: './v4/index.js',
    },
  ];

  let chosen = null;
  for (const c of candidates) {
    const okTypes = fs.existsSync(path.join(pkgDir, c.types.replace('./', '')));
    const okReq = fs.existsSync(path.join(pkgDir, c.require.replace('./', '')));
    const okImp = fs.existsSync(path.join(pkgDir, c.import.replace('./', '')));
    if (okTypes && okReq && okImp) {
      chosen = c;
      break;
    }
  }

  // If we can't validate exact files, still add a best-guess mapping.
  if (!chosen) {
    chosen = candidates[0];
  }

  pkg.exports['./v4'] = {
    types: chosen.types,
    require: chosen.require,
    import: chosen.import,
  };

  safeWriteJson(pkgJsonPath, pkg);
  return true;
}

function* walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      // Skip huge dirs we don't need
      if (e.name === '.git') continue;
      yield* walk(full);
    } else if (e.isFile() && e.name === 'package.json') {
      yield full;
    }
  }
}

function main() {
  const root = process.cwd();
  const nodeModules = path.join(root, 'node_modules');
  if (!fs.existsSync(nodeModules)) return;

  let patched = 0;
  for (const pkgJsonPath of walk(nodeModules)) {
    if (!pkgJsonPath.endsWith(path.join('zod-validation-error', 'package.json'))) continue;
    if (patchPackageJson(pkgJsonPath)) patched++;
  }

  if (patched > 0) {
    console.log(`[postinstall] Patched zod-validation-error exports (./v4) in ${patched} location(s).`);
  }
}

main();
