# n8n Agent Chat - Chrome Extension

## Quick Install

1. **Download** the `n8n-agent-chat-extension.zip` file
2. **Extract** the zip file to a folder on your computer
3. **Open Chrome** and go to `chrome://extensions/`
4. **Enable** "Developer mode" (toggle in top right)
5. **Click** "Load unpacked"
6. **Select** the folder where you extracted the files
7. **Done!** Click the extension icon to start chatting

## What's New in This Version

✅ Fixed dropdown/settings menu bug  
✅ Simplified file upload system  
✅ PDFs now sent as base64 to backend (works reliably!)  
✅ All syntax errors resolved  
✅ Pack installer included (install multiple agents with one code)  

## How to Use

1. Click the extension icon in Chrome toolbar
2. Click settings (⋮) to add your n8n agents
3. Add agent name + webhook URL
4. Select an agent from the dropdown
5. Start chatting!

### Pack Installer

Install multiple agents at once using pack codes:

1. Open settings (⋮)
2. Go to "Install Agent Pack" section
3. Enter your pack code
4. Click "Install Pack"

**Pack codes** let you distribute pre-configured agent sets. Your n8n workflow at `https://www.brandmoveslabs.com/webhook/packs` handles the pack code and returns the agent configurations.

## File Upload Support

- **Text files**: TXT, CSV, MD, JSON - extracted directly
- **PDF files**: Converted to base64 and sent to your n8n workflow

### For PDF Processing in n8n

Your workflow will receive PDFs in this format:

```
[PDF_BASE64]...base64 string...[/PDF_BASE64]
[PDF_FILENAME]document.pdf[/PDF_FILENAME]
[PDF_SIZE]12345[/PDF_SIZE]
```

Use a Function node to extract the base64 and process it server-side.

## Troubleshooting

**Settings won't open?**  
- Make sure you loaded the updated version
- Try removing and re-adding the extension

**File upload not working?**  
- Check your n8n workflow is set up to receive the base64 data
- Make sure the webhook URL is correct

**Agent not responding?**  
- Verify the webhook URL is accessible
- Check the browser console (F12) for errors

## Need Help?

See `CHANGES.md` for technical details about what was fixed.
