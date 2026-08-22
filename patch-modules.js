const fs = require("fs");
const path = require("path");

function walk(dir) {
  if (!fs.existsSync(dir)) return;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath);
    } else if (entry.name === "package.json") {
      try {
        const content = fs.readFileSync(fullPath, "utf8");
        if (
          content.includes('"exports"') &&
          (content.includes('"./": "./"') || fullPath.includes("postcss"))
        ) {
          const pkg = JSON.parse(content);
          if (pkg.exports && typeof pkg.exports === "object") {
            pkg.exports["./lib/tokenize"] = "./lib/tokenize.js";
            pkg.exports["./lib/*"] = "./lib/*.js";
            pkg.exports["./*"] = "./*";
            fs.writeFileSync(fullPath, JSON.stringify(pkg, null, 2));
            console.log("Patched exports in:", fullPath);
          }
        }
      } catch (e) {}
    }
  }
}

const nmPath = path.join(__dirname, "node_modules");
if (fs.existsSync(nmPath)) {
  walk(nmPath);
}
