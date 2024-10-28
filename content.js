chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'closeOverlay') {
        const panel = document.getElementById('overlay-panel');
        if (panel) {
            panel.remove();
            console.log('Overlay closed');
        }
        sendResponse({ success: true });
    } else if (request.action === 'downloadScreenshot') {

        // const imageUrl = request.screenshotUrl;
        //
        // const img = document.createElement('img');
        // img.src = imageUrl;
        // document.body.appendChild(img);
        console.log('Screenshot captured and displayed');
        sendResponse({ success: true });
    }
});
