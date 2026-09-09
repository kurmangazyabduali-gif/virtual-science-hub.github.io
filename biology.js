/**
 * Virtual Lab: Biology - High Fidelity Microscope (Mega Edition)
 */

const ORGANELLES = [
    // --- CATEGORY: HUMAN CELLS (Human) ---
    { id: 'erythrocyte', category: 'human', name: 'Эритроцит', cssClass: 'org-erythrocyte', desc: 'Красная клетка крови. Переносит кислород.', energy: 0, limit: 50 },
    { id: 'leukocyte', category: 'human', name: 'Лейкоцит', cssClass: 'org-leukocyte', desc: 'Белая клетка крови. Защищает иммунитет.', energy: 0, limit: 5 },
    { id: 'neuron', category: 'human', name: 'Нейрон', cssClass: 'org-neuron', desc: 'Нервная клетка. Передает сигналы.', energy: 20, limit: 3 },
    { id: 'platelet', category: 'human', name: 'Тромбоцит', cssClass: 'org-platelet', desc: 'Участвует в свертывании крови.', energy: 0, limit: 20 },
    { id: 'sperm', category: 'human', name: 'Сперматозоид', cssClass: 'org-sperm', desc: 'Мужская половая клетка.', energy: 50, limit: 10 },
    { id: 'egg', category: 'human', name: 'Яйцеклетка', cssClass: 'org-egg', desc: 'Женская половая клетка. Самая крупная у человека.', energy: 100, limit: 1 },
    { id: 'adipocyte', category: 'human', name: 'Адипоцит', cssClass: 'org-adipocyte', desc: 'Жировая клетка. Хранит энергию.', energy: 0, limit: 10 }, // Lots of stored energy but doesn't produce it actively like mito
    { id: 'myocyte', category: 'human', name: 'Миоцит', cssClass: 'org-myocyte', desc: 'Мышечная клетка. Сокращается.', energy: 30, limit: 5 },
    { id: 'osteocyte', category: 'human', name: 'Остеоцит', cssClass: 'org-osteocyte', desc: 'Клетка костной ткани.', energy: 0, limit: 5 },
    { id: 'epithelial', category: 'human', name: 'Эпителий', cssClass: 'org-epithelial', desc: 'Клетка кожи/слизистой.', energy: 0, limit: 10 },

    // --- CATEGORY: ANIMAL (Organelles & Micro-Animals) ---
    { id: 'nucleus', category: 'animal', name: 'Ядро', cssClass: 'org-nucleus', desc: 'Центр клетки с ДНК.', energy: 0, limit: 1, unique: true },
    { id: 'mitochondria', category: 'animal', name: 'Митохондрия', cssClass: 'org-mitochondria', desc: 'Энергостанция (АТФ).', energy: 15, limit: 8 },
    { id: 'ribosome', category: 'animal', name: 'Рибосома', cssClass: 'org-ribosome', desc: 'Синтез белка.', energy: 2, limit: 20 },
    { id: 'lysosome', category: 'animal', name: 'Лизосома', cssClass: 'org-lysosome', desc: 'Переваривание веществ.', energy: 1, limit: 5 },
    { id: 'golgi', category: 'animal', name: 'Аппарат Гольджи', cssClass: 'org-golgi', desc: 'Транспорт белков.', energy: 5, limit: 3 },
    { id: 'amoeba', category: 'animal', name: 'Амеба', cssClass: 'org-amoeba', desc: 'Простейшее одноклеточное. Меняет форму.', energy: 10, limit: 2 },
    { id: 'paramecium', category: 'animal', name: 'Инфузория', cssClass: 'org-paramecium', desc: 'Туфелька. Плавает ресничками.', energy: 10, limit: 2 },
    { id: 'tardigrade', category: 'animal', name: 'Тихоходка', cssClass: 'org-tardigrade', desc: 'Самое живучее существо. "Водяной медведь".', energy: 50, limit: 1 },
    { id: 'rotifer', category: 'animal', name: 'Коловратка', cssClass: 'org-rotifer', desc: 'Микро-животное с коловращательным аппаратом.', energy: 10, limit: 2 },
    { id: 'hydra', category: 'animal', name: 'Гидра', cssClass: 'org-hydra', desc: 'Пресноводный полип.', energy: 20, limit: 1 },
    { id: 'centriole', category: 'animal', name: 'Центриоль', cssClass: 'org-centriole', desc: 'Деление клетки.', energy: 0, limit: 2 },

    // --- CATEGORY: OTHERS (Plants, Virus, etc) ---
    { id: 'chloroplast', category: 'other', name: 'Хлоропласт', cssClass: 'org-chloroplast', desc: 'Фотосинтез (Растения).', energy: 15, limit: 5 },
    { id: 'cellwall', category: 'other', name: 'Клеточная стенка', cssClass: 'org-cellwall', desc: 'Жесткая оболочка растений.', energy: 0, limit: 5 },
    { id: 'stoma', category: 'other', name: 'Устьице', cssClass: 'org-stoma', desc: 'Пора листа для дыхания.', energy: 0, limit: 5 },
    { id: 'pollen', category: 'other', name: 'Пыльца', cssClass: 'org-pollen', desc: 'Мужская клетка растений.', energy: 0, limit: 10 },
    { id: 'virus', category: 'other', name: 'Вирус (Враг!)', cssClass: 'org-virus', desc: 'Паразит. Отнимает энергию!', energy: -20, limit: 5 },
    { id: 'hiv', category: 'other', name: 'ВИЧ', cssClass: 'org-hiv', desc: 'Вирус иммунодефицита.', energy: -50, limit: 1 },
    { id: 'influenza', category: 'other', name: 'Грипп', cssClass: 'org-influenza', desc: 'Вирус гриппа.', energy: -15, limit: 5 },
    { id: 'ecoli', category: 'other', name: 'Кишечная палочка', cssClass: 'org-ecoli', desc: 'Бактерия. Может быть полезной и вредной.', energy: 5, limit: 5 },
    { id: 'diatom', category: 'other', name: 'Диатомея', cssClass: 'org-diatom', desc: 'Водоросль в стеклянном панцире.', energy: 5, limit: 3 },
    { id: 'atp', category: 'other', name: 'АТФ', cssClass: 'org-atp', desc: 'Молекула энергии.', energy: 5, limit: 50 },
    { id: 'water', category: 'other', name: 'Вода H2O', cssClass: 'org-water', desc: 'Основа жизни.', energy: 0, limit: 100 }
];

