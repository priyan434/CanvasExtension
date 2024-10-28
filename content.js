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
        return true;
    }
    if (request.action === 'closeOverlay') {
        const panel = document.getElementById('overlay-panel');
        if (panel) {
            panel.remove();
            console.log('Overlay closed');
        }
        sendResponse({ success: true });
    }

});
