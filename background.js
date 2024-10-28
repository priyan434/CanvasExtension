chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'closeOverlay') {
        console.log('Close overlay request received');

        chrome.tabs.query({}, (tabs) => {
            tabs.forEach(tab => {
                chrome.tabs.sendMessage(tab.id, { action: 'closeOverlay' }).then(r => r);
                chrome.storage.local.set({ overlayActive: false });
            });
        });
        sendResponse({ success: true });
    } else if (request.action === 'captureScreenshot') {

        chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
            if (request.action === 'closeOverlay') {
                const panel = document.getElementById('overlay-panel');
                if (panel) {
                    panel.remove();
                }
            }
        });

        const closeOverlay = () => {
            return new Promise((resolve) => {
                chrome.tabs.query({}, (tabs) => {
                    let promises = tabs.map(tab => chrome.tabs.sendMessage(tab.id, { action: 'closeOverlay' }));
                    Promise.all(promises).then(resolve); // Waits for all tabs to complete
                });
            });
        };

        closeOverlay().then(() => {

            setTimeout(() => {
                chrome.tabs.captureVisibleTab(null, {}, (screenshotUrl) => {
                    if (chrome.runtime.lastError) {
                        console.error(chrome.runtime.lastError);
                        sendResponse({ success: false, error: chrome.runtime.lastError.message });
                    } else {
                        // Store screenshot URL locally
                        chrome.storage.local.set({ screenshotUrl }, () => {
                            if (chrome.runtime.lastError) {
                                console.error(`Error storing screenshot URL: ${chrome.runtime.lastError.message}`);
                            }
                        });

                        // Open a new popup window to display the screenshot
                        chrome.windows.create({
                            url: "screenshotCanvas.html",
                            type: "popup",
                            height: 800,
                            width: 1000
                        }).then(r => r);

                        sendResponse({ success: true, screenshotUrl });
                    }
                });
            }, 1000);
        });

        return true; // Keep the message channel open for async sendResponse
    }
});
console.log('Background script is running');

chrome.tabs.onCreated.addListener((tab) => {
    console.log("listening")
    chrome.storage.local.get('overlayActive', (data) => {
        console.log("data.overlayActive",data.overlayActive)
        if (data.overlayActive) {

            if (tab.url) {
                chrome.scripting.executeScript({
                    target: { tabId: tab.id },
                    func: createOverlay
                });
            }
        }
    });
});

function createOverlay() {
    console.log("create for page")
    chrome.storage.local.set({ overlayActive: true });
}

chrome.webNavigation.onHistoryStateUpdated.addListener((details) => {
    console.log("details",details)

}, { url: [{ schemes: ['http', 'https'] }] });


//
//
//
// chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
//
//
//     if (changeInfo.url) {
//
//         chrome.scripting.executeScript({
//             target: { tabId: tabId },
//             func: createOverlay
//         });
//
//
//     }
// });