import { Page } from "puppeteer";

export async function login(page: Page, email: string): Promise<void> {
  console.log("Navigating to Perplexity...");
  await page.goto("https://www.perplexity.ai/");

  try {
    await page.waitForSelector("button::-p-text('Accept All Cookies')", { timeout: 3000 });
    await page.click("button::-p-text('Accept All Cookies')");
  } catch (e) {
    console.log("No cookie banner found, continuing...");
  }

  // Wait for email input and enter credentials
  await page.waitForSelector('input[type="email"]');
  await page.type('input[type="email"]', email);

  // Click the login submit button
  await page.click("button::-p-text('Continue with email')");

  await page.waitForNavigation();

  await page.waitForSelector('input[placeholder="Enter Code"]');

  console.log(
    "Check your email and enter code in the window.\nWaiting for you to enter the email code and login to succeed..."
  );

  await page.waitForNavigation();

  // Wait for the main chat input to be ready
  await page.waitForSelector("#ask-input", {
    timeout: 120000,
  });

  console.log("Successfully logged in");
}
