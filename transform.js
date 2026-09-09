/**
 * Virtual Lab: Shape Master
 * Geometry Transformations Game
 */

const canvas = document.getElementById('geo-canvas');
const ctx = canvas.getContext('2d');

// --- STATE ---
const state = {
    level: 1,
    currentShape: [], // Array of {x, y}
    targetShape: [],  // Array of {x, y}
    startShape: [],   // Creating reset point

    // Animation State
    animating: false,
    animProgress: 0,
    animStartShape: [], // State before action
    animEndShape: [],   // State after action

    history: [],
    gridSize: 40,

};

// --- LEVELS ---
const LEVELS = [
    {
        id: 1,
        text: "<b>Задача:</b> Перемести синий квадрат в зеленую рамку.<br>Используй панель <b>Сдвиг</b>: введи <b>6</b> в поле X и нажми ▶.",
        start: [{ x: -4, y: 2 }, { x: -2, y: 2 }, { x: -2, y: 0 }, { x: -4, y: 0 }],
        target: [{ x: 2, y: 2 }, { x: 4, y: 2 }, { x: 4, y: 0 }, { x: 2, y: 0 }], // Moved X+6
        allowed: ['move']
    },
    {
        id: 2,
        text: "Теперь цель снизу. Обрати внимание на знаки координат (Y вниз — это минус).",
        start: [{ x: -3, y: 3 }, { x: -1, y: 3 }, { x: -2, y: 1 }], // Triangle
        target: [{ x: -3, y: -2 }, { x: -1, y: -2 }, { x: -2, y: -4 }], // Moved Y-5
        allowed: ['move']
    },
    {
        id: 3,
        text: "Поверни фигуру на 90 градусов по часовой стрелке, чтобы она совпала.",
        start: [{ x: 1, y: 1 }, { x: 1, y: 4 }, { x: 2, y: 1 }], // L shape-ish
        target: [{ x: 1, y: -1 }, { x: 4, y: -1 }, { x: 1, y: -2 }], // Rotated -90 around (0,0)? Actually let's keep it simple.
        // Let's perform the rotation on start to define target
        targetGen: (s) => rotatePoints(s, -90),
        allowed: ['rotate']
    },
    {
        id: 4,
        text: "Отрази фигуру по оси Y (Зеркало), чтобы она 'перепрыгнула' на другую сторону.",
        start: [{ x: -4, y: 1 }, { x: -2, y: 3 }, { x: -2, y: 1 }], // Right triangle on left
        target: [{ x: 4, y: 1 }, { x: 2, y: 3 }, { x: 2, y: 1 }], // On right
        allowed: ['reflect']
    },
    {
        id: 5,
        text: "ФИНАЛ: Сначала поверни, потом сдвинь. Комбинируй действия!",
        start: [{ x: -2, y: 0 }, { x: 0, y: 2 }, { x: 2, y: 0 }], // Arrow up
        target: [{ x: 2, y: -2 }, { x: 4, y: -4 }, { x: 2, y: -6 }], // Rotated 180 + Moved? 
        // Let's define specifically. Rotate 180 -> Pointing down at 0,0. Move X+2, Y-2.
        start: [{ x: 0, y: 2 }, { x: -1, y: 0 }, { x: 1, y: 0 }],
        target: [{ x: 4, y: -2 }, { x: 5, y: 0 }, { x: 3, y: 0 }],
        allowed: ['all']
    },
    {
        id: 6,
        text: "НОВОЕ: Масштабирование! Увеличь фигуру в 2 раза.",
        start: [{ x: 1, y: 1 }, { x: 1, y: 2 }, { x: 2, y: 1 }], // Small triangle
        target: [{ x: 2, y: 2 }, { x: 2, y: 4 }, { x: 4, y: 2 }], // Scaled x2
        allowed: ['scale']
    }
];

// --- CORE ---
function resizeCanvas() {
    canvas.width = window.innerWidth;
    const parentH = canvas.parentElement.clientHeight;
    canvas.height = (parentH > 100) ? parentH : (window.innerHeight - 80);
    draw();
}
window.addEventListener('resize', resizeCanvas);

function initLevel(lvlIdx) {
    const lvl = LEVELS[lvlIdx - 1];
    if (!lvl) return; // End game nicely?

    state.level = lvlIdx;

    // Deep copy shapes
    state.startShape = JSON.parse(JSON.stringify(lvl.start));
    state.currentShape = JSON.parse(JSON.stringify(lvl.start));

    if (lvl.targetGen) {
        state.targetShape = lvl.targetGen(lvl.start);
    } else {
        state.targetShape = JSON.parse(JSON.stringify(lvl.target));
    }

    // UI
    document.getElementById('level-disp').innerText = lvlIdx;
    document.getElementById('mission-task').innerHTML = lvl.text;
    document.getElementById('success-message').style.display = 'none';
    document.getElementById('modal-success').classList.remove('active');

    // Manage Controls Visibility
    const groups = {
        'move': document.getElementById('group-move'),
        'rotate': document.getElementById('group-rotate'),
        'reflect': document.getElementById('group-reflect'),
        'scale': document.getElementById('group-scale')
    };

    // Hide all first
    Object.values(groups).forEach(g => {
        if (g) g.style.display = 'none';
    });

    // Show allowed
    if (lvl.allowed.includes('all')) {
        Object.values(groups).forEach(g => { if (g) g.style.display = 'block'; });
    } else {
        lvl.allowed.forEach(key => {
            if (groups[key]) groups[key].style.display = 'block';
        });
    }

    log(`Загружен уровень ${lvlIdx}`);
    draw();
}

