/**
 * Virtual Lab: Gravity Engine
 * Core simulation logic using HTML5 Canvas
 */

// --- Configuration & State ---
const state = {
    gravity: 9.8,
    elasticity: 0.7,
    friction: 0.99,
    balls: [],
    obstacles: [], // Static walls {x, y, w, h, color}
    isPaused: false,
    mouse: { x: 0, y: 0, isDown: false, startX: 0, startY: 0 },
    mouseMode: 'create', // 'create', 'attract', 'repel'
    selectedMaterial: 'standard',
    isSoundEnabled: false,

    // Challenge Mode
    isChallengeMode: false,
    currentLevel: 0,
    target: null, // {x, y, w, h} - Basket area
    hasWon: false
};

const LEVELS = [
    {
        name: "Штрафной Бросок",
        target: { x: 800, y: 400, w: 100, h: 20 },
        walls: [],
        startObs: [ // Rim
            { x: 790, y: 400, w: 10, h: 10 },
            { x: 900, y: 400, w: 10, h: 10 }
        ]
    },
    {
        name: "Стена",
        target: { x: 900, y: 500, w: 120, h: 20 },
        walls: [
            { x: 400, y: 300, w: 50, h: 400 } // Tall wall in middle
        ],
        startObs: [
            { x: 890, y: 500, w: 10, h: 10 },
            { x: 1020, y: 500, w: 10, h: 10 }
        ]
    },
    {
        name: "Потолок",
        target: { x: 100, y: 400, w: 100, h: 20 },
        walls: [
            { x: 300, y: 400, w: 50, h: 400 }, // Wall blocking direct shot
            { x: 0, y: 200, w: 400, h: 50 } // Ceiling to bounce off
        ],
        startObs: [
            { x: 90, y: 400, w: 10, h: 10 },
            { x: 200, y: 400, w: 10, h: 10 }
        ]
    }
];

// --- Audio Context ---
const AudioContext = window.AudioContext || window.webkitAudioContext;
let audioCtx;

function initAudio() {
    if (!audioCtx) {
        audioCtx = new AudioContext();
    }
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
}

