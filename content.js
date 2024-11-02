function createDownloadButton() {
    const button = document.createElement('button');
    button.className = 'claude-download-button';
    button.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
        </svg>
        <span>Download</span>
    `;
    
    button.addEventListener('click', () => {
        const messageDiv = document.querySelector('div[class="flex-1  flex  flex-col  gap-3  px-4  max-w-3xl  mx-auto  w-full pt-1"]');
        if (messageDiv) {
            const pageTitle = document.title
                .replace(/[^a-z0-9]/gi, '-')
                .replace(/-+/g, '-')
                .replace(/^-|-$/g, '')
                .toLowerCase()
                .slice(0, 100);

            const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>${document.title}</title>
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
</head>
<body>
    ${messageDiv.outerHTML}
</body>
</html>`;

            chrome.runtime.sendMessage({
                action: 'download',
                payload: {
                    content: htmlContent,
                    filename: `${pageTitle}.html`
                }
            });
        } else {
            console.error('Message div not found');
        }
    });

    return button;
}

function addDownloadButton() {
    const buttonContainer = document.querySelector('.flex.min-w-0.items-center.max-md\\:text-sm');
    
    if (buttonContainer && !buttonContainer.querySelector('.claude-download-button')) {
        const downloadButton = createDownloadButton();
        buttonContainer.appendChild(downloadButton);
    }
}

function checkAndAddDownloadButton() {
    if (window.location.href.startsWith('https://claude.ai/chat/')) {
        const maxAttempts = 15;
        let attempts = 0;
        
        function tryAddButton() {
            if (attempts < maxAttempts) {
                addDownloadButton();
                if (!document.querySelector('.claude-download-button')) {
                    attempts++;
                    setTimeout(tryAddButton, 1000);
                }
            } else {
                console.log("Failed to add download button after maximum attempts");
            }
        }
        
        tryAddButton();
    }
}

// Initial check
checkAndAddDownloadButton();

// Check when URL changes (for single-page app navigation)
let lastUrl = window.location.href;
new MutationObserver(() => {
    if (lastUrl !== window.location.href) {
        lastUrl = window.location.href;
        checkAndAddDownloadButton();
    }
}).observe(document, { subtree: true, childList: true });
