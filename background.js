chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'closeOverlay') {
        console.log('Close overlay request received');
        chrome.tabs.query({}, (tabs) => {
            tabs.forEach(tab => {
                chrome.tabs.sendMessage(tab.id, { action: 'closeOverlay' });
            });
        });
        sendResponse({ success: true });
    } else if (request.action === 'captureScreenshot') {
        chrome.tabs.captureVisibleTab(null, {}, (screenshotUrl) => {
            if (chrome.runtime.lastError) {
                console.error(chrome.runtime.lastError);
                sendResponse({ success: false, error: chrome.runtime.lastError.message });
            } else {
                sendResponse({ success: true, screenshotUrl });
            }
        });
        return true;
    }
});

console.log('Background script is running');
