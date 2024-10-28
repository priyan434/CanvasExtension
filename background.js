chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'closeOverlay') {
        console.log('Close overlay request received');

        chrome.tabs.query({}, (tabs) => {
            tabs.forEach(tab => {
                chrome.tabs.sendMessage(tab.id, {action: 'closeOverlay'}).then(r => r);
            });
        });
        sendResponse({success: true});
    } else if (request.action === 'captureScreenshot') {


        chrome.tabs.query({}, async (tabs) => {
            tabs.forEach( tab => {
                chrome.tabs.sendMessage(tab.id, {action: 'closeOverlay'})
            });
        });



        chrome.tabs.captureVisibleTab(null, {}, (screenshotUrl) => {
            if (chrome.runtime.lastError) {
                console.error(chrome.runtime.lastError);
                sendResponse({success: false, error: chrome.runtime.lastError.message});
            } else {

                chrome.tabs.sendMessage(sender.tab.id, {action: 'downloadScreenshot', screenshotUrl}).then(r => r);

                chrome.storage.local.set({screenshotUrl: screenshotUrl}, () => {
                    if (chrome.runtime.lastError) {
                        console.error(`Error storing screenshot URL: ${chrome.runtime.lastError.message}`);
                    }
                });


                chrome.windows.create({
                    url: "screenshotCanvas.html",
                    type: "popup",
                    height: 800,
                    width: 1000
                }).then(r => r)

                sendResponse({success: true, screenshotUrl});
            }
        });
        return true;
    }
});

console.log('Background script is running');
