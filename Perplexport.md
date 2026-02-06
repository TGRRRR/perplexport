# Perplexport

Export Perplexity AI conversations to JSON and Markdown.

## Usage

```powershell
# Run executable
.\perplexport.exe

# With citations
.\perplexport.exe --citations
```

## Output Structure

```
./exports/
  2026-02-07T00-29/
    json/        # Raw API responses
    md/          # Rendered markdown
```

## Markdown Format

```yaml
---
URL: https://www.perplexity.ai/search/...
Last updated: 2026-02-06T22:37:20
Space: 🐧 Linux    # If thread is in a Space
---
```

- `# Me` / `# Perplexity` - collapsible sections
- `## Header` - answer headers (bumped from H1)
- Sources stripped by default (use `--citations` to include)

## Key Files

| File | Purpose |
|------|---------|
| `src/cli.ts` | Entry point |
| `src/exportLibrary.ts` | Main export logic |
| `src/renderConversation.ts` | JSON → Markdown |
| `src/rerender-all.ts` | Batch re-render JSONs |

## Re-rendering Existing JSONs

```powershell
$env:OUTPUT_DIR = './exports/2026-02-07T00-29'
npx ts-node src/rerender-all.ts

# With citations
$env:CITATIONS = '1'
npx ts-node src/rerender-all.ts
```

## Building

```powershell
npm run build      # Compile TypeScript
npm run package    # Create standalone .exe
```

## Technical Notes

- Uses `puppeteer-extra` + stealth plugin (bypasses Cloudflare)
- Requires Google Chrome installed
- Tracks progress in `done.json` for resumable exports
- Retries failed conversations 3 times before skipping
