# Set Puppeteer environment variables to use local Chrome
$env:PUPPETEER_SKIP_CHROMIUM_DOWNLOAD = 'true'
$env:PUPPETEER_EXECUTABLE_PATH = 'C:\Program Files\Google\Chrome\Application\chrome.exe'

# Ask for email
Write-Host "Enter your Perplexity email:"
$email = Read-Host

# Run the tool using the verified entry point src/cli.ts
Write-Host "Starting Perplexport... please check your email for the login code when prompted."
try {
    npx ts-node src/cli.ts -e $email
} catch {
    Write-Host "An error occurred: $_" -ForegroundColor Red
}

Read-Host "Press Enter to exit..."
