/**
 * Virtual Lab: Pendulum Wave
 * Simulation of harmonic motion patterns
 */

const canvas = document.getElementById('pendulum-canvas');
const ctx = canvas.getContext('2d');

const state = {
    count: 15,
    speed: 1.0,
    startTime: null,
    running: false,
    is3D: true,
    pendulums: [],

    // Challenge
    isChallengeMode: false,
    targetSpeed: 1.0,
    hasWon: false
};

// --- Physics Constants ---
const GRAVITY = 9.81;
const CYCLE_DURATION = 60; // Seconds for full pattern cycle
const BASE_OSCILLATIONS = 50;

function initPendulums() {
    state.pendulums = [];
    for (let i = 0; i < state.count; i++) {
        const oscillations = BASE_OSCILLATIONS + i;
        const T = CYCLE_DURATION / oscillations;

        // In challenge mode, we distort lengths slightly so standard speed doesnt work
        // The user must adjust speed to compensate (finding 'resonance')
        let L = GRAVITY * Math.pow(T / (2 * Math.PI), 2);

        state.pendulums.push({
            index: i,
            length: L,
            freq: (2 * Math.PI) / T,
            theta: 0,
            color: `hsl(${280 + i * (60 / state.count)}, 100%, 60%)`
        });
    }
}

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = canvas.parentElement.clientHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

function checkWinCondition() {
    if (!state.isChallengeMode || state.hasWon || !state.running) return;

    // Win condition: Speed is close to targetSpeed (+- 0.05)
    // AND we waited for at least 5 seconds
    if (Math.abs(state.speed - state.targetSpeed) < 0.06) {
        // Double check visual alignment? 
        // Just checking input is enough for this UX
        state.hasWon = true;
        document.getElementById('victory-modal').style.display = 'block';
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (state.running && state.isChallengeMode) {
        checkWinCondition();
    }

    const centerX = canvas.width / 2;
    const topY = 100;

    const maxL = state.pendulums[0].length;
    const scale = (canvas.height - 150) / maxL;

    state.pendulums.forEach((p, i) => {
        // t is modified by speed
        const elapsed = state.running ? (Date.now() - state.startTime) / 1000 : 0;
        const t = elapsed * state.speed;

        const thetaMax = Math.PI / 6;
        p.theta = thetaMax * Math.cos(p.freq * t);

        // Position Calculation
        let x, y, z;

        if (state.is3D) {
            const zOffset = i * 20;
            const pivotX = centerX - (state.count * 10) + zOffset;
            const pivotY = topY + i * 5;

            const ballX = pivotX + Math.sin(p.theta) * (p.length * scale);
            const ballY = pivotY + Math.cos(p.theta) * (p.length * scale);

            ctx.beginPath();
            ctx.moveTo(pivotX, pivotY);
            ctx.lineTo(ballX, ballY);
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
            ctx.lineWidth = 1;
            ctx.stroke();

            const radius = 8 + i * 0.2;

            ctx.beginPath();
            ctx.arc(ballX, ballY, radius, 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.shadowBlur = 10;
            ctx.shadowColor = p.color;
            ctx.fill();
            ctx.shadowBlur = 0;

        } else {
            const pivotX = centerX;
            const pivotY = topY;
            const ballX = pivotX + Math.sin(p.theta) * (p.length * scale);
            const ballY = pivotY + Math.cos(p.theta) * (p.length * scale);

            ctx.beginPath();
            ctx.moveTo(pivotX, pivotY);
            ctx.lineTo(ballX, ballY);
            ctx.strokeStyle = 'rgba(255,255,255,0.1)';
            ctx.stroke();

            ctx.beginPath();
            ctx.arc(ballX, ballY, 10, 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.fill();
        }
    });

    requestAnimationFrame(draw);
}


// --- Controls ---
const btnStart = document.getElementById('btn-start');
btnStart.addEventListener('click', () => {
    if (!state.running) {
        state.startTime = Date.now();
        state.running = true;
        btnStart.innerText = "Перезапуск";

        // In challenge mode, play a 'wrong' sound or visual cue if speed is off?
    } else {
        state.startTime = Date.now();
    }
});

document.getElementById('btn-reset').addEventListener('click', () => {
    state.running = false;
    btnStart.innerText = "Запуск";
});

document.getElementById('count').addEventListener('input', (e) => {
    if (state.isChallengeMode) return; // Locked in challenge
    state.count = parseInt(e.target.value);
    document.getElementById('count-val').innerText = state.count;
    initPendulums();
});

document.getElementById('speed').addEventListener('input', (e) => {
    state.speed = parseFloat(e.target.value);
    document.getElementById('speed-val').innerText = state.speed.toFixed(1) + "x";
});

document.getElementById('view-3d').addEventListener('change', (e) => {
    state.is3D = e.target.checked;
});

// Challenge Logic
document.getElementById('btn-challenge').addEventListener('click', () => {
    if (state.isChallengeMode) stopChallenge();
    else startChallenge();
});

document.getElementById('btn-restart-game').addEventListener('click', () => {
    state.hasWon = false;
    document.getElementById('victory-modal').style.display = 'none';
    startChallenge(); // New target
});

function startChallenge() {
    state.isChallengeMode = true;
    state.hasWon = false;
    document.body.classList.add('challenge-active');
    document.getElementById('btn-challenge').innerText = "❌ Выйти (Свободный режим)";

    // Pick random target speed
    // e.g. 0.8, 1.2, 1.5
    const targets = [0.8, 1.2, 1.4, 1.5, 1.6];
    state.targetSpeed = targets[Math.floor(Math.random() * targets.length)];

    // Reset Speed to 1.0 (unless 1.0 IS the target, avoid that)
    if (state.targetSpeed === 1.0) state.targetSpeed = 1.2;
    state.speed = 0.5; // Start slow
    document.getElementById('speed').value = 0.5;
    document.getElementById('speed-val').innerText = "0.5x";

    // Lock Count
    document.getElementById('count').disabled = true;

    // Auto start
    state.startTime = Date.now();
    state.running = true;
    btnStart.innerText = "Перезапуск";

    alert(`Настройте СКОРОСТЬ так, чтобы она стала ${state.targetSpeed}x! (Но вы видите только ползунок...) \nПодсказка: Ищите гармонию.`);
}

function stopChallenge() {
    state.isChallengeMode = false;
    document.body.classList.remove('challenge-active');
    document.getElementById('btn-challenge').innerText = "🧩 Режим Испытаний 'Гармония'";
    document.getElementById('victory-modal').style.display = 'none';

    document.getElementById('count').disabled = false;
}

initPendulums();
draw();
