import { promises as fs } from "fs";
import path from "path";
import puppeteer from "puppeteer-core";
import { Browser } from "puppeteer-core";
import { ConversationSaver } from "./ConversationSaver";
import { getConversations } from "./listConversations";
import { login } from "./login";
import renderConversation from "./renderConversation";
import { loadDoneFile, saveDoneFile, sleep, getChromePath } from "./utils";

export interface ExportLibraryOptions {
  outputDir: string;
  doneFilePath: string;
  email: string;
  includeCitations?: boolean;
}

function getTimestampedFolderName(): string {
  const now = new Date();
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}-${pad(now.getMinutes())}`;
}

export default async function exportLibrary(options: ExportLibraryOptions) {
  // Create timestamped output directory with json/md subdirs
  const timestamp = getTimestampedFolderName();
  const exportDir = path.join(options.outputDir, timestamp);
  const jsonDir = path.join(exportDir, "json");
  const mdDir = path.join(exportDir, "md");

  await fs.mkdir(jsonDir, { recursive: true });
  await fs.mkdir(mdDir, { recursive: true });

  console.log(`Export folder: ${exportDir}`);

  // Load done file
  const doneFile = await loadDoneFile(options.doneFilePath);
  console.log(
    `Loaded ${doneFile.processedUrls.length} processed URLs from done file`
  );

  const executablePath = getChromePath();
  if (!executablePath) {
    throw new Error("Google Chrome not found. Please install it or set PUPPETEER_EXECUTABLE_PATH.");
  }

  const browser: Browser = await puppeteer.launch({
    headless: false,
    executablePath: executablePath,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    defaultViewport: null
  });

  try {
    const page = await browser.newPage();

    await login(page, options.email);
    const conversations = await getConversations(page, doneFile);

    console.log(`Found ${conversations.length} new conversations to process`);

    const conversationSaver = new ConversationSaver(page);
    await conversationSaver.initialize();

    for (const conversation of conversations) {
      console.log(`Processing conversation ${conversation.url}`);

      const threadData = await conversationSaver.loadThreadFromURL(
        conversation.url
      );

      // Save JSON
      await fs.writeFile(
        path.join(jsonDir, `${threadData.id}.json`),
        JSON.stringify(threadData.conversation, null, 2)
      );

      // Save Markdown
      const result = renderConversation(threadData.conversation, {
        includeCitations: options.includeCitations,
      });
      await fs.writeFile(
        path.join(mdDir, `${result.suggestedFilename}.md`),
        result.markdown
      );

      doneFile.processedUrls.push(conversation.url);
      await saveDoneFile(doneFile, options.doneFilePath);

      await sleep(2000);
    }

    console.log("Done");
  } catch (error) {
    console.error("An error occurred:", error);
  } finally {
    // await browser.close();
    console.log("Browser left open for debugging.");
  }
}
