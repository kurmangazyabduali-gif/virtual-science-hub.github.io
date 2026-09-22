/* =====================================================
   PRESENTATION APP — COMPLETE SCRIPT WITH RAG ARCHITECTURE
   ===================================================== */

const API_KEY = localStorage.getItem('ai_api_key') || localStorage.getItem('gemini_api_key') || atob('c2stWURjaEdfRFpxamtuVk5zdXlKd1NhQQ==');
const PHOTO_API_KEY = localStorage.getItem('photo_api_key') || atob('c2stR1dxWTk5cnFJekR3STVLTGFQdUkxdw==');
const FALLBACK_GEMINI_KEY = atob('QVEuQWI4Uk42SnZ1V19xZ0FmSlpBaURwbE1EbEdxR0tvYlRiZ3hMc2l3aWI0c1BNZXJHQnc=');
const GEMINI_ENDPOINTS = [
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent',
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent'
];
const GEMINI_URL = GEMINI_ENDPOINTS[0];

// ── App State ────────────────────────────────────────────────
let presentationState = {
    title: 'Новая презентация',
    theme: {
        backgroundColor: '#F8FAFC',
        primaryTextColor: '#475569',
        accentColor: '#3B82F6',
        style: 'NotebookLM Academic'
    },
    slides: [],
    currentSlideIndex: 0
};

// Preset Palettes
const PALETTES_MAP = {
    notebook: { bg: '#F8FAFC', text: '#475569', accent: '#3B82F6', style: 'NotebookLM Academic' },
    dark:     { bg: '#0f172a', text: '#f8fafc', accent: '#38bdf8', style: 'Dark Tech' },
    emerald:  { bg: '#F0FDF4', text: '#334155', accent: '#10B981', style: 'Emerald Academic' },
    sunset:   { bg: '#FFFBEB', text: '#334155', accent: '#F59E0B', style: 'Warm Academic' },
    violet:   { bg: '#FDF4FF', text: '#334155', accent: '#8B5CF6', style: 'Violet Academic' }
};

// ── 20 Ready-Made Design Templates ──────────────────────────
let selectedTemplateId = 'academic-blue';
let activeCategoryFilter = 'all';

const DESIGN_TEMPLATES = [
    {
        id: 'academic-blue',
        name: 'Академический Синий',
        category: 'academic',
        icon: '📘',
        isDark: false,
        theme: { 
            backgroundColor: '#F8FAFC', 
            primaryTextColor: '#475569', 
            accentColor: '#3B82F6', 
            style: 'Academic Blue',
            tileBg: '#FFFFFF',
            tileBorder: '#E2E8F0',
            titleColor: '#0F172A'
        },
        imageStyle: 'clean modern vector infographic, educational schematic, minimalist scientific illustration',
        layouts: ['cover', 'split-left', 'split-right', 'cards-grid', 'top-bottom', 'focus-card', 'split-left'],
        preview: 'split-left'
    },
    {
        id: 'dark-tech',
        name: 'Тёмный Технический',
        category: 'tech',
        icon: '🌑',
        isDark: true,
        theme: { 
            backgroundColor: '#0F172A', 
            primaryTextColor: '#E2E8F0', 
            accentColor: '#38BDF8', 
            style: 'Dark Tech',
            tileBg: '#1E293B',
            tileBorder: 'rgba(56,189,248,0.25)',
            titleColor: '#F8FAFC'
        },
        imageStyle: 'dark futuristic 3d render, cyberpunk tech, neon blue accents, octane render 8k',
        layouts: ['cover', 'split-left', 'focus-card', 'split-right', 'cards-grid', 'top-bottom', 'split-left'],
        preview: 'split-left'
    },
    {
        id: 'emerald-nature',
        name: 'Изумруд Природы',
        category: 'academic',
        icon: '🌿',
        isDark: false,
        theme: { 
            backgroundColor: '#F0FDF4', 
            primaryTextColor: '#334155', 
            accentColor: '#10B981', 
            style: 'Emerald Nature',
            tileBg: '#FFFFFF',
            tileBorder: '#DCFCE7',
            titleColor: '#064E3B'
        },
        imageStyle: 'natural science macro photography, emerald green botanical diagram, clean soft lighting',
        layouts: ['cover', 'split-right', 'top-bottom', 'split-left', 'focus-card', 'cards-grid', 'split-right'],
        preview: 'split-right'
    },
    {
        id: 'sunset-warm',
        name: 'Тёплый Закат',
        category: 'business',
        icon: '🌅',
        isDark: false,
        theme: { 
            backgroundColor: '#FFFBEB', 
            primaryTextColor: '#451A03', 
            accentColor: '#F59E0B', 
            style: 'Sunset Warm',
            tileBg: '#FFFFFF',
            tileBorder: '#FEF3C7',
            titleColor: '#451A03'
        },
        imageStyle: 'warm golden sunset lighting, isometric 3d render, warm corporate aesthetic',
        layouts: ['cover', 'top-bottom', 'split-left', 'cards-grid', 'split-right', 'focus-card', 'top-bottom'],
        preview: 'top-bottom'
    },
    {
        id: 'violet-creative',
        name: 'Фиолетовый Креатив',
        category: 'creative',
        icon: '🔮',
        isDark: false,
        theme: { 
            backgroundColor: '#FDF4FF', 
            primaryTextColor: '#334155', 
            accentColor: '#8B5CF6', 
            style: 'Violet Creative',
            tileBg: '#FFFFFF',
            tileBorder: '#F3E8FF',
            titleColor: '#3B0764'
        },
        imageStyle: 'purple violet digital art, creative abstract 3d geometry, modern gradient',
        layouts: ['cover', 'cards-grid', 'split-left', 'focus-card', 'split-right', 'top-bottom', 'cards-grid'],
        preview: 'cards-grid'
    },
    {
        id: 'ocean-deep',
        name: 'Глубокий Океан',
        category: 'business',
        icon: '🌊',
        isDark: false,
        theme: { 
            backgroundColor: '#F0F9FF', 
            primaryTextColor: '#1E3A5F', 
            accentColor: '#0EA5E9', 
            style: 'Deep Ocean',
            tileBg: '#FFFFFF',
            tileBorder: '#E0F2FE',
            titleColor: '#0C4A6E'
        },
        imageStyle: 'deep ocean marine aesthetic, clean modern blue infographics, corporate 3d',
        layouts: ['cover', 'split-left', 'top-bottom', 'split-right', 'focus-card', 'split-left', 'cards-grid'],
        preview: 'split-left'
    },
    {
        id: 'rose-elegant',
        name: 'Элегантная Роза',
        category: 'creative',
        icon: '🌹',
        isDark: false,
        theme: { 
            backgroundColor: '#FFF1F2', 
            primaryTextColor: '#4C0519', 
            accentColor: '#F43F5E', 
            style: 'Rose Elegant',
            tileBg: '#FFFFFF',
            tileBorder: '#FFE4E6',
            titleColor: '#881337'
        },
        imageStyle: 'elegant soft rose gold 3d aesthetic, floral pastel digital artwork, clean lighting',
        layouts: ['cover', 'focus-card', 'split-left', 'cards-grid', 'split-right', 'top-bottom', 'focus-card'],
        preview: 'focus-card'
    },
    {
        id: 'mint-fresh',
        name: 'Свежая Мята',
        category: 'creative',
        icon: '🍃',
        isDark: false,
        theme: { 
            backgroundColor: '#ECFDF5', 
            primaryTextColor: '#134E4A', 
            accentColor: '#14B8A6', 
            style: 'Mint Fresh',
            tileBg: '#FFFFFF',
            tileBorder: '#CCFBF1',
            titleColor: '#134E4A'
        },
        imageStyle: 'fresh mint green vector illustration, clean minimalist healthcare science',
        layouts: ['cover', 'split-right', 'cards-grid', 'top-bottom', 'split-left', 'focus-card', 'split-right'],
        preview: 'split-right'
    },
    {
        id: 'coral-energy',
        name: 'Энергия Коралла',
        category: 'business',
        icon: '🪸',
        isDark: false,
        theme: { 
            backgroundColor: '#FFF7ED', 
            primaryTextColor: '#431407', 
            accentColor: '#F97316', 
            style: 'Coral Energy',
            tileBg: '#FFFFFF',
            tileBorder: '#FFEDD5',
            titleColor: '#7C2D12'
        },
        imageStyle: 'energetic orange coral modern 3d illustration, dynamic startup aesthetic',
        layouts: ['cover', 'top-bottom', 'focus-card', 'split-left', 'cards-grid', 'split-right', 'top-bottom'],
        preview: 'top-bottom'
    },
    {
        id: 'indigo-pro',
        name: 'Индиго Профи',
        category: 'academic',
        icon: '💎',
        isDark: false,
        theme: { 
            backgroundColor: '#EEF2FF', 
            primaryTextColor: '#312E81', 
            accentColor: '#6366F1', 
            style: 'Indigo Professional',
            tileBg: '#FFFFFF',
            tileBorder: '#E0E7FF',
            titleColor: '#1E1B4B'
        },
        imageStyle: 'professional indigo vector charts, high tech science diagrams, clean modern',
        layouts: ['cover', 'split-left', 'split-right', 'focus-card', 'top-bottom', 'cards-grid', 'split-left'],
        preview: 'split-left'
    },
    {
        id: 'midnight-neon',
        name: 'Полночный Неон',
        category: 'tech',
        icon: '🌃',
        isDark: true,
        theme: { 
            backgroundColor: '#0C0A1A', 
            primaryTextColor: '#E2E8F0', 
            accentColor: '#A78BFA', 
            style: 'Midnight Neon',
            tileBg: '#18182E',
            tileBorder: 'rgba(167,139,250,0.3)',
            titleColor: '#F8FAFC'
        },
        imageStyle: 'midnight dark neon synthwave, glowing purple neon 3d isometric render',
        layouts: ['cover', 'cards-grid', 'split-right', 'top-bottom', 'focus-card', 'split-left', 'cards-grid'],
        preview: 'cards-grid'
    },
    {
        id: 'sky-light',
        name: 'Небесный Свет',
        category: 'academic',
        icon: '☁️',
        isDark: false,
        theme: { 
            backgroundColor: '#F0F9FF', 
            primaryTextColor: '#0C4A6E', 
            accentColor: '#7DD3FC', 
            style: 'Sky Light',
            tileBg: '#FFFFFF',
            tileBorder: '#E0F2FE',
            titleColor: '#0369A1'
        },
        imageStyle: 'airy sky blue minimalist vector, educational astronomy science illustration',
        layouts: ['cover', 'split-left', 'top-bottom', 'cards-grid', 'split-right', 'focus-card', 'split-left'],
        preview: 'split-left'
    },
    {
        id: 'forest-dark',
        name: 'Тёмный Лес',
        category: 'tech',
        icon: '🌲',
        isDark: true,
        theme: { 
            backgroundColor: '#052E16', 
            primaryTextColor: '#D1FAE5', 
            accentColor: '#4ADE80', 
            style: 'Dark Forest',
            tileBg: '#064E3B',
            tileBorder: 'rgba(74,222,128,0.3)',
            titleColor: '#ECFDF5'
        },
        imageStyle: 'dark emerald green forest ambient lighting, high tech bioluminescent nature',
        layouts: ['cover', 'focus-card', 'split-right', 'split-left', 'top-bottom', 'cards-grid', 'focus-card'],
        preview: 'focus-card'
    },
    {
        id: 'cherry-blossom',
        name: 'Цветение Сакуры',
        category: 'creative',
        icon: '🌸',
        isDark: false,
        theme: { 
            backgroundColor: '#FDF2F8', 
            primaryTextColor: '#831843', 
            accentColor: '#EC4899', 
            style: 'Cherry Blossom',
            tileBg: '#FFFFFF',
            tileBorder: '#FCE7F3',
            titleColor: '#831843'
        },
        imageStyle: 'japanese cherry blossom aesthetic, soft pink watercolor digital art, elegant',
        layouts: ['cover', 'split-right', 'focus-card', 'split-left', 'top-bottom', 'cards-grid', 'split-right'],
        preview: 'split-right'
    },
    {
        id: 'arctic-frost',
        name: 'Арктический Мороз',
        category: 'academic',
        icon: '❄️',
        isDark: false,
        theme: { 
            backgroundColor: '#F8FAFC', 
            primaryTextColor: '#1E293B', 
            accentColor: '#94A3B8', 
            style: 'Arctic Frost',
            tileBg: '#FFFFFF',
            tileBorder: '#E2E8F0',
            titleColor: '#0F172A'
        },
        imageStyle: 'arctic ice crystal macro photography, cold silver blue scientific textures',
        layouts: ['cover', 'top-bottom', 'split-left', 'split-right', 'focus-card', 'cards-grid', 'top-bottom'],
        preview: 'top-bottom'
    },
    {
        id: 'golden-premium',
        name: 'Золотой Премиум',
        category: 'business',
        icon: '👑',
        isDark: false,
        theme: { 
            backgroundColor: '#FEFCE8', 
            primaryTextColor: '#422006', 
            accentColor: '#CA8A04', 
            style: 'Golden Premium',
            tileBg: '#FFFFFF',
            tileBorder: '#FEF08A',
            titleColor: '#422006'
        },
        imageStyle: 'luxury gold 3d abstract render, cinematic lighting, premium corporate graphic',
        layouts: ['cover', 'focus-card', 'split-left', 'top-bottom', 'split-right', 'cards-grid', 'focus-card'],
        preview: 'focus-card'
    },
    {
        id: 'cyber-punk',
        name: 'Кибер Панк',
        category: 'tech',
        icon: '⚡',
        isDark: true,
        theme: { 
            backgroundColor: '#18181B', 
            primaryTextColor: '#FAFAFA', 
            accentColor: '#22D3EE', 
            style: 'Cyber Punk',
            tileBg: '#27272A',
            tileBorder: 'rgba(34,211,238,0.35)',
            titleColor: '#FAFAFA'
        },
        imageStyle: 'cyberpunk 2077 aesthetic, cyan and yellow neon wires, dark futuristic high tech',
        layouts: ['cover', 'cards-grid', 'top-bottom', 'split-left', 'focus-card', 'split-right', 'cards-grid'],
        preview: 'cards-grid'
    },
    {
        id: 'lavender-calm',
        name: 'Лавандовый Покой',
        category: 'creative',
        icon: '💜',
        isDark: false,
        theme: { 
            backgroundColor: '#F5F3FF', 
            primaryTextColor: '#4C1D95', 
            accentColor: '#A855F7', 
            style: 'Lavender Calm',
            tileBg: '#FFFFFF',
            tileBorder: '#EDE9FE',
            titleColor: '#4C1D95'
        },
        imageStyle: 'calm lavender dreamscape, minimal 3d pastel shapes, soft aesthetic',
        layouts: ['cover', 'split-left', 'cards-grid', 'focus-card', 'top-bottom', 'split-right', 'split-left'],
        preview: 'split-left'
    },
    {
        id: 'terracotta',
        name: 'Терракота',
        category: 'business',
        icon: '🏺',
        isDark: false,
        theme: { 
            backgroundColor: '#FEF2F2', 
            primaryTextColor: '#450A0A', 
            accentColor: '#DC2626', 
            style: 'Terracotta',
            tileBg: '#FFFFFF',
            tileBorder: '#FEE2E2',
            titleColor: '#450A0A'
        },
        imageStyle: 'terracotta ceramic architecture, warm Mediterranean earth tones, modern vector',
        layouts: ['cover', 'split-right', 'top-bottom', 'cards-grid', 'focus-card', 'split-left', 'split-right'],
        preview: 'split-right'
    },
    {
        id: 'matrix-code',
        name: 'Код Матрицы',
        category: 'tech',
        icon: '🖥️',
        isDark: true,
        theme: { 
            backgroundColor: '#022C22', 
            primaryTextColor: '#A7F3D0', 
            accentColor: '#34D399', 
            style: 'Matrix Code',
            tileBg: '#064E3B',
            tileBorder: 'rgba(52,211,153,0.35)',
            titleColor: '#A7F3D0'
        },
        imageStyle: 'matrix digital code green phosphor terminal, dark hacker computer science 3d',
        layouts: ['cover', 'top-bottom', 'cards-grid', 'split-right', 'split-left', 'focus-card', 'top-bottom'],
        preview: 'top-bottom'
    }
];

