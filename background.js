chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'download') {
    try {
      const { content, filename } = message.payload;
      const dataUrl = 'data:text/html;base64,' + btoa(unescape(encodeURIComponent(content)));

      chrome.downloads.download({
        url: dataUrl,
        filename: filename,
        saveAs: true
      }, (downloadId) => {
        if (chrome.runtime.lastError) {
          console.error('Download error:', chrome.runtime.lastError);
          sendResponse({ success: false, error: chrome.runtime.lastError });
        } else {
          sendResponse({ success: true, downloadId });
        }
      });

      return true;
    } catch (err) {
      console.error('Error in background script:', err);
      sendResponse({ success: false, error: err.message });
    }
  }
});
