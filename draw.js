const fileInput = document.querySelector("#upload");

// enabling drawing on the blank canvas
drawOnImage();

fileInput.addEventListener("change", async (e) => {
    const [file] = fileInput.files;

    // displaying the uploaded image
    const image = document.createElement("img");
    image.src = await fileToDataUri(file);

    // enabling the brush after the image
    // has been uploaded
    image.addEventListener("load", () => {
        drawOnImage(image);
    });

    return false;
});


function fileToDataUri(field) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.addEventListener("load", () => {
            resolve(reader.result);
        });
        reader.readAsDataURL(field);
    });
}

const sizeElement = document.querySelector("#sizeRange");
let size = sizeElement.value;
sizeElement.oninput = (e) => {
    size = e.target.value;
};

const colorElement = document.getElementsByName("colorRadio");
let color;
colorElement.forEach((c) => {
    if (c.checked) color = c.value;
});
colorElement.forEach((c) => {
    c.onclick = () => {
        color = c.value;
    };
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'screenshotCaptured') {
        const image = new Image();
        image.src = request.screenshotUrl;


        image.onload = () => {
            drawOnImage(image);
        };
    }
});


function drawOnImage(image = null) {
    const canvasElement = document.getElementById("canvas");

    const context = canvasElement.getContext("2d");

    // if an image is present,
    // the image passed as parameter is drawn in the canvas
    if (image) {
        const imageWidth = image.width;
        const imageHeight = image.height;

        // rescaling the canvas element
        canvasElement.width = imageWidth;
        canvasElement.height = imageHeight;

        context.drawImage(image, 0, 0, imageWidth, imageHeight);
    }

    const clearElement = document.getElementById("clear");
    clearElement.onclick = () => {
        context.clearRect(0, 0, canvasElement.width, canvasElement.height);
    };

    let isDrawing;
    canvasElement.onmousedown = (e) => {
        isDrawing = true;
        context.beginPath();
        context.lineWidth = size;
        context.strokeStyle = color;
        context.lineJoin = "round";
        context.lineCap = "round";
        context.moveTo(e.clientX, e.clientY);
    };

    canvasElement.onmousemove = (e) => {
        if (isDrawing) {
            context.lineTo(e.clientX, e.clientY);
            context.stroke();
        }
    };

    canvasElement.onmouseup = function () {
        isDrawing = false;
        context.closePath();
    };
}