// --- MATH HELPERS ---
// Coordinate system: Center is (0,0). Y is UP.
function toScreen(x, y) {
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    return {
        x: cx + x * state.gridSize,
        y: cy - y * state.gridSize // Invert Y for Cartesian feel
    };
}

function rotatePoints(points, angleDeg) {
    const rad = angleDeg * Math.PI / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);

    return points.map(p => ({
        x: Math.round(p.x * cos - p.y * sin),
        y: Math.round(p.x * sin + p.y * cos)
    }));
}

// --- ANIMATION SYSTEM ---
function triggerAnimation(newShape) {
    if (state.animating) return; // Block input while animating

    state.animStartShape = JSON.parse(JSON.stringify(state.currentShape));
    state.animEndShape = newShape;
    state.animProgress = 0;
    state.animating = true;

    requestAnimationFrame(animateLoop);
}

function animateLoop() {
    if (!state.animating) return;

    state.animProgress += 0.1; // Speed of animation

    if (state.animProgress >= 1) {
        state.animating = false;
        state.currentShape = state.animEndShape;
        checkWin();
        draw();
        return;
    }

    // Interpolate
    const t = easeOutCubic(state.animProgress);
    state.currentShape = state.animStartShape.map((p, i) => {
        const target = state.animEndShape[i];
        return {
            x: p.x + (target.x - p.x) * t,
            y: p.y + (target.y - p.y) * t
        };
    });

    draw();
    requestAnimationFrame(animateLoop);
}

function easeOutCubic(x) {
    return 1 - Math.pow(1 - x, 3);
}


// --- ACTIONS ---

function translateShape(dx, dy) {
    if (state.animating) return;
    const newShape = state.currentShape.map(p => ({
        x: p.x + dx,
        y: p.y + dy
    }));
    log(`Сдвиг: X${dx >= 0 ? '+' : ''}${dx}, Y${dy >= 0 ? '+' : ''}${dy}`);
    triggerAnimation(newShape);
}

function rotateShape(angle) {
    if (state.animating) return;
    const newShape = rotatePoints(state.currentShape, angle);
    log(`Поворот: ${angle}°`);
    triggerAnimation(newShape);
}

function reflectShape(axis) { // 'x' or 'y'
    if (state.animating) return;
    const newShape = state.currentShape.map(p => ({
        x: axis === 'y' ? -p.x : p.x,
        y: axis === 'x' ? -p.y : p.y
    }));
    log(`Отражение по оси ${axis.toUpperCase()}`);
    triggerAnimation(newShape);
}

function scaleShape(factor) {
    if (state.animating) return;
    const newShape = state.currentShape.map(p => ({
        x: p.x * factor,
        y: p.y * factor
    }));
    log(`Масштаб: x${factor}`);
    triggerAnimation(newShape);
}


function resetShape() {
    state.currentShape = JSON.parse(JSON.stringify(state.startShape));
    log("Сброс фигуры");
    draw();
}

function checkWin() {
    // Check if every point in current matches a point in target
    // Order might differ? Assume vertex order is preserved for now (rigid transform).
    // Actually better to just check bounds or match any order?
    // Let's assume order matches for rigid body.

    let match = true;
    if (state.currentShape.length !== state.targetShape.length) match = false;
    else {
        for (let i = 0; i < state.currentShape.length; i++) {
            const p1 = state.currentShape[i];
            const p2 = state.targetShape[i];
            // Allow small float error if we had float math, but we round.
            if (p1.x !== p2.x || p1.y !== p2.y) {
                match = false;
                break;
            }
        }
    }

    if (match) {
        // Show Success Modal
        const modal = document.getElementById('modal-success');
        modal.classList.add('active');

        // Setup Next Button
        if (state.level >= LEVELS.length) {
            document.querySelector('#modal-success h2').innerText = "🏆 Курс завершен!";
            document.querySelector('#modal-success p').innerText = "Ты прошел все задания и стал Мастером Геометрии!";
            document.getElementById('btn-next-level').innerText = "В меню";
            document.getElementById('btn-next-level').onclick = () => window.location.href = 'index.html';
        } else {
            document.querySelector('#modal-success h2').innerText = "🎉 Уровень пройден!";
            document.querySelector('#modal-success p').innerText = "Отличная работа!";
            document.getElementById('btn-next-level').innerText = "Следующий уровень ➡";
            document.getElementById('btn-next-level').onclick = () => {
                initLevel(state.level + 1);
            };
        }
    }
}

