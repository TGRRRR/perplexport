# Perplexport

Export your Perplexity AI conversations to JSON and Markdown files.

## Quick Start
0. Need Google Chrome installed
1. Download `perplexport.exe` from [Releases](https://github.com/leonid-shevtsov/perplexport/releases)
2. Run it
3. Log in to Perplexity in the browser window that opens
4. Press Enter in the terminal
5. Leave the browser window open to process all threads
6. Your conversations are exported to `./exports/<timestamp>/`

## Output

```
./exports/2026-02-07T00-29/
  json/        # Raw API data
  md/          # Markdown files
```

Each markdown file includes:
- YAML frontmatter with URL, date, and Space (if applicable)
- Collapsible `# Me` / `# Perplexity` sections
- Images and videos preserved

## Options

```
--output <dir>     Output directory (default: ./exports)
--done-file <file> Progress tracking file (default: done.json)
--citations        Include source citations (default: stripped)
```

## Development

```powershell
npm install
npm start          # Run from source
npm run build      # Compile TypeScript
npm run package    # Create standalone exe
```

## Requirements

- Google Chrome installed (uses your existing browser)
- Windows (Linux/Mac: run from source with `npm start`)

## Credits

Based on [perplexport](https://github.com/leonid-shevtsov/perplexport)