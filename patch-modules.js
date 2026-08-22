const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

// Find ALL postcss package.json files anywhere in node_modules
let files = [];
try {
  const result = execSync(
    'find node_modules -name "package.json" -path "*/postcss/package.json"',
    { encoding: "utf8", cwd: __dirname }
  );
  files = result.trim().split("\n").filter(Boolean);
} catch (e) {
  console.log("find command failed, using fallback");
  files = [
    "node_modules/postcss/package.json",
    "node_modules/postcss-safe-parser/node_modules/postcss/package.json",
  ];
}

console.log("Found postcss package files:", files);

for (const relPath of files) {
  const fullPath = path.join(__dirname, relPath);
  if (!fs.existsSync(fullPath)) continue;
  try {
    const raw = fs.readFileSync(fullPath, "utf8");
    const pkg = JSON.parse(raw);
    if (pkg.exports) {
      delete pkg.exports;
      fs.writeFileSync(fullPath, JSON.stringify(pkg, null, 2));
      console.log("✓ Patched exports in:", relPath);
    } else {
      console.log("- No exports to patch in:", relPath);
    }
  } catch (e) {
    console.error("✗ Failed to patch:", relPath, e.message);
  }
}