function log(msg) {
    const el = document.getElementById('history-log');
    const line = document.createElement('div');
    line.innerText = "> " + msg;
    el.prepend(line);
}

// --- DRAWING ---
function draw() {
    ctx.fillStyle = "#0b0d17";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw Grid
    drawGrid();

    // Draw Axis
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;

    ctx.beginPath();
    ctx.strokeStyle = "#444";
    ctx.lineWidth = 2;
    ctx.moveTo(0, cy); ctx.lineTo(canvas.width, cy); // X axis
    ctx.moveTo(cx, 0); ctx.lineTo(cx, canvas.height); // Y axis
    ctx.stroke();

    // Draw Target (Ghost)
    drawShape(state.targetShape, "rgba(0, 255, 100, 0.2)", "rgba(0, 255, 100, 0.5)", true);

    // Draw Current
    drawShape(state.currentShape, "rgba(0, 150, 255, 0.8)", "#00f3ff", false);
}

function drawGrid() {
    ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
    ctx.lineWidth = 1;
    ctx.beginPath();

    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const sz = state.gridSize;

    // Verticals
    for (let x = cx % sz; x < canvas.width; x += sz) {
        ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height);
    }
    // Horizontals
    for (let y = cy % sz; y < canvas.height; y += sz) {
        ctx.moveTo(0, y); ctx.lineTo(canvas.width, y);
    }
    ctx.stroke();
}

function drawShape(points, fill, stroke, isDashed) {
    if (!points || points.length === 0) return;

    ctx.beginPath();
    const start = toScreen(points[0].x, points[0].y);
    ctx.moveTo(start.x, start.y);

    for (let i = 1; i < points.length; i++) {
        const p = toScreen(points[i].x, points[i].y);
        ctx.lineTo(p.x, p.y);
    }
    ctx.closePath();

    ctx.fillStyle = fill;
    ctx.fill();

    ctx.strokeStyle = stroke;
    ctx.lineWidth = 2;
    if (isDashed) ctx.setLineDash([5, 5]);
    else ctx.setLineDash([]);
    ctx.stroke();

    // Draw vertices dots
    if (!isDashed) {
        ctx.fillStyle = "#fff";
        points.forEach(p => {
            const sc = toScreen(p.x, p.y);
            ctx.beginPath();
            ctx.arc(sc.x, sc.y, 4, 0, Math.PI * 2);
            ctx.fill();

            // Coord label
            ctx.fillStyle = "#aaa";
            ctx.font = "10px monospace";
            ctx.fillText(`(${p.x},${p.y})`, sc.x + 8, sc.y - 8);
            ctx.fillStyle = "#fff";
        });
    }
}


// --- EVENTS ---
document.getElementById('btn-move').addEventListener('click', () => {
    const dx = parseInt(document.getElementById('inp-dx').value) || 0;
    const dy = parseInt(document.getElementById('inp-dy').value) || 0;
    translateShape(dx, dy);
});

document.getElementById('btn-rotate').addEventListener('click', () => {
    const angle = parseInt(document.getElementById('inp-angle').value) || 0;
    rotateShape(-angle); // Standard math rotation is CCW, but users equate + with Clockwise often. 
    // Actually Math standard: + is CCW.
    // Let's stick to standard: input 90 -> CCW.
    // Wait, user intuition is often Clockwise. Let's start with standard (-angle in canvas Y-inverted world might be confusing).
    // Inverted Y: 
    // real (1, 0) -> rot 90 -> (0, 1). 
    // screen (10, -0) -> rot 90 -> (0, -10).
    // Visual check: "Clockwise" is usually preferred in simple games. 
    // Let's implement rotateShape to do Math.cos/sin logic raw, which is CCW.
});

document.getElementById('btn-flip-x').addEventListener('click', () => reflectShape('x'));
document.getElementById('btn-flip-y').addEventListener('click', () => reflectShape('y'));

document.getElementById('btn-scale').addEventListener('click', () => {
    const factor = parseFloat(document.getElementById('inp-scale').value) || 1;
    scaleShape(factor);
});

document.getElementById('btn-reset').addEventListener('click', resetShape);

// --- KEYBOARD SHORTCUTS ---
function addEnterListener(ids, callback) {
    if (!Array.isArray(ids)) ids = [ids];
    ids.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('keyup', (e) => {
                if (e.key === 'Enter') callback();
            });
        }
    });
}

addEnterListener(['inp-dx', 'inp-dy'], () => document.getElementById('btn-move').click());
addEnterListener('inp-angle', () => document.getElementById('btn-rotate').click());
addEnterListener('inp-scale', () => document.getElementById('btn-scale').click());

// Init
resizeCanvas();
initLevel(1);
