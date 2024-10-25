chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'captureScreenshot') {
        chrome.tabs.captureVisibleTab(null, {}, (image) => {
            if (chrome.runtime.lastError) {
                console.error(chrome.runtime.lastError);
                sendResponse({ success: false });
                return;
            }
            chrome.tabs.sendMessage(sender.tab.id, { action: 'downloadScreenshot', image });
            sendResponse({ success: true });
        });
        return true; // Indicates an asynchronous response
    }
});
