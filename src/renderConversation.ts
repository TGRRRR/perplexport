import {
  ConversationResponse,
  ImageModeBlock,
  SourcesModeBlock,
  VideoModeBlock,
} from "./types/conversation";

export interface RenderResult {
  markdown: string;
  suggestedFilename: string;
}

export default function renderConversation(
  conversation: ConversationResponse
): RenderResult {
  const { entries } = conversation;

  if (entries.length === 0) {
    return { markdown: "", suggestedFilename: "untitled" };
  }

  const firstEntry = entries[0];

  // Get filename from thread_title
  let suggestedFilename = firstEntry.thread_title || "untitled";
  suggestedFilename = sanitizeFilename(suggestedFilename);

  // Build space property from collection_info
  let spaceValue = "";
  if (firstEntry.collection_info?.title) {
    const emoji = firstEntry.collection_info.emoji || "";
    const title = firstEntry.collection_info.title;
    spaceValue = emoji ? `${emojiFromCodepoint(emoji)} ${title}` : title;
  }

  // Build YAML frontmatter
  let frontmatter = `---
URL: https://www.perplexity.ai/search/${firstEntry.thread_url_slug}
Last updated: ${entries[entries.length - 1].updated_datetime}`;

  if (spaceValue) {
    frontmatter += `\nSpace: ${spaceValue}`;
  }
  frontmatter += "\n---";

  let items = [frontmatter];

  entries.forEach((entry, entryIndex) => {
    // User prompt
    items.push("# Me");
    items.push(entry.query_str);
    items.push("---");

    // Perplexity response
    items.push("# Perplexity");

    const answerBlock = entry.blocks.find(
      (block) => block.intended_usage === "ask_text"
    )?.markdown_block;

    const sourcesBlock = entry.blocks.find(
      (block) => block.intended_usage === "sources_answer_mode"
    )?.sources_mode_block;

    const imagesBlock = entry.blocks.find(
      (block) => block.intended_usage === "image_answer_mode"
    )?.image_mode_block;

    const videoBlock = entry.blocks.find(
      (block) => block.intended_usage === "video_answer_mode"
    )?.video_mode_block;

    if (imagesBlock) {
      items.push(renderImages(imagesBlock));
    }

    if (videoBlock) {
      items.push(renderVideo(videoBlock));
    }

    if (answerBlock) {
      let cleanedAnswer = cleanupAnswer(answerBlock.answer, entryIndex);
      cleanedAnswer = bumpHeaders(cleanedAnswer);
      items.push(cleanedAnswer);
    }

    if (sourcesBlock) {
      items.push(renderSources(sourcesBlock, entryIndex));
    }

    // Separator between exchanges (except after last one)
    if (entryIndex < entries.length - 1) {
      items.push("---");
    }
  });

  return {
    markdown: items.join("\n\n"),
    suggestedFilename
  };
}

function emojiFromCodepoint(codepoint: string): string {
  try {
    return String.fromCodePoint(parseInt(codepoint, 16));
  } catch {
    return "";
  }
}

function bumpHeaders(text: string): string {
  return text.replace(/^(#{1,5}) /gm, (match, hashes) => {
    return '#' + hashes + ' ';
  });
}

function sanitizeFilename(name: string): string {
  return name
    .replace(/[<>:"/\\|?*]/g, '')
    .replace(/_/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .substring(0, 100);
}

function cleanupAnswer(answer: string, entryIndex: number): string {
  return (
    answer
      .replace(/\[(.*?)\]\(pplx:\/\/.*?\)/g, "$1")
      .replace(/\[(\d+)\]/g, (_, num) => ` [[#^${entryIndex + 1}-${num}]] `)
  );
}

function renderSources(sources: SourcesModeBlock, entryIndex: number): string {
  let sourcesText = `## ${sources.rows.length} Sources\n\n`;
  sources.rows.forEach((row) => {
    if (row.web_result.url.startsWith("http")) {
      sourcesText += `- [${row.web_result.name}](${row.web_result.url
        }) ${hostLabel(row.web_result.url)}`;
    } else {
      sourcesText += `- ${row.web_result.name} (${row.web_result.url})`;
    }
    if (row.web_result.snippet) {
      sourcesText += `\n    ${row.web_result.snippet}`;
    }

    if (row.citation) {
      sourcesText += ` ^${entryIndex + 1}-${row.citation}`;
    }
    sourcesText += "\n";
  });

  return sourcesText;
}

function renderImages(images: ImageModeBlock): string {
  const imagesLine = images.media_items
    .map((item) => {
      const scale = 100 / item.image_height;
      return `[![${item.name}|${(item.image_width * scale).toFixed(0)}x100](${item.image
        })](${item.url})`;
    })
    .join(" ");

  return `${imagesLine}\n`;
}

function renderVideo(video: VideoModeBlock): string {
  let videosText = "";

  video.media_items.forEach((item) => {
    videosText += `- 📺 [${item.name}](${item.url}) ${hostLabel(item.url)}\n`;
  });

  return videosText;
}

function hostLabel(url: string): string {
  return `(${new URL(url).hostname.replace("www.", "")})`;
}
