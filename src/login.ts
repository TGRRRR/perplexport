import { Page } from "puppeteer-core";

export async function login(page: Page, email: string): Promise<void> {
  console.log("Navigating to Perplexity...");
  await page.goto("https://www.perplexity.ai/");

  try {
    const button = await page.waitForSelector("button::-p-text('Accept All Cookies')", { timeout: 3000 });
    if (button) {
      await button.click();
    }
  } catch (e) {
    // Ignore if not found
  }

  const emailInput = await page.waitForSelector("input[type='email']", { timeout: 10000 }).catch(() => null);

  if (emailInput) {
    console.log("Enter your email:", email);
    await emailInput.type(email);
    await page.keyboard.press("Enter");

    // Sometimes there is a "Continue with email" button
    try {
      const continueButton = await page.waitForSelector("button::-p-text('Continue with email')", { timeout: 3000 });
      if (continueButton) {
        await continueButton.click();
      }
    } catch (e) { }

    console.log("Waiting for you to enter the email code...");
  } else {
    console.log("Could not find email input, assuming already logged in or manual intervention needed.");
  }

  console.log("Waiting for login to succeed...");

  // Wait for a sign that we are logged in. The new threads UI usually has "Ask anything..." or similar.
  // We can wait for the presence of the user menu or the absence of the login modal, or just a known element of the main interface.
  // The 'textarea' for asking questions is a good candidate.
  await page.waitForSelector('textarea[placeholder*="Ask"]', { timeout: 0 }); // Wait indefinitely
  console.log("Successfully logged in.");
}
