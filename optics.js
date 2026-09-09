/**
 * Virtual Lab: Optics Engine
 * Ray casting and reflection logic
 */

// --- State ---
const state = {
    lasers: [], // {x, y, angle, color}
    segments: [], // {x1, y1, x2, y2, type: 'mirror'|'wall'}
    tool: 'laser', // 'laser', 'mirror', 'wall'
    color: '#ff0000',
    showNormals: false,
    mouse: { x: 0, y: 0, isDown: false, startX: 0, startY: 0 },

    // Game Mode
    isChallengeMode: false,
    currentLevel: 0,
    target: null, // {x, y, radius, hit: boolean}
    hasWon: false
};

const MAX_REFLECTIONS = 100;
const MAX_DISTANCE = 2000;

// --- Levels Data ---
const LEVELS = [
    {
        name: "Отражение",
        laser: { x: 100, y: 300, angle: 0 },
        target: { x: 400, y: 100, radius: 20 },
        walls: []
    },
    {
        name: "Преграды",
        laser: { x: 100, y: 100, angle: 0.5 },
        target: { x: 500, y: 400, radius: 25 },
        walls: [
            { x1: 300, y1: 0, x2: 300, y2: 300 }
        ]
    },
    {
        name: "Лабиринт",
        laser: { x: 50, y: 50, angle: 0.2 },
        target: { x: 50, y: 500, radius: 20 },
        walls: [
            { x1: 200, y1: 150, x2: 800, y2: 150 },
            { x1: 0, y1: 350, x2: 600, y2: 350 }
        ]
    },
    {
        name: "Рикошет",
        laser: { x: 700, y: 500, angle: Math.PI }, // Shooting Left
        target: { x: 700, y: 100, radius: 30 },
        walls: [
            { x1: 400, y1: 200, x2: 400, y2: 400 } // Barrier in middle
        ]
    },
    {
        name: "Коридор",
        laser: { x: 50, y: 50, angle: 0 },
        target: { x: 50, y: 550, radius: 20 },
        walls: [
            { x1: 200, y1: 0, x2: 200, y2: 400 }, // Zig Zag walls
            { x1: 400, y1: 200, x2: 400, y2: 600 },
            { x1: 600, y1: 0, x2: 600, y2: 400 }
        ]
    },
    {
        name: "Игольное Ушко",
        laser: { x: 50, y: 300, angle: 0 },
        target: { x: 750, y: 300, radius: 15 },
        walls: [
            { x1: 400, y1: 0, x2: 400, y2: 280 }, // Top wall
            { x1: 400, y1: 320, x2: 400, y2: 600 }, // Bottom wall (Gap is 40px)
            { x1: 600, y1: 100, x2: 600, y2: 500 } // Backstop to force bounce
        ]
    }
];


// --- Canvas ---
const canvas = document.getElementById('optics-canvas');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = canvas.parentElement.clientHeight;
    if (state.isChallengeMode) loadLevel(state.currentLevel); // Reload to fit
    draw();
}
window.addEventListener('resize', resizeCanvas);


// --- Game Logic ---
function startChallenge() {
    state.isChallengeMode = true;
    state.currentLevel = 0;

    // UI Updates
    document.body.classList.add('challenge-active');
    document.getElementById('btn-challenge').innerText = "❌ Выйти из режима";
    document.getElementById('level-indicator').style.display = 'block';
    document.getElementById('btn-clear').innerText = "Очистить Зеркала";

    // Lock tools: Only mirrors allowed
    setTool('mirror');
    document.querySelector('[data-tool="laser"]').disabled = true;
    document.querySelector('[data-tool="wall"]').disabled = true;

    loadLevel(0);
}

function stopChallenge() {
    state.isChallengeMode = false;

    // UI Updates
    document.body.classList.remove('challenge-active');
    document.getElementById('btn-challenge').innerText = "🎯 Режим Испытаний";
    document.getElementById('level-indicator').style.display = 'none';
    document.getElementById('btn-clear').innerText = "Очистить Всё";
    document.getElementById('victory-modal').style.display = 'none';

    // Unlock tools
    document.querySelector('[data-tool="laser"]').disabled = false;
    document.querySelector('[data-tool="wall"]').disabled = false;

    // Clear everything
    state.lasers = [];
    state.segments = [];
    state.target = null;
    draw();
}

