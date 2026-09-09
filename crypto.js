/**
 * Virtual Lab: Hacker Terminal v2.0
 */

// RUS: АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ (33 letters)
const ALPHABET_RU = "АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ".split('');
const ALPHABET = ALPHABET_RU;
const ALPHA_LEN = ALPHABET.length;

// --- STATE ---
const state = {
    currentMission: 0,
    maxUnlocked: 0, // Unlocked level index
    frequency: 0,
    targetFrequency: 0,
    inputCode: "",
    isHacked: false
};

// --- THEMES ---
const THEMES = [
    { main: '#0f0', dim: '#003300', bg: '#050a05' },    // Level 1: Matrix Green
    { main: '#00ccff', dim: '#003344', bg: '#00050a' }, // Level 2: Cyber Blue
    { main: '#ff3300', dim: '#441100', bg: '#0a0000' }, // Level 3: Red Alert
    { main: '#d500f9', dim: '#4a0072', bg: '#0a000a' }, // Level 4: Mystery Purple
    { main: '#ffcc00', dim: '#664400', bg: '#0a0500' }  // Level 5: Golden Legend
];

const MISSIONS = [
    {
        id: 1,
        name: "ОПЕРАЦИЯ: КОНТАКТ",
        text: "ВХОДЯЩАЯ ТРАНСМИССИЯ...\n\nОБНАРУЖЕН НЕИЗВЕСТНЫЙ ОБЪЕКТ.\n\nДЛЯ ДОСТУПА ВВЕДИТЕ ГОД ПЕРВОГО ПОЛЕТА ЧЕЛОВЕКА В КОСМОС.",
        shift: 5,
        targetCode: "1961"
    },
    {
        id: 2,
        name: "ОПЕРАЦИЯ: КИБЕР-ШТОРМ",
        text: "ВНИМАНИЕ! ВИРУСНАЯ УГРОЗА.\n\nЧТОБЫ ОСТАНОВИТЬ ЗАРАЖЕНИЕ, РЕШИТЕ УРАВНЕНИЕ:\n\nКОД = 1000 - 333.",
        shift: 13,
        targetCode: "0667"
    },
    {
        id: 3,
        name: "ОПЕРАЦИЯ: ФАНТОМ",
        text: "СОВЕРШЕННО СЕКРЕТНО.\n\nАГЕНТ 'Z' СКРЫВАЕТСЯ В ГОРОДЕ АЛМАТЫ.\n\nКОД ЭВАКУАЦИИ — ГОД ОСНОВАНИЯ КАЗАХСКОГО ХАНСТВА.",
        shift: 21,
        targetCode: "1465"
    },
    {
        id: 4,
        name: "ОПЕРАЦИЯ: ЭНИГМА",
        text: "ЗАШИФРОВАННЫЙ АРХИВ.\n\nВ КАКОМ ГОДУ БЫЛ ИЗОБРЕТЕН ПЕРВЫЙ ТРАНЗИСТОР?\n(ПОДСКАЗКА: 1947).",
        shift: 10,
        targetCode: "1947"
    },
    {
        id: 5,
        name: "ФИНАЛ: СИНГУЛЯРНОСТЬ",
        text: "СИСТЕМНЫЙ СБОЙ.\nКРИТИЧЕСКАЯ ОШИБКА.\n\nДЛЯ ПЕРЕЗАГРУЗКИ ВВЕДИТЕ ЧИСЛО ПИ (ПЕРВЫЕ 4 ЦИФРЫ: 3141).",
        shift: 30,
        targetCode: "3141"
    }
];

// --- DOM ---
const tuner = document.getElementById('frequency-tuner');
const messageScreen = document.getElementById('message-display');
const shiftLabel = document.getElementById('shift-val');
const integrityMeter = document.getElementById('integrity-meter');
const keypadDisplay = document.getElementById('keypad-input');
const missionList = document.getElementById('mission-list');
const canvas = document.getElementById('signal-canvas');
const ctx = canvas.getContext('2d');

// --- LOGIC ---

function init() {
    tuner.max = 32;
    loadMissions();
    selectMission(0);
    requestAnimationFrame(drawSignal);

    document.getElementById('agent-id').innerText = "USR-" + Math.floor(Math.random() * 9000 + 1000);
}

function loadMissions() {
    missionList.innerHTML = "";
    MISSIONS.forEach((m, idx) => {
        const li = document.createElement('li');
        li.className = 'mission-item';

        // Locked logic
        if (idx > state.maxUnlocked) {
            li.classList.add('locked');
            li.innerHTML = `🔒 <span>ЗАСЕКРЕЧЕНО</span>`;
            li.style.cursor = "not-allowed";
        } else {
            li.innerHTML = `<span>${m.name}</span>`;
            if (idx < state.maxUnlocked) {
                li.innerHTML += ` ✅`;
            }
            li.onclick = () => selectMission(idx);
        }

        if (idx === state.currentMission) li.classList.add('active');
        missionList.appendChild(li);
    });
}

function selectMission(idx) {
    if (idx > state.maxUnlocked) return;

    state.currentMission = idx;
    state.targetFrequency = MISSIONS[idx].shift;
    state.isHacked = (idx < state.maxUnlocked);
    state.isHacked = false;
    state.inputCode = "";

    // Apply Theme
    const theme = THEMES[idx] || THEMES[0];
    const root = document.documentElement;
    root.style.setProperty('--term-green', theme.main);
    root.style.setProperty('--term-dim', theme.dim);
    root.style.setProperty('--term-bg', theme.bg);

    updateKeypad();

    document.querySelectorAll('.mission-item').forEach((el, i) => {
        el.classList.toggle('active', i === idx);
    });

    updateDecryption();
}