// ── NotebookLM RAG Source State ──────────────────────────────
let ragSourceState = {
    activeTab: 'none', // 'none' | 'file' | 'text' | 'vsh'
    sourceText: '',
    sourceMeta: '',
    fileName: ''
};

// Pre-loaded VSH Lab Manuals Database
const VSH_LABS_DB = {
    physics_ohm: `Лабораторная работа №1 по физике: Экспериментальное исследование Закона Ома для участка цепи.
Цель работы: Измерить силу тока I в проводнике при различных напряжениях U и сопротивлении R, проверить справедливость закона I = U / R.
Оборудование: Источник постоянного тока, амперметр, вольтметр, реостат, исследуемый резистор, ключ, соединительные провода.
Теоретическая справка: Сила тока в участке цепи прямо пропорциональна напряжению на концах этого участка и обратно пропорциональна его сопротивлению (Закон Ома). Формула: I = U/R, где I — сила тока в амперах (А), U — напряжение в вольтах (В), R — сопротивление в омах (Ом).
Ход работы:
1. Собрать электрическую цепь, последовательно соединив источник, реостат, резистор R1, ключ и амперметр.
2. Подключить вольтметр параллельно резистору R1.
3. Замкнуть ключ. Изменяя положение ползунка реостата, снять показания при напряжении 2В, 4В, 6В.
4. Вычислить сопротивление R = U/I для каждого измерения.
5. Заменить резистор на R2 и повторить измерения.
Результаты и выводы: С увеличением напряжения сила тока пропорционально возрастает. График зависимости I(U) представляет собой прямую линию. Закон Ома полностью подтвержден.`,

    biology_cell: `Лабораторная работа по биологии: Микроскопическое исследование строения растительной и животной клетки.
Цель работы: Изучить особенности клеточного строения клеток кожицы чешуи лука и эпителия человека, выявить ключевые различия между растительными и животными клетками.
Оборудование и материалы: Микроскоп, покровные и предметные стекла, препаровальная игла, раствор иода, пипетка, кожица лука, соскоб эпителия.
Теоретическая часть: Растительные клетки обладают твердой целлюлозной клеточной стенкой, пластидами (хлоропласты, хромопласты, лейкопласты) и крупными центральными вакуолями с клеточным соком. Животные клетки не имеют клеточной стенки и вакуолей с соком, их внешняя граница — плазматическая мембрана. Ядро и цитоплазма присутствуют в обоих типах клеток.
Ход работы:
1. Приготовить временный микропрепарат кожицы лука, окрасить раствором иода.
2. Рассмотреть препарат при малом и большом увеличении микроскопа. Найти клеточную стенку, ядро, цитоплазму.
3. Приготовить микропрепарат клеток эпителия полости рта, найти ядро и мембрану.
Выводы: Растительная клетка имеет форму прямоугольного блока с прочной стенкой и зелеными хлоропластами (место фотосинтеза). Животная клетка имеет округлую эластичную форму.`,

    physics_newton: `Лабораторный практикум по физике: Законы движения Ньютона и динамика механических систем.
Цель работы: Экспериментальное подтверждение второго закона Ньютона (F = m*a) и исследование зависимости ускорения тела от приложенной силы и массы.
Оборудование: Легкая тележка, направляющая дорожка, набор грузов, датчик движения, секундомер, динамометр.
Теоретическая справка: 
- 1-й Закон Ньютона (Закон инерции): Тело сохраняет состояние покоя или равномерного прямолинейного движения, пока внешние силы не заставят его изменить это состояние.
- 2-й Закон Ньютона: Ускорение тела прямо пропорционально равнодействующей всех сил и обратно пропорционально массе тела: a = F / m.
- 3-й Закон Ньютона: Силы взаимодействия двух тел равны по модулю и противоположны по направлению: F1 = -F2.
Ход работы:
1. Закрепить тележку на гладкой дорожке, подвесить груз массой m1 через блок.
2. Измерить ускорение a1 с помощью датчика.
3. Увеличить силу тяги F (добавив груз на нить) и измерить новое ускорение a2.
4. Поместить дополнительный груз на тележку (увеличив массу m) при постоянной силе F и измерить ускорение.
Вывод: Ускорение возрастает с увеличением силы тяги и уменьшается с ростом массы тела. Законы динамики Ньютона подтверждены экспериментально.`,

    chemistry_periodic: `Лабораторная работа по химии: Периодический закон Д.И. Менделеева и закономерности химических свойств элементов.
Цель работы: Изучить изменение металлических и неметаллических свойств элементов 3-го периода (Na, Mg, Al, Si, P, S, Cl) в зависимости от строения электронных оболочек атомов.
Теоретические сведения: Свойства химических элементов и образуемых ими простых и сложных веществ находятся в периодической зависимости от заряда их атомных ядер. В периоде слева направо радиус атома уменьшается, число валентных электронов растет, металлические свойства ослабевают, а неметаллические усиливаются. В группах сверху вниз металлические свойства возрастают.
Ход эксперимента:
1. Исследование реакций натрия, магния и алюминия с водой и кислотами. Na бурно реагирует с водой с выделением H2. Mg реагирует с горячей водой. Al реагирует только после удаления оксидной пленки.
2. Сравнение характера оксидов и гидроксидов: NaOH — сильное основание (щелочь), Mg(OH)2 — слабое основание, Al(OH)3 — амфотерный гидроксид, H2SiO3 и H2SO4 — кислоты.
Вывод: В периоде слева направо основные свойства гидроксидов сменяются амфотерными, а затем кислотными.`,

    geometry_pythagoras: `Лабораторный практикум по геометрии: Теорема Пифагора и ее практическое применение.
Цель работы: Доказать теорему Пифагора на основе геометрических построений и проверить равенство a^2 + b^2 = c^2 для прямоугольных треугольников.
Теоретическая часть: В прямоугольном треугольнике квадрат длины гипотенузы равен сумме квадратов длин катетов. Формула: c^2 = a^2 + b^2, где c — гипотенуза, a и b — катеты. Треугольник со сторонами 3, 4, 5 называется Египетским треугольником.
Ход работы:
1. Построить прямоугольный треугольник со сторонами a = 6 см, b = 8 см. Измерить гипотенузу c = 10 см. Проверить: 6^2 + 8^2 = 36 + 64 = 100 = 10^2.
2. Построить квадраты на каждой из трех сторон треугольника. Площадь квадрата на гипотенузе равна сумме площадей квадратов на катетах: S_c = S_a + S_b.
3. Решить прикладную задачу: Найти длину диагонали прямоугольного экрана со сторонами 12 см и 16 см. c = sqrt(144 + 256) = sqrt(400) = 20 см.
Вывод: Теорема Пифагора является фундаментальным соотношением евклидовой геометрии и широко применяется в инженерных расчетах.`
};

// Helper: Read text from file (.txt, .md, .pdf)
async function extractTextFromFile(file) {
    const ext = file.name.split('.').pop().toLowerCase();
    if (ext === 'txt' || ext === 'md' || ext === 'text') {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = e => resolve(e.target.result);
            reader.onerror = e => reject(new Error('Не удалось прочитать файл'));
            reader.readAsText(file);
        });
    } else if (ext === 'pdf') {
        if (typeof pdfjsLib === 'undefined') {
            throw new Error('Библиотека PDF.js не загружена.');
        }
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        let fullText = '';
        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map(item => item.str).join(' ');
            fullText += `--- Страница ${i} ---\n` + pageText + '\n\n';
        }
        return fullText;
    } else {
        throw new Error('Поддерживаются только файлы .PDF, .TXT и .MD');
    }
}

