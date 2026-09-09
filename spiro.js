/**
 * Virtual Lab: Spirograph
 * Visualizing hypotrochoids and epitrochoids
 */

const canvas = document.getElementById('spiro-canvas');
const ctx = canvas.getContext('2d');

const state = {
    R: 150, // Fixed circle radius
    r: 52,  // Moving circle radius
    d: 60,  // Pen offset
    t: 0,   // Time/Angle
    speed: 0.2, // Radians per frame
    colorHue: 180,
    trace: [], // History of points
    maxTrace: 2000, // How much logic to keep? Infinite trail or fading? Let's do persistent buffer
    autoMode: false,
    cycles: 0
};

// We need two canvases: one for the persistent drawing (Art), one for the UI (Gears)
// Actually we can just redraw trace every frame or use an offscreen canvas.
// For performance with LONG traces, offscreen canvas is best.
const artCanvas = document.createElement('canvas');
const artCtx = artCanvas.getContext('2d');

function resizeCanvas() {
    canvas.width = window.innerWidth;
    const parentH = canvas.parentElement.clientHeight;
    canvas.height = (parentH > 100) ? parentH : (window.innerHeight - 80);

    artCanvas.width = canvas.width;
    artCanvas.height = canvas.height;

    // Clear logic on resize or keep?
    // Let's clear to avoid stretching artifacts
    resetDrawing();
}

window.addEventListener('resize', resizeCanvas);


function resetDrawing() {
    state.t = 0;
    state.trace = [];
    state.cycles = 0;
    artCtx.clearRect(0, 0, artCanvas.width, artCanvas.height);
}

function updateParams() {
    state.R = parseInt(document.getElementById('input-R').value);
    state.r = parseInt(document.getElementById('input-r').value);
    state.d = parseInt(document.getElementById('input-d').value);

    document.getElementById('val-R').innerText = state.R;
    document.getElementById('val-r').innerText = state.r;
    document.getElementById('val-d').innerText = state.d;

    // Resetting on param change makes clean patterns
    // But sometimes users want to "morph" the shape. 
    // Let's allow morphing, but fade out old? No, allow messiness, user can clear manually.
    // Actually, morphing creates cool 3D tube effects.
}

document.getElementById('input-R').addEventListener('input', updateParams);
document.getElementById('input-r').addEventListener('input', updateParams);
document.getElementById('input-d').addEventListener('input', updateParams);

document.getElementById('input-speed').addEventListener('input', (e) => {
    state.speed = parseInt(e.target.value) * 0.02;
});

document.getElementById('input-color').addEventListener('input', (e) => {
    state.colorHue = parseInt(e.target.value);
});

document.getElementById('btn-clear').addEventListener('click', resetDrawing);

document.getElementById('btn-auto').addEventListener('click', (e) => {
    state.autoMode = !state.autoMode;
    e.target.innerText = state.autoMode ? "Авто-рисунок: Вкл" : "Авто-рисунок: Выкл";
});


