document.getElementById('overlay-btn').addEventListener('click', () => {
    chrome.storage.local.set({ overlayActive: true }, () => {
        chrome.tabs.query({}, (tabs) => {
            tabs.forEach(tab => {
                if (!tab.url.startsWith("chrome://")) {
                    chrome.scripting.executeScript({
                        target: { tabId: tab.id },
                        func: createOverlay
                    });
                }
            });
        });
    });
});


function createOverlay() {
    if (document.getElementById('overlay-panel')) return;


    const panel = document.createElement('div');
    panel.id = 'overlay-panel';
    panel.style.position = 'fixed';
    panel.style.top = '50px';
    panel.style.left = '0px';
    panel.style.width = '100px';
    panel.style.height = '400px';
    panel.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    panel.style.color = 'white';
    panel.style.zIndex = '9999';
    panel.style.display = 'flex';
    panel.style.flexDirection = 'column';
    panel.style.padding = '20px';
    panel.style.cursor = 'move';
    panel.style.borderRadius = "10px";

    panel.innerHTML = `
        <button id="close-panel">Close</button>
        <button id="screenshot-btn">Take Screenshot</button>
    `;

    document.body.appendChild(panel);

    let isDragging = false;
    let offsetX, offsetY;

    panel.addEventListener('mousedown', (e) => {
        isDragging = true;
        offsetX = e.clientX - panel.getBoundingClientRect().left;
        offsetY = e.clientY - panel.getBoundingClientRect().top;
        panel.style.cursor = 'grabbing';
    });

    document.addEventListener('mousemove', (e) => {
        if (isDragging) {
            panel.style.left = `${e.clientX - offsetX}px`;
            panel.style.top = `${e.clientY - offsetY}px`;
        }
    });

    document.addEventListener('mouseup', () => {
        isDragging = false;
        panel.style.cursor = 'move';
    });

    document.getElementById('close-panel').addEventListener('click', () => {
        console.log('Closing overlay and notifying other tabs...');
        chrome.runtime.sendMessage({ action: 'closeOverlay' }, (response) => {
            if (response.success) {
                console.log('Overlay close message sent successfully.');
            } else {
                console.error('Failed to send overlay close message.');
            }
        });
        panel.remove();
        chrome.storage.local.set({ overlayActive: false });
    });


    document.getElementById('screenshot-btn').addEventListener('click', () => {
        chrome.runtime.sendMessage({ action: 'captureScreenshot' }, (response) => {
            if (response.success) {
                // createDrawingCanvas(response.screenshotUrl);


            } else {
                console.error('Screenshot capture failed:', response.error);
            }
        });
    });
}



chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'closeOverlay') {
        const panel = document.getElementById('overlay-panel');
        if (panel) {
            panel.remove();
            chrome.storage.local.set({ overlayActive: false });
        }
    }
});