function encrypt(text, shift) {
    const upper = text.toUpperCase();
    return upper.split('').map(char => {
        const idx = ALPHABET.indexOf(char);
        if (idx === -1) return char;
        let newIdx = (idx + shift) % ALPHA_LEN;
        return ALPHABET[newIdx];
    }).join('');
}

function updateDecryption() {
    const val = parseInt(tuner.value);
    state.frequency = val;
    shiftLabel.innerText = `ЧАСТОТА: ${val.toString().padStart(2, '0')}.00 MHz`;

    const mission = MISSIONS[state.currentMission];

    let shiftDiff = (mission.shift - val);
    while (shiftDiff < 0) shiftDiff += ALPHA_LEN;
    shiftDiff = shiftDiff % ALPHA_LEN;

    const displayText = encrypt(mission.text, shiftDiff);

    let dist = Math.min(
        Math.abs(mission.shift - val),
        ALPHA_LEN - Math.abs(mission.shift - val)
    );

    let integrity = Math.max(0, 100 - (dist * 10));
    integrityMeter.innerText = integrity + "%";

    const themeColor = getComputedStyle(document.documentElement).getPropertyValue('--term-green').trim();

    // Visual Effects
    if (dist === 0) {
        integrityMeter.style.color = themeColor;
        messageScreen.style.textShadow = `0 0 10px ${themeColor}`;
        messageScreen.classList.remove('glitch');
    } else {
        integrityMeter.style.color = (integrity > 50) ? "#ffff00" : "#555";
        messageScreen.style.textShadow = "none";
    }

    messageScreen.innerText = displayText;
}

// --- VISUALIZER ---
function drawSignal() {
    const themeColor = getComputedStyle(document.documentElement).getPropertyValue('--term-green').trim();

    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = themeColor;
    ctx.lineWidth = 2;
    ctx.beginPath();

    const mission = MISSIONS[state.currentMission];
    let dist = Math.abs(mission.shift - state.frequency);
    const noiseLevel = dist * 2;

    const cy = canvas.height / 2;

    for (let x = 0; x < canvas.width; x += 5) {
        let y = cy + Math.sin(x * 0.05 + Date.now() * 0.01) * 30;
        if (noiseLevel > 0) {
            y += (Math.random() - 0.5) * noiseLevel;
        }

        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    }

    ctx.stroke();

    if (dist === 0) {
        ctx.fillStyle = themeColor;
        ctx.globalAlpha = 0.1;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.globalAlpha = 1.0;

        ctx.fillStyle = themeColor;
        ctx.font = "10px monospace";
        ctx.fillText("СИГНАЛ ЗАХВАЧЕН", 10, 20);
    }

    requestAnimationFrame(drawSignal);
}

// --- KEYPAD ---
window.typeKey = function (key) {
    if (state.isHacked) return;

    if (key === 'C') {
        state.inputCode = "";
    } else if (state.inputCode.length < 4) {
        state.inputCode += key;
    }
    updateKeypad();
};

window.submitCode = function () {
    if (state.isHacked) return;

    const mission = MISSIONS[state.currentMission];
    const themeColor = getComputedStyle(document.documentElement).getPropertyValue('--term-green').trim();

    let input = state.inputCode;
    let target = mission.targetCode;

    if (input === target) {
        // SUCCESS
        state.isHacked = true;
        keypadDisplay.style.color = themeColor;
        keypadDisplay.innerText = "ДОСТУП РАЗРЕШЕН";

        // Progress Logic
        if (state.currentMission === state.maxUnlocked) {
            state.maxUnlocked++;
            // Save progress? (Optional: localStorage)
            messageScreen.innerHTML += `\n\n> УРОВЕНЬ ПРОЙДЕН.\n> СЛЕДУЮЩАЯ МИССИЯ РАЗБЛОКИРОВАНА.`;
        } else {
            messageScreen.innerHTML += `\n\n> СИСТЕМА ВЗЛОМАНА.`;
        }

        loadMissions();

        document.body.style.backgroundColor = "#fff";
        setTimeout(() => document.body.style.backgroundColor = "", 50);

    } else {
        // FAIL
        keypadDisplay.style.color = "#f00";
        keypadDisplay.innerText = "ОТКАЗ";
        setTimeout(() => {
            state.inputCode = "";
            keypadDisplay.style.color = "";
            updateKeypad();
        }, 1000);
    }
};

function updateKeypad() {
    if (!state.isHacked && keypadDisplay.innerText !== "ОТКАЗ") {
        keypadDisplay.innerText = state.inputCode.padEnd(4, '_');
        keypadDisplay.style.color = "var(--term-green)";
    }
}

// --- EVENTS ---
tuner.addEventListener('input', updateDecryption);
window.addEventListener('resize', resizeCanvas);
function resizeCanvas() {
    canvas.width = document.querySelector('.visualizer-box').offsetWidth;
    canvas.height = document.querySelector('.visualizer-box').offsetHeight;
}

setTimeout(resizeCanvas, 100);
init();