/* ──────────────────────────────────────────────
   BOOTSTRAP & EVENT LISTENERS
─────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', function () {

    // Screens
    const screenPrompt    = document.getElementById('screen-prompt');
    const screenWorkspace = document.getElementById('screen-workspace');
    const screenPresenter = document.getElementById('screen-presenter');

    // Prompt Screen DOM
    const promptInput     = document.getElementById('prompt-input');
    const selectGrade     = document.getElementById('select-grade');
    const selectSlides    = document.getElementById('select-slides');
    const btnGenerate     = document.getElementById('btn-generate');
    const btnGenIcon      = document.getElementById('btn-gen-icon');
    const btnGenText      = document.getElementById('btn-gen-text');
    const genProgress     = document.getElementById('generation-progress');
    const genProgressFill = document.getElementById('gen-progress-fill');
    const genProgressText = document.getElementById('gen-progress-text');

    // Workspace Header DOM
    const btnBackPrompt   = document.getElementById('btn-back-to-prompt');
    const wsTitleInput    = document.getElementById('workspace-title-input');
    const themeStyleBadge = document.getElementById('theme-style-badge');
    const btnPresentMode  = document.getElementById('btn-present-mode');
    const btnPPTX         = document.getElementById('btn-download-pptx');
    const btnPDF          = document.getElementById('btn-download-pdf');

    // Sidebar Editor & Controls
    const btnAddSlide     = document.getElementById('btn-add-slide');
    const btnMoveLeft     = document.getElementById('btn-move-left');
    const btnMoveRight    = document.getElementById('btn-move-right');
    const btnDeleteSlide  = document.getElementById('btn-delete-slide');
    const editSlideTitle  = document.getElementById('edit-slide-title');
    const editSlidePoints = document.getElementById('edit-slide-points');
    const editImgPrompt   = document.getElementById('edit-image-prompt');
    const btnRefreshImg   = document.getElementById('btn-refresh-image');

    // Presenter Mode DOM
    const btnClosePresent = document.getElementById('btn-close-presenter');
    const btnPrevSlide    = document.getElementById('btn-prev-slide');
    const btnNextSlide    = document.getElementById('btn-next-slide');

    // Restore from localStorage if present
    loadFromLocalStorage();

    // ── NotebookLM RAG Source Management Event Handlers ──
    document.querySelectorAll('.rag-tab').forEach(tab => {
        tab.addEventListener('click', function() {
            document.querySelectorAll('.rag-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            const sourceTab = tab.getAttribute('data-source-tab');
            ragSourceState.activeTab = sourceTab;

            document.querySelectorAll('.rag-panel').forEach(p => p.classList.add('hidden'));

            if (sourceTab === 'file') {
                document.getElementById('rag-panel-file').classList.remove('hidden');
            } else if (sourceTab === 'text') {
                document.getElementById('rag-panel-text').classList.remove('hidden');
            } else if (sourceTab === 'vsh') {
                document.getElementById('rag-panel-vsh').classList.remove('hidden');
            }

            updateRagStatusBadge();
        });
    });

    const ragDropzone = document.getElementById('rag-dropzone');
    const ragFileInput = document.getElementById('rag-file-input');
    const ragFileInfo = document.getElementById('rag-file-info');
    const ragFileName = document.getElementById('rag-file-name');
    const ragFileMeta = document.getElementById('rag-file-meta');
    const ragFileRemove = document.getElementById('rag-file-remove');

    if (ragDropzone) {
        ragDropzone.addEventListener('click', () => ragFileInput.click());
        ragDropzone.addEventListener('dragover', (e) => {
            e.preventDefault();
            ragDropzone.classList.add('dragover');
        });
        ragDropzone.addEventListener('dragleave', () => ragDropzone.classList.remove('dragover'));
        ragDropzone.addEventListener('drop', (e) => {
            e.preventDefault();
            ragDropzone.classList.remove('dragover');
            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                handleFileSelect(e.dataTransfer.files[0]);
            }
        });
    }

    if (ragFileInput) {
        ragFileInput.addEventListener('change', (e) => {
            if (e.target.files && e.target.files[0]) {
                handleFileSelect(e.target.files[0]);
            }
        });
    }

    if (ragFileRemove) {
        ragFileRemove.addEventListener('click', (e) => {
            e.stopPropagation();
            ragSourceState.sourceText = '';
            ragSourceState.fileName = '';
            ragSourceState.sourceMeta = '';
            ragFileInfo.classList.add('hidden');
            ragDropzone.classList.remove('hidden');
            ragFileInput.value = '';
            updateRagStatusBadge();
        });
    }

    async function handleFileSelect(file) {
        try {
            ragFileName.textContent = file.name;
            ragFileMeta.textContent = `${(file.size / 1024).toFixed(1)} КБ • Извлечение текста...`;
            ragDropzone.classList.add('hidden');
            ragFileInfo.classList.remove('hidden');

            const text = await extractTextFromFile(file);
            const wordCount = text.trim().split(/\s+/).length;

            ragSourceState.sourceText = text;
            ragSourceState.fileName = file.name;
            ragSourceState.sourceMeta = `${(file.size / 1024).toFixed(1)} КБ • ~${wordCount} слов`;

            ragFileMeta.textContent = ragSourceState.sourceMeta;
            updateRagStatusBadge();
            showToast(`Файл "${file.name}" загружен в контекст RAG`, 'success');
        } catch(err) {
            showToast(err.message || 'Ошибка чтения файла', 'error');
            ragFileInfo.classList.add('hidden');
            ragDropzone.classList.remove('hidden');
        }
    }

    const ragTextInput = document.getElementById('rag-text-input');
    if (ragTextInput) {
        ragTextInput.addEventListener('input', (e) => {
            ragSourceState.sourceText = e.target.value;
            updateRagStatusBadge();
        });
    }

    const ragVshSelect = document.getElementById('rag-vsh-select');
    if (ragVshSelect) {
        ragVshSelect.addEventListener('change', (e) => {
            const labKey = e.target.value;
            if (labKey && VSH_LABS_DB[labKey]) {
                ragSourceState.sourceText = VSH_LABS_DB[labKey];
                const text = VSH_LABS_DB[labKey];
                const wordCount = text.trim().split(/\s+/).length;
                ragSourceState.sourceMeta = `Лабораторная VSH • ~${wordCount} слов`;
                showToast('Лабораторная работа загружена в контекст RAG', 'success');
            } else {
                ragSourceState.sourceText = '';
                ragSourceState.sourceMeta = '';
            }
            updateRagStatusBadge();
        });
    }

    function updateRagStatusBadge() {
        const badge = document.getElementById('rag-status-badge');
        if (!badge) return;

        let hasContext = false;
        let label = 'Без файла (Общий ИИ)';

        if (ragSourceState.activeTab === 'file' && ragSourceState.sourceText) {
            hasContext = true;
            label = `📄 ${ragSourceState.fileName || 'Файл'} (${ragSourceState.sourceMeta})`;
        } else if (ragSourceState.activeTab === 'text' && ragSourceState.sourceText.trim()) {
            hasContext = true;
            const words = ragSourceState.sourceText.trim().split(/\s+/).length;
            label = `📝 Ручной текст (~${words} слов)`;
        } else if (ragSourceState.activeTab === 'vsh' && ragSourceState.sourceText) {
            hasContext = true;
            label = `📚 Лабораторная VSH`;
        }

        badge.textContent = label;
        if (hasContext) badge.classList.add('active');
        else badge.classList.remove('active');
    }

    // ── Template Design Picker Rendering with Category Filtering ──
    function renderTemplateGrid() {
        const grid = document.getElementById('template-grid');
        const countBadge = document.getElementById('template-count-badge');
        if (!grid) return;
        grid.innerHTML = '';

        const filtered = activeCategoryFilter === 'all' 
            ? DESIGN_TEMPLATES 
            : DESIGN_TEMPLATES.filter(t => t.category === activeCategoryFilter);

        if (countBadge) {
            countBadge.textContent = `${filtered.length} шаблонов`;
        }

        filtered.forEach(tpl => {
            const card = document.createElement('div');
            card.className = `template-card ${tpl.id === selectedTemplateId ? 'active' : ''}`;
            card.setAttribute('data-template-id', tpl.id);

            const bg = tpl.theme.backgroundColor;
            const accent = tpl.theme.accentColor;
            const text = tpl.theme.primaryTextColor;
            const previewLayout = tpl.preview || 'split-left';

            let bodyHTML = '';
            if (previewLayout === 'split-left') {
                bodyHTML = `
                    <div class="tpl-preview-lines">
                        <div class="tpl-preview-line" style="background:${text}"></div>
                        <div class="tpl-preview-line" style="background:${text}"></div>
                        <div class="tpl-preview-line" style="background:${text}"></div>
                    </div>
                    <div class="tpl-preview-img" style="background:${accent}"></div>
                `;
            } else if (previewLayout === 'split-right') {
                bodyHTML = `
                    <div class="tpl-preview-img" style="background:${accent}"></div>
                    <div class="tpl-preview-lines">
                        <div class="tpl-preview-line" style="background:${text}"></div>
                        <div class="tpl-preview-line" style="background:${text}"></div>
                        <div class="tpl-preview-line" style="background:${text}"></div>
                    </div>
                `;
            } else if (previewLayout === 'top-bottom') {
                bodyHTML = `
                    <div style="display:flex;flex-direction:column;flex:1;gap:4px;">
                        <div class="tpl-preview-lines" style="flex:0.5;">
                            <div class="tpl-preview-line" style="background:${text}"></div>
                            <div class="tpl-preview-line" style="background:${text}"></div>
                        </div>
                        <div class="tpl-preview-img" style="flex:0.5;width:100%;background:${accent}"></div>
                    </div>
                `;
            } else if (previewLayout === 'cards-grid') {
                bodyHTML = `
                    <div class="tpl-preview-grid">
                        <div class="tpl-preview-minicard" style="background:${accent}"></div>
                        <div class="tpl-preview-minicard" style="background:${accent}"></div>
                        <div class="tpl-preview-minicard" style="background:${accent}"></div>
                    </div>
                `;
            } else if (previewLayout === 'focus-card') {
                bodyHTML = `
                    <div style="flex:1;border-radius:4px;border:1px solid ${accent}30;display:flex;flex-direction:column;gap:4px;padding:6%;justify-content:center;">
                        <div class="tpl-preview-line" style="background:${text};width:90%"></div>
                        <div class="tpl-preview-line" style="background:${text};width:75%"></div>
                        <div class="tpl-preview-line" style="background:${text};width:82%"></div>
                    </div>
                `;
            }

            card.innerHTML = `
                <div class="tpl-preview" style="background:${bg};">
                    <div class="tpl-preview-accent" style="background:${accent};"></div>
                    <div class="tpl-preview-title" style="background:${accent};"></div>
                    <div class="tpl-preview-body">
                        ${bodyHTML}
                    </div>
                </div>
                <div class="template-card-label">${tpl.icon} ${tpl.name}</div>
            `;

            card.addEventListener('click', () => {
                selectedTemplateId = tpl.id;
                document.querySelectorAll('#template-grid .template-card').forEach(c => c.classList.remove('active'));
                card.classList.add('active');
            });

            grid.appendChild(card);
        });
    }

    // Category Tabs Click
    document.querySelectorAll('.tpl-cat-tab').forEach(tab => {
        tab.addEventListener('click', function() {
            document.querySelectorAll('.tpl-cat-tab').forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            activeCategoryFilter = this.getAttribute('data-category') || 'all';
            renderTemplateGrid();
        });
    });

    // Random Template Button Click
    const btnRandomTemplate = document.getElementById('btn-random-template');
    if (btnRandomTemplate) {
        btnRandomTemplate.addEventListener('click', function() {
            const available = activeCategoryFilter === 'all' 
                ? DESIGN_TEMPLATES 
                : DESIGN_TEMPLATES.filter(t => t.category === activeCategoryFilter);
            if (!available.length) return;

            const randomTpl = available[Math.floor(Math.random() * available.length)];
            selectedTemplateId = randomTpl.id;
            renderTemplateGrid();

            const activeCard = document.querySelector(`[data-template-id="${randomTpl.id}"]`);
            if (activeCard) {
                activeCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
            showToast(`Выбран стиль: ${randomTpl.icon} ${randomTpl.name}`, 'info');
        });
    }

    renderTemplateGrid();

    // ── Hint Chips Click ─────────────────────────────────────
    document.querySelectorAll('.hint-chip').forEach(function(chip) {
        chip.addEventListener('click', function() {
            promptInput.value = chip.getAttribute('data-text');
            promptInput.focus();
        });
    });

    // ── Generate Button Click with Topic Intelligence ─────────
    btnGenerate.addEventListener('click', async function() {
        const topic = promptInput.value.trim();
        if (!topic) {
            showToast('Пожалуйста, введите тему презентации', 'error');
            promptInput.focus();
            return;
        }

        const sourceContext = (ragSourceState.activeTab !== 'none') ? ragSourceState.sourceText : '';

        btnGenerate.disabled = true;
        btnGenIcon.className = 'fa-solid fa-spinner icon-spin';
        btnGenText.textContent = 'Анализ темы и подбор WOW-стиля...';
        genProgress.classList.remove('hidden');
        setGenProgress(15, 'Глубокий анализ темы и палитры...');

        try {
            const intel = detectTopicIntelligence(topic, sourceContext);
            selectedTemplateId = intel.id;

            if (sourceContext) {
                btnGenText.textContent = 'RAG извлечение фактов из источника...';
                setGenProgress(35, 'Анализ методички и извлечение данных...');
            } else {
                btnGenText.textContent = 'Генерация слайдов через ИИ...';
                setGenProgress(40, `Генерация слайдов в стиле «${intel.name}»...`);
            }

            const rawData = await callUniversalAI(topic, sourceContext, intel);

            btnGenText.textContent = 'Создаем кинематографичный WOW-дизайн...';
            setGenProgress(75, 'Сборка визуальных макетов...');
            await sleep(200);

            initPresentationState(rawData, intel);

            setGenProgress(100, '✅ Готово!');
            await sleep(300);

            // АВТО-ОТКРЫТИЕ WORKSPACE (.workspace)
            switchScreen(screenWorkspace);
            renderWorkspace();
            saveToLocalStorage();
            showToast(`Презентация создана в стиле «${intel.name}»!`, 'success');

        } catch (err) {
            console.error('[Generate error]', err);
            showToast(err.message || 'Ошибка генерации', 'error');
        } finally {
            btnGenerate.disabled = false;
            btnGenIcon.className = 'fa-solid fa-wand-magic-sparkles';
            btnGenText.textContent = 'Сгенерировать WOW-презентацию';
            genProgress.classList.add('hidden');
        }
    });

    // ── Live Binding: Workspace Title ────────────────────────
    wsTitleInput.addEventListener('input', function(e) {
        presentationState.title = e.target.value;
        saveToLocalStorage();
    });

    // ── Live Binding: Sidebar Inputs ─────────────────────────
    editSlideTitle.addEventListener('input', function(e) {
        const slide = getCurrentSlide();
        if (!slide) return;
        slide.title = e.target.value;
        renderLiveSlidePreview();
        updateActiveThumbnail();
        saveToLocalStorage();
    });

    editSlidePoints.addEventListener('input', function(e) {
        const slide = getCurrentSlide();
        if (!slide) return;
        slide.points = e.target.value.split('\n').filter(line => line.trim() !== '');
        renderLiveSlidePreview();
        saveToLocalStorage();
    });

    const editSpeakerNotes = document.getElementById('edit-speaker-notes');
    if (editSpeakerNotes) {
        editSpeakerNotes.addEventListener('input', function(e) {
            const slide = getCurrentSlide();
            if (!slide) return;
            slide.speakerNotes = e.target.value;
            saveToLocalStorage();
        });
    }

    // Slide Layout Picker Buttons
    document.querySelectorAll('.layout-opt-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const slide = getCurrentSlide();
            if (!slide) return;
            const layout = this.getAttribute('data-layout');
            slide.layout = layout;
            document.querySelectorAll('.layout-opt-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            renderLiveSlidePreview();
            saveToLocalStorage();
            showToast(`Макет слайда изменен на: ${this.textContent.trim()}`, 'info');
        });
    });

    editImgPrompt.addEventListener('input', function(e) {
        const slide = getCurrentSlide();
        if (!slide) return;
        slide.imagePrompt = e.target.value;
        renderLiveSlidePreview();
        saveToLocalStorage();
    });

    btnRefreshImg.addEventListener('click', function() {
        const slide = getCurrentSlide();
        if (!slide) return;
        
        if (editImgPrompt && editImgPrompt.value.trim()) {
            slide.imagePrompt = editImgPrompt.value.trim();
        }
        
        slide.seed = Math.floor(Math.random() * 10000000);
        showToast('Генерация нового варианта фото через ИИ...', 'info');
        
        const originalHtml = btnRefreshImg.innerHTML;
        btnRefreshImg.disabled = true;
        btnRefreshImg.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Генерация нового фото...';
        
        renderLiveSlidePreview();
        saveToLocalStorage();
        
        setTimeout(() => {
            btnRefreshImg.disabled = false;
            btnRefreshImg.innerHTML = originalHtml;
            showToast('Фотография успешно обновлена!', 'success');
        }, 1000);
    });

    // ── Slide Management Toolbar ──────────────────────────────
    btnAddSlide.addEventListener('click', function() {
        const newSlide = {
            title: `Новый слайд ${presentationState.slides.length + 1}`,
            points: ['Новый пункт 1', 'Новый пункт 2'],
            imagePrompt: 'educational presentation illustration',
            layout: 'split-left',
            speakerNotes: 'Расскажите об основных тезисах этого слайда.',
            seed: Math.floor(Math.random() * 1000000)
        };
        presentationState.slides.splice(presentationState.currentSlideIndex + 1, 0, newSlide);
        presentationState.currentSlideIndex++;
        renderWorkspace();
        saveToLocalStorage();
        showToast('Новый слайд добавлен', 'success');
    });

    btnDeleteSlide.addEventListener('click', function() {
        if (presentationState.slides.length <= 1) {
            showToast('В презентации должен остаться хотя бы 1 слайд', 'error');
            return;
        }
        presentationState.slides.splice(presentationState.currentSlideIndex, 1);
        if (presentationState.currentSlideIndex >= presentationState.slides.length) {
            presentationState.currentSlideIndex = presentationState.slides.length - 1;
        }
        renderWorkspace();
        saveToLocalStorage();
        showToast('Слайд удален', 'info');
    });

    btnMoveLeft.addEventListener('click', function() {
        const idx = presentationState.currentSlideIndex;
        if (idx <= 0) return;
        const temp = presentationState.slides[idx];
        presentationState.slides[idx] = presentationState.slides[idx - 1];
        presentationState.slides[idx - 1] = temp;
        presentationState.currentSlideIndex = idx - 1;
        renderWorkspace();
        saveToLocalStorage();
    });

    btnMoveRight.addEventListener('click', function() {
        const idx = presentationState.currentSlideIndex;
        if (idx >= presentationState.slides.length - 1) return;
        const temp = presentationState.slides[idx];
        presentationState.slides[idx] = presentationState.slides[idx + 1];
        presentationState.slides[idx + 1] = temp;
        presentationState.currentSlideIndex = idx + 1;
        renderWorkspace();
        saveToLocalStorage();
    });

    // ── Workspace 20-Template Live Switcher ───────────────────
    function initWorkspaceTemplateControls() {
        const select = document.getElementById('ws-template-select');
        const swatchesContainer = document.getElementById('ws-quick-swatches');
        if (!select || !swatchesContainer) return;

        // Populate dropdown
        select.innerHTML = '';
        DESIGN_TEMPLATES.forEach(tpl => {
            const opt = document.createElement('option');
            opt.value = tpl.id;
            opt.textContent = `${tpl.icon} ${tpl.name}`;
            select.appendChild(opt);
        });

        // Populate quick swatches
        swatchesContainer.innerHTML = '';
        DESIGN_TEMPLATES.forEach(tpl => {
            const swatch = document.createElement('div');
            swatch.className = `ws-swatch-item ${tpl.id === selectedTemplateId ? 'active' : ''}`;
            swatch.title = `${tpl.icon} ${tpl.name}`;
            swatch.style.background = tpl.theme.backgroundColor;
            swatch.style.borderColor = tpl.theme.accentColor;
            swatch.setAttribute('data-template-id', tpl.id);

            swatch.addEventListener('click', () => {
                applyTemplateToPresentation(tpl.id);
            });
            swatchesContainer.appendChild(swatch);
        });

        // Dropdown change
        select.addEventListener('change', (e) => {
            applyTemplateToPresentation(e.target.value);
        });
    }

    function applyTemplateToPresentation(templateId) {
        const tpl = DESIGN_TEMPLATES.find(t => t.id === templateId);
        if (!tpl) return;

        selectedTemplateId = tpl.id;

        // Update presentation state theme
        presentationState.theme = {
            backgroundColor: tpl.theme.backgroundColor,
            primaryTextColor: tpl.theme.primaryTextColor,
            accentColor: tpl.theme.accentColor,
            style: tpl.theme.style,
            tileBg: tpl.theme.tileBg,
            tileBorder: tpl.theme.tileBorder,
            titleColor: tpl.theme.titleColor,
            isDark: tpl.isDark
        };

        // Update layouts for all slides to match new template's layout sequence
        presentationState.slides.forEach((s, idx) => {
            if (idx === 0) s.layout = 'cover';
            else if (tpl.layouts && tpl.layouts.length > idx) {
                s.layout = tpl.layouts[idx];
            }
        });

        // Update UI controls
        const select = document.getElementById('ws-template-select');
        if (select) select.value = tpl.id;

        const themeStyleBadge = document.getElementById('theme-style-badge');
        if (themeStyleBadge) themeStyleBadge.textContent = `Дизайн: ${tpl.icon} ${tpl.name}`;

        document.querySelectorAll('.ws-swatch-item').forEach(sw => {
            if (sw.getAttribute('data-template-id') === tpl.id) {
                sw.classList.add('active');
                sw.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
            } else {
                sw.classList.remove('active');
            }
        });

        // Re-render preview & thumbnails
        renderLiveSlidePreview();
        renderThumbnailsList();
        saveToLocalStorage();
        showToast(`Применен дизайн: ${tpl.icon} ${tpl.name}`, 'success');
    }

    initWorkspaceTemplateControls();

    // ── Back to Prompt ───────────────────────────────────────
    btnBackPrompt.addEventListener('click', function() {
        switchScreen(screenPrompt);
    });

    // ── Export PPTX & PDF ────────────────────────────────────
    btnPPTX.addEventListener('click', function() {
        generatePPTX(presentationState, btnPPTX);
    });

    btnPDF.addEventListener('click', function() {
        downloadPDF();
    });

    // ── Fullscreen Presenter Mode Controls ────────────────────
    const btnToggleNotes = document.getElementById('btn-toggle-notes');
    const presenterNotesDrawer = document.getElementById('presenter-notes-drawer');

    if (btnToggleNotes && presenterNotesDrawer) {
        btnToggleNotes.addEventListener('click', function() {
            presenterNotesDrawer.classList.toggle('hidden');
        });
    }

    btnPresentMode.addEventListener('click', function() {
        if (!presentationState.slides.length) return;
        switchScreen(screenPresenter);
        renderPresenterSlide();
    });

    btnClosePresent.addEventListener('click', function() {
        if (document.fullscreenElement) {
            document.exitFullscreen().catch(() => {});
        }
        switchScreen(screenWorkspace);
    });

    btnPrevSlide.addEventListener('click', function() {
        if (presentationState.currentSlideIndex > 0) {
            presentationState.currentSlideIndex--;
            renderPresenterSlide();
            renderWorkspace();
        }
    });

    btnNextSlide.addEventListener('click', function() {
        if (presentationState.currentSlideIndex < presentationState.slides.length - 1) {
            presentationState.currentSlideIndex++;
            renderPresenterSlide();
            renderWorkspace();
        }
    });

    // Keyboard Arrow navigation, notes toggle and fullscreen for Presenter Mode
    document.addEventListener('keydown', function(e) {
        if (!screenPresenter.classList.contains('active')) return;
        if (e.key === 'ArrowRight' || e.key === 'Space') {
            e.preventDefault();
            btnNextSlide.click();
        } else if (e.key === 'ArrowLeft') {
            e.preventDefault();
            btnPrevSlide.click();
        } else if (e.key === 'Escape') {
            btnClosePresent.click();
        } else if (e.key === 'n' || e.key === 'N' || e.key === 'т' || e.key === 'Т') {
            if (presenterNotesDrawer) presenterNotesDrawer.classList.toggle('hidden');
        } else if (e.key === 'f' || e.key === 'F' || e.key === 'а' || e.key === 'А') {
            if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen().catch(() => {});
            } else {
                document.exitFullscreen().catch(() => {});
            }
        }
    });

    function setGenProgress(pct, text) {
        genProgressFill.style.width = Math.min(100, pct) + '%';
        if (text) genProgressText.textContent = text;
    }
});


/* ──────────────────────────────────────────────
   UNIVERSAL AI DECK GENERATOR (OpenAI -> Gemini Fallback -> Pollinations Fallback)
─────────────────────────────────────────────── */
function parseJsonDeck(raw) {
    if (!raw) return null;
    let clean = String(raw).trim();
    if (clean.startsWith('```json')) clean = clean.slice(7);
    if (clean.startsWith('```')) clean = clean.slice(3);
    if (clean.endsWith('```')) clean = clean.slice(0, -3);
    clean = clean.trim();
    const first = clean.indexOf('{');
    const last = clean.lastIndexOf('}');
    if (first !== -1 && last !== -1 && last > first) {
        try {
            return JSON.parse(clean.substring(first, last + 1));
        } catch (e) {
            console.warn('JSON slice parse warning:', e);
        }
    }
    try {
        return JSON.parse(clean);
    } catch (e) {
        return null;
    }
}

