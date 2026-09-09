/**
 * Virtual Lab: Fractals v2.0
 * Multi-mode fractal generator
 */

const canvas = document.getElementById('fractal-canvas');
const ctx = canvas.getContext('2d');

const state = {
    mode: 'tree', // tree, mandelbrot, snowflake

    // Tree Params
    tree: {
        angle: 45,
        depth: 10,
        length: 100, // Reduced from 120
        ratio: 0.7,
        color: 40,
        animating: false,
        time: 0
    },

    // Mandelbrot Params
    mandel: {
        zoom: 1,
        offsetX: -0.5,
        offsetY: 0,
        iterations: 100
    },

    // Koch Params
    koch: {
        depth: 0
    }
};

// --- CORE ---
function resizeCanvas() {
    canvas.width = window.innerWidth;
    // Calculate reliable height: Window height minus Header height (approx 80px)
    // Or use parent height if available and larger
    const parentH = canvas.parentElement.clientHeight;
    canvas.height = (parentH > 100) ? parentH : (window.innerHeight - 80);
    requestRender();
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas(); // Init

function requestRender() {
    cancelAnimationFrame(window.renderReq);
    window.renderReq = requestAnimationFrame(render);
}

function render() {
    // Clear
    if (state.mode === 'mandelbrot') {
        // Mandelbrot fills fully, no clear needed usually but safe to do
    } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    if (state.mode === 'tree') renderTree();
    else if (state.mode === 'mandelbrot') renderMandelbrot();
    else if (state.mode === 'snowflake') renderKoch();

    // Stats
    updateStats();

    if (state.tree.animating && state.mode === 'tree') {
        state.tree.time += 0.03;
        requestAnimationFrame(render);
    }
}

// --- TREE RENDERER ---
function renderTree() {
    const { angle, depth, length, ratio, color, time } = state.tree;
    const startX = canvas.width / 2;
    const startY = canvas.height - 100; // Added padding

    let count = 0;

    function branch(len, ang, d) {
        count++;
        ctx.save();

        // Style
        const hue = color + (state.tree.depth - d) * 15;
        ctx.strokeStyle = `hsl(${hue}, 80%, ${70 - d * 5}%)`;
        ctx.lineWidth = d + 1;

        ctx.rotate(ang * Math.PI / 180);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, -len);
        ctx.stroke();

        if (d > 0) {
            ctx.translate(0, -len);

            // Wind
            const wind = state.tree.animating ? Math.sin(time + d) * 5 : 0;

            branch(len * ratio, angle + wind, d - 1);
            branch(len * ratio, -angle + wind, d - 1);
        }
        ctx.restore();
    }

    ctx.save();
    ctx.translate(startX, startY);
    branch(length, 0, depth);
    ctx.restore();

    state.lastObjCount = count;
}

// --- MANDELBROT RENDERER (Optimized) ---
function renderMandelbrot() {
    // Using ImageData for pixel manipulation (CPU heavy, GPU shader would be better but keeping vanilla JS)
    const w = canvas.width;
    const h = canvas.height;

    // Performance guard
    if (w * h > 2000000) {
        // downscale for speed if needed?
    }

    const { zoom, offsetX, offsetY, iterations } = state.mandel;

    const imgData = ctx.createImageData(w, h);
    const data = imgData.data;

    const limit = 4;

    // Scale factor
    const scale = 3.0 / (zoom * Math.min(w, h)); // 3.0 covers typical -2 to 1 range

    for (let py = 0; py < h; py++) {
        for (let px = 0; px < w; px++) {
            // Map pixel to complex plane
            // center pixel is (w/2, h/2) -> (offsetX, offsetY)
            let x0 = (px - w / 2) * scale + offsetX;
            let y0 = (py - h / 2) * scale + offsetY;

            let x = 0;
            let y = 0;
            let iter = 0;

            while (x * x + y * y <= limit && iter < iterations) {
                let xtemp = x * x - y * y + x0;
                y = 2 * x * y + y0;
                x = xtemp;
                iter++;
            }

            // Color
            const pIndex = (py * w + px) * 4;
            if (iter === iterations) {
                data[pIndex] = 0;     // R
                data[pIndex + 1] = 0;   // G
                data[pIndex + 2] = 0;   // B
                data[pIndex + 3] = 255; // A
            } else {
                // Smooth coloring? Simple HSL map
                // const hue = (iter / iterations * 360);
                // Simple gradient
                const val = (iter % 32) * 8;
                data[pIndex] = val; // R
                data[pIndex + 1] = (val * 2) % 255; // G (Greenish/Blueish)
                data[pIndex + 2] = 180; // B
                data[pIndex + 3] = 255;
            }
        }
    }

    ctx.putImageData(imgData, 0, 0);
    state.lastObjCount = w * h; // pixels calculated
}