function playCollisionSound(velocity, radius) {
    if (!state.isSoundEnabled || !audioCtx) return;

    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.type = 'sine';
    const freq = 1000 - (radius * 20);
    oscillator.frequency.setValueAtTime(freq, audioCtx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(freq * 0.5, audioCtx.currentTime + 0.1);

    let vol = Math.min(velocity * 0.05, 1);
    if (vol < 0.05) return;

    gainNode.gain.setValueAtTime(vol * 0.3, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.1);
}

// --- Canvas Setup ---
const canvas = document.getElementById('sim-canvas');
const ctx = canvas.getContext('2d');

const chartCanvas = document.getElementById('energy-chart');
const chartCtx = chartCanvas.getContext('2d');
let energyHistory = [];

let animationId;

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = canvas.parentElement.clientHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// --- Materials Data ---
const MATERIALS = {
    standard: { density: 1.0, restitution: 0.7, color: null },
    lead: { density: 3.0, restitution: 0.2, color: '#555555' },
    bouncy: { density: 0.8, restitution: 1.2, color: '#ff00ff' },
    bubble: { density: 0.1, restitution: 0.5, color: 'rgba(255,255,255,0.4)' }
};

// --- Physics Object: Ball ---
class Ball {
    constructor(x, y, vx, vy, radius, materialKey) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.radius = radius;
        this.materialKey = materialKey;

        const mat = MATERIALS[materialKey];
        this.mass = radius * radius * mat.density;
        this.restitution = mat.restitution;
        this.color = mat.color || randomColor();

        this.history = [];
        this.historyMax = 20;
    }

    update() {
        if (state.isPaused) return;

        // Force Fields Logic
        if (state.mouse.isDown && state.mouseMode !== 'create') {
            const dx = state.mouse.x - this.x;
            const dy = state.mouse.y - this.y;
            const dist = Math.hypot(dx, dy);
            const safeDist = Math.max(dist, 20);
            const force = (1000 * this.mass) / (safeDist * safeDist);
            const angle = Math.atan2(dy, dx);

            if (state.mouseMode === 'attract') {
                this.vx += Math.cos(angle) * force;
                this.vy += Math.sin(angle) * force;
            } else if (state.mouseMode === 'repel') {
                this.vx -= Math.cos(angle) * force;
                this.vy -= Math.sin(angle) * force;
            }
        }

        // Store history for trails
        if (Math.abs(this.vx) > 0.1 || Math.abs(this.vy) > 0.1) {
            this.history.push({ x: this.x, y: this.y });
            if (this.history.length > this.historyMax) {
                this.history.shift();
            }
        }

        // Apply forces
        this.vy += state.gravity * 0.05;

        // Air resistance
        this.vx *= state.friction;
        this.vy *= state.friction;

        // Move
        this.x += this.vx;
        this.y += this.vy;

        // Collisions
        this.checkBounds();
        this.checkObstacles();
    }

    checkBounds() {
        let collided = false;
        if (this.y + this.radius > canvas.height) {
            this.y = canvas.height - this.radius;
            this.vy *= -this.restitution;
            collided = true;
            if (Math.abs(this.vy) < state.gravity * 0.1) {
                this.vy = 0;
                collided = false;
            }
        }
        else if (this.y - this.radius < 0) {
            this.y = this.radius;
            this.vy *= -this.restitution;
            collided = true;
        }

        if (this.x + this.radius > canvas.width) {
            this.x = canvas.width - this.radius;
            this.vx *= -this.restitution;
            collided = true;
        } else if (this.x - this.radius < 0) {
            this.x = this.radius;
            this.vx *= -this.restitution;
            collided = true;
        }

        if (collided) {
            playCollisionSound(Math.hypot(this.vx, this.vy), this.radius);
        }
    }

    checkObstacles() {
        state.obstacles.forEach(obs => {
            // AABB collision detection logic (Circle vs Rectangle)
            // Find closest point on rectangle to circle center
            const closestX = Math.max(obs.x, Math.min(this.x, obs.x + obs.w));
            const closestY = Math.max(obs.y, Math.min(this.y, obs.y + obs.h));

            const dx = this.x - closestX;
            const dy = this.y - closestY;
            const distSq = dx * dx + dy * dy;

            if (distSq < this.radius * this.radius) {
                // Collision detected
                const overlap = this.radius - Math.sqrt(distSq);

                // Determine collision normal
                // (Simplified: push out based on relative position)
                if (Math.abs(dx) > Math.abs(dy)) {
                    // Horizontal collision
                    if (dx > 0) { // Hit right side
                        this.x += overlap;
                        this.vx *= -this.restitution;
                    } else { // Hit left side
                        this.x -= overlap;
                        this.vx *= -this.restitution;
                    }
                } else {
                    // Vertical collision
                    if (dy > 0) { // Hit bottom
                        this.y += overlap;
                        this.vy *= -this.restitution;
                    } else { // Hit top
                        this.y -= overlap;
                        this.vy *= -this.restitution;
                    }
                }
                playCollisionSound(Math.hypot(this.vx, this.vy), this.radius);
            }
        });
    }

    draw() {
        // Draw Trail
        if (this.history.length > 1) {
            ctx.beginPath();
            ctx.moveTo(this.history[0].x, this.history[0].y);
            for (let point of this.history) {
                ctx.lineTo(point.x, point.y);
            }
            ctx.strokeStyle = this.color;
            ctx.globalAlpha = 0.4;
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.globalAlpha = 1.0;
        }

        // Draw Ball
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;

        ctx.shadowBlur = 15;
        ctx.shadowColor = this.color;

        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.closePath();
    }
}

