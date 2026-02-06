import { Page } from "puppeteer";
import * as readline from "readline";

function waitForKeypress(prompt: string): Promise<void> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) => {
    rl.question(prompt, () => {
      rl.close();
      resolve();
    });
  });
}

export async function login(page: Page): Promise<void> {
  console.log("Opening Perplexity...");
  await page.goto("https://www.perplexity.ai/");

  try {
    const button = await page.waitForSelector("button::-p-text('Accept All Cookies')", { timeout: 3000 });
    if (button) {
      await button.click();
    }
  } catch (e) {
    // Ignore if not found
  }

  console.log(`\nPlease log in to Perplexity in the browser window.`);
  await waitForKeypress("Press Enter when you are logged in...");

  console.log("Continuing with export...");
}