function loadLevel(idx) {
    if (idx >= LEVELS.length) {
        alert("Поздравляем! Все уровни пройдены.");
        stopChallenge();
        return;
    }

    state.currentLevel = idx;
    state.hasWon = false;
    document.getElementById('victory-modal').style.display = 'none';
    document.getElementById('level-indicator').innerText = `Уровень ${idx + 1}: ${LEVELS[idx].name}`;

    const level = LEVELS[idx];

    // Setup scene
    state.lasers = [{ ...level.laser, color: '#ff0000' }];
    state.target = { ...level.target, hit: false };

    // Setup walls (immutable)
    state.segments = level.walls.map(w => ({ ...w, type: 'wall', frozen: true }));

    draw();
}


// --- Geometry Math ---

function getIntersection(rayOrigin, rayDir, segA, segB) {
    const rx = rayDir.x;
    const ry = rayDir.y;

    const sx = segB.x - segA.x;
    const sy = segB.y - segA.y;

    const qpx = segA.x - rayOrigin.x;
    const qpy = segA.y - rayOrigin.y;

    const cross = rx * sy - ry * sx;

    if (Math.abs(cross) < 1e-5) return null; // Parallel

    const t = (qpx * sy - qpy * sx) / cross;
    const u = (qpx * ry - qpy * rx) / cross;

    if (t >= 0 && u >= 0 && u <= 1) {
        return {
            x: rayOrigin.x + t * rx,
            y: rayOrigin.y + t * ry,
            param: t,
            segDir: { x: sx, y: sy }
        };
    }
    return null;
}

// Check intersection with Target Circle
function checkTargetHit(x1, y1, x2, y2) {
    if (!state.isChallengeMode || !state.target) return;

    const cx = state.target.x;
    const cy = state.target.y;
    const r = state.target.radius;

    // Vector from start to end
    const dx = x2 - x1;
    const dy = y2 - y1;
    const lenSq = dx * dx + dy * dy;

    // Project circle center onto line segment
    // t = ((cx-x1)dx + (cy-y1)dy) / lenSq
    let t = ((cx - x1) * dx + (cy - y1) * dy) / lenSq;
    t = Math.max(0, Math.min(1, t)); // Clamp to segment

    // Closest point
    const closestX = x1 + t * dx;
    const closestY = y1 + t * dy;

    // Distance
    const dist = Math.hypot(cx - closestX, cy - closestY);

    if (dist < r) {
        state.target.hit = true;
        if (!state.hasWon) {
            state.hasWon = true;
            setTimeout(() => {
                document.getElementById('victory-modal').style.display = 'block';
            }, 200); // Small delay for visual effect
        }
    }
}


function castRay(x, y, angle, color, depth = 0) {
    if (depth > MAX_REFLECTIONS) return;

    const dx = Math.cos(angle);
    const dy = Math.sin(angle);

    // Find closest intersection
    let closest = null;
    let minT = Infinity;
    let hitObject = null;

    // Check all segments
    for (let seg of state.segments) {
        const hit = getIntersection(
            { x, y },
            { x: dx, y: dy },
            { x: seg.x1, y: seg.y1 },
            { x: seg.x2, y: seg.y2 }
        );

        if (hit && hit.param < minT && hit.param > 0.1) {
            minT = hit.param;
            closest = hit;
            hitObject = seg;
        }
    }

    // Canvas bounds
    const bounds = [
        { x1: 0, y1: 0, x2: canvas.width, y2: 0 },
        { x1: canvas.width, y1: 0, x2: canvas.width, y2: canvas.height },
        { x1: canvas.width, y1: canvas.height, x2: 0, y2: canvas.height },
        { x1: 0, y1: canvas.height, x2: 0, y2: 0 }
    ];

    for (let bound of bounds) {
        const hit = getIntersection(
            { x, y },
            { x: dx, y: dy },
            { x: bound.x1, y: bound.y1 },
            { x: bound.x2, y: bound.y2 }
        );
        if (hit && hit.param < minT && hit.param > 0.1) {
            minT = hit.param;
            closest = hit;
            hitObject = { type: 'wall' };
        }
    }

    // Draw parameters
    let endX, endY;

    if (closest) {
        endX = closest.x;
        endY = closest.y;
    } else {
        endX = x + dx * MAX_DISTANCE;
        endY = y + dy * MAX_DISTANCE;
    }

    // Visuals
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(endX, endY);
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.shadowBlur = 10;
    ctx.shadowColor = color;
    ctx.stroke();
    ctx.shadowBlur = 0;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(endX, endY);
    ctx.strokeStyle = 'rgba(255,255,255,0.5)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Check Win Condition along this ray segment
    checkTargetHit(x, y, endX, endY);

    // Reflection Logic
    if (closest && hitObject.type === 'mirror') {
        const sx = closest.segDir.x;
        const sy = closest.segDir.y;

        let nx = -sy;
        let ny = sx;
        const len = Math.hypot(nx, ny);
        nx /= len;
        ny /= len;

        if (dx * nx + dy * ny > 0) {
            nx = -nx;
            ny = -ny;
        }

        if (state.showNormals) {
            ctx.beginPath();
            ctx.moveTo(endX, endY);
            ctx.lineTo(endX + nx * 20, endY + ny * 20);
            ctx.strokeStyle = 'rgba(100,100,100,0.5)';
            ctx.lineWidth = 1;
            ctx.stroke();
        }

        const dot = dx * nx + dy * ny;
        const rx = dx - 2 * dot * nx;
        const ry = dy - 2 * dot * ny;

        const newAngle = Math.atan2(ry, rx);

        castRay(endX, endY, newAngle, color, depth + 1);
    }
}