// --- Physics Engine: Collisions ---
function resolveCollisions() {
    for (let i = 0; i < state.balls.length; i++) {
        for (let j = i + 1; j < state.balls.length; j++) {
            const b1 = state.balls[i];
            const b2 = state.balls[j];

            const dx = b2.x - b1.x;
            const dy = b2.y - b1.y;
            const distance = Math.hypot(dx, dy);

            // Check if radii overlap
            if (distance < b1.radius + b2.radius) {
                // Sound
                const impactVel = Math.hypot(b1.vx - b2.vx, b1.vy - b2.vy);
                playCollisionSound(impactVel, (b1.radius + b2.radius) / 2);

                // 1. Resolve Overlap
                const overlap = (b1.radius + b2.radius - distance) / 2;
                const normalX = dx / distance;
                const normalY = dy / distance;

                b1.x -= overlap * normalX;
                b1.y -= overlap * normalY;
                b2.x += overlap * normalX;
                b2.y += overlap * normalY;

                // 2. Resolve Velocity (Elastic Collision with Mass)
                const v1n = b1.vx * normalX + b1.vy * normalY;
                const v2n = b2.vx * normalX + b2.vy * normalY;

                const m1 = b1.mass;
                const m2 = b2.mass;

                const newV1n = (v1n * (m1 - m2) + 2 * m2 * v2n) / (m1 + m2);
                const newV2n = (v2n * (m2 - m1) + 2 * m1 * v1n) / (m1 + m2);

                b1.vx += (newV1n - v1n) * normalX;
                b1.vy += (newV1n - v1n) * normalY;
                b2.vx += (newV2n - v2n) * normalX;
                b2.vy += (newV2n - v2n) * normalY;

                const avgRestitution = (b1.restitution + b2.restitution) / 2;
                b1.vx *= avgRestitution;
                b1.vy *= avgRestitution;
                b2.vx *= avgRestitution;
                b2.vy *= avgRestitution;
            }
        }
    }
}

// --- Challenge Logic ---
function startChallenge() {
    state.isChallengeMode = true;
    state.currentLevel = 0;

    document.body.classList.add('challenge-active'); // Reuses style from optics
    document.getElementById('btn-challenge').innerText = "❌ Выйти из режима";
    document.getElementById('level-indicator').style.display = 'block';

    // Clear loose balls
    state.balls = [];

    loadLevel(0);
}

function stopChallenge() {
    state.isChallengeMode = false;
    document.body.classList.remove('challenge-active');
    document.getElementById('btn-challenge').innerText = "🎯 Режим Испытаний (Баскетбол)";
    document.getElementById('level-indicator').style.display = 'none';
    document.getElementById('victory-modal').style.display = 'none';

    state.obstacles = [];
    state.target = null;
    state.balls = [];
}

function loadLevel(idx) {
    if (idx >= LEVELS.length) {
        alert("Поздравляем! Вы прошли лигу!");
        stopChallenge();
        return;
    }
    state.currentLevel = idx;
    state.hasWon = false;
    document.getElementById('victory-modal').style.display = 'none';
    document.getElementById('level-indicator').innerText = `Уровень ${idx + 1}: ${LEVELS[idx].name}`;

    state.balls = [];

    // Scale coords to screen? For simplicity, we use absolute, but ideally relative %
    // Assuming 1200x800 base approx.
    const lvl = LEVELS[idx];
    state.obstacles = [...lvl.walls, ...(lvl.startObs || [])];
    state.target = lvl.target;
}

function checkWinCondition() {
    if (!state.isChallengeMode || !state.target || state.hasWon) return;

    // Check if any ball is inside target area (Basket)
    const t = state.target;
    for (let b of state.balls) {
        // Simple center check
        if (b.x > t.x && b.x < t.x + t.w && b.y > t.y && b.y < t.y + t.h) {
            state.hasWon = true;
            playCollisionSound(50, 50); // Victory sound trigger
            document.getElementById('victory-modal').style.display = 'block';
            break;
        }
    }
}


// --- Utils ---
function randomColor() {
    const colors = ['#00f3ff', '#bc13fe', '#ff0055', '#ffe600', '#00ff9d'];
    return colors[Math.floor(Math.random() * colors.length)];
}

function randomRange(min, max) {
    return Math.random() * (max - min) + min;
}