async function callUniversalAI(promptText, sourceContext = '') {
    let systemPrompt = '';

    if (sourceContext && sourceContext.trim()) {
        systemPrompt = [
            'Ты профессиональный методист и арт-директор. На основе ПРЕДОСТАВЛЕННОГО КОНТЕКСТА создай структуру презентации. Не придумывай информацию от себя. Верни массив JSON с полями "title", "points" и "imagePrompt" (на английском).',
            '',
            'СТРОГИЕ ПРАВИЛА ИЗВЛЕЧЕНИЯ (Grounded RAG Generation):',
            '1. Все тезисы, факты, формулы, правила и выводы должны быть извлечены ИСКЛЮЧИТЕЛЬНО из предоставленного текста источника.',
            '2. Избегай галлюцинаций. Не добавляй стороннюю информацию, которой нет в контексте источника.',
            '3. Каждая презентация должна состоять из 5–8 слайдов.',
            '4. Первый слайд — титульная обложка (points: [], imagePrompt: "educational science lab poster").',
            '5. Поле imagePrompt пиши СТРОГО НА АНГЛИЙСКОМ ЯЗЫКЕ для генератора ИИ-иллюстраций Pollinations AI.',
            '6. Тексты заголовков и пунктов слайдов — НА ЯЗЫКЕ ЗАПРОСА (русский / казахский).',
            '7. Ответь СТРОГО валидным JSON объектом без markdown оберток (без ```json).',
            '',
            'Формат ответа JSON:',
            '{',
            '  "title": "Заголовок презентации по источнику",',
            '  "theme": {',
            '    "backgroundColor": "#0f172a",',
            '    "primaryTextColor": "#f8fafc",',
            '    "accentColor": "#38bdf8",',
            '    "style": "Академический RAG"',
            '  },',
            '  "slides": [',
            '    {',
            '      "title": "Заголовок слайда по тексту",',
            '      "points": ["Фактический пункт 1 из источника с точными терминами/числами", "Фактический пункт 2 из источника"],',
            '      "imagePrompt": "Short accurate description in English for AI image generator, clean 3d render",',
            '      "speakerNotes": "Подсказка спикеру: что рассказать на этом слайде по материалам источника."',
            '    }',
            '  ]',
            '}'
        ].join('\n');
    } else {
        systemPrompt = [
            'Ты опытный методист и ведущий арт-директор презентаций мирового уровня (в стиле Apple Keynote, Pitch, Gamma).',
            'Создай структурированную презентацию с глубоким и содержательным наполнением.',
            'Ответь СТРОГО валидным JSON объектом без markdown оберток (без ```json).',
            '',
            'Формат ответа:',
            '{',
            '  "title": "Полное название презентации",',
            '  "theme": {',
            '    "backgroundColor": "#0f172a",',
            '    "primaryTextColor": "#f8fafc",',
            '    "accentColor": "#38bdf8",',
            '    "style": "Космический / Строгий / Футуристичный / Академический / Экологичный / Золотой"',
            '  },',
            '  "slides": [',
            '    {',
            '      "title": "Заголовок слайда",',
            '      "points": ["Конкретный тезис с данными/формулой", "Аналитический пункт", "Практический вывод"],',
            '      "imagePrompt": "Short accurate description in English for AI image generator, photorealistic 3d cinematic render",',
            '      "speakerNotes": "Шпаргалка спикеру: тезисы для устного выступления на 1 минуту."',
            '    }',
            '  ]',
            '}',
            '',
            'Правила выбора цвета в theme:',
            '- Подбирай цвета по смыслу темы (Космос/ИТ -> темный с неоновым голубым/фиолетовым; Биология -> темно-зеленый с мятным; Бизнес/История -> темный с королевским золотом/бронзой; Физика/Математика -> лазурный неон).',
            '- backgroundColor: глубокий темный цвет (HEX).',
            '- primaryTextColor: контрастный светлый текст (HEX).',
            '- accentColor: яркий насыщенный неоновый акцент (HEX).',
            '',
            'Правила для слайдов:',
            '- Слайдов от 5 до 8.',
            '- Первый слайд — обложка (points: [], imagePrompt: "main theme poster, cinematic 3d render", speakerNotes: "Приветствие и анонс темы выступления").',
            '- Каждая картинка: imagePrompt СТРОГО НА АНГЛИЙСКОМ ЯЗЫКЕ!',
            '- Тексты заголовков, пунктов и speakerNotes — НА ЯЗЫКЕ ЗАПРОСА (русский / казахский).'
        ].join('\n');
    }

    let userContent = 'Тема: ' + promptText;
    if (sourceContext && sourceContext.trim()) {
        userContent = [
            'КОНТЕКСТ ИСТОЧНИКА (Методическая лабораторная работа / Документ):',
            '========================================',
            sourceContext.trim(),
            '========================================',
            '',
            'ТЕМА / ТРЕБОВАНИЕ К ПРЕЗЕНТАЦИИ: ' + promptText
        ].join('\n');
    }

    // 1. TIER 1: If user provided OpenAI key (starts with sk-), try OpenAI
    if (API_KEY && API_KEY.startsWith('sk-')) {
        try {
            const res = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + API_KEY
                },
                body: JSON.stringify({
                    model: 'gpt-4o-mini',
                    messages: [
                        { role: 'system', content: systemPrompt },
                        { role: 'user', content: userContent }
                    ],
                    temperature: sourceContext ? 0.25 : 0.7
                })
            });
            if (res.ok) {
                const oaiData = await res.json();
                const content = oaiData?.choices?.[0]?.message?.content;
                const parsed = parseJsonDeck(content);
                if (parsed && Array.isArray(parsed.slides) && parsed.slides.length > 0) {
                    return parsed;
                }
            }
        } catch (e) {
            console.warn('OpenAI deck generation failed, switching to Google AI engine...', e);
        }
    }

    // 2. TIER 2: Google Gemini (2.5-Flash and 1.5-Flash)
    const activeGeminiKey = (API_KEY && (API_KEY.startsWith('AQ.') || API_KEY.startsWith('AIzaSy'))) ? API_KEY : FALLBACK_GEMINI_KEY;
    const geminiModels = ['gemini-2.5-flash', 'gemini-1.5-flash-latest'];

    for (let model of geminiModels) {
        try {
            const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${activeGeminiKey}`;
            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    system_instruction: { parts: [{ text: systemPrompt }] },
                    contents: [{ role: 'user', parts: [{ text: userContent }] }],
                    generationConfig: {
                        temperature: sourceContext ? 0.25 : 0.7,
                        responseMimeType: 'application/json'
                    }
                })
            });
            if (res.ok) {
                const data = await res.json();
                const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
                const parsed = parseJsonDeck(rawText);
                if (parsed && Array.isArray(parsed.slides) && parsed.slides.length > 0) {
                    return parsed;
                }
            }
        } catch (e) {
            console.warn(`Gemini model ${model} failed, trying next...`, e);
        }
    }

    // 3. TIER 3: Pollinations AI (Zero-key JSON fallback)
    try {
        const fullPrompt = `${systemPrompt}\n\nПользовательский запрос:\n${userContent}\n\nОтветь ТОЛЬКО валидным JSON:`;
        const res = await fetch(`https://text.pollinations.ai/${encodeURIComponent(fullPrompt)}?json=true&model=openai`);
        if (res.ok) {
            const rawText = await res.text();
            const parsed = parseJsonDeck(rawText);
            if (parsed && Array.isArray(parsed.slides) && parsed.slides.length > 0) {
                return parsed;
            }
        }
    } catch (e) {
        console.warn('Pollinations AI fallback failed...', e);
    }

    throw new Error('ИИ временно недоступен. Пожалуйста, попробуйте еще раз.');
}

