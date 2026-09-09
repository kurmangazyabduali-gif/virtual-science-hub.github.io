/**
 * Virtual Lab: Flashcards Logic
 */

const DATA_SETS = {
    kk: {
        antonyms: [
            { front: "Иә (Да)", back: "Жоқ (Нет)" },
            { front: "Ақ (Белый)", back: "Қара (Черный)" },
            { front: "Үлкен (Большой)", back: "Кіші (Маленький)" },
            { front: "Күн (День)", back: "Түн (Ночь)" },
            { front: "Жақсы (Хорошо)", back: "Жаман (Плохо)" },
            { front: "Жоғары (Верх)", back: "Төмен (Низ)" },
            { front: "Көп (Много)", back: "Аз (Мало)" },
            { front: "Ыстық (Горячо)", back: "Суық (Холодно)" }
        ],
        family: [
            { front: "Ана (Мама)", back: "Әке (Папа)" },
            { front: "Аға (Брат)", back: "Қарындас (Сестренка)" },
            { front: "Ата (Дедушка)", back: "Әже (Бабушка)" },
            { front: "Ұл (Сын)", back: "Қыз (Дочь)" }
        ],
        school: [
            { front: "Мектеп", back: "Школа" },
            { front: "Кітап", back: "Книга" },
            { front: "Қалам", back: "Ручка" },
            { front: "Мұғалім", back: "Учитель" },
            { front: "Оқушы", back: "Ученик" }
        ]
    }
};

const currentLang = (typeof LANG !== 'undefined') ? LANG : 'kk';
let activeSet = []; // List of word objects
let currentIndex = 0;
let learnedCount = 0;
let totalInSet = 0;

// ELEMENTS
const card = document.getElementById('flashcard');
const frontText = document.getElementById('word-front');
const backText = document.getElementById('word-back');
const progBar = document.getElementById('progress-bar');
const counter = document.getElementById('counter');
const btnKnow = document.getElementById('btn-know');
const btnMiss = document.getElementById('btn-miss');
const btnReset = document.getElementById('btn-reset');
const btnSpeak = document.getElementById('btn-speak');

// CATEGORY BUTTONS
document.querySelectorAll('.cat-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const cat = btn.dataset.cat;
        loadCategory(cat);
    });
});

function loadCategory(catKey) {
    const rawData = DATA_SETS[currentLang][catKey] || DATA_SETS[currentLang]['antonyms'];
    // Clone logic
    activeSet = JSON.parse(JSON.stringify(rawData));
    // Shuffle init
    activeSet.sort(() => Math.random() - 0.5);

    totalInSet = activeSet.length;
    currentIndex = 0;

    // Reset learned set tracking implicitly by refilling activeSet
    // Ideally we track learned separately but simpler model:
    // "Known" -> Removed from activeSet.
    // "Missed" -> Kept in activeSet (pushed back).

    // Reset UI
    if (btnReset) btnReset.style.display = 'none';
    if (document.querySelector('.controls-row'))
        document.querySelector('.controls-row').style.display = 'flex';
    if (card) card.style.display = 'block';

    updateCard();
}

function updateCard() {
    if (activeSet.length === 0) {
        showWin();
        return;
    }

    // Ensure index is valid
    if (currentIndex >= activeSet.length) currentIndex = 0;

    const wordObj = activeSet[currentIndex];

    // Reset flip
    card.classList.remove('flipped');

    // Update texts
    setTimeout(() => {
        frontText.innerText = wordObj.front;
        backText.innerText = wordObj.back;
    }, 200); // slight delay for smooth transition if spamming

    // Update progress
    const learned = totalInSet - activeSet.length;
    const pct = (learned / totalInSet) * 100;
    progBar.style.width = `${pct}%`;
    counter.innerText = `${learned} / ${totalInSet}`;
}

// FLIP
if (card) {
    card.addEventListener('click', () => {
        card.classList.toggle('flipped');
    });
}

// ACTIONS
if (btnKnow) {
    btnKnow.addEventListener('click', handleKnow);
}
if (btnMiss) {
    btnMiss.addEventListener('click', handleMiss);
}

function handleKnow() {
    // Remove current word from set
    activeSet.splice(currentIndex, 1);
    // Index stays same (next word shifts into slot), unless we were at end
    if (currentIndex >= activeSet.length) currentIndex = 0;
    updateCard();
}

function handleMiss() {
    // Keep word, move to next
    currentIndex++;
    if (currentIndex >= activeSet.length) currentIndex = 0;
    updateCard();
}

// WIN STATE
function showWin() {
    frontText.innerText = "Жарайсың! 🎉"; // Great job!
    backText.innerText = "Барлығын жаттадың!";
    progBar.style.width = '100%';
    counter.innerText = `${totalInSet} / ${totalInSet}`;

    // Hide controls
    document.querySelector('.controls-row').style.display = 'none';

    // Show Reset
    if (btnReset) btnReset.style.display = 'block';
}

if (btnReset) {
    btnReset.addEventListener('click', () => {
        // Reload current category logic
        const activeCatBtn = document.querySelector('.cat-btn.active');
        const cat = activeCatBtn ? activeCatBtn.dataset.cat : 'antonyms';
        loadCategory(cat);
    });
}

// TTS
if (btnSpeak) {
    btnSpeak.addEventListener('click', speakWord);
}

function speakWord() {
    const text = frontText.innerText;
    if (!window.speechSynthesis) return;

    const utterance = new SpeechSynthesisUtterance(text);
    // Try to find Kazakh voice or Russian/Turkic fallback
    // Note: Browser support for 'kk-KZ' varies. 
    utterance.lang = 'kk-KZ';
    window.speechSynthesis.speak(utterance);
}

// Init
loadCategory('antonyms');
