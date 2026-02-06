# Perplexport

Export your Perplexity AI conversations as JSON and Markdown files.

## Features

- **Automatic Chrome detection** - Uses your installed Chrome browser
- **Clean Markdown output** - Proper `# Me` / `# Perplexity` headers, collapsible sections
- **Smart filenames** - Generated from conversation titles
- **Organized exports** - Timestamped folders with separate `json/` and `md/` subdirectories
- **Resume support** - Tracks processed URLs to avoid re-downloading

## Quick Start

### Windows Executable

1. Download `perplexport.exe` from Releases
2. Double-click to run
3. Enter your Perplexity email when prompted
4. Check your email for the login code and enter it in the browser
5. Wait for export to complete

### From Source

```bash
git clone https://github.com/leonid-shevtsov/perplexport.git
cd perplexport
npm install
npx ts-node src/cli.ts -e your@email.com
```

## CLI Options

```
Usage: perplexport [options]

Options:
  -e, --email <email>       Perplexity email (prompts if not provided)
  -o, --output <directory>  Base output directory (default: "./exports")
  -d, --done-file <file>    Tracking file (default: "done.json")
  -h, --help                Display help
```

## Output Structure

```
exports/
  2026-02-06T22-35/
    json/
      thread-abc123.json
      thread-def456.json
    md/
      How to Build a Game.md
      Market Research Report.md
  2026-02-07T10-00/
    json/
    md/
```

## Re-rendering Markdown

If you want to re-render existing JSON files with updated formatting:

```bash
# Windows
set OUTPUT_DIR=./exports/2026-02-06T22-35
npx ts-node src/rerender-all.ts

# PowerShell
$env:OUTPUT_DIR = "./exports/2026-02-06T22-35"
npx ts-node src/rerender-all.ts
```

## Building

```bash
npm run build        # Compile TypeScript
npm run package      # Create standalone exe
```

## Notes

- Requires Google Chrome installed
- Email login only (no password stored)
- Browser stays open for debugging after export

---

Fork of [leonid-shevtsov/perplexport](https://github.com/leonid-shevtsov/perplexport)
