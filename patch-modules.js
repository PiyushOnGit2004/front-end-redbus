const fs = require("fs");
const path = require("path");

function walk(dir) {
  if (!fs.existsSync(dir)) return;
  let entries = [];
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch (e) {
    return;
  }
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath);
    } else if (entry.name === "package.json") {
      try {
        const content = fs.readFileSync(fullPath, "utf8");
        const pkg = JSON.parse(content);
        let modified = false;

        // Remove exports restriction from PostCSS and related packages
        if (pkg.name === "postcss" && pkg.exports) {
          delete pkg.exports;
          modified = true;
        } else if (pkg.exports && typeof pkg.exports === "object") {
          if (pkg.exports["./"]) {
            delete pkg.exports["./"];
            pkg.exports["./*"] = "./*";
            modified = true;
          }
        }

        if (modified) {
          fs.writeFileSync(fullPath, JSON.stringify(pkg, null, 2));
          console.log("Patched package.json:", fullPath);
        }
      } catch (e) {}
    }
  }
}

const nmPath = path.join(__dirname, "node_modules");
if (fs.existsSync(nmPath)) {
  walk(nmPath);
}
