import renderConversation from "./renderConversation";
import fs from "fs";
import path from "path";

// This script re-renders all JSON files into Markdown.
// Supports both:
//   - New structure: ./exports/2026-02-06T22-35/json/ -> md/
//   - Old structure: ./JSON/ (flat, outputs .md alongside .json)

const outputDir = process.env.OUTPUT_DIR || "./exports";

let jsonDir: string;
let mdDir: string;
let flatMode = false;

// Check if new structure (has json/ subfolder)
if (fs.existsSync(path.join(outputDir, "json"))) {
  jsonDir = path.join(outputDir, "json");
  mdDir = path.join(outputDir, "md");
} else if (fs.existsSync(outputDir) && fs.readdirSync(outputDir).some(f => f.endsWith('.json'))) {
  // Flat mode: JSON files directly in folder
  jsonDir = outputDir;
  mdDir = outputDir;
  flatMode = true;
} else {
  console.error(`No JSON files found in: ${outputDir}`);
  console.error("Usage: OUTPUT_DIR=./exports/2026-02-06T22-35 npx ts-node src/rerender-all.ts");
  console.error("   or: OUTPUT_DIR=./JSON npx ts-node src/rerender-all.ts (for flat folders)");
  process.exit(1);
}

fs.mkdirSync(mdDir, { recursive: true });

const files = fs
  .readdirSync(jsonDir)
  .filter((file) => file.endsWith(".json"));

console.log(`Found ${files.length} JSON files to process (${flatMode ? 'flat' : 'nested'} mode)`);

for (const file of files) {
  const filePath = path.join(jsonDir, file);
  try {
    const conversation = JSON.parse(fs.readFileSync(filePath, "utf8"));
    const result = renderConversation(conversation);

    const outputPath = path.join(mdDir, `${result.suggestedFilename}.md`);
    fs.writeFileSync(outputPath, result.markdown);
    console.log(`Rendered ${file} -> ${result.suggestedFilename}.md`);
  } catch (e) {
    console.error(`Failed to process ${file}:`, e);
  }
}

console.log("Done!");