const callGemini = callUniversalAI;


/* ──────────────────────────────────────────────
   STATE & RENDER WORKSPACE
─────────────────────────────────────────────── */
function detectTopicIntelligence(topicText, sourceText = '') {
    const combined = `${topicText || ''} ${sourceText || ''}`.toLowerCase();

    // 1. Space & Astronomy
    if (/космос|ғарыш|планет|астроном|space|mars|марс|звезд|галактик|orbit|солнечн|астероид|юпитер|спутник/i.test(combined)) {
        return {
            id: 'space-deep',
            name: 'Глубокий Космос',
            category: 'space',
            icon: '🚀',
            isDark: true,
            theme: {
                backgroundColor: '#050814',
                primaryTextColor: '#94a3b8',
                accentColor: '#38bdf8',
                style: 'Deep Cosmos 4K',
                tileBg: 'rgba(15, 23, 42, 0.65)',
                tileBorder: 'rgba(56, 189, 248, 0.25)',
                titleColor: '#f8fafc'
            },
            imageStyle: 'cinematic deep cosmic space photorealistic 4k nebula stars solar system render'
        };
    }

    // 2. Physics & Quantum
    if (/физик|ньютон|ом|ток|электр|квант|гравитац|механик|динамик|резистор|энерги|термодинамик|voltage|physics|оптика|линз/i.test(combined)) {
        return {
            id: 'physics-quantum',
            name: 'Квантовая Физика',
            category: 'physics',
            icon: '⚛️',
            isDark: true,
            theme: {
                backgroundColor: '#070b19',
                primaryTextColor: '#cbd5e1',
                accentColor: '#60a5fa',
                style: 'Quantum Physics',
                tileBg: 'rgba(15, 23, 42, 0.65)',
                tileBorder: 'rgba(96, 165, 250, 0.25)',
                titleColor: '#ffffff'
            },
            imageStyle: 'physics science laboratory experiment glowing laser electrical circuit 3d render'
        };
    }

    // 3. Biology & Genetics
    if (/биолог|клетк|жасуша|днк|митохондр|хлоропласт|генет|эволюци|организм|микроскоп|бактери|био|анатоми|вирус/i.test(combined)) {
        return {
            id: 'bio-emerald',
            name: 'Изумруд Биологии',
            category: 'biology',
            icon: '🌿',
            isDark: true,
            theme: {
                backgroundColor: '#031711',
                primaryTextColor: '#a7f3d0',
                accentColor: '#10b981',
                style: 'Bio Genetics',
                tileBg: 'rgba(6, 46, 35, 0.6)',
                tileBorder: 'rgba(16, 185, 129, 0.25)',
                titleColor: '#ecfdf5'
            },
            imageStyle: 'microscopic glowing biological cell DNA structure 3d scientific rendering octane'
        };
    }

    // 4. AI, IT, Coding & Robotics
    if (/информатик|робот|жасанды интеллект|нейро|ai|код|программ|cyber|технолог|алгоритм|machine learning|python|web/i.test(combined)) {
        return {
            id: 'ai-cyber',
            name: 'Кибер Интеллект',
            category: 'tech',
            icon: '🤖',
            isDark: true,
            theme: {
                backgroundColor: '#090a16',
                primaryTextColor: '#e2e8f0',
                accentColor: '#a78bfa',
                style: 'Cyber Neural AI',
                tileBg: 'rgba(24, 24, 46, 0.65)',
                tileBorder: 'rgba(167, 139, 250, 0.3)',
                titleColor: '#f8fafc'
            },
            imageStyle: 'futuristic artificial intelligence glowing holographic neural brain cyberpunk 3d render'
        };
    }

    // 5. Chemistry & Periodic Table
    if (/хими|менделеев|период|атом|молекул|реакци|кислот|щелоч|колб|раствор|chem|элемент|оксид/i.test(combined)) {
        return {
            id: 'chem-neon',
            name: 'Неоновая Химия',
            category: 'chemistry',
            icon: '🧪',
            isDark: true,
            theme: {
                backgroundColor: '#0c071e',
                primaryTextColor: '#f3e8ff',
                accentColor: '#f43f5e',
                style: 'Neon Chemistry',
                tileBg: 'rgba(30, 15, 48, 0.65)',
                tileBorder: 'rgba(244, 63, 94, 0.25)',
                titleColor: '#ffffff'
            },
            imageStyle: 'glowing chemistry laboratory test tubes colorful reaction molecules 3d render'
        };
    }

    // 6. History, Kazakh Culture & Literature
    if (/абай|шоқан|ыбырай|тарих|батыр|хан|қазақ|мұра|әдебиет|культура|рухани|казахстан|истори|номад|шежире/i.test(combined)) {
        return {
            id: 'history-gold',
            name: 'Алтын Мұра',
            category: 'history',
            icon: '📜',
            isDark: true,
            theme: {
                backgroundColor: '#140f07',
                primaryTextColor: '#fef3c7',
                accentColor: '#f59e0b',
                style: 'Golden Heritage',
                tileBg: 'rgba(40, 28, 12, 0.65)',
                tileBorder: 'rgba(245, 158, 11, 0.3)',
                titleColor: '#fffbeb'
            },
            imageStyle: 'historical cultural artistic masterpiece portrait golden dramatic cinematic lighting'
        };
    }

    // 7. Math, Geometry & Engineering
    if (/математик|геометр|пифагор|үшбұрыш|инженер|формул|алгебр|уравнен|график|теорем|math|треугольник|числа/i.test(combined)) {
        return {
            id: 'math-blueprint',
            name: 'Математический Чертеж',
            category: 'math',
            icon: '📐',
            isDark: true,
            theme: {
                backgroundColor: '#0a1124',
                primaryTextColor: '#bae6fd',
                accentColor: '#38bdf8',
                style: 'Precision Blueprint',
                tileBg: 'rgba(15, 30, 60, 0.65)',
                tileBorder: 'rgba(56, 189, 248, 0.3)',
                titleColor: '#ffffff'
            },
            imageStyle: 'clean mathematical geometric formula blueprint isometric 3d visualization'
        };
    }

    // 8. Nature, Ecology & Geography
    if (/эколог|табиғат|природ|климат|географ|өзен|мұхит|жануар|nature|forest|water|планета земля|океан/i.test(combined)) {
        return {
            id: 'nature-emerald',
            name: 'Живая Природа',
            category: 'nature',
            icon: '🌍',
            isDark: true,
            theme: {
                backgroundColor: '#041812',
                primaryTextColor: '#d1fae5',
                accentColor: '#34d399',
                style: 'Eco Living Earth',
                tileBg: 'rgba(6, 40, 30, 0.65)',
                tileBorder: 'rgba(52, 211, 153, 0.25)',
                titleColor: '#ecfdf5'
            },
            imageStyle: 'lush green pristine nature landscape forest clean energy 3d octane render'
        };
    }

    // 9. Default Modern Academic WOW theme
    return {
        id: 'modern-academic',
        name: 'Современный Академический',
        category: 'academic',
        icon: '✨',
        isDark: true,
        theme: {
            backgroundColor: '#0b0f19',
            primaryTextColor: '#94a3b8',
            accentColor: '#38bdf8',
            style: 'Modern Academic Pro',
            tileBg: 'rgba(18, 26, 46, 0.65)',
            tileBorder: 'rgba(56, 189, 248, 0.25)',
            titleColor: '#f8fafc'
        },
        imageStyle: 'high quality 3d educational concept illustration clean studio lighting'
    };
}

function getSelectedTemplate() {
    return DESIGN_TEMPLATES.find(t => t.id === selectedTemplateId) || DESIGN_TEMPLATES[0];
}

function getSlideLayoutType(slide, index) {
    if (index === 0) return 'cover';
    if (slide && slide.layout && ['cover', 'stat', 'steps', 'compare', 'cards-grid', 'insight', 'split-left', 'split-right'].includes(slide.layout)) {
        return slide.layout;
    }
    const sequence = ['split-left', 'stat', 'steps', 'cards-grid', 'compare', 'insight', 'split-right'];
    return sequence[(index - 1) % sequence.length];
}

function initPresentationState(data, intel = null) {
    const slides = Array.isArray(data.slides) ? data.slides : [];
    if (slides.length === 0) throw new Error('ИИ не сгенерировал ни одного слайда');

    const activeIntel = intel || detectTopicIntelligence(data.title || 'Урок');
    const tpl = getSelectedTemplate();

    const theme = {
        backgroundColor: activeIntel.theme.backgroundColor || tpl.theme.backgroundColor,
        primaryTextColor: activeIntel.theme.primaryTextColor || tpl.theme.primaryTextColor,
        accentColor: activeIntel.theme.accentColor || tpl.theme.accentColor,
        style: activeIntel.theme.style || tpl.theme.style,
        tileBg: activeIntel.theme.tileBg || (tpl.isDark ? '#1E293B' : '#FFFFFF'),
        tileBorder: activeIntel.theme.tileBorder || (tpl.isDark ? 'rgba(255,255,255,0.12)' : '#E2E8F0'),
        titleColor: activeIntel.theme.titleColor || (tpl.isDark ? '#F8FAFC' : '#0F172A'),
        isDark: activeIntel.isDark !== undefined ? activeIntel.isDark : tpl.isDark
    };

    presentationState = {
        title: data.title || 'Новая презентация',
        theme: theme,
        slides: slides.map((s, i) => ({
            title: s.title || `Слайд ${i + 1}`,
            points: Array.isArray(s.points) ? s.points : [],
            imagePrompt: s.imagePrompt || 'educational presentation illustration',
            layout: getSlideLayoutType(s, i),
            speakerNotes: s.speakerNotes || '',
            seed: Math.floor(Math.random() * 100000)
        })),
        currentSlideIndex: 0
    };
}

function renderWorkspace() {
    const wsTitleInput    = document.getElementById('workspace-title-input');
    const themeStyleBadge = document.getElementById('theme-style-badge');
    const slidesCount     = document.getElementById('slides-count');
    const currentTheme    = presentationState.theme || {};
    
    if (wsTitleInput)    wsTitleInput.value = presentationState.title;
    if (themeStyleBadge) themeStyleBadge.textContent = `Дизайн: ${currentTheme.style || 'AshyqLab Pro'}`;
    if (slidesCount)     slidesCount.textContent = presentationState.slides.length;

    renderThumbnailsList();
    loadActiveSlideToEditor();
    renderLiveSlidePreview();
}

function getCurrentSlide() {
    return presentationState.slides[presentationState.currentSlideIndex];
}

/* Render Thumbnails Navigator */
function renderThumbnailsList() {
    const thumbsList = document.getElementById('slides-thumbnails-list');
    if (!thumbsList) return;
    thumbsList.innerHTML = '';

    presentationState.slides.forEach((slide, idx) => {
        const thumb = document.createElement('div');
        thumb.className = `slide-thumb ${idx === presentationState.currentSlideIndex ? 'active' : ''}`;
        thumb.textContent = `Слайд ${idx + 1}`;
        thumb.style.borderColor = idx === presentationState.currentSlideIndex ? presentationState.theme.accentColor : 'transparent';
        thumb.addEventListener('click', () => {
            presentationState.currentSlideIndex = idx;
            renderThumbnailsList();
            loadActiveSlideToEditor();
            renderLiveSlidePreview();
        });
        thumbsList.appendChild(thumb);
    });
}

function updateActiveThumbnail() {
    const activeThumb = document.querySelector('.slide-thumb.active');
    if (activeThumb) {
        const slide = getCurrentSlide();
        if (slide) activeThumb.textContent = `Слайд ${presentationState.currentSlideIndex + 1}`;
    }
}