// --- Drawing ---
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Reset Target Hit Status (re-evaluated during raycast)
    if (state.target) state.target.hit = false;

    // Draw Target (Challenge Mode)
    if (state.isChallengeMode && state.target) {
        const t = state.target;
        ctx.beginPath();
        ctx.arc(t.x, t.y, t.radius, 0, Math.PI * 2);
        // Outer glow changes if hit
        if (t.hit) {
            ctx.fillStyle = '#00ff00';
            ctx.shadowColor = '#00ff00';
            ctx.shadowBlur = 30;
        } else {
            ctx.fillStyle = '#333';
            ctx.shadowColor = 'red';
            ctx.shadowBlur = 10;
            ctx.strokeStyle = 'red';
            ctx.lineWidth = 3;
            ctx.stroke();
        }
        ctx.fill();
        ctx.shadowBlur = 0;

        // Bullseye rings
        ctx.beginPath(); ctx.arc(t.x, t.y, t.radius * 0.6, 0, Math.PI * 2);
        ctx.fillStyle = t.hit ? '#ccffcc' : '#500'; ctx.fill();

        ctx.beginPath(); ctx.arc(t.x, t.y, t.radius * 0.3, 0, Math.PI * 2);
        ctx.fillStyle = t.hit ? '#fff' : '#f00'; ctx.fill();
    }


    // Draw Segments
    state.segments.forEach(seg => {
        ctx.beginPath();
        ctx.moveTo(seg.x1, seg.y1);
        ctx.lineTo(seg.x2, seg.y2);

        if (seg.type === 'mirror') {
            ctx.strokeStyle = '#00ffe5';
            ctx.lineWidth = 3;
            ctx.shadowColor = 'cyan';
            ctx.shadowBlur = 5;
        } else {
            ctx.strokeStyle = '#777';
            ctx.lineWidth = 6;
            ctx.shadowBlur = 0;
            // Dotted pattern for walls if frozen
            if (seg.frozen) ctx.setLineDash([2, 2]);
        }
        ctx.stroke();
        ctx.shadowBlur = 0;
        ctx.setLineDash([]);

        ctx.fillStyle = '#fff';
        ctx.beginPath(); ctx.arc(seg.x1, seg.y1, 2, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(seg.x2, seg.y2, 2, 0, Math.PI * 2); ctx.fill();
    });

    // Draw Lasers
    state.lasers.forEach(laser => {
        if (!state.isChallengeMode) {
            // Only draw body if editable
            ctx.beginPath();
            ctx.arc(laser.x, laser.y, 8, 0, Math.PI * 2);
            ctx.fillStyle = laser.color;
            ctx.shadowColor = laser.color;
            ctx.shadowBlur = 10;
            ctx.fill();
            ctx.shadowBlur = 0;
            ctx.strokeStyle = 'white';
            ctx.lineWidth = 2;
            ctx.stroke();
        } else {
            // Minimal source in challenge
            ctx.beginPath();
            ctx.arc(laser.x, laser.y, 5, 0, Math.PI * 2);
            ctx.fillStyle = '#fff';
            ctx.fill();
        }

        castRay(laser.x, laser.y, laser.angle, laser.color);
    });

    // Preview
    if (state.mouse.isDown) {
        if (state.tool === 'mirror' || (!state.isChallengeMode && state.tool === 'wall')) {
            ctx.beginPath();
            ctx.moveTo(state.mouse.startX, state.mouse.startY);
            ctx.lineTo(state.mouse.x, state.mouse.y);
            ctx.strokeStyle = 'rgba(255,255,255,0.5)';
            ctx.setLineDash([5, 5]);
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.setLineDash([]);
        } else if (state.tool === 'laser' && !state.isChallengeMode) {
            ctx.beginPath();
            ctx.moveTo(state.mouse.startX, state.mouse.startY);
            ctx.lineTo(state.mouse.x, state.mouse.y);
            ctx.strokeStyle = state.color;
            ctx.stroke();
        }
    }

    // Stats
    document.getElementById('ray-count').innerText = state.lasers.length;
}


