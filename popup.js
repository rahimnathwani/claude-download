document.getElementById('saveButton').addEventListener('click', async () => {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab) {
      console.error('No active tab found');
      return;
    }

    console.log('Executing content script...');
    const result = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        // Get the div
        const targetDiv = document.querySelector('div[class="flex-1  flex  flex-col  gap-3  px-4  max-w-3xl  mx-auto  w-full pt-1"]');
        
        if (!targetDiv) {
          console.error('Div not found');
          return { success: false, error: 'Div not found' };
        }

        // Get page title and clean it for filename
        const pageTitle = document.title
          .replace(/[^a-z0-9]/gi, '-')
          .replace(/-+/g, '-')
          .replace(/^-|-$/g, '')
          .toLowerCase()
          .slice(0, 100);

        // Create HTML content
        const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>${document.title}</title>
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
</head>
<body>
    ${targetDiv.outerHTML}
</body>
</html>`;

        return { 
          success: true, 
          content: htmlContent, 
          filename: `${pageTitle}.html` 
        };
      }
    });

    console.log('Script execution result:', result);

    if (result && result[0] && result[0].result.success) {
      const { content, filename } = result[0].result;
      
      // Send to background script for download
      chrome.runtime.sendMessage({
        action: 'download',
        payload: { content, filename }
      }, response => {
        console.log('Background script response:', response);
      });
    } else {
      console.error('Script execution failed:', result);
    }

  } catch (err) {
    console.error('Error in popup script:', err);
  }
});