// --- Energy Graph ---
function drawEnergyChart() {
    let totalKE = 0;
    let totalPE = 0;
    const groundLevel = canvas.height;

    state.balls.forEach(b => {
        const v2 = b.vx * b.vx + b.vy * b.vy;
        totalKE += 0.5 * b.mass * v2;
        const h = groundLevel - b.y;
        if (h > 0) totalPE += b.mass * Math.abs(state.gravity) * h * 0.01;
    });

    const total = totalKE + totalPE;
    energyHistory.push({ ke: totalKE, pe: totalPE });
    if (energyHistory.length > chartCanvas.width) {
        energyHistory.shift();
    }

    const w = chartCanvas.width;
    const h = chartCanvas.height;
    chartCtx.clearRect(0, 0, w, h);

    let maxE = 1000;
    energyHistory.forEach(e => {
        if (e.ke + e.pe > maxE) maxE = e.ke + e.pe;
    });

    chartCtx.lineWidth = 1;

    chartCtx.beginPath();
    chartCtx.moveTo(0, h);
    energyHistory.forEach((e, i) => {
        const y = h - (e.pe / maxE) * h;
        chartCtx.lineTo(i, y);
    });
    chartCtx.strokeStyle = '#bc13fe';
    chartCtx.stroke();

    chartCtx.beginPath();
    chartCtx.moveTo(0, h);
    energyHistory.forEach((e, i) => {
        const y = h - (e.ke / maxE) * h;
        chartCtx.lineTo(i, y);
    });
    chartCtx.strokeStyle = '#00f3ff';
    chartCtx.stroke();

    chartCtx.fillStyle = 'white';
    chartCtx.font = '10px monospace';
    chartCtx.fillText(`KE: ${Math.round(totalKE)}`, 5, 10);
    chartCtx.fillStyle = '#bc13fe';
    chartCtx.fillText(`PE: ${Math.round(totalPE)}`, 5, 20);
}

// --- Input Handling ---
canvas.addEventListener('mousedown', (e) => {
    initAudio();
    state.mouse.isDown = true;
    state.mouse.startX = e.clientX;
    state.mouse.startY = e.clientY - canvas.getBoundingClientRect().top;
});

window.addEventListener('mouseup', (e) => {
    if (!state.mouse.isDown) return;
    state.mouse.isDown = false;

    if (state.mouseMode !== 'create') return;

    const endX = e.clientX;
    const endY = e.clientY - canvas.getBoundingClientRect().top;
    const dx = state.mouse.startX - endX;
    const dy = state.mouse.startY - endY;

    let vx, vy;
    if (Math.hypot(dx, dy) < 10) {
        vx = randomRange(-2, 2);
        vy = randomRange(-2, 2);
    } else {
        vx = dx * 0.15;
        vy = dy * 0.15;
    }

    const radius = randomRange(15, 30);
    const ball = new Ball(state.mouse.startX, state.mouse.startY, vx, vy, radius, state.selectedMaterial);
    state.balls.push(ball);
    updateStats();
});

canvas.addEventListener('mousemove', (e) => {
    state.mouse.x = e.clientX;
    state.mouse.y = e.clientY - canvas.getBoundingClientRect().top;
});