// --- KOCH SNOWFLAKE RENDERER ---
function renderKoch() {
    const depth = state.koch.depth;

    ctx.strokeStyle = "#00ccff";
    ctx.lineWidth = 2;
    ctx.shadowBlur = 10;
    ctx.shadowColor = "#00ccff";

    // Triangle Vertices
    const size = Math.min(canvas.width, canvas.height) * 0.8;
    const h = size * Math.sqrt(3) / 2;

    const p1 = { x: canvas.width / 2 - size / 2, y: canvas.height / 2 + h / 3 };
    const p2 = { x: canvas.width / 2 + size / 2, y: canvas.height / 2 + h / 3 };
    const p3 = { x: canvas.width / 2, y: canvas.height / 2 - 2 * h / 3 };

    let lines = [
        { a: p1, b: p2 },
        { a: p2, b: p3 },
        { a: p3, b: p1 }
    ];

    // Iterative Generation
    for (let i = 0; i < depth; i++) {
        let nextLines = [];
        lines.forEach(line => {
            const a = line.a;
            const b = line.b;

            const dx = b.x - a.x;
            const dy = b.y - a.y;

            const pA = { x: a.x + dx / 3, y: a.y + dy / 3 };
            const pC = { x: a.x + 2 * dx / 3, y: a.y + 2 * dy / 3 };

            // Peak (Rotated 60 deg)
            // cos(60) = 0.5, sin(60) = 0.866
            const peakX = pA.x + (pC.x - pA.x) * 0.5 + (pC.y - pA.y) * 0.866; // Actually -sin for one direction?
            // Standard Koch outward:
            // x' = x*cos - y*sin
            // Vector AC = (dx/3, dy/3)
            // rotate -60 degrees 
            const vx = (dx / 3);
            const vy = (dy / 3);
            const peak = {
                x: pA.x + vx * 0.5 + vy * 0.866025,
                y: pA.y - vx * 0.866025 + vy * 0.5
            };

            nextLines.push({ a: a, b: pA });
            nextLines.push({ a: pA, b: peak });
            nextLines.push({ a: peak, b: pC });
            nextLines.push({ a: pC, b: b });
        });
        lines = nextLines;
    }

    ctx.beginPath();
    lines.forEach(l => {
        ctx.moveTo(l.a.x, l.a.y);
        ctx.lineTo(l.b.x, l.b.y);
    });
    ctx.stroke();

    state.lastObjCount = lines.length;

    ctx.shadowBlur = 0;
}


// --- INTERACTION ---

// Mode Switching
document.querySelectorAll('.mode-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        state.mode = btn.dataset.mode;

        // UI Updates
        document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        document.querySelectorAll('.control-section').forEach(s => s.classList.remove('active'));
        document.getElementById(`ctrl-${state.mode}`).classList.add('active');

        requestRender();
    });
});

// Tree Controls
document.getElementById('angle').addEventListener('input', e => {
    state.tree.angle = parseFloat(e.target.value);
    document.getElementById('val-angle').innerText = state.tree.angle;
    requestRender();
});
document.getElementById('depth').addEventListener('input', e => { state.tree.depth = parseInt(e.target.value); requestRender(); });
document.getElementById('ratio').addEventListener('input', e => { state.tree.ratio = parseFloat(e.target.value); requestRender(); });
document.getElementById('color-shift').addEventListener('input', e => { state.tree.color = parseInt(e.target.value); requestRender(); });

document.getElementById('btn-anim').addEventListener('click', () => {
    state.tree.animating = !state.tree.animating;
    if (state.tree.animating) requestRender();
});


// Mandelbrot Controls
canvas.addEventListener('wheel', e => {
    if (state.mode !== 'mandelbrot') return;

    e.preventDefault();
    const zoomFactor = 1.1;
    if (e.deltaY < 0) {
        state.mandel.zoom *= zoomFactor;
    } else {
        state.mandel.zoom /= zoomFactor;
    }
    requestRender();
});

let isDragging = false;
let dragStart = { x: 0, y: 0 };

canvas.addEventListener('mousedown', e => {
    if (state.mode === 'mandelbrot') {
        isDragging = true;
        dragStart = { x: e.clientX, y: e.clientY };
    }
});

window.addEventListener('mousemove', e => {
    if (isDragging && state.mode === 'mandelbrot') {
        const dx = e.clientX - dragStart.x;
        const dy = e.clientY - dragStart.y;

        // Convert screen pixels to Mandelbrot units
        const scale = 3.0 / (state.mandel.zoom * Math.min(canvas.width, canvas.height));

        state.mandel.offsetX -= dx * scale;
        state.mandel.offsetY -= dy * scale;

        dragStart = { x: e.clientX, y: e.clientY };
        requestRender();
    }
});

window.addEventListener('mouseup', () => isDragging = false);

document.getElementById('mand-iter').addEventListener('input', e => {
    state.mandel.iterations = parseInt(e.target.value);
    requestRender();
});

document.getElementById('btn-reset-view').addEventListener('click', () => {
    state.mandel.zoom = 1;
    state.mandel.offsetX = -0.5;
    state.mandel.offsetY = 0;
    requestRender();
});


// Koch Controls
document.getElementById('koch-depth').addEventListener('input', e => {
    state.koch.depth = parseInt(e.target.value);
    document.getElementById('val-koch').innerText = state.koch.depth;
    requestRender();
});


function updateStats() {
    const el = document.getElementById('obj-count');
    if (state.mode === 'mandelbrot') {
        el.innerText = "∞ Пикселей";
    } else if (state.mode === 'tree') {
        el.innerText = `${state.lastObjCount} Ветвей`;
    } else {
        el.innerText = `${state.lastObjCount} Линий`;
    }
}
