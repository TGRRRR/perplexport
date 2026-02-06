import { Page } from "puppeteer";
import { Conversation, DoneFile } from "./types";
import { sleep } from "./utils";

export async function scrollToBottomOfConversations(
  page: Page,
  doneFile: DoneFile
): Promise<void> {
  // Scroll to bottom and wait for more items until no new items load
  let previousHeight = 0;
  let currentHeight = await page.evaluate(() => {
    const container = document.querySelector("div.scrollable-container");
    return container?.scrollHeight || 0;
  });

  // Safety break to prevent infinite loops if something is wrong
  let unchangedCount = 0;

  while (previousHeight !== currentHeight || unchangedCount < 3) { // Allow a few retries even if height seems same
    // Check if we've hit any processed URLs
    const foundProcessed = await page.evaluate((processedUrls) => {
      const items = Array.from(
        document.querySelectorAll('div[data-testid="thread-title"], a[href^="/search/"]')
      ).map((div: Element) => div.closest("a") as HTMLAnchorElement).filter(el => el != null && el.href.includes("/search/"));
      return items.some((item) => processedUrls.includes(item.href));
    }, doneFile.processedUrls);

    if (foundProcessed) {
      console.log("Found already processed conversation, stopping scroll");
      break;
    }

    // Scroll to bottom
    await page.evaluate(() => {
      const container = document.querySelector("div.scrollable-container");
      if (container) {
        container.scrollTo(0, container.scrollHeight);
      } else {
        // Fallback if container selector changed, scroll window
        window.scrollTo(0, document.body.scrollHeight);
      }
    });

    // Wait a bit for content to load
    await sleep(2000);

    previousHeight = currentHeight;
    currentHeight = await page.evaluate(() => {
      const container = document.querySelector("div.scrollable-container");
      return container?.scrollHeight || document.body.scrollHeight;
    });

    if (previousHeight === currentHeight) {
      unchangedCount++;
    } else {
      unchangedCount = 0;
    }
  }
}

export async function getConversations(
  page: Page,
  doneFile: DoneFile
): Promise<Conversation[]> {
  console.log("Navigating to library...");
  await page.goto("https://www.perplexity.ai/library");

  try {
    // Try primary selector
    await page.waitForSelector('div[data-testid="thread-title"]', { timeout: 5000 });
  } catch (e) {
    // Try fallback selector
    try {
      await page.waitForSelector('a[href^="/search/"]', { timeout: 5000 });
    } catch (e2) {
      console.error("Could not find thread list. Dumping page content to error_page.html");
      const fs = require('fs');
      try {
        fs.writeFileSync('error_page.html', await page.content());
      } catch (err) { }
      throw new Error("Failed to find conversation list on the page.");
    }
  }

  await scrollToBottomOfConversations(page, doneFile);

  // Get all conversation links
  const conversations = await page.evaluate(() => {
    const items = Array.from(
      document.querySelectorAll('div[data-testid="thread-title"], a[href^="/search/"]')
    ).map((el: Element) => el.closest("a") as HTMLAnchorElement).filter(el => el !== null && el.href.includes("/search/"));

    // Deduplicate by URL
    const uniqueItems = new Map();
    items.forEach(item => {
      uniqueItems.set(item.href, item.textContent?.trim() || "Untitled");
    });

    return Array.from(uniqueItems.entries()).map(([url, title]) => ({
      title,
      url,
    }));
  });

  // Filter out already processed conversations and reverse the order
  return conversations
    .filter((conv) => !doneFile.processedUrls.includes(conv.url))
    .reverse();
}