function draw() {
    // 1. Logic
    if (state.autoMode) {
        state.t += state.speed * 2;
        // Slowly mutate params for generative art
        state.d = 60 + Math.sin(state.t * 0.01) * 40;
        state.colorHue = (state.colorHue + 0.1) % 360;
    } else {
        state.t += state.speed;
    }

    const cx = canvas.width / 2;
    const cy = canvas.height / 2;

    const R = state.R;
    const r = state.r;
    const d = state.d;
    const t = state.t;

    // Hypotrochoid Formula
    // x(θ) = (R - r) cos θ + d cos((R - r)/r θ)
    // y(θ) = (R - r) sin θ - d sin((R - r)/r θ)

    const x = (R - r) * Math.cos(t) + d * Math.cos(((R - r) / r) * t);
    const y = (R - r) * Math.sin(t) - d * Math.sin(((R - r) / r) * t);

    // Draw segment to Art Canvas
    artCtx.beginPath();

    const lastX = state.lastX ?? x;
    const lastY = state.lastY ?? y;

    artCtx.moveTo(cx + lastX, cy + lastY);
    artCtx.lineTo(cx + x, cy + y);

    artCtx.strokeStyle = `hsla(${state.colorHue}, 100%, 60%, 0.8)`;
    artCtx.lineWidth = 2;
    // Glow effect
    artCtx.shadowBlur = 5;
    artCtx.shadowColor = `hsla(${state.colorHue}, 100%, 50%, 0.5)`;
    artCtx.stroke();
    artCtx.shadowBlur = 0; // Reset for performance

    state.lastX = x;
    state.lastY = y;

    // Cycle counting (approx based on 2PI)
    document.getElementById('stat-cycles').innerText = (state.t / (Math.PI * 2)).toFixed(1);


    // 2. Rendering Main Canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw Art
    ctx.drawImage(artCanvas, 0, 0);

    // Draw UI (Gears) - Optional visual aid
    // Big Circle (Stator)
    ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, Math.PI * 2);
    ctx.stroke();

    // Small Circle (Rotor)
    // Rotor center position
    // Center dist = R - r
    const rotorCx = cx + (R - r) * Math.cos(t);
    const rotorCy = cy + (R - r) * Math.sin(t);

    ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
    ctx.beginPath();
    ctx.arc(rotorCx, rotorCy, r, 0, Math.PI * 2);
    ctx.stroke();

    // Line from rotor center to pen
    ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
    ctx.beginPath();
    ctx.moveTo(rotorCx, rotorCy);
    ctx.lineTo(cx + x, cy + y);
    ctx.stroke();

    // Pen Point
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(cx + x, cy + y, 4, 0, Math.PI * 2);
    ctx.fill();


    requestAnimationFrame(draw);
}


// --- AI ASSISTANT ---
const assistantText = document.getElementById('assistant-text');
let lastHintTime = 0;

function updateAssistantLogic() {
    const now = Date.now();
    if (now - lastHintTime < 3000) return; // Update every 3 seconds
    lastHintTime = now;

    const { R, r, d, speed } = state;
    let messages = [];

    // GCD helper
    const gcd = (a, b) => b ? gcd(b, a % b) : a;
    const divisor = gcd(R, r);
    const petals = r / divisor; // Simplified logic, usually petals = R/gcd for hypocycloid
    // Correct petal logic for Hypocycloid: k = R/r. Numerator of reduced fraction k gives peaks.
    // If k=3 (R=150, r=50), 3 peaks.

    // Geometry analysis
    if (d === 0) {
        messages.push("Точка в центре малой шестерни — мы рисуем идеальный круг!");
    } else if (d === r) {
        messages.push("Точка на самом краю! Это создаст фигуру с острыми углами — **Гипоциклоиду**.");
    } else if (d > r) {
        messages.push(`Точка вынесена на ${d - r} ед. дальше радиуса. Видишь эти петли? Это **Удлиненная Гипотрохоида**.`);
    } else {
        messages.push("Точка внутри круга. Линии получаются плавными и волнистыми (**Укороченная Гипотрохоида**).");
    }

    // Symmetry analysis
    if (R % r === 0) {
        const k = R / r;
        messages.push(`Радиусы кратны (${R}/${r}). У фигуры будет ровно **${k}** лепестк${k < 5 ? 'а' : 'ов'}.`);
    } else {
        messages.push("Сложное соотношение радиусов! Линия долго не замкнется, создавая плотную текстуру.");
    }

    // Speed analysis
    if (speed > 0.5) messages.push("Высокая скорость создает иллюзию 3D-объема!");

    // Pick random relevant message
    const msg = messages[Math.floor(Math.random() * messages.length)];

    // Typing effect (simple replacement for now)
    if (assistantText.innerText !== msg) {
        assistantText.style.opacity = 0;
        setTimeout(() => {
            assistantText.innerText = msg;
            assistantText.style.opacity = 1;
        }, 300);
    }
}

// Hook into draw loop
const originalDraw = draw;
// We actually need to redefine draw to include the update,
// OR just set an interval. Interval is cleaner for independent logic.
setInterval(updateAssistantLogic, 3000);

// Init
resizeCanvas();
draw();
// Add CSS transition for text
assistantText.style.transition = "opacity 0.3s";