// --- UI Controls ---
document.getElementById('mouse-mode-group').addEventListener('click', (e) => {
    if (e.target.tagName === 'BUTTON') {
        document.querySelectorAll('#mouse-mode-group .btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        state.mouseMode = e.target.dataset.mode;
    }
});

document.getElementById('material-select').addEventListener('change', (e) => {
    state.selectedMaterial = e.target.value;
});

document.getElementById('sound-toggle').addEventListener('change', (e) => {
    state.isSoundEnabled = e.target.checked;
    if (state.isSoundEnabled) initAudio();
});

const gravInput = document.getElementById('gravity');
const gravDisplay = document.getElementById('gravity-val');
gravInput.addEventListener('input', (e) => setGravity(parseFloat(e.target.value)));

function setGravity(val) {
    state.gravity = val;
    gravInput.value = val;
    gravDisplay.textContent = val.toFixed(1) + " м/с²";
    document.querySelectorAll('.preset-btn').forEach(btn => btn.classList.remove('active'));
}

document.getElementById('elasticity').addEventListener('input', (e) => {
    state.elasticity = parseFloat(e.target.value);
    document.getElementById('elasticity-val').textContent = state.elasticity.toFixed(1);
});

document.getElementById('friction').addEventListener('input', (e) => {
    state.friction = parseFloat(e.target.value);
    document.getElementById('friction-val').textContent = state.friction.toFixed(3);
});

document.getElementById('btn-clear').addEventListener('click', () => {
    state.balls = [];
    energyHistory = [];
    updateStats();
});

document.getElementById('btn-pause').addEventListener('click', (e) => {
    state.isPaused = !state.isPaused;
    e.target.textContent = state.isPaused ? "Старт" : "Пауза";
    e.target.classList.toggle('danger');
});

document.getElementById('btn-challenge').addEventListener('click', () => {
    if (state.isChallengeMode) stopChallenge();
    else startChallenge();
});

document.getElementById('btn-next-level').addEventListener('click', () => {
    loadLevel(state.currentLevel + 1);
});

// Preset Buttons
document.querySelectorAll('.preset-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const g = parseFloat(btn.dataset.g);
        setGravity(g);
        btn.classList.add('active');
    });
});

function updateStats() {
    document.getElementById('obj-count').textContent = state.balls.length;
}

// --- Main Loop ---
let lastTime = 0;
function animate(timestamp) {
    const delta = timestamp - lastTime;
    lastTime = timestamp;
    if (timestamp % 10 < 1) {
        document.getElementById('fps-counter').textContent = Math.round(1000 / delta) || 60;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!state.isPaused) {
        resolveCollisions();
        checkWinCondition();
    }

    // Draw Obstacles
    ctx.fillStyle = '#888';
    state.obstacles.forEach(obs => {
        ctx.fillRect(obs.x, obs.y, obs.w, obs.h);
        // Highlight stroke
        ctx.strokeStyle = '#aaa';
        ctx.strokeRect(obs.x, obs.y, obs.w, obs.h);
    });

    // Draw Target
    if (state.isChallengeMode && state.target) {
        const t = state.target;
        ctx.beginPath();
        // Basket Net shape (trapezoid)
        ctx.moveTo(t.x, t.y);
        ctx.lineTo(t.x + t.w, t.y);
        ctx.lineTo(t.x + t.w - 10, t.y + t.h);
        ctx.lineTo(t.x + 10, t.y + t.h);
        ctx.closePath();

        ctx.fillStyle = 'rgba(255, 100, 0, 0.4)';
        ctx.strokeStyle = '#ff6600';
        ctx.lineWidth = 2;
        ctx.fill();
        ctx.stroke();
    }

    state.balls.forEach(ball => {
        ball.update();
        ball.draw();
    });

    if (!state.isPaused) drawEnergyChart();

    if (state.mouse.isDown) {
        if (state.mouseMode === 'create') {
            ctx.beginPath();
            ctx.moveTo(state.mouse.startX, state.mouse.startY);
            ctx.lineTo(state.mouse.x, state.mouse.y);
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.lineWidth = 2;
            ctx.setLineDash([5, 5]);
            ctx.stroke();
            ctx.setLineDash([]);

            ctx.beginPath();
            ctx.arc(state.mouse.startX, state.mouse.startY, 5, 0, Math.PI * 2);
            ctx.fillStyle = 'white';
            ctx.fill();
        } else {
            const color = state.mouseMode === 'attract' ? 'rgba(0, 243, 255, 0.1)' : 'rgba(255, 71, 87, 0.1)';
            const ringColor = state.mouseMode === 'attract' ? '#00f3ff' : '#ff4757';
            ctx.beginPath();
            ctx.arc(state.mouse.x, state.mouse.y, 100, 0, Math.PI * 2);
            ctx.fillStyle = color;
            ctx.fill();
            ctx.strokeStyle = ringColor;
            ctx.lineWidth = 2;
            ctx.stroke();
        }
    }

    animationId = requestAnimationFrame(animate);
}

// Start
animate(0);
