import { Page } from "puppeteer-core";
import { ConversationResponse } from "./types/conversation";

interface ThreadData {
  id: string;
  conversation: ConversationResponse;
}

export class ConversationSaver {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  private resolve: (data: ThreadData) => void = (_) => { };

  async initialize(): Promise<void> {
    this.page.on("response", async (response) => {
      const url = response.url();
      try {
        if (
          response.request().method() === "GET" &&
          url.includes("/rest/thread/")
        ) {
          const parts = url.split("/rest/thread/");
          if (parts.length > 1) {
            const threadId = parts[1].split("?")[0];
            if (threadId === "list_recent") {
              //ignore list request
              return;
            }

            try {
              const data = (await response.json()) as ConversationResponse;
              if (this.resolve) {
                this.resolve({
                  id: threadId,
                  conversation: data,
                });
              }
            } catch (error) {
              // Often response body is not JSON or empty if request failed
            }
          }
        }
      } catch (e) {
        // Ignore errors in response handling
      }
    });
  }

  // we request the thread's page and wait for the response for thread data
  // the response is captured by the response handler above
  // and we route it through the promise
  // concurrency not possible with the browser anyway
  async loadThreadFromURL(url: string): Promise<ThreadData> {
    const pagePromise = new Promise<ThreadData>((resolve) => {
      this.resolve = resolve;
    });
    const timeoutPromise = new Promise<ThreadData>((_, reject) => {
      setTimeout(() => reject(new Error("Timeout waiting for thread data")), 30000);
    });

    try {
      await this.page.goto(url);
      const threadData = await Promise.race([pagePromise, timeoutPromise]);
      this.resolve = (_) => { };
      return threadData;
    } catch (e) {
      this.resolve = (_) => { };
      console.error(`Failed to load thread data for ${url}:`, e);
      throw e;
    }
  }
}
