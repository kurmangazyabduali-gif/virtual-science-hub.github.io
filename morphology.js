/**
 * Virtual Lab: Morphology Constructor
 */

const MORPH_LEVELS = [
    {
        task: "В школу (Мектеп + ...)",
        root: "Мектеп",
        parts: [
            { text: "тер", type: "plural" }, // False option (soft)
            { text: "ке", type: "case" },   // Correct (soft dative)
            { text: "ға", type: "case" },   // False (hard)
            { text: "тар", type: "plural" } // False (hard)
        ],
        solution: ["Мектеп", "ке"]
    },
    {
        task: "Мои друзья (Дос + ...)",
        root: "Дос",
        parts: [
            { text: "тар", type: "plural" }, // Correct (hard)
            { text: "тер", type: "plural" }, // False (soft)
            { text: "ым", type: "possessive" }, // Correct (my)
            { text: "ім", type: "possessive" }  // False (soft)
        ],
        solution: ["Дос", "тар", "ым"]
    },
    {
        task: "Детям (Бала + ...)",
        root: "Бала",
        parts: [
            { text: "лар", type: "plural" },
            { text: "ға", type: "case" },
            { text: "ге", type: "case" },
            { text: "лер", type: "plural" }
        ],
        solution: ["Бала", "лар", "ға"]
    },
    {
        task: "Из города (Қала + ...)",
        root: "Қала",
        parts: [
            { text: "дан", type: "case" },
            { text: "ден", type: "case" },
            { text: "нан", type: "case" },
            { text: "мен", type: "case" }
        ],
        solution: ["Қала", "дан"]
    },
    {
        task: "В доме (Үй + ...)",
        root: "Үй",
        parts: [
            { text: "де", type: "case" },
            { text: "да", type: "case" },
            { text: "те", type: "case" },
            { text: "та", type: "case" }
        ],
        solution: ["Үй", "де"]
    },
    {
        task: "С братом (Аға + ...)",
        root: "Аға",
        parts: [
            { text: "мен", type: "case" },
            { text: "бен", type: "case" },
            { text: "пен", type: "case" },
            { text: "лар", type: "plural" }
        ],
        solution: ["Аға", "мен"]
    },
    {
        task: "Наши учителя (Мұғалім + ...)",
        root: "Мұғалім",
        parts: [
            { text: "дер", type: "plural" },
            { text: "тер", type: "plural" },
            { text: "іміз", type: "possessive" },
            { text: "ымыз", type: "possessive" }
        ],
        solution: ["Мұғалім", "дер", "іміз"]
    },
    {
        task: "Глазам (Көз + ...)",
        root: "Көз",
        parts: [
            { text: "ге", type: "case" },
            { text: "ке", type: "case" },
            { text: "дер", type: "plural" },
            { text: "тер", type: "plural" }
        ],
        solution: ["Көз", "ге"]
    },
    {
        task: "С твоим отцом (Әке + ...)",
        root: "Әке",
        parts: [
            { text: "ң", type: "possessive" },
            { text: "мен", type: "case" },
            { text: "ңмен", type: "combined" },
            { text: "нің", type: "case" }
        ],
        solution: ["Әке", "ң", "мен"]
    },
    {
        task: "На столе (Үстел + ...)",
        root: "Үстел",
        parts: [
            { text: "де", type: "case" },
            { text: "те", type: "case" },
            { text: "да", type: "case" },
            { text: "та", type: "case" }
        ],
        solution: ["Үстел", "де"]
    }
];

let currentMorphIdx = 0;

function initMorphology() {
    document.getElementById('btn-check-morph').addEventListener('click', checkMorph);
    document.getElementById('btn-next-morph').addEventListener('click', () => {
        currentMorphIdx = (currentMorphIdx + 1) % MORPH_LEVELS.length;
        loadMorphLevel(currentMorphIdx);
    });

    loadMorphLevel(0);
}

function loadMorphLevel(idx) {
    const data = MORPH_LEVELS[idx];
    document.getElementById('morph-goal').innerText = data.task;

    // Setup Root
    const ground = document.getElementById('construct-area');
    const pool = document.getElementById('parts-pool');

    ground.innerHTML = '';
    pool.innerHTML = '';
    document.getElementById('morph-msg').innerText = '';
    document.getElementById('btn-check-morph').style.display = 'inline-block';
    document.getElementById('btn-next-morph').style.display = 'none';

    // Spawn Root (Fixed)
    const rootBlock = document.createElement('div');
    rootBlock.className = 'morph-block block-root';
    rootBlock.innerText = data.root;
    ground.appendChild(rootBlock);

    // Spawn Parts (Shuffled)
    const shuffled = [...data.parts].sort(() => Math.random() - 0.5);
    shuffled.forEach(p => {
        const block = document.createElement('div');
        block.className = 'morph-block block-suffix';
        block.dataset.type = p.type;
        block.innerText = p.text;
        block.addEventListener('click', () => toggleMorphBlock(block));
        pool.appendChild(block);
    });
}

function toggleMorphBlock(block) {
    const ground = document.getElementById('construct-area');
    const pool = document.getElementById('parts-pool');

    if (block.parentElement === pool) {
        ground.appendChild(block);
    } else {
        pool.appendChild(block);
    }
}

function checkMorph() {
    const data = MORPH_LEVELS[currentMorphIdx];
    // Get text of all children in ground
    const currentChain = Array.from(document.getElementById('construct-area').children).map(el => el.innerText);

    const msg = document.getElementById('morph-msg');

    // Compare arrays
    const isCorrect = JSON.stringify(currentChain) === JSON.stringify(data.solution);

    if (isCorrect) {
        msg.innerText = "✅ Тамаша! Сөз дұрыс құралды!";
        msg.className = "msg-grammar correct";
        document.getElementById('btn-check-morph').style.display = 'none';
        document.getElementById('btn-next-morph').style.display = 'inline-block';
    } else {
        msg.innerText = "❌ Қате. Жалғауларды тексер!";
        msg.className = "msg-grammar wrong";
    }
}

// Init
initMorphology();
