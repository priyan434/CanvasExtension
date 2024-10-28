const fileInput = document.querySelector("#upload");
let currentImage = null;
// Enable drawing on the blank canvas initially
drawOnImage(); // Starts with a blank canvas

fileInput.addEventListener("change", async (e) => {
    const [file] = fileInput.files;

    // Display the uploaded image
    const image = document.createElement("img");
    image.src = await fileToDataUri(file);

    image.addEventListener("load", () => {
        drawOnImage(image); // Pass the image to the drawing function
    });

    return false; // Prevent default form submission
});

function fileToDataUri(file) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.addEventListener("load", () => {
            resolve(reader.result);
        });
        reader.readAsDataURL(file);
    });
}

// Size control
const sizeElement = document.querySelector("#sizeRange");
let size = sizeElement.value;
sizeElement.oninput = (e) => {
    size = e.target.value;
};

// Color control
const colorElements = document.getElementsByName("colorRadio");
let color = colorElements[0].value; // Default to first color
colorElements.forEach((c) => {
    c.onclick = () => {
        color = c.value;
    };
});



chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.table(request)
    if (request.action === 'screenshotCaptured') {
        const image = new Image();
        image.src = request.screenshotUrl;

        image.onload = () => {
            drawOnImage(image);
        };
    }
});

chrome.storage.local.get(['screenshotUrl'], (result) => {
    if (chrome.runtime.lastError) {
        console.error(`Error retrieving screenshot URL: ${chrome.runtime.lastError.message}`);
        return;
    }

    const screenshotUrl = result.screenshotUrl;
    if (screenshotUrl) {
        console.log('Retrieved screenshot URL:', screenshotUrl);

        const image = new Image();
        image.src = screenshotUrl;

        image.onload = () => {
            drawOnImage(image); // Call drawOnImage with the image
        };

    } else {
        console.log('No screenshot URL found in storage.');
    }
});


// Draw on the canvas
function drawOnImage(image = null) {
    const canvasElement = document.getElementById("canvas");
    const context = canvasElement.getContext("2d");

    if (image) {
        currentImage=image
        const imageWidth = image.width;
        const imageHeight = image.height;

        // Resize canvas to fit the image
        canvasElement.width = imageWidth;
        canvasElement.height = imageHeight;

        // Draw the image on the canvas
        context.drawImage(image, 0, 0, imageWidth, imageHeight);
    }

    // Clear canvas button functionality
    const clearElement = document.getElementById("clear");
    clearElement.onclick = () => {
        context.clearRect(0, 0, canvasElement.width, canvasElement.height);
        // Redraw the current image
        if (currentImage) {
            context.drawImage(currentImage, 0, 0, currentImage.width, currentImage.height);
        }
    };

    let isDrawing = false;
    canvasElement.onmousedown = (e) => {
        isDrawing = true;
        context.beginPath();
        context.lineWidth = size;
        context.strokeStyle = color;
        context.lineJoin = "round";
        context.lineCap = "round";
        context.moveTo(e.clientX - canvasElement.offsetLeft, e.clientY - canvasElement.offsetTop);
    };

    canvasElement.onmousemove = (e) => {
        if (isDrawing) {
            context.lineTo(e.clientX - canvasElement.offsetLeft, e.clientY - canvasElement.offsetTop);
            context.stroke();
        }
    };

    canvasElement.onmouseup = () => {
        isDrawing = false;
        context.closePath();
    };
}
