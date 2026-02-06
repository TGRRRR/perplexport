import { promises as fs, constants } from "fs";
import { existsSync } from "fs";
import { join } from "path";
import { DoneFile } from "./types";

export function getChromePath(): string {
  if (process.env.PUPPETEER_EXECUTABLE_PATH) {
    return process.env.PUPPETEER_EXECUTABLE_PATH;
  }

  const paths = [
    join(process.env.LOCALAPPDATA || '', 'Google/Chrome/Application/chrome.exe'),
    join(process.env.PROGRAMFILES || '', 'Google/Chrome/Application/chrome.exe'),
    join(process.env['PROGRAMFILES(X86)'] || '', 'Google/Chrome/Application/chrome.exe'),
  ];

  for (const p of paths) {
    if (existsSync(p)) {
      return p;
    }
  }
  return "";
}

export async function loadDoneFile(doneFilePath: string): Promise<DoneFile> {
  try {
    const content = await fs.readFile(doneFilePath, "utf-8");
    return JSON.parse(content);
  } catch (error: any) {
    if (error.code !== 'ENOENT') {
      console.error(`Error loading done file ${doneFilePath}:`, error);
    }
    return { processedUrls: [] };
  }
}

export async function saveDoneFile(
  doneFile: DoneFile,
  doneFilePath: string
): Promise<void> {
  await fs.writeFile(doneFilePath, JSON.stringify(doneFile, null, 2));
}

export async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