/* Load Selected Slide Data into Sidebar Editor Form */
function loadActiveSlideToEditor() {
    const slide = getCurrentSlide();
    if (!slide) return;

    document.getElementById('active-slide-num').textContent = presentationState.currentSlideIndex + 1;
    document.getElementById('edit-slide-title').value = slide.title || '';
    document.getElementById('edit-slide-points').value = (slide.points || []).join('\n');
    const notesInput = document.getElementById('edit-speaker-notes');
    if (notesInput) notesInput.value = slide.speakerNotes || '';
    document.getElementById('edit-image-prompt').value = slide.imagePrompt || '';

    const currentLayout = getSlideLayoutType(slide, presentationState.currentSlideIndex);
    document.querySelectorAll('.layout-opt-btn').forEach(btn => {
        if (btn.getAttribute('data-layout') === currentLayout) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}


/* ──────────────────────────────────────────────
   LIVE HTML SLIDE PREVIEW WITH 7 WOW ARCHETYPES
─────────────────────────────────────────────── */
function renderLiveSlidePreview() {
    const card = document.getElementById('live-slide-card');
    const slide = getCurrentSlide();
    if (!card || !slide) return;

    buildSlideCardHTML(card, slide, presentationState.currentSlideIndex, presentationState.theme);
}

const CYRILLIC_MAP = {
    'а':'a','б':'b','в':'v','г':'g','д':'d','е':'e','ё':'yo','ж':'zh','з':'z','и':'i','й':'y','к':'k','л':'l','м':'m','н':'n','о':'o','п':'p','р':'r','с':'s','т':'t','у':'u','ф':'f','х':'kh','ц':'ts','ч':'ch','ш':'sh','щ':'shch','ъ':'','ы':'y','ь':'','э':'e','ю':'yu','я':'ya','ә':'ae','і':'i','ң':'ng','ғ':'gh','ү':'u','ұ':'u','қ':'q','ө':'o','һ':'h'
};

function transliterateText(str) {
    if (!str) return '';
    return String(str).toLowerCase().split('').map(c => CYRILLIC_MAP[c] || c).join('');
}

function sanitizeImagePrompt(prompt, slideTitle = '', topicTitle = '') {
    let text = (prompt || '').trim();
    if (!text || text.length < 3) {
        text = `${slideTitle} ${topicTitle}`.trim() || 'educational presentation science illustration';
    }

    const mappings = [
        { regex: /абай|құнанбаев|кунанбаев/i, prompt: 'Abai Kunanbayev historical Kazakh poet philosopher national costume portrait painting masterpiece' },
        { regex: /шоқан|уәлиханов|валиханов/i, prompt: 'Shoqan Walikhanov Kazakh scholar researcher portrait in historical study room' },
        { regex: /ыбырай|алтынсарин/i, prompt: 'Ybyrai Altynsarin Kazakh educator teacher vintage classroom' },
        { regex: /жасуша|клетка|митохондр|хлоропласт|днк|генетик/i, prompt: 'glowing biological cell structure DNA helix organelles 3D microscope scientific rendering' },
        { regex: /ом|ток|кернеу|электр|резистор|тізбек|цепь/i, prompt: 'glowing electrical circuit physics laboratory experiment voltmeter ammeter 3D' },
        { regex: /ньютон|гравитац|динамика|күш|сила|инерци/i, prompt: 'Newtonian physics laboratory experiment motion forces gravity 3D render' },
        { regex: /период|менделеев|химия|реакци|молекул|атом/i, prompt: 'chemistry laboratory colorful test tubes chemical reaction glowing molecules 3D' },
        { regex: /пифагор|геометр|үшбұрыш|треугольник/i, prompt: 'Pythagorean geometric mathematical theorem visual blueprint 3D' },
        { regex: /ғарыш|космос|планет|күн жүйе|астроном/i, prompt: 'solar system planets orbiting sun in cosmic nebula space photorealistic 4k' },
        { regex: /жасанды интеллект|робот|информатик|нейро|ai/i, prompt: 'futuristic artificial intelligence neural cybernetic network glowing holographic brain' },
        { regex: /тарих|история|батыр|хан|қазақ/i, prompt: 'historical Kazakh warriors nomads yurt culture dramatic sunset landscape cinematic' },
        { regex: /экология|табиғат|природа|өсімдік/i, prompt: 'nature ecology green blooming environment forest landscape clean energy' }
    ];

    for (const m of mappings) {
        if (m.regex.test(text) || m.regex.test(slideTitle) || m.regex.test(topicTitle)) {
            return m.prompt;
        }
    }

    const hasCyrillic = /[а-яА-ЯёЁәіңғүұқөһӘІҢҒҮҰҚӨҺ]/.test(text);
    if (hasCyrillic) {
        return `educational visual concept of ${transliterateText(text)}, clean 3d render, studio lighting`;
    }

    return text;
}

function generateSvgIllustration(title, accentColor, bgColor) {
    const safeTitle = escapeHtml((title || 'AshyqLab').slice(0, 32));
    const accent = accentColor || '#38bdf8';
    const bg = bgColor || '#0f172a';
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
        <defs>
            <linearGradient id="g1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="${bg}" />
                <stop offset="100%" stop-color="#020617" />
            </linearGradient>
            <linearGradient id="g2" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="${accent}" />
                <stop offset="100%" stop-color="#a855f7" />
            </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#g1)" />
        <circle cx="400" cy="260" r="160" fill="${accent}" opacity="0.12" />
        <circle cx="400" cy="260" r="100" fill="none" stroke="${accent}" stroke-width="3" stroke-dasharray="6 6" opacity="0.6" />
        <circle cx="400" cy="260" r="60" fill="url(#g2)" opacity="0.9" />
        <path d="M375,235 L425,235 L425,285 L375,285 Z" fill="#ffffff" opacity="0.95" rx="8" />
        <path d="M400,205 L400,315 M345,260 L455,260" stroke="#ffffff" stroke-width="3" stroke-linecap="round" />
        <text x="400" y="440" fill="#f8fafc" font-size="22" font-weight="bold" font-family="system-ui, sans-serif" text-anchor="middle">${safeTitle}</text>
        <text x="400" y="475" fill="${accent}" font-size="13" font-weight="700" font-family="system-ui, sans-serif" text-anchor="middle" letter-spacing="2">ASHYQLAB AI VISUAL</text>
    </svg>`;
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function getTopicFallbackImage(prompt, title = '') {
    const text = `${prompt || ''} ${title || ''}`.toLowerCase();
    if (/ом|ток|кернеу|электр|резистор|circuit|physic|ньютон|динамика|күш|gravity|вольт|ампер/i.test(text)) {
        return 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=800&auto=format&fit=crop&q=80';
    }
    if (/жасуша|клетка|митохондр|хлоропласт|днк|биолог|cell|dna|microscope|микроскоп|бактери/i.test(text)) {
        return 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=800&auto=format&fit=crop&q=80';
    }
    if (/период|менделеев|химия|реакци|молекул|атом|chem|колба|раствор/i.test(text)) {
        return 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800&auto=format&fit=crop&q=80';
    }
    if (/ғарыш|космос|планет|астроном|space|universe|planet|stars|күн жүйе/i.test(text)) {
        return 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80';
    }
    if (/абай|шоқан|ыбырай|тарих|батыр|хан|history|kazakh|культура|әдебиет/i.test(text)) {
        return 'https://images.unsplash.com/photo-1461360370896-922624d12aa1?w=800&auto=format&fit=crop&q=80';
    }
    if (/жасанды интеллект|робот|информатик|нейро|ai|code|robot|cyber|программи/i.test(text)) {
        return 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80';
    }
    if (/пифагор|геометр|үшбұрыш|математик|math|geometry|формула|алгебра/i.test(text)) {
        return 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=800&auto=format&fit=crop&q=80';
    }
    if (/экология|табиғат|природа|өсімдік|nature|forest|эко|су|ағаш/i.test(text)) {
        return 'https://images.unsplash.com/photo-1511497584788-87676104235f?w=800&auto=format&fit=crop&q=80';
    }
    return 'https://images.unsplash.com/photo-1507668077129-56e32842fceb?w=800&auto=format&fit=crop&q=80';
}

function handleImageFallback(imgEl, title, svgFallback, prompt) {
    if (!imgEl) return;
    const stage = imgEl.getAttribute('data-fallback-stage') || 'ai';
    if (stage === 'ai') {
        imgEl.setAttribute('data-fallback-stage', 'topic');
        imgEl.src = getTopicFallbackImage(prompt, title);
    } else {
        imgEl.onerror = null;
        imgEl.src = svgFallback;
    }
}

function buildPollinationsUrl(prompt, seed, slideTitle = '') {
    const tpl = getSelectedTemplate();
    const styleModifier = tpl && tpl.imageStyle ? `, ${tpl.imageStyle}` : ', high quality educational 3d render';
    const cleanPrompt = sanitizeImagePrompt(prompt, slideTitle, presentationState ? presentationState.title : '');
    const fullPrompt = `${cleanPrompt}${styleModifier}`;
    const encoded = encodeURIComponent(fullPrompt);
    const seedParam = seed ? `&seed=${seed}` : `&seed=${Math.floor(Math.random() * 1000000)}`;
    return `https://image.pollinations.ai/prompt/${encoded}?width=800&height=600&nologo=true${seedParam}`;
}

/* Build Slide Card HTML inner structure with 7 Diverse WOW Archetypes */
function buildSlideCardHTML(card, slide, index, theme) {
    const isDark = theme.isDark !== false;
    const tileBg = theme.tileBg || (isDark ? 'rgba(15, 23, 42, 0.65)' : '#FFFFFF');
    const tileBorder = theme.tileBorder || (isDark ? 'rgba(56, 189, 248, 0.25)' : '#E2E8F0');
    const titleColor = theme.titleColor || (isDark ? '#F8FAFC' : '#0F172A');
    const accentColor = theme.accentColor || '#38BDF8';

    card.style.setProperty('--slide-bg', theme.backgroundColor || '#0B0F19');
    card.style.setProperty('--slide-text', theme.primaryTextColor || '#94A3B8');
    card.style.setProperty('--slide-accent', accentColor);
    card.style.setProperty('--tile-bg', tileBg);
    card.style.setProperty('--tile-border', tileBorder);
    card.style.setProperty('--title-color', titleColor);

    const layout = getSlideLayoutType(slide, index);
    card.className = `slide-card layout-${layout} ${isDark ? 'theme-dark' : 'theme-light'}`;

    const hasImage = Boolean(slide.imagePrompt && slide.imagePrompt.trim());
    const imageUrl = hasImage ? buildPollinationsUrl(slide.imagePrompt, slide.seed, slide.title) : '';
    const svgFallback = generateSvgIllustration(slide.title, accentColor, theme.backgroundColor);
    const boxId = `slide-img-box-${index}`;
    const loaderId = `slide-loader-${index}`;
    const safeTitle = escapeHtml(slide.title || '').replace(/'/g, "\\'");
    const safePrompt = escapeHtml(slide.imagePrompt || '').replace(/'/g, "\\'");

    // Universal Top Ribbon
    const topRibbonHTML = '<div class="slide-top-ribbon"></div>';

    // Slide Total Count
    const totalSlides = presentationState && Array.isArray(presentationState.slides) ? presentationState.slides.length : 7;

    // Universal Header with HUD Tag
    const categoryLabel = theme.style || 'AshyqLab Pro';
    const headerHTML = `
        <div class="slide-card-header">
            <div class="slide-hud-tag"><span class="hud-dot"></span> <i class="fa-solid fa-sparkles"></i> ${escapeHtml(categoryLabel)} • СЛАЙД ${index + 1} / ${totalSlides}</div>
            <h2 class="slide-card-title">${escapeHtml(slide.title)}</h2>
            <div class="slide-title-divider"></div>
        </div>
    `;

    // Universal Footer with Pagination Track
    let dotsHTML = '';
    for (let d = 0; d < totalSlides; d++) {
        dotsHTML += `<span class="slide-dot-item ${d === index ? 'active' : ''}"></span>`;
    }
    const footerHTML = `
        <div class="slide-card-footer">
            <span class="slide-footer-brand"><i class="fa-solid fa-bolt"></i> ASHYQLAB AI • TOPIC INTELLIGENCE</span>
            <div class="slide-pagination-dots">${dotsHTML}</div>
        </div>
    `;

    // Universal Image Node
    const imageHTML = hasImage ? `
        <div class="slide-col-image">
            <div class="slide-img-container" id="${boxId}">
                <div class="slide-img-loader" id="${loaderId}">
                    <i class="fa-solid fa-spinner fa-spin"></i>
                    <span>AI 3D Visual...</span>
                </div>
                <img src="${imageUrl}" 
                     class="slide-ai-img" 
                     alt="AI Generated" 
                     loading="eager"
                     data-fallback-stage="ai"
                     onload="this.style.opacity='1'; const l = document.getElementById('${loaderId}'); if(l) l.style.display='none';" 
                     onerror="handleImageFallback(this, '${safeTitle}', '${svgFallback}', '${safePrompt}'); this.style.opacity='1'; const l = document.getElementById('${loaderId}'); if(l) l.style.display='none';" />
                <div class="slide-img-meta-tag"><i class="fa-solid fa-sparkles"></i> 4K AI</div>
            </div>
        </div>
    ` : '';

    // ── ARCHETYPE 1: CINEMA HERO COVER ─────────────────────────────
    if (layout === 'cover') {
        card.innerHTML = `
            ${topRibbonHTML}
            <div class="slide-cover-cinema">
                <div class="slide-cover-hero-tile">
                    <div>
                        <div class="slide-hud-tag">
                            <span class="hud-dot"></span> <i class="fa-solid fa-wand-magic-sparkles"></i> ${escapeHtml(categoryLabel)}
                        </div>
                        <h1 class="slide-card-title" style="margin-top:0.4em;">${escapeHtml(slide.title)}</h1>
                        ${slide.points && slide.points.length > 0 ? `<p class="slide-cover-desc">${escapeHtml(slide.points.join(' • '))}</p>` : `<p class="slide-cover-desc">Интеллектуальная презентация с адаптивной структурой и 3D-визуализацией</p>`}
                    </div>
                    <div class="slide-cover-footer-tags">
                        <span class="slide-cover-tag"><i class="fa-solid fa-graduation-cap"></i> Образовательный модуль</span>
                        <span class="slide-cover-tag"><i class="fa-solid fa-layer-group"></i> ${totalSlides} Слайдов</span>
                        <span class="slide-cover-tag"><i class="fa-solid fa-bolt"></i> Neural Engine 2026</span>
                    </div>
                </div>
                ${imageHTML}
            </div>
            ${footerHTML}
        `;
        return;
    }

    // ── ARCHETYPE 2: STAT & METRIC HIGHLIGHT ───────────────────────
    if (layout === 'stat') {
        let statNum = '100%';
        let statLabel = 'Ключевой показатель темы';
        const numMatch = (slide.title + ' ' + (slide.points || []).join(' ')).match(/(\d+[\d.,]*%?|\b[E]=mc²\b|\b[F]=m[·*]a\b|\b[I]=U\/R\b|\b3\.0\s*×\s*10⁸\b|\b9\.8\b|\b№\s*\d+\b)/i);
        if (numMatch) {
            statNum = numMatch[1];
        } else {
            const mathList = ['№ 1', '100%', '3.0×10⁸', '9.8 м/с²', 'E=mc²', 'I = U/R', 'F = m·a', '98.5%'];
            statNum = mathList[(index + slide.title.length) % mathList.length];
        }
        statLabel = slide.points && slide.points.length > 0 ? slide.points[0] : 'Фундаментальная закономерность';
        const restPoints = slide.points && slide.points.length > 1 ? slide.points.slice(1) : (slide.points || []);

        card.innerHTML = `
            ${topRibbonHTML}
            ${headerHTML}
            <div class="slide-card-body">
                <div class="slide-stat-hero-card">
                    <div class="slide-stat-badge"><i class="fa-solid fa-chart-line"></i> Главная метрика / Закон</div>
                    <div class="slide-stat-number-box">
                        <div class="slide-stat-number">${escapeHtml(statNum)}</div>
                        <div class="slide-stat-label">${escapeHtml(statLabel)}</div>
                    </div>
                    ${restPoints.length > 0 ? `
                        <ul class="slide-stat-bullets">
                            ${restPoints.map(p => `<li>${escapeHtml(p)}</li>`).join('')}
                        </ul>
                    ` : ''}
                </div>
                ${imageHTML}
            </div>
            ${footerHTML}
        `;
        return;
    }

    // ── ARCHETYPE 3: STEP-BY-STEP PROCESS ──────────────────────────
    if (layout === 'steps') {
        const points = slide.points && slide.points.length > 0 ? slide.points : ['Анализ и постановка задачи', 'Экспериментальная проверка', 'Выводы и закономерности'];
        const stepPhases = ['Фаза 1: Анализ', 'Фаза 2: Синтез', 'Фаза 3: Верификация'];
        const stepCardsHTML = points.slice(0, 3).map((p, i) => {
            const parts = p.split(/[:—–-]\s*/);
            const stepTitle = parts.length > 1 ? parts[0] : (stepPhases[i] || `Этап ${i + 1}`);
            const stepDesc = parts.length > 1 ? parts.slice(1).join(' — ') : p;
            return `
                <div class="slide-step-card">
                    <div class="slide-step-num-pill">0${i + 1}</div>
                    <div class="slide-step-title">${escapeHtml(stepTitle)}</div>
                    <div class="slide-step-desc">${escapeHtml(stepDesc)}</div>
                </div>
            `;
        }).join('');

        card.innerHTML = `
            ${topRibbonHTML}
            ${headerHTML}
            <div class="slide-card-body">
                <div class="slide-steps-row">
                    ${stepCardsHTML}
                </div>
            </div>
            ${footerHTML}
        `;
        return;
    }

    // ── ARCHETYPE 4: SIDE-BY-SIDE COMPARISON ───────────────────────
    if (layout === 'compare') {
        const points = slide.points || [];
        const mid = Math.ceil(points.length / 2);
        const leftPoints = points.slice(0, mid);
        const rightPoints = points.slice(mid);

        card.innerHTML = `
            ${topRibbonHTML}
            ${headerHTML}
            <div class="slide-card-body">
                <div class="slide-compare-col">
                    <div class="slide-compare-header">
                        <span class="slide-compare-badge left">📌 Сторона А / Тезис</span>
                    </div>
                    <ul class="slide-compare-list">
                        ${leftPoints.map(p => `<li><i class="fa-solid fa-circle-check"></i> <span>${escapeHtml(p)}</span></li>`).join('')}
                    </ul>
                </div>
                <div class="slide-compare-vs-badge">VS</div>
                <div class="slide-compare-col">
                    <div class="slide-compare-header">
                        <span class="slide-compare-badge right">⚡ Сторона Б / Вывод</span>
                    </div>
                    <ul class="slide-compare-list">
                        ${(rightPoints.length ? rightPoints : leftPoints).map(p => `<li><i class="fa-solid fa-bolt" style="color:#a855f7;"></i> <span>${escapeHtml(p)}</span></li>`).join('')}
                    </ul>
                </div>
            </div>
            ${footerHTML}
        `;
        return;
    }

    // ── ARCHETYPE 5: CARDS GRID / BENTO ────────────────────────────
    if (layout === 'cards-grid') {
        const icons = ['fa-atom', 'fa-dna', 'fa-bolt', 'fa-microchip', 'fa-chart-pie', 'fa-star'];
        const miniTilesHTML = (slide.points || []).map((p, i) => `
            <div class="slide-grid-mini-tile">
                <div class="slide-mini-icon-box">
                    <i class="fa-solid ${icons[i % icons.length]}"></i>
                </div>
                <div class="slide-mini-tile-content">${escapeHtml(p)}</div>
            </div>
        `).join('');

        card.innerHTML = `
            ${topRibbonHTML}
            ${headerHTML}
            <div class="slide-card-body">
                <div class="slide-cards-grid-row">
                    <div class="slide-grid-col-cards">
                        ${miniTilesHTML}
                    </div>
                    ${imageHTML}
                </div>
            </div>
            ${footerHTML}
        `;
        return;
    }

    // ── ARCHETYPE 6: INSIGHT & FOCUS QUOTE ─────────────────────────
    if (layout === 'insight') {
        const quoteText = slide.points && slide.points.length > 0 ? slide.points[0] : slide.title;
        const subPoints = slide.points && slide.points.length > 1 ? slide.points.slice(1) : [];

        card.innerHTML = `
            ${topRibbonHTML}
            ${headerHTML}
            <div class="slide-card-body">
                <div class="slide-insight-hero-tile">
                    <div>
                        <div class="slide-hud-tag"><i class="fa-solid fa-lightbulb"></i> Главный вывод / Инсайт</div>
                        <div class="slide-insight-quote-icon" style="margin-top:0.3em;">“</div>
                        <div class="slide-insight-quote-text">${escapeHtml(quoteText)}</div>
                    </div>
                    ${subPoints.length > 0 ? `
                        <ul class="slide-insight-points">
                            ${subPoints.map(p => `<li>${escapeHtml(p)}</li>`).join('')}
                        </ul>
                    ` : ''}
                </div>
                ${imageHTML}
            </div>
            ${footerHTML}
        `;
        return;
    }

    // ── ARCHETYPE 7: SPLIT LEFT / SPLIT RIGHT ──────────────────────
    const pointsListHTML = `
        <ul class="slide-points-ul">
            ${(slide.points || []).map((p, pIdx) => `<li><span class="point-num">${pIdx + 1}</span> <span>${escapeHtml(p)}</span></li>`).join('')}
        </ul>
    `;

    card.innerHTML = `
        ${topRibbonHTML}
        ${headerHTML}
        <div class="slide-card-body">
            <div class="slide-split-points-card">
                ${pointsListHTML}
            </div>
            ${imageHTML}
        </div>
        ${footerHTML}
    `;
}


/* ──────────────────────────────────────────────
   FULLSCREEN PRESENTER MODE RENDERING
─────────────────────────────────────────────── */
function renderPresenterSlide() {
    const card = document.getElementById('presenter-slide-card');
    const counter = document.getElementById('presenter-counter');
    const fill = document.getElementById('presenter-progress-fill');
    const notesContent = document.getElementById('presenter-notes-content');
    const total = presentationState.slides.length;
    const current = presentationState.currentSlideIndex;

    if (!card) return;
    const slide = getCurrentSlide();
    buildSlideCardHTML(card, slide, current, presentationState.theme);

    if (counter) counter.textContent = `Слайд ${current + 1} из ${total}`;
    if (fill) fill.style.width = `${((current + 1) / total) * 100}%`;
    if (notesContent && slide) {
        notesContent.textContent = slide.speakerNotes || (slide.points && slide.points.length ? `Ключевые тезисы для озвучивания: ${slide.points.join('; ')}` : 'Расскажите об основных аспектах темы этого слайда.');
    }
}


/* ──────────────────────────────────────────────
   FULL MULTI-PAGE PDF EXPORT (ALL SLIDES!)
─────────────────────────────────────────────── */
async function downloadPDF() {
    if (!presentationState.slides.length) {
        showToast('Презентация пуста', 'error');
        return;
    }
    showToast('Подготовка многостраничного PDF (все слайды)...', 'info');

    // Create off-screen container for rendering ALL slides sequentially
    const exportContainer = document.createElement('div');
    exportContainer.style.position = 'fixed';
    exportContainer.style.left = '-9999px';
    exportContainer.style.top = '0';
    exportContainer.style.width = '960px';

    const { theme, slides } = presentationState;

    slides.forEach((slide, idx) => {
        const pageDiv = document.createElement('div');
        pageDiv.style.width = '960px';
        pageDiv.style.height = '540px';
        pageDiv.style.position = 'relative';
        pageDiv.style.overflow = 'hidden';
        pageDiv.style.pageBreakAfter = 'always'; // FORCE PAGE BREAK IN PDF

        buildSlideCardHTML(pageDiv, slide, idx, theme);
        exportContainer.appendChild(pageDiv);
    });

    document.body.appendChild(exportContainer);

    const opt = {
        margin: 0,
        filename: `${presentationState.title || 'Презентация'}.pdf`,
        image: { type: 'jpeg', quality: 0.95 },
        html2canvas: { scale: 1.5, useCORS: true, logging: false },
        jsPDF: { unit: 'px', format: [960, 540], orientation: 'landscape' }
    };

    try {
        await html2pdf().set(opt).from(exportContainer).save();
        showToast(`PDF с ${slides.length} слайдами скачан!`, 'success');
    } catch (e) {
        console.error('[PDF Error]', e);
        showToast('Ошибка при экспорте PDF: ' + e.message, 'error');
    } finally {
        document.body.removeChild(exportContainer);
    }
}


/* ──────────────────────────────────────────────
   FULL MULTI-PAGE PPTX EXPORT (ALL SLIDES + CORS)
─────────────────────────────────────────────── */
async function generatePPTX(presentation, btn) {
    if (!presentation || !Array.isArray(presentation.slides) || presentation.slides.length === 0) {
        showToast('Презентация пуста', 'error');
        return;
    }
    if (typeof PptxGenJS === 'undefined') {
        showToast('Библиотека PptxGenJS не загружена', 'error');
        return;
    }

    btn.disabled = true;
    showToast('Генерация картинок и сборка PPTX (все слайды)...', 'info');

    try {
        const pptx = new PptxGenJS();
        pptx.layout = 'LAYOUT_16x9';
        pptx.title  = presentation.title;

        const theme = presentation.theme || {};
        const bgHex     = (theme.backgroundColor  || '#F8FAFC').replace('#', '');
        const textHex   = '475569';
        const titleHex  = '0F172A';
        const accentHex = (theme.accentColor      || '#3B82F6').replace('#', '');

        const totalSlides = presentation.slides.length;

        for (let i = 0; i < totalSlides; i++) {
            const slideData = presentation.slides[i];
            const slide = pptx.addSlide();
            slide.background = { color: bgHex };

            if (slideData.speakerNotes) {
                slide.addNotes(slideData.speakerNotes);
            }

            const layout = getSlideLayoutType(slideData, i);

            // Top Decorative Blue Accent Line (NotebookLM Style)
            slide.addShape(pptx.ShapeType.rect, {
                x: 0, y: 0, w: '100%', h: 0.1, fill: { color: accentHex }
            });

            // Cover slide (Index 0)
            if (layout === 'cover') {
                const coverHasImage = Boolean(slideData.imagePrompt);
                let coverImgBase64 = null;
                if (coverHasImage) {
                    const imageUrl = buildPollinationsUrl(slideData.imagePrompt, slideData.seed, slideData.title);
                    showToast(`Загрузка обложки слайда 1/${totalSlides}...`, 'info');
                    coverImgBase64 = await fetchImageAsBase64(imageUrl, slideData.title, theme);
                }

                if (coverImgBase64) {
                    slide.addShape(pptx.ShapeType.roundRect, {
                        x: 0.8, y: 1.15, w: 4.6, h: 3.9,
                        fill: { color: 'FFFFFF' },
                        line: { color: 'E2E8F0', width: 1 },
                        rectRadius: 0.15
                    });
                    slide.addText(slideData.title || '', {
                        x: 1.0, y: 1.5, w: 4.2, h: 2.0,
                        fontSize: 28, bold: true, color: titleHex,
                        align: 'left', valign: 'middle', fontFace: 'Arial'
                    });
                    if (slideData.points && slideData.points.length > 0) {
                        slide.addText(slideData.points.join(' • '), {
                            x: 1.0, y: 3.6, w: 4.2, h: 1.0,
                            fontSize: 14, color: textHex,
                            align: 'left', valign: 'top', fontFace: 'Arial'
                        });
                    }
                    slide.addShape(pptx.ShapeType.roundRect, {
                        x: 5.6, y: 1.15, w: 3.8, h: 3.9,
                        fill: { color: 'FFFFFF' },
                        line: { color: 'E2E8F0', width: 1 },
                        rectRadius: 0.15
                    });
                    slide.addImage({ data: coverImgBase64, x: 5.7, y: 1.25, w: 3.6, h: 3.7 });
                } else {
                    slide.addShape(pptx.ShapeType.roundRect, {
                        x: 1.0, y: 1.2, w: 8.0, h: 3.3,
                        fill: { color: 'FFFFFF' },
                        line: { color: 'E2E8F0', width: 1 },
                        rectRadius: 0.15
                    });
                    slide.addText(slideData.title || '', {
                        x: 1.2, y: 1.6, w: 7.6, h: 1.5,
                        fontSize: 34, bold: true, color: titleHex,
                        align: 'center', valign: 'middle', fontFace: 'Arial'
                    });
                    if (slideData.points && slideData.points.length > 0) {
                        slide.addText(slideData.points.join(' • '), {
                            x: 1.2, y: 3.2, w: 7.6, h: 0.8,
                            fontSize: 15, color: textHex,
                            align: 'center', valign: 'top', fontFace: 'Arial'
                        });
                    }
                }
                continue;
            }

            // Regular Slide Header
            slide.addText(slideData.title || '', {
                x: 0.6, y: 0.35, w: 8.8, h: 0.6,
                fontSize: 24, bold: true, color: titleHex,
                align: 'left', valign: 'middle', fontFace: 'Arial'
            });

            // Decorative Title Accent Bar
            slide.addShape(pptx.ShapeType.rect, {
                x: 0.6, y: 0.95, w: 0.8, h: 0.04, fill: { color: accentHex }
            });

            const points = slideData.points || [];
            const hasImage = Boolean(slideData.imagePrompt && slideData.imagePrompt.trim());

            let imageBase64 = null;
            if (hasImage) {
                const imageUrl = buildPollinationsUrl(slideData.imagePrompt, slideData.seed, slideData.title);
                showToast(`Загрузка картинки слайда ${i + 1}/${totalSlides}...`, 'info');
                imageBase64 = await fetchImageAsBase64(imageUrl, slideData.title, theme);
            }

            if (layout === 'stat') {
                // Large Stat & Formula Callout
                const textW = imageBase64 ? 4.8 : 8.8;
                slide.addShape(pptx.ShapeType.roundRect, {
                    x: 0.6, y: 1.15, w: textW, h: 3.9,
                    fill: { color: 'FFFFFF' }, line: { color: 'E2E8F0', width: 1 }, rectRadius: 0.15
                });

                let statNum = '100%';
                let statLabel = slideData.points && slideData.points.length > 0 ? slideData.points[0] : 'Ключевой показатель';
                const numMatch = (slideData.title + ' ' + (slideData.points || []).join(' ')).match(/(\d+[\d.,]*%?|\b[E]=mc²\b|\b[F]=m[·*]a\b|\b[I]=U\/R\b|\b3\.0\s*×\s*10⁸\b|\b9\.8\b|\b№\s*\d+\b)/i);
                if (numMatch) statNum = numMatch[1];

                slide.addText(statNum, {
                    x: 0.8, y: 1.35, w: textW - 0.4, h: 1.1,
                    fontSize: 38, bold: true, color: accentHex, fontFace: 'Arial'
                });
                slide.addText(statLabel, {
                    x: 0.8, y: 2.5, w: textW - 0.4, h: 0.7,
                    fontSize: 16, bold: true, color: titleHex, fontFace: 'Arial'
                });

                const restPoints = slideData.points && slideData.points.length > 1 ? slideData.points.slice(1) : [];
                if (restPoints.length > 0) {
                    const bulletItems = restPoints.map(p => ({
                        text: p,
                        options: { fontSize: 13, color: textHex, bullet: { code: '2713', color: accentHex }, paraSpaceBefore: 6 }
                    }));
                    slide.addText(bulletItems, { x: 0.8, y: 3.3, w: textW - 0.4, h: 1.6, fontFace: 'Arial', valign: 'top' });
                }

                if (imageBase64) {
                    slide.addShape(pptx.ShapeType.roundRect, {
                        x: 5.6, y: 1.15, w: 3.8, h: 3.9,
                        fill: { color: 'FFFFFF' }, line: { color: 'E2E8F0', width: 1 }, rectRadius: 0.15
                    });
                    slide.addImage({ data: imageBase64, x: 5.7, y: 1.25, w: 3.6, h: 3.7 });
                }
            } else if (layout === 'steps') {
                // 3 Horizontal Step Process Cards
                const stepCount = Math.min(points.length, 3);
                const stepW = (8.8 - (0.25 * (stepCount - 1))) / Math.max(stepCount, 1);

                for (let k = 0; k < stepCount; k++) {
                    const cardX = 0.6 + k * (stepW + 0.25);
                    slide.addShape(pptx.ShapeType.roundRect, {
                        x: cardX, y: 1.15, w: stepW, h: 3.9,
                        fill: { color: 'FFFFFF' }, line: { color: 'E2E8F0', width: 1 }, rectRadius: 0.15
                    });

                    slide.addText(`0${k + 1}`, {
                        x: cardX + 0.2, y: 1.35, w: 0.6, h: 0.5,
                        fontSize: 18, bold: true, color: accentHex, fontFace: 'Arial'
                    });

                    const p = points[k] || '';
                    const parts = p.split(/[:—–-]\s*/);
                    const stepTitle = parts.length > 1 ? parts[0] : `Этап ${k + 1}`;
                    const stepDesc = parts.length > 1 ? parts.slice(1).join(' — ') : p;

                    slide.addText(stepTitle, {
                        x: cardX + 0.2, y: 2.0, w: stepW - 0.4, h: 0.6,
                        fontSize: 14, bold: true, color: titleHex, fontFace: 'Arial'
                    });
                    slide.addText(stepDesc, {
                        x: cardX + 0.2, y: 2.7, w: stepW - 0.4, h: 2.1,
                        fontSize: 12, color: textHex, fontFace: 'Arial', valign: 'top', lineSpacingMultiple: 1.2
                    });
                }
            } else if (layout === 'compare') {
                // 2 Balanced Comparative Columns
                const colW = 4.25;
                const mid = Math.ceil(points.length / 2);
                const leftPoints = points.slice(0, mid);
                const rightPoints = points.slice(mid);

                // Left Column
                slide.addShape(pptx.ShapeType.roundRect, {
                    x: 0.6, y: 1.15, w: colW, h: 3.9,
                    fill: { color: 'FFFFFF' }, line: { color: 'E2E8F0', width: 1 }, rectRadius: 0.15
                });
                slide.addText('📌 Сторона А / Тезис', {
                    x: 0.8, y: 1.35, w: colW - 0.4, h: 0.4,
                    fontSize: 13, bold: true, color: accentHex, fontFace: 'Arial'
                });
                if (leftPoints.length > 0) {
                    const bulletItems = leftPoints.map(p => ({
                        text: p,
                        options: { fontSize: 13, color: textHex, bullet: { code: '2713', color: accentHex }, paraSpaceBefore: 6 }
                    }));
                    slide.addText(bulletItems, { x: 0.8, y: 1.85, w: colW - 0.4, h: 3.0, fontFace: 'Arial', valign: 'top' });
                }

                // Right Column
                slide.addShape(pptx.ShapeType.roundRect, {
                    x: 5.15, y: 1.15, w: colW, h: 3.9,
                    fill: { color: 'FFFFFF' }, line: { color: 'E2E8F0', width: 1 }, rectRadius: 0.15
                });
                slide.addText('⚡ Сторона Б / Вывод', {
                    x: 5.35, y: 1.35, w: colW - 0.4, h: 0.4,
                    fontSize: 13, bold: true, color: '8B5CF6', fontFace: 'Arial'
                });
                const rPoints = rightPoints.length ? rightPoints : leftPoints;
                if (rPoints.length > 0) {
                    const bulletItems = rPoints.map(p => ({
                        text: p,
                        options: { fontSize: 13, color: textHex, bullet: { code: '2713', color: '8B5CF6' }, paraSpaceBefore: 6 }
                    }));
                    slide.addText(bulletItems, { x: 5.35, y: 1.85, w: colW - 0.4, h: 3.0, fontFace: 'Arial', valign: 'top' });
                }
            } else if (layout === 'insight') {
                // Focus Insight Hero
                const textW = imageBase64 ? 4.8 : 8.8;
                slide.addShape(pptx.ShapeType.roundRect, {
                    x: 0.6, y: 1.15, w: textW, h: 3.9,
                    fill: { color: 'FFFFFF' }, line: { color: 'E2E8F0', width: 1 }, rectRadius: 0.15
                });

                const quoteText = points.length > 0 ? points[0] : slideData.title;
                slide.addText(`“ ${quoteText} ”`, {
                    x: 0.8, y: 1.4, w: textW - 0.4, h: 1.5,
                    fontSize: 17, bold: true, color: titleHex, fontFace: 'Arial', italic: true
                });

                const subPoints = points.length > 1 ? points.slice(1) : [];
                if (subPoints.length > 0) {
                    const bulletItems = subPoints.map(p => ({
                        text: p,
                        options: { fontSize: 13, color: textHex, bullet: { code: '2713', color: accentHex }, paraSpaceBefore: 6 }
                    }));
                    slide.addText(bulletItems, { x: 0.8, y: 3.0, w: textW - 0.4, h: 1.8, fontFace: 'Arial', valign: 'top' });
                }

                if (imageBase64) {
                    slide.addShape(pptx.ShapeType.roundRect, {
                        x: 5.6, y: 1.15, w: 3.8, h: 3.9,
                        fill: { color: 'FFFFFF' }, line: { color: 'E2E8F0', width: 1 }, rectRadius: 0.15
                    });
                    slide.addImage({ data: imageBase64, x: 5.7, y: 1.25, w: 3.6, h: 3.7 });
                }
            } else if (layout === 'split-right') {
                // Image Left (0.6 -> 4.4), Text Right (4.6 -> 9.4)
                if (imageBase64) {
                    slide.addShape(pptx.ShapeType.roundRect, {
                        x: 0.6, y: 1.15, w: 3.8, h: 3.9,
                        fill: { color: 'FFFFFF' }, line: { color: 'E2E8F0', width: 1 }, rectRadius: 0.15
                    });
                    slide.addImage({ data: imageBase64, x: 0.7, y: 1.25, w: 3.6, h: 3.7 });
                }

                const textX = imageBase64 ? 4.6 : 0.6;
                const textW = imageBase64 ? 4.8 : 8.8;

                slide.addShape(pptx.ShapeType.roundRect, {
                    x: textX, y: 1.15, w: textW, h: 3.9,
                    fill: { color: 'FFFFFF' }, line: { color: 'E2E8F0', width: 1 }, rectRadius: 0.15
                });

                if (points.length > 0) {
                    const bulletItems = points.map(p => ({
                        text: p,
                        options: { fontSize: 15, color: textHex, bullet: { code: '2713', color: accentHex }, paraSpaceBefore: 8 }
                    }));
                    slide.addText(bulletItems, { x: textX + 0.2, y: 1.35, w: textW - 0.4, h: 3.5, fontFace: 'Arial', valign: 'top', lineSpacingMultiple: 1.2 });
                }
            } else if (layout === 'cards-grid') {
                const maxTextWidth = imageBase64 ? 4.8 : 8.8;
                const pointCount = Math.min(points.length, 3);
                const cardWidth = pointCount > 0 ? (maxTextWidth - (0.2 * (pointCount - 1))) / pointCount : maxTextWidth;

                for (let k = 0; k < pointCount; k++) {
                    const cardX = 0.6 + k * (cardWidth + 0.2);
                    slide.addShape(pptx.ShapeType.roundRect, {
                        x: cardX, y: 1.15, w: cardWidth, h: 3.9,
                        fill: { color: 'FFFFFF' }, line: { color: 'E2E8F0', width: 1 }, rectRadius: 0.15
                    });

                    slide.addText(`${k + 1}`, {
                        x: cardX + 0.15, y: 1.3, w: 0.4, h: 0.4,
                        fontSize: 14, bold: true, color: accentHex, align: 'center', fontFace: 'Arial'
                    });

                    slide.addText(points[k], {
                        x: cardX + 0.15, y: 1.8, w: cardWidth - 0.3, h: 3.0,
                        fontSize: 13, color: textHex, fontFace: 'Arial', valign: 'top', lineSpacingMultiple: 1.2
                    });
                }

                if (imageBase64) {
                    slide.addShape(pptx.ShapeType.roundRect, {
                        x: 5.6, y: 1.15, w: 3.8, h: 3.9,
                        fill: { color: 'FFFFFF' }, line: { color: 'E2E8F0', width: 1 }, rectRadius: 0.15
                    });
                    slide.addImage({ data: imageBase64, x: 5.7, y: 1.25, w: 3.6, h: 3.7 });
                }
            } else {
                // Default split-left
                const textW = imageBase64 ? 4.8 : 8.8;

                slide.addShape(pptx.ShapeType.roundRect, {
                    x: 0.6, y: 1.15, w: textW, h: 3.9,
                    fill: { color: 'FFFFFF' }, line: { color: 'E2E8F0', width: 1 }, rectRadius: 0.15
                });

                if (points.length > 0) {
                    const bulletItems = points.map(p => ({
                        text: p,
                        options: { fontSize: 15, color: textHex, bullet: { code: '2713', color: accentHex }, paraSpaceBefore: 8 }
                    }));
                    slide.addText(bulletItems, { x: 0.8, y: 1.35, w: textW - 0.4, h: 3.5, fontFace: 'Arial', valign: 'top', lineSpacingMultiple: 1.2 });
                }

                if (imageBase64) {
                    slide.addShape(pptx.ShapeType.roundRect, {
                        x: 5.6, y: 1.15, w: 3.8, h: 3.9,
                        fill: { color: 'FFFFFF' }, line: { color: 'E2E8F0', width: 1 }, rectRadius: 0.15
                    });
                    slide.addImage({ data: imageBase64, x: 5.7, y: 1.25, w: 3.6, h: 3.7 });
                }
            }

            if (slideData.imagePrompt) slide.addNotes(`AI Image Prompt: ${slideData.imagePrompt}`);
            slide.addText(`${i + 1} / ${totalSlides}`, {
                x: 8.5, y: 5.15, w: 1.0, h: 0.3,
                fontSize: 10, color: '94A3B8', align: 'right'
            });
        }

        const safeFileName = (presentation.title || 'Презентация').replace(/[\\/:*?"<>|]/g, '').trim() || 'Урок';
        await pptx.writeFile({ fileName: `${safeFileName}.pptx` });
        showToast(`PPTX с ${totalSlides} слайдами скачан!`, 'success');

    } catch (err) {
        console.error('[PPTX Error]', err);
        showToast('Ошибка экспорта PPTX: ' + err.message, 'error');
    } finally {
        btn.disabled = false;
    }
}

async function fetchImageAsBase64(url, fallbackTitle = '', theme = {}) {
    try {
        if (!url) throw new Error('No URL');
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 6500);
        const res = await fetch(url, { signal: controller.signal });
        clearTimeout(timeoutId);
        if (!res.ok) throw new Error('HTTP ' + res.status);
        const blob = await res.blob();
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    } catch (e) {
        console.warn('[Fetch Base64 Fallback]', e);
        return generateSvgIllustration(fallbackTitle, theme.accentColor, theme.backgroundColor);
    }
}


/* ──────────────────────────────────────────────
   LOCALSTORAGE PERSISTENCE
─────────────────────────────────────────────── */
function saveToLocalStorage() {
    try {
        localStorage.setItem('vsh_presentation_state', JSON.stringify(presentationState));
    } catch (e) {}
}

function loadFromLocalStorage() {
    try {
        const saved = localStorage.getItem('vsh_presentation_state');
        if (saved) {
            const parsed = JSON.parse(saved);
            if (parsed && Array.isArray(parsed.slides) && parsed.slides.length > 0) {
                presentationState = parsed;
            }
        }
    } catch (e) {}
}


/* ──────────────────────────────────────────────
   UTILITIES
─────────────────────────────────────────────── */
function switchScreen(target) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    target.classList.add('active');
}

function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const icons = { error: 'fa-circle-exclamation', success: 'fa-circle-check', info: 'fa-circle-info' };
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<i class="fa-solid ${icons[type] || icons.info}"></i> ${escapeHtml(message)}`;
    container.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.3s';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