// State
let cellData = {
    atp: 0,
    hasNucleus: false,
    focusPlane: 50,
    objects: []
};

// UI Refs
const petriDish = document.getElementById('petri-dish');
const tray = document.getElementById('tray');
const knob = document.getElementById('visual-knob');
const knobRotator = document.getElementById('knob-rotate');
const toast = document.getElementById('info-toast');
const valAtp = document.getElementById('val-atp');
const valStatus = document.getElementById('val-status');

// Init
function init() {
    renderTray();
    setupKnobControl();
    updateFocusEffect();
}

// --- KNOB INTERACTION ---
function setupKnobControl() {
    let isDragging = false;
    let startY = 0;
    let startVal = 50;

    knob.addEventListener('mousedown', (e) => {
        isDragging = true;
        startY = e.clientY;
        startVal = cellData.focusPlane;
        document.body.style.cursor = 'ns-resize';
    });

    window.addEventListener('mouseup', () => {
        isDragging = false;
        document.body.style.cursor = 'default';
    });

    window.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        const delta = (startY - e.clientY) * 0.5;
        let newVal = startVal + delta;
        newVal = Math.max(0, Math.min(100, newVal));
        cellData.focusPlane = newVal;
        updateKnobVisuals();
        updateFocusEffect();
    });
}

function updateKnobVisuals() {
    const deg = (cellData.focusPlane - 50) * 2.7;
    knobRotator.style.transform = `rotate(${deg}deg)`;
}

// --- FOCUS CONFIG ---
function updateFocusEffect() {
    const plane = cellData.focusPlane;
    cellData.objects.forEach(obj => {
        const dist = Math.abs(obj.z - plane);

        // Strict Blur: anything > 2 units away starts blurring fast
        let blur = 0;
        if (dist > 2) {
            blur = (dist - 2) * 0.6; // Multiplier
        }
        blur = Math.min(20, blur);

        obj.el.style.filter = `blur(${blur}px) drop-shadow(2px 5px 5px rgba(0,0,0,0.3))`;

        if (blur > 3) {
            obj.el.style.pointerEvents = 'none';
            obj.el.style.opacity = 0.5 + (1 - (dist / 50)) * 0.5;
        } else {
            obj.el.style.pointerEvents = 'auto';
            obj.el.style.opacity = 1;
        }
    });
}

