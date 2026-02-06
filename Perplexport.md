# Perplexport

Export Perplexity AI conversations to JSON and Markdown.

## Quick Start

```powershell
# Run from source
npm start

# Or use compiled executable
.\dist\perplexport.exe

# Include source citations (default: stripped)
.\dist\perplexport.exe --citations
```

## Output Structure

Each export creates a timestamped folder:
```
./exports/
  2026-02-06T22-35/
    json/        # Raw API responses
    md/          # Rendered markdown files
    done.json    # Progress tracking
```

## Markdown Format

```yaml
---
URL: https://www.perplexity.ai/search/...
Last updated: 2026-02-06T22:37:20
Space: 🐧 Linux    # Only if thread is in a Space
---
```

Headers structure:
- `# Me` / `# Perplexity` - collapsible sections per exchange
- `## Source Title` - answer headers (bumped from H1)
- `## N Sources` - citations with block references

## Key Files

| File | Purpose |
|------|---------|
| `src/cli.ts` | Entry point, email prompt |
| `src/exportLibrary.ts` | Main export logic |
| `src/renderConversation.ts` | JSON → Markdown conversion |
| `src/rerender-all.ts` | Batch re-render existing JSONs |

## Re-rendering

Convert existing JSON files to updated markdown format:

```powershell
# New structure (json/ and md/ subfolders)
$env:OUTPUT_DIR = './exports/2026-02-06T22-35'
npx ts-node src/rerender-all.ts

# Old flat structure
$env:OUTPUT_DIR = './JSON'
npx ts-node src/rerender-all.ts
```

## Building

```powershell
npm run build      # Compile TypeScript
npm run package    # Create standalone .exe
```

## Technical Notes

- Uses `puppeteer-core` with system Chrome (no bundled Chromium)
- Email login via Perplexity's passwordless auth
- Tracks processed URLs in `done.json` for resumable exports
- Filenames from `thread_title`, sanitized for filesystem
- Source citations use block references: `[[#^1-2]]`
