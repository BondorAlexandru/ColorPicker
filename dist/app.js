"use strict";
var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d', { willReadFrequently: true });
var colorPicker = document.getElementById('colorPicker');
var colorPickerCanvas = document.getElementById('colorPickerCanvas');
var colorPickerCtx = colorPickerCanvas.getContext('2d');
var colorHex = document.getElementById('colorHex');
var pickedColorSpan = document.getElementById('pickedColor');
var pickerBtn = document.getElementById('pickerBtn');
var fileInput = document.getElementById('fileInput');
var isPickerActive = false;
var imageBounds;
function resizeCanvasToSquare() {
    var size = Math.min(window.innerWidth, window.innerHeight) * 0.8;
    canvas.width = size;
    canvas.height = size;
    canvas.style.width = "".concat(size, "px");
    canvas.style.height = "".concat(size, "px");
}
function drawImageWithBorders(img) {
    resizeCanvasToSquare();
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    var aspectRatio = img.width / img.height;
    var drawWidth = canvas.width;
    var drawHeight = canvas.height;
    if (aspectRatio > 1) {
        drawHeight = canvas.width / aspectRatio;
    }
    else {
        drawWidth = canvas.height * aspectRatio;
    }
    var offsetX = (canvas.width - drawWidth) / 2;
    var offsetY = (canvas.height - drawHeight) / 2;
    ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
    imageBounds = { offsetX: offsetX, offsetY: offsetY, drawWidth: drawWidth, drawHeight: drawHeight };
}
fileInput.addEventListener('change', function (event) {
    var file = event.target.files[0];
    if (file) {
        var reader = new FileReader();
        reader.onload = function (e) {
            var _a;
            var img = new Image();
            img.onload = function () {
                drawImageWithBorders(img);
            };
            img.src = (_a = e.target) === null || _a === void 0 ? void 0 : _a.result;
        };
        reader.readAsDataURL(file);
    }
});
pickerBtn.addEventListener('click', function () {
    isPickerActive = !isPickerActive;
    if (isPickerActive) {
        pickerBtn.textContent = "Deactivate Picker";
        colorPicker.classList.remove('hidden');
        colorPicker.style.display = 'flex';
    }
    else {
        pickerBtn.textContent = "Activate Picker";
        colorPicker.classList.add('hidden');
        colorPicker.style.display = 'none';
    }
});
canvas.addEventListener('mousemove', function (e) {
    if (!isPickerActive)
        return;
    var rect = canvas.getBoundingClientRect();
    var x = Math.floor(e.clientX - rect.left);
    var y = Math.floor(e.clientY - rect.top);
    if (x < imageBounds.offsetX ||
        x > imageBounds.offsetX + imageBounds.drawWidth ||
        y < imageBounds.offsetY ||
        y > imageBounds.offsetY + imageBounds.drawHeight) {
        colorPicker.style.display = 'none';
        canvas.style.cursor = 'default';
        return;
    }
    var imageData = ctx.getImageData(x, y, 1, 1).data;
    var hexColor = rgbToHex(imageData[0], imageData[1], imageData[2]);
    colorHex.textContent = hexColor;
    colorPicker.style.borderColor = hexColor;
    colorPicker.style.left = "".concat(e.clientX, "px");
    colorPicker.style.top = "".concat(e.clientY, "px");
    drawMagnifier(x, y);
    colorPicker.style.display = 'flex';
    canvas.style.cursor = 'none';
});
canvas.addEventListener('mouseleave', function () {
    if (isPickerActive) {
        colorPicker.style.display = 'none';
        canvas.style.cursor = 'default';
    }
});
canvas.addEventListener('mouseenter', function () {
    if (isPickerActive) {
        colorPicker.style.display = 'flex';
        canvas.style.cursor = 'none';
    }
});
canvas.addEventListener('click', function (e) {
    if (!isPickerActive)
        return;
    var rect = canvas.getBoundingClientRect();
    var x = Math.floor(e.clientX - rect.left);
    var y = Math.floor(e.clientY - rect.top);
    var imageData = ctx.getImageData(x, y, 1, 1).data;
    var hexColor = rgbToHex(imageData[0], imageData[1], imageData[2]);
    pickedColorSpan.textContent = hexColor;
});
function drawMagnifier(x, y) {
    var zoomFactor = 11;
    var magnifierSize = 19;
    var sx = Math.max(0, x - Math.floor(magnifierSize / 2));
    var sy = Math.max(0, y - Math.floor(magnifierSize / 2));
    var sw = Math.min(magnifierSize, canvas.width - sx);
    var sh = Math.min(magnifierSize, canvas.height - sy);
    colorPickerCanvas.width = colorPicker.clientWidth;
    colorPickerCanvas.height = colorPicker.clientHeight;
    colorPickerCtx.clearRect(0, 0, colorPickerCanvas.width, colorPickerCanvas.height);
    colorPickerCtx.imageSmoothingEnabled = false;
    var dx = (colorPickerCanvas.width - (sw * zoomFactor)) / 2;
    var dy = (colorPickerCanvas.height - (sh * zoomFactor)) / 2;
    colorPickerCtx.drawImage(canvas, sx, sy, sw, sh, dx, dy, sw * zoomFactor, sh * zoomFactor);
    colorPickerCtx.strokeStyle = '#000';
    colorPickerCtx.lineWidth = 2;
    colorPickerCtx.strokeRect((colorPickerCanvas.width / 2) - (zoomFactor / 2), (colorPickerCanvas.height / 2) - (zoomFactor / 2), zoomFactor, zoomFactor);
}
function rgbToHex(r, g, b) {
    return "#".concat(componentToHex(r)).concat(componentToHex(g)).concat(componentToHex(b));
}
function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
}
