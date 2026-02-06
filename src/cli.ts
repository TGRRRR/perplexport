#!/usr/bin/env node

import { Command } from "commander";
import * as readline from "readline";
import exportLibrary from "./exportLibrary";

const program = new Command();

program
  .name("perplexport")
  .description("Export Perplexity conversations as markdown files")
  .version("1.0.0")
  .option("-o, --output <directory>", "Base output directory (timestamped subfolder will be created)", "./exports")
  .option(
    "-d, --done-file <file>",
    "Done file location (tracks which URLs have been downloaded before)",
    "done.json"
  )
  .option("-e, --email <email>", "Perplexity email")
  .option("--citations", "Include source citations in markdown output", false)
  .parse();

const options = program.opts();

function prompt(question: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

function waitForEnter(): Promise<void> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) => {
    rl.question("\nPress Enter to exit...", () => {
      rl.close();
      resolve();
    });
  });
}

async function main(): Promise<void> {
  let email = options.email;

  if (!email) {
    email = await prompt("Enter your Perplexity email: ");
    if (!email) {
      console.error("Email is required.");
      await waitForEnter();
      process.exit(1);
    }
  }

  await exportLibrary({
    outputDir: options.output,
    doneFilePath: options.doneFile,
    email: email,
    includeCitations: options.citations,
  });
}

main()
  .then(async () => {
    await waitForEnter();
  })
  .catch(async (error) => {
    console.error("Fatal error:", error);
    await waitForEnter();
    process.exit(1);
  });