// --- Input ---
canvas.addEventListener('mousedown', (e) => {
    state.mouse.isDown = true;
    state.mouse.startX = e.clientX;
    state.mouse.startY = e.clientY - canvas.getBoundingClientRect().top;
});

window.addEventListener('mouseup', (e) => {
    if (!state.mouse.isDown) return;
    state.mouse.isDown = false;

    const endX = e.clientX;
    const endY = e.clientY - canvas.getBoundingClientRect().top;

    const dx = endX - state.mouse.startX;
    const dy = endY - state.mouse.startY;
    const dist = Math.hypot(dx, dy);

    if (dist < 5) return;

    if (state.tool === 'mirror') {
        state.segments.push({
            x1: state.mouse.startX, y1: state.mouse.startY,
            x2: endX, y2: endY,
            type: 'mirror'
        });
    } else if (state.tool === 'wall' && !state.isChallengeMode) {
        state.segments.push({
            x1: state.mouse.startX, y1: state.mouse.startY,
            x2: endX, y2: endY,
            type: 'wall'
        });
    } else if (state.tool === 'laser' && !state.isChallengeMode) {
        const angle = Math.atan2(dy, dx);
        state.lasers.push({
            x: state.mouse.startX,
            y: state.mouse.startY,
            angle: angle,
            color: state.color
        });
    }
    draw();
});

canvas.addEventListener('mousemove', (e) => {
    state.mouse.x = e.clientX;
    state.mouse.y = e.clientY - canvas.getBoundingClientRect().top;
    if (state.mouse.isDown) draw();
});


// UI Events
function setTool(t) {
    state.tool = t;
    document.querySelectorAll('#tool-group .btn').forEach(b => {
        b.classList.toggle('active', b.dataset.tool === t);
    });
}

document.getElementById('tool-group').addEventListener('click', (e) => {
    if (e.target.tagName === 'BUTTON') {
        if (state.isChallengeMode && e.target.dataset.tool !== 'mirror') return; // Restriction
        setTool(e.target.dataset.tool);
    }
});

document.getElementById('laser-color').addEventListener('input', (e) => {
    state.color = e.target.value;
});

document.getElementById('show-normals').addEventListener('change', (e) => {
    state.showNormals = e.target.checked;
    draw();
});

document.getElementById('btn-clear').addEventListener('click', () => {
    if (state.isChallengeMode) {
        // Clear only user mirrors, keep frozen walls
        state.segments = state.segments.filter(s => s.frozen);
    } else {
        state.segments = [];
        state.lasers = [];
    }
    draw();
});


// Challenge Buttons
document.getElementById('btn-challenge').addEventListener('click', () => {
    if (state.isChallengeMode) {
        stopChallenge();
    } else {
        startChallenge();
    }
});

document.getElementById('btn-next-level').addEventListener('click', () => {
    loadLevel(state.currentLevel + 1);
});


// Initial draw
resizeCanvas(); // Ensure size
draw();
