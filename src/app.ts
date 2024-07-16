const canvas: HTMLCanvasElement = document.getElementById('canvas') as HTMLCanvasElement;
const ctx: CanvasRenderingContext2D = canvas.getContext('2d', { willReadFrequently: true })!;
const colorPicker: HTMLDivElement = document.getElementById('colorPicker') as HTMLDivElement;
const colorPickerCanvas: HTMLCanvasElement = document.getElementById('colorPickerCanvas') as HTMLCanvasElement;
const colorPickerCtx: CanvasRenderingContext2D = colorPickerCanvas.getContext('2d')!;
const colorHex: HTMLElement = document.getElementById('colorHex')!;
const pickedColorSpan: HTMLElement = document.getElementById('pickedColor')!;
const pickerBtn: HTMLButtonElement = document.getElementById('pickerBtn') as HTMLButtonElement;
const fileInput: HTMLInputElement = document.getElementById('fileInput') as HTMLInputElement;

let isPickerActive: boolean = false;
let imageBounds: { offsetX: number, offsetY: number, drawWidth: number, drawHeight: number };

function resizeCanvasToSquare() {
    const size = Math.min(window.innerWidth, window.innerHeight) * 0.8;
    canvas.width = size;
    canvas.height = size;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;
}

function drawImageWithBorders(img: HTMLImageElement) {
    resizeCanvasToSquare();
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const aspectRatio = img.width / img.height;
    let drawWidth = canvas.width;
    let drawHeight = canvas.height;

    if (aspectRatio > 1) {
        drawHeight = canvas.width / aspectRatio;
    } else {
        drawWidth = canvas.height * aspectRatio;
    }

    const offsetX = (canvas.width - drawWidth) / 2;
    const offsetY = (canvas.height - drawHeight) / 2;

    ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);

    imageBounds = { offsetX, offsetY, drawWidth, drawHeight };
}

fileInput.addEventListener('change', (event) => {
    const file = (event.target as HTMLInputElement).files![0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = new Image();
            img.onload = () => {
                drawImageWithBorders(img);
            };
            img.src = e.target?.result as string;
        };
        reader.readAsDataURL(file);
    }
});

pickerBtn.addEventListener('click', () => {
    isPickerActive = !isPickerActive;
    if (isPickerActive) {
        pickerBtn.textContent = "Deactivate Picker";
        colorPicker.classList.remove('hidden');
        colorPicker.style.display = 'flex';
    } else {
        pickerBtn.textContent = "Activate Picker";
        colorPicker.classList.add('hidden');
        colorPicker.style.display = 'none';
    }
});

canvas.addEventListener('mousemove', (e) => {
    if (!isPickerActive) return;

    const rect = canvas.getBoundingClientRect();
    const x = Math.floor(e.clientX - rect.left);
    const y = Math.floor(e.clientY - rect.top);

    if (
        x < imageBounds.offsetX ||
        x > imageBounds.offsetX + imageBounds.drawWidth ||
        y < imageBounds.offsetY ||
        y > imageBounds.offsetY + imageBounds.drawHeight
    ) {
        colorPicker.style.display = 'none';
        canvas.style.cursor = 'default';
        return;
    }

    const imageData = ctx.getImageData(x, y, 1, 1).data;
    const hexColor = rgbToHex(imageData[0], imageData[1], imageData[2]);

    colorHex.textContent = hexColor;
    colorPicker.style.borderColor = hexColor;

    colorPicker.style.left = `${e.clientX}px`;
    colorPicker.style.top = `${e.clientY}px`;

    drawMagnifier(x, y);
    colorPicker.style.display = 'flex';
    canvas.style.cursor = 'none';
});

canvas.addEventListener('mouseleave', () => {
    if (isPickerActive) {
        colorPicker.style.display = 'none';
        canvas.style.cursor = 'default';
    }
});

canvas.addEventListener('mouseenter', () => {
    if (isPickerActive) {
        colorPicker.style.display = 'flex';
        canvas.style.cursor = 'none';
    }
});

canvas.addEventListener('click', (e) => {
    if (!isPickerActive) return;

    const rect = canvas.getBoundingClientRect();
    const x = Math.floor(e.clientX - rect.left);
    const y = Math.floor(e.clientY - rect.top);
    const imageData = ctx.getImageData(x, y, 1, 1).data;
    const hexColor = rgbToHex(imageData[0], imageData[1], imageData[2]);

    pickedColorSpan.textContent = hexColor;
});

function drawMagnifier(x: number, y: number) {
    const zoomFactor = 11;
    const magnifierSize = 19;

    const sx = Math.max(0, x - Math.floor(magnifierSize / 2));
    const sy = Math.max(0, y - Math.floor(magnifierSize / 2));
    const sw = Math.min(magnifierSize, canvas.width - sx);
    const sh = Math.min(magnifierSize, canvas.height - sy);

    colorPickerCanvas.width = colorPicker.clientWidth;
    colorPickerCanvas.height = colorPicker.clientHeight;

    colorPickerCtx.clearRect(0, 0, colorPickerCanvas.width, colorPickerCanvas.height);
    colorPickerCtx.imageSmoothingEnabled = false;

    const dx = (colorPickerCanvas.width - (sw * zoomFactor)) / 2;
    const dy = (colorPickerCanvas.height - (sh * zoomFactor)) / 2;

    colorPickerCtx.drawImage(canvas, sx, sy, sw, sh, dx, dy, sw * zoomFactor, sh * zoomFactor);

    colorPickerCtx.strokeStyle = '#000';
    colorPickerCtx.lineWidth = 2;
    colorPickerCtx.strokeRect((colorPickerCanvas.width / 2) - (zoomFactor / 2), (colorPickerCanvas.height / 2) - (zoomFactor / 2), zoomFactor, zoomFactor);
}

function rgbToHex(r: number, g: number, b: number): string {
    return `#${componentToHex(r)}${componentToHex(g)}${componentToHex(b)}`;
}

function componentToHex(c: number): string {
    const hex = c.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
}
