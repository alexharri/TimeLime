import fs from "fs";
import path from "path";

const srcDir = path.resolve(__dirname, "../src");
const cursorsDir = path.resolve(srcDir, "./core/utils/cursor");
const pngDir = path.resolve(cursorsDir, "./png");
const outFile = path.resolve(cursorsDir, "./base64Cursors.ts");

const cursorFileNames = fs.readdirSync(pngDir);

const out: Record<string, string> = {};

for (const fileName of cursorFileNames) {
  const cursorPath = path.resolve(pngDir, `./${fileName}`);

  const withoutDotPng = fileName.split(".png")[0];

  const content = fs.readFileSync(cursorPath, "base64");
  out[withoutDotPng] = `url(data:image/png;base64,${content})`;
}

let str = `export const base64Cursors = {\n`;

for (const [key, value] of Object.entries(out)) {
  str += `  ${key}: "${value}",\n`;
}

str += "};\n";

fs.writeFileSync(outFile, str, "utf-8");
