/**
 * Virtual Lab: Ripple Tank
 * Water simulation using 2D Wave Equation
 */

const canvas = document.getElementById('waves-canvas');
const ctx = canvas.getContext('2d');

const state = {
    width: 0,
    height: 0,
    damping: 0.97,
    buffer1: [],
    buffer2: [],
    imageData: null, // Canvas pixel data
    isRain: false,
    brushSize: 3,
    isHighQuality: false
};

// --- Initialization ---

function initBuffers(width, height) {
    const size = width * height;
    state.width = width;
    state.height = height;
    state.buffer1 = new Float32Array(size); // Use Float32 for precision
    state.buffer2 = new Float32Array(size);
    state.imageData = ctx.createImageData(width, height);
}

function resizeCanvas() {
    // Resolution scaling
    const scale = state.isHighQuality ? 1 : 0.25; // 0.25 = 1/4 resolution (faster)

    // Physical size
    const displayWidth = canvas.parentElement.clientWidth;
    const displayHeight = canvas.parentElement.clientHeight;

    // Internal size
    canvas.width = Math.floor(displayWidth * scale);
    canvas.height = Math.floor(displayHeight * scale);

    // CSS scaling used by browser to stretch it back up
    // No specific CSS needed if canvas.style.width/height is not set, 
    // but the browsers default scaling (set in CSS image-rendering) handles the pixel look.

    initBuffers(canvas.width, canvas.height);
}
window.addEventListener('resize', resizeCanvas);


// --- Simulation Core ---
function processWaves() {
    const { width, height, damping, buffer1, buffer2 } = state;

    // Loop through every pixel (skip edges)
    for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
            const index = (y * width) + x;

            // Average of neighbors
            const val = (
                buffer1[index - 1] +
                buffer1[index + 1] +
                buffer1[index - width] +
                buffer1[index + width]
            ) / 2 - buffer2[index];

            buffer2[index] = val * damping;
        }
    }

    // Swap buffers
    const temp = state.buffer1;
    state.buffer1 = state.buffer2;
    state.buffer2 = temp;
}


// --- Rendering ---
function draw() {
    const { width, height, buffer1, imageData } = state;
    const data = imageData.data; // RGBA array

    for (let i = 0; i < width * height; i++) {
        const val = buffer1[i]; // Wave height

        // Visualize:
        // - Positive values -> Light (Crests)
        // - Negative values -> Dark (Troughs)

        // Simple Blue Shader
        // Base color maps
        const intensity = Math.max(0, Math.min(255, val + 128)); // Shift so 0 is mid-grey if we wanted

        // Let's do a cool "Sonar/Hologram" look
        // Crests (val > 0) are white/cyan
        // Troughs (val < 0) are deep blue/black

        // Pixel index in RGBA is i*4
        const idx = i * 4;

        if (val > 0) {
            // Crests
            data[idx] = 0; // R
            data[idx + 1] = Math.min(255, val * 100 + 50); // G (Greenish for cyan)
            data[idx + 2] = Math.min(255, val * 100 + 200); // B (Blue base)
            data[idx + 3] = 255; // Alpha
        } else {
            // Troughs
            data[idx] = 0;
            data[idx + 1] = 0;
            data[idx + 2] = Math.max(0, 50 + val * 50); // Fade to black
            data[idx + 3] = 255;
        }
    }

    ctx.putImageData(imageData, 0, 0);
}


// --- Interaction ---
function createRipple(x, y, strength) {
    if (x < 1 || x >= state.width - 1 || y < 1 || y >= state.height - 1) return;

    // Apply brush size
    const r = state.brushSize;
    for (let j = -r; j <= r; j++) {
        for (let i = -r; i <= r; i++) {
            if (i * i + j * j <= r * r) {
                const idx = ((y + j) * state.width) + (x + i);
                if (idx >= 0 && idx < state.buffer1.length) {
                    state.buffer1[idx] = strength;
                }
            }
        }
    }
}

// Mouse Handling
// Need to map mouse coordinates to internal canvas resolution
canvas.addEventListener('mousemove', (e) => {
    // Only add ripples if mouse is moving fast or always? 
    // Standard ripple tank: just moving creates waves

    // Map coords
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = Math.floor((e.clientX - rect.left) * scaleX);
    const y = Math.floor((e.clientY - rect.top) * scaleY);

    createRipple(x, y, 500); // Strength 500
});

canvas.addEventListener('mousedown', (e) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = Math.floor((e.clientX - rect.left) * scaleX);
    const y = Math.floor((e.clientY - rect.top) * scaleY);

    createRipple(x, y, 2000); // Mega ripple on click
});


// --- Loop ---
function loop() {
    if (state.isRain && Math.random() < 0.1) {
        const x = Math.floor(Math.random() * (state.width - 2)) + 1;
        const y = Math.floor(Math.random() * (state.height - 2)) + 1;
        createRipple(x, y, 500);
    }

    processWaves();
    draw();
    requestAnimationFrame(loop);
}


// --- UI Controls ---
document.getElementById('damping').addEventListener('input', (e) => {
    state.damping = parseFloat(e.target.value);
});

document.getElementById('brush-size').addEventListener('input', (e) => {
    state.brushSize = parseInt(e.target.value);
});

document.getElementById('rain-mode').addEventListener('change', (e) => {
    state.isRain = e.target.checked;
});

document.getElementById('high-quality').addEventListener('change', (e) => {
    state.isHighQuality = e.target.checked;
    resizeCanvas(); // Re-init buffers
});

document.getElementById('btn-clear').addEventListener('click', () => {
    state.buffer1.fill(0);
    state.buffer2.fill(0);
});

// Start
resizeCanvas(); // Init
loop();
