chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'closeOverlay') {
        console.log('Overlay closed');
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
    } else if (request.action === 'test') {
        console.log('Test message received in background');
        sendResponse({ success: true });
    }
});

console.log('Background script is running');