// --- TRAY RENDERING (GROUPED) ---
function renderTray() {
    tray.innerHTML = '';
    // Removed specific alignments here to let CSS handle 'stretch'

    const categories = [
        { id: 'human', title: "🧍 ЧЕЛОВЕК", color: "rgba(244, 114, 182, 0.1)" },
        { id: 'animal', title: "🐘 ЖИВОТНЫЕ", color: "rgba(163, 230, 53, 0.1)" },
        { id: 'other', title: "🦠 МИКРОМИР", color: "rgba(96, 165, 250, 0.1)" }
    ];

    categories.forEach(cat => {
        // Filter items
        const items = ORGANELLES.filter(o => o.category === cat.id);
        if (items.length === 0) return;

        // Section Container
        const section = document.createElement('div');
        section.className = 'tray-section';
        // Style as full panels
        section.style.background = cat.color;
        section.style.borderRight = '1px solid rgba(255,255,255,0.1)';
        section.style.padding = '15px 25px';
        section.style.display = 'flex';
        section.style.flexDirection = 'column';
        section.style.justifyContent = 'center'; // Center content vertically
        section.style.gap = '15px';
        section.style.minWidth = 'max-content';

        // Header
        const header = document.createElement('div');
        header.innerText = cat.title;
        header.style.color = 'rgba(255,255,255,0.7)';
        header.style.fontSize = '0.9rem';
        header.style.fontWeight = 'bold';
        header.style.letterSpacing = '2px';
        header.style.textAlign = 'center';
        section.appendChild(header);

        // Item Grid
        const itemRow = document.createElement('div');
        itemRow.style.display = 'flex';
        itemRow.style.gap = '15px';

        items.forEach(org => {
            const slot = createTraySlot(org);
            itemRow.appendChild(slot);
        });

        section.appendChild(itemRow);
        tray.appendChild(section);
    });
}

function createTraySlot(org) {
    const slot = document.createElement('div');
    slot.className = 'tray-slot';
    slot.title = org.name;

    const preview = document.createElement('div');
    preview.className = org.cssClass;
    // Scale for preview - BIGGER as requested (0.8 instead of 0.5)
    preview.style.transform = 'scale(0.8)';
    preview.style.position = 'relative';
    preview.style.animation = 'none';

    slot.appendChild(preview);
    slot.draggable = true;
    slot.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('id', org.id);
    });
    return slot;
}

petriDish.addEventListener('dragover', e => e.preventDefault());
petriDish.addEventListener('drop', e => {
    e.preventDefault();
    const id = e.dataTransfer.getData('id');
    if (id) spawnOrganelle(id, e.clientX, e.clientY);
});

function spawnOrganelle(id, clientX, clientY) {
    const def = ORGANELLES.find(o => o.id === id);

    if (def.unique && cellData.hasNucleus) {
        showFeedback("Только одно Ядро допустимо!", "error");
        return;
    }

    const el = document.createElement('div');
    el.className = `organelle ${def.cssClass}`;

    // Position
    const rect = petriDish.getBoundingClientRect();
    const x = clientX - rect.left - 25;
    const y = clientY - rect.top - 25;

    el.style.left = x + 'px';
    el.style.top = y + 'px';

    // Z-Depth Randomization Strategy
    let randomZ = Math.random() * 100;
    // Ensure it's blurry
    if (Math.abs(randomZ - cellData.focusPlane) < 15) {
        randomZ = (randomZ + 50) % 100;
    }

    const z = randomZ;
    el.style.zIndex = Math.floor(z);

    const rot = Math.random() * 360;
    el.style.transform = `rotate(${rot}deg)`;

    el.addEventListener('click', (e) => {
        e.stopPropagation();
        showInfo(def, z);
    });

    petriDish.appendChild(el);

    cellData.objects.push({ el, z, def });

    if (id === 'nucleus') cellData.hasNucleus = true;
    cellData.atp += def.energy;
    updateStats();
    updateFocusEffect();
}

function updateStats() {
    valAtp.innerText = cellData.atp;

    if (cellData.hasNucleus && cellData.atp > 50) {
        valStatus.innerText = "ЖИЗНЬ";
        valStatus.style.color = "#4ade80";
        valStatus.style.textShadow = "0 0 10px #4ade80";
    } else if (cellData.hasNucleus) {
        valStatus.innerText = "Сон";
        valStatus.style.color = "#fbbf24";
    } else {
        valStatus.innerText = "Мертва";
        valStatus.style.color = "#ef4444";
    }
}

function showInfo(def, zDepth) {
    document.getElementById('toast-title').innerText = def.name;
    document.getElementById('toast-desc').innerText = def.desc;
    document.getElementById('toast-meta').innerText = `Глубина: ${Math.round(zDepth)} μm`;
    toast.classList.add('visible');

    const hideFn = () => {
        toast.classList.remove('visible');
        petriDish.removeEventListener('click', hideFn);
    };
    petriDish.addEventListener('click', hideFn);
}

function showFeedback(text, type) {
    const t = document.getElementById('toast-title');
    const d = document.getElementById('toast-desc');
    const oldT = t.innerText;
    const oldD = d.innerText;

    t.innerText = type === 'error' ? "Ошибка!" : "Инфо";
    d.innerText = text;
    t.style.color = type === 'error' ? '#ef4444' : '#4ade80';
    toast.classList.add('visible');

    setTimeout(() => {
        toast.classList.remove('visible');
        setTimeout(() => {
            t.innerText = oldT;
            d.innerText = oldD;
            t.style.color = '#4ade80';
        }, 500);
    }, 2000);
}

init();
