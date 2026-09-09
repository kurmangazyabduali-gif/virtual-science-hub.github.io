const STORAGE_KEY = 'vsh-presentation-editor-v1';
const STAGE = { w: 960, h: 540 };

const slideTypes = [
    ['title', 'Титульный'],
    ['headingText', 'Заголовок + текст'],
    ['twoBlocks', 'Два блока'],
    ['textImage', 'Текст + изображение'],
    ['imageText', 'Изображение + текст'],
    ['imageOnly', 'Только изображение'],
    ['quote', 'Цитата'],
    ['stats', 'Слайд со статистикой'],
    ['chart', 'График/диаграмма'],
    ['table', 'Таблица'],
    ['final', 'Финальный слайд']
];

const themes = {
    business: { name: 'Business', bg: '#f8fafc', fg: '#0f172a', accent: '#2563eb', soft: '#dbeafe', font: 'Inter' },
    education: { name: 'Education', bg: '#fff7ed', fg: '#1f2937', accent: '#16a34a', soft: '#dcfce7', font: 'Inter' },
    technology: { name: 'Technology', bg: '#07111f', fg: '#e0f2fe', accent: '#22d3ee', soft: '#12334a', font: 'Inter' },
    startup: { name: 'Startup', bg: '#fff1f2', fg: '#111827', accent: '#f43f5e', soft: '#ffe4e6', font: 'Inter' },
    marketing: { name: 'Marketing', bg: '#fdf2f8', fg: '#312e81', accent: '#db2777', soft: '#fce7f3', font: 'Inter' },
    portfolio: { name: 'Portfolio', bg: '#f5f3ff', fg: '#18181b', accent: '#7c3aed', soft: '#ede9fe', font: 'Inter' },
    minimal: { name: 'Minimal', bg: '#ffffff', fg: '#111827', accent: '#111827', soft: '#f3f4f6', font: 'Inter' },
    dark: { name: 'Dark', bg: '#111827', fg: '#f9fafb', accent: '#f59e0b', soft: '#263244', font: 'Inter' },
    modern: { name: 'Modern', bg: '#ecfeff', fg: '#083344', accent: '#0f766e', soft: '#ccfbf1', font: 'Inter' }
};

const textCommands = [
    'Улучшить текст',
    'Сократить текст',
    'Расширить текст',
    'Сделать текст официальным',
    'Сделать текст простым',
    'Исправить ошибки',
    'Переписать',
    'Создать новый вариант',
    'Сделать текст более убедительным',
    'Перевести на другой язык'
];

const designCommands = [
    'Улучшить дизайн',
    'Сделать современный стиль',
    'Сделать минималистично',
    'Сделать корпоративный стиль',
    'Подобрать цветовую палитру',
    'Выровнять элементы',
    'Сделать единый стиль всех слайдов'
];

const apiKey = 'AIzaSyAheibdcYZ6SC46CzJ2kO-rAvSIjHEo9to';
let pendingProposal = null;
let previewIndex = 0;
let interactionSnapshot = null;
let uploadTargetElementId = null;
let draggedSlideIndex = null;
let saveTimer = null;

let state = loadState() || createInitialState();

const $ = (selector) => document.querySelector(selector);
const els = {
    deckTitle: $('#deckTitle'),
    autosave: $('#autosaveStatus'),
    slidesList: $('#slidesList'),
    slideCount: $('#slideCountLabel'),
    newSlideType: $('#newSlideType'),
    themeSelect: $('#themeSelect'),
    stage: $('#slideStage'),
    properties: $('#propertiesContent'),
    selectedLabel: $('#selectedLabel'),
    imageUpload: $('#imageUpload'),
    toastStack: $('#toastStack')
};

init();

function init() {
    els.deckTitle.value = state.title;
    slideTypes.forEach(([value, label]) => els.newSlideType.add(new Option(label, value)));
    Object.entries(themes).forEach(([value, theme]) => els.themeSelect.add(new Option(theme.name, value)));
    bindEvents();
    render();
    autosave('Восстановлено');
}

function bindEvents() {
    els.deckTitle.addEventListener('input', () => {
        state.title = els.deckTitle.value || 'Новая презентация';
        scheduleSave();
    });

    $('#saveBtn').addEventListener('click', () => {
        saveNow();
        toast('Проект сохранён');
    });
    $('#previewBtn').addEventListener('click', openPreview);
    $('#downloadPdfBtn').addEventListener('click', () => openModal('exportModal'));
    $('#shareBtn').addEventListener('click', shareDeck);
    $('#addSlideBtn').addEventListener('click', () => addSlide(els.newSlideType.value));
    $('#duplicateSlideBtn').addEventListener('click', duplicateSlide);
    $('#deleteSlideBtn').addEventListener('click', confirmDeleteSlide);
    $('#moveSlideUpBtn').addEventListener('click', () => moveSlide(-1));
    $('#moveSlideDownBtn').addEventListener('click', () => moveSlide(1));
    $('#applyThemeDeckBtn').addEventListener('click', () => applyTheme(els.themeSelect.value, true));
    $('#applyThemeSlideBtn').addEventListener('click', () => applyTheme(els.themeSelect.value, false));
    $('#undoBtn').addEventListener('click', undo);
    $('#redoBtn').addEventListener('click', redo);
    $('#deleteElementBtn').addEventListener('click', deleteSelectedElement);
    $('#aiAssistantBtn').addEventListener('click', () => openModal('aiModal'));
    $('#aiGenerateBtn').addEventListener('click', generateDeckWithAI);
    $('#applyAiProposalBtn').addEventListener('click', applyAiProposal);
    $('#startExportBtn').addEventListener('click', exportPdf);
    $('#exitPreviewBtn').addEventListener('click', closePreview);
    $('#previewPrevBtn').addEventListener('click', () => navigatePreview(-1));
    $('#previewNextBtn').addEventListener('click', () => navigatePreview(1));

    document.querySelectorAll('[data-add]').forEach((button) => {
        button.addEventListener('click', () => addElement(button.dataset.add));
    });

    document.querySelectorAll('[data-close-modal]').forEach((button) => {
        button.addEventListener('click', () => closeModal(button.dataset.closeModal));
    });

    document.querySelectorAll('.modal-backdrop').forEach((backdrop) => {
        backdrop.addEventListener('click', (event) => {
            if (event.target === backdrop) closeModal(backdrop.id);
        });
    });

    els.stage.addEventListener('pointerdown', (event) => {
        if (event.target === els.stage) {
            selectElement(null);
        }
    });

    els.imageUpload.addEventListener('change', handleImageUpload);

    textCommands.forEach((command) => addAiCommandButton('#aiTextCommands', command, () => runTextAI(command)));
    designCommands.forEach((command) => addAiCommandButton('#aiDesignCommands', command, () => runDesignAI(command)));

    document.addEventListener('keydown', handleKeyboard);
}

function createInitialState() {
    return {
        title: 'Новая презентация',
        selectedSlide: 0,
        selectedElementId: null,
        history: [],
        future: [],
        slides: [createSlide('title', 'modern')]
    };
}

function createSlide(type = 'headingText', themeId = currentSlide()?.theme || 'modern') {
    const theme = themes[themeId] || themes.modern;
    const slide = {
        id: id(),
        type,
        theme: themeId,
        background: theme.bg,
        elements: []
    };

    const add = (element) => {
        const nextElement = { id: id(), z: slide.elements.length + 1, ...element };
        slide.elements.push(nextElement);
        return nextElement;
    };
    const title = (content, x, y, w, h, size = 48) => add(textEl(content, x, y, w, h, size, theme.fg, true));
    const text = (content, x, y, w, h, size = 24) => add(textEl(content, x, y, w, h, size, theme.fg, false));
    const shape = (x, y, w, h, fill = theme.soft) => add(shapeEl(x, y, w, h, fill, theme.accent));

    if (type === 'title') {
        shape(610, 0, 350, 540, theme.soft);
        title('Название презентации', 70, 145, 560, 110, 54);
        text('Короткое описание идеи, темы или проекта', 74, 275, 480, 80, 24);
        add(lineEl(75, 365, 220, 0, theme.accent, 5));
    } else if (type === 'twoBlocks') {
        title('Два ключевых блока', 60, 48, 720, 60, 42);
        shape(70, 160, 360, 250, theme.soft);
        shape(530, 160, 360, 250, '#ffffff');
        text('Первый тезис\nПодробности и аргументы', 105, 200, 285, 120, 24);
        text('Второй тезис\nФакты, выводы и примеры', 565, 200, 285, 120, 24);
    } else if (type === 'textImage' || type === 'imageText') {
        const imageFirst = type === 'imageText';
        title('Текст и визуальный пример', 58, 48, 760, 58, 40);
        text('Опишите главную мысль слайда. Используйте короткие фразы и выделяйте важное.', imageFirst ? 560 : 70, 160, 320, 200, 25);
        add(imageEl(imageFirst ? 70 : 530, 145, 360, 250, placeholderImage(theme.accent, 'IMAGE')));
    } else if (type === 'imageOnly') {
        add(imageEl(80, 64, 800, 410, placeholderImage(theme.accent, 'FULL IMAGE')));
        text('Подпись к изображению', 110, 468, 740, 42, 21);
    } else if (type === 'quote') {
        text('“', 60, 52, 80, 100, 86).color = theme.accent;
        title('Сильная цитата или главная идея презентации', 145, 145, 680, 155, 44);
        text('Автор или источник', 150, 328, 420, 48, 22);
    } else if (type === 'stats') {
        title('Статистика', 60, 48, 600, 60, 42);
        [0, 1, 2].forEach((n) => {
            shape(70 + n * 295, 155, 230, 220, n === 1 ? theme.soft : '#ffffff');
            title(`${[72, 48, 91][n]}%`, 100 + n * 295, 205, 170, 60, 46);
            text(['рост интереса', 'экономия времени', 'лучше запоминают'][n], 104 + n * 295, 284, 170, 55, 20);
        });
    } else if (type === 'chart') {
        title('График / диаграмма', 60, 45, 650, 60, 42);
        add(chartEl(92, 145, 520, 300, theme.accent));
        text('Ключевой вывод по данным: показатель растёт и требует внимания.', 650, 170, 230, 160, 23);
    } else if (type === 'table') {
        title('Таблица сравнения', 60, 45, 650, 60, 42);
        add(tableEl(90, 145, 780, 280, theme.fg));
    } else if (type === 'final') {
        title('Спасибо за внимание', 96, 155, 760, 85, 54);
        text('Вопросы и обсуждение', 100, 260, 470, 50, 26);
        add(shapeEl(720, 310, 90, 90, theme.accent, theme.accent, 0, 28, 0.9));
    } else {
        title('Заголовок слайда', 60, 58, 760, 60, 42);
        text('Добавьте основной текст. Каждый блок можно редактировать прямо на рабочем поле, перемещать и менять размер.', 64, 155, 620, 190, 26);
        add(shapeEl(720, 154, 140, 140, theme.soft, theme.accent, 2, 18, 0.95));
    }

    return slide;
}

function textEl(content, x, y, w, h, fontSize, color, bold = false) {
    return {
        type: 'text',
        content,
        x,
        y,
        w,
        h,
        fontFamily: 'Inter',
        fontSize,
        color,
        bold,
        italic: false,
        underline: false,
        align: 'left',
        lineHeight: 1.18,
        padding: 6,
        opacity: 1,
        rotation: 0
    };
}

function imageEl(x, y, w, h, src) {
    return { type: 'image', src, x, y, w, h, opacity: 1, rotation: 0, borderRadius: 14 };
}

function shapeEl(x, y, w, h, fill, stroke, strokeWidth = 0, borderRadius = 16, opacity = 1) {
    return { type: 'shape', x, y, w, h, fill, stroke, strokeWidth, borderRadius, opacity, rotation: 0 };
}

function lineEl(x, y, w, h, stroke, strokeWidth) {
    return { type: 'line', x, y, w, h: Math.max(h, 1), stroke, strokeWidth, opacity: 1, rotation: 0 };
}

function tableEl(x, y, w, h, color) {
    return {
        type: 'table',
        x,
        y,
        w,
        h,
        color,
        fontSize: 18,
        opacity: 1,
        rotation: 0,
        cells: [
            ['Параметр', 'Значение', 'Комментарий'],
            ['Идея', 'Высокая', 'Подходит для урока'],
            ['Сложность', 'Средняя', 'Можно упростить']
        ]
    };
}

function chartEl(x, y, w, h, fill) {
    return { type: 'chart', x, y, w, h, fill, values: [45, 70, 58, 88, 64], opacity: 1, rotation: 0 };
}

function iconEl(x, y) {
    return { type: 'text', content: '★', x, y, w: 80, h: 80, fontFamily: 'Inter', fontSize: 58, color: currentTheme().accent, bold: true, italic: false, underline: false, align: 'center', lineHeight: 1, padding: 0, opacity: 1, rotation: 0 };
}

function render() {
    state.selectedSlide = clamp(state.selectedSlide, 0, state.slides.length - 1);
    renderSlidesList();
    renderStage();
    renderProperties();
    els.slideCount.textContent = `${state.slides.length} ${plural(state.slides.length, ['слайд', 'слайда', 'слайдов'])}`;
    els.themeSelect.value = currentSlide().theme;
    scheduleSave();
}

function renderSlidesList() {
    els.slidesList.innerHTML = '';
    state.slides.forEach((slide, index) => {
        const theme = themes[slide.theme] || themes.modern;
        const item = document.createElement('button');
        item.type = 'button';
        item.className = `slide-thumb ${index === state.selectedSlide ? 'active' : ''}`;
        item.draggable = true;
        item.innerHTML = `
            <span class="slide-number">${index + 1}</span>
            <span class="thumb-canvas" style="background:${escapeAttr(slide.background)}">
                <span class="thumb-title" style="background:${escapeAttr(theme.fg)}"></span>
                <span class="thumb-lines" style="background:${escapeAttr(theme.accent)}"></span>
            </span>
        `;
        item.addEventListener('click', () => {
            state.selectedSlide = index;
            state.selectedElementId = null;
            render();
        });
        item.addEventListener('dragstart', () => draggedSlideIndex = index);
        item.addEventListener('dragover', (event) => event.preventDefault());
        item.addEventListener('drop', (event) => {
            event.preventDefault();
            if (draggedSlideIndex === null || draggedSlideIndex === index) return;
            saveSnapshot();
            const [moved] = state.slides.splice(draggedSlideIndex, 1);
            state.slides.splice(index, 0, moved);
            state.selectedSlide = index;
            draggedSlideIndex = null;
            toast('Порядок слайдов изменён');
            render();
        });
        els.slidesList.appendChild(item);
    });
}

function renderStage() {
    const slide = currentSlide();
    els.stage.style.background = slide.background;
    els.stage.innerHTML = '';
    slide.elements
        .slice()
        .sort((a, b) => (a.z || 0) - (b.z || 0))
        .forEach((element) => els.stage.appendChild(createElementNode(element, true)));
}

function createElementNode(element, interactive) {
    const node = document.createElement('div');
    node.className = `slide-element el-${element.type} ${interactive && element.id === state.selectedElementId ? 'selected' : ''}`;
    node.dataset.id = element.id;
    node.style.left = `${element.x}px`;
    node.style.top = `${element.y}px`;
    node.style.width = `${element.w}px`;
    node.style.height = `${element.h}px`;
    node.style.zIndex = element.z || 1;
    node.style.opacity = element.opacity ?? 1;
    node.style.transform = `rotate(${element.rotation || 0}deg)`;

    if (element.type === 'text') {
        node.contentEditable = interactive ? 'true' : 'false';
        node.textContent = element.content;
        node.style.fontFamily = element.fontFamily;
        node.style.fontSize = `${element.fontSize}px`;
        node.style.color = element.color;
        node.style.fontWeight = element.bold ? '800' : '500';
        node.style.fontStyle = element.italic ? 'italic' : 'normal';
        node.style.textDecoration = element.underline ? 'underline' : 'none';
        node.style.textAlign = element.align;
        node.style.lineHeight = element.lineHeight;
        node.style.padding = `${element.padding || 0}px`;
        node.style.whiteSpace = 'pre-wrap';
        node.style.overflow = 'hidden';
        if (interactive) {
            node.addEventListener('input', () => {
                element.content = node.textContent;
                autosave('Редактирование');
            });
            node.addEventListener('blur', () => {
                saveSnapshotFromInteraction();
                renderProperties();
            });
        }
    } else if (element.type === 'image') {
        node.style.borderRadius = `${element.borderRadius || 0}px`;
        node.innerHTML = `<img alt="" src="${escapeAttr(element.src)}" style="border-radius:${element.borderRadius || 0}px">`;
    } else if (element.type === 'shape') {
        node.style.background = element.fill;
        node.style.border = `${element.strokeWidth || 0}px solid ${element.stroke || 'transparent'}`;
        node.style.borderRadius = `${element.borderRadius || 0}px`;
    } else if (element.type === 'line') {
        node.style.height = `${element.strokeWidth || 3}px`;
        node.style.background = element.stroke;
        node.style.borderRadius = '999px';
        node.style.top = `${element.y}px`;
    } else if (element.type === 'table') {
        node.style.color = element.color;
        node.style.fontSize = `${element.fontSize}px`;
        node.innerHTML = `<table>${element.cells.map((row) => `<tr>${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join('')}</tr>`).join('')}</table>`;
    } else if (element.type === 'chart') {
        const max = Math.max(...element.values, 1);
        node.innerHTML = element.values.map((value) => `<span class="chart-bar" style="height:${(value / max) * 100}%; background:linear-gradient(180deg, ${escapeAttr(element.fill)}, #0f766e)"></span>`).join('');
    }

    if (interactive) {
        node.addEventListener('pointerdown', (event) => startDrag(event, element.id));
        if (element.id === state.selectedElementId) {
            const handle = document.createElement('span');
            handle.className = 'resize-handle';
            handle.addEventListener('pointerdown', (event) => startResize(event, element.id));
            node.appendChild(handle);
        }
    }
    return node;
}

function renderProperties() {
    const element = selectedElement();
    els.selectedLabel.textContent = element ? labelForElement(element) : 'Слайд';
    if (!element) {
        els.properties.innerHTML = `
            <div class="settings-stack">
                <label>Фон слайда <input class="input-field" type="color" value="${currentSlide().background}" data-slide-prop="background"></label>
                <label>Шаблон <select class="select-field" data-slide-prop="theme">${Object.entries(themes).map(([id, theme]) => `<option value="${id}" ${currentSlide().theme === id ? 'selected' : ''}>${theme.name}</option>`).join('')}</select></label>
                <button class="tool-button wide" data-slide-command="addNote"><i class="fa-solid fa-note-sticky"></i><span>Добавить заметку</span></button>
            </div>
        `;
        bindPropertyControls();
        return;
    }

    const base = `
        <div class="settings-stack">
            <div class="control-row">
                <label>X <input class="input-field" type="number" value="${Math.round(element.x)}" data-prop="x"></label>
                <label>Y <input class="input-field" type="number" value="${Math.round(element.y)}" data-prop="y"></label>
            </div>
            <div class="control-row">
                <label>Ширина <input class="input-field" type="number" value="${Math.round(element.w)}" data-prop="w"></label>
                <label>Высота <input class="input-field" type="number" value="${Math.round(element.h)}" data-prop="h"></label>
            </div>
            <div class="control-row">
                <label>Поворот <input class="input-field" type="number" value="${element.rotation || 0}" data-prop="rotation"></label>
                <label>Прозрачность <input class="input-field" type="range" min="0.1" max="1" step="0.05" value="${element.opacity ?? 1}" data-prop="opacity"></label>
            </div>
            <div class="button-row">
                <button class="mini-button" data-command="copy">Копировать</button>
                <button class="mini-button" data-command="front">Выше</button>
                <button class="mini-button" data-command="back">Ниже</button>
            </div>
        </div>
    `;

    let specific = '';
    if (element.type === 'text') {
        specific = `
            <div class="settings-stack">
                <label>Шрифт
                    <select class="select-field" data-prop="fontFamily">
                        ${['Inter', 'Arial', 'Georgia', 'Times New Roman', 'Verdana', 'Courier New'].map((font) => `<option ${element.fontFamily === font ? 'selected' : ''}>${font}</option>`).join('')}
                    </select>
                </label>
                <label>Размер <input class="input-field" type="number" min="8" max="120" value="${element.fontSize}" data-prop="fontSize"></label>
                <label>Цвет <input class="input-field" type="color" value="${element.color}" data-prop="color"></label>
                <div class="button-row">
                    <button class="mini-button ${element.bold ? 'filled' : ''}" data-toggle="bold"><b>B</b></button>
                    <button class="mini-button ${element.italic ? 'filled' : ''}" data-toggle="italic"><i>I</i></button>
                    <button class="mini-button ${element.underline ? 'filled' : ''}" data-toggle="underline"><u>U</u></button>
                </div>
                <div class="button-row">
                    ${['left', 'center', 'right'].map((align) => `<button class="mini-button ${element.align === align ? 'filled' : ''}" data-align="${align}"><i class="fa-solid fa-align-${align}"></i></button>`).join('')}
                </div>
                <div class="control-row">
                    <label>Интервал <input class="input-field" type="number" min="0.8" max="2.2" step="0.05" value="${element.lineHeight}" data-prop="lineHeight"></label>
                    <label>Отступы <input class="input-field" type="number" min="0" max="60" value="${element.padding || 0}" data-prop="padding"></label>
                </div>
                <button class="tool-button wide accent" data-ai-current="Улучшить текст"><i class="fa-solid fa-wand-magic-sparkles"></i><span>Улучшить текст</span></button>
            </div>
        `;
    } else if (element.type === 'image') {
        specific = `
            <div class="settings-stack">
                <label>Скругление <input class="input-field" type="range" min="0" max="80" value="${element.borderRadius || 0}" data-prop="borderRadius"></label>
                <button class="tool-button wide" data-command="replaceImage"><i class="fa-regular fa-image"></i><span>Заменить изображение</span></button>
                <button class="tool-button wide" data-command="cropImage"><i class="fa-solid fa-crop-simple"></i><span>Обрезка по центру</span></button>
            </div>
        `;
    } else if (element.type === 'shape') {
        specific = `
            <div class="settings-stack">
                <label>Цвет <input class="input-field" type="color" value="${element.fill}" data-prop="fill"></label>
                <label>Обводка <input class="input-field" type="color" value="${element.stroke || '#000000'}" data-prop="stroke"></label>
                <label>Толщина обводки <input class="input-field" type="number" min="0" max="30" value="${element.strokeWidth || 0}" data-prop="strokeWidth"></label>
                <label>Скругление <input class="input-field" type="range" min="0" max="120" value="${element.borderRadius || 0}" data-prop="borderRadius"></label>
            </div>
        `;
    } else if (element.type === 'line') {
        specific = `
            <div class="settings-stack">
                <label>Цвет <input class="input-field" type="color" value="${element.stroke}" data-prop="stroke"></label>
                <label>Толщина <input class="input-field" type="number" min="1" max="24" value="${element.strokeWidth || 3}" data-prop="strokeWidth"></label>
            </div>
        `;
    } else if (element.type === 'table') {
        specific = `
            <div class="settings-stack">
                <label>Цвет текста <input class="input-field" type="color" value="${element.color}" data-prop="color"></label>
                <label>Размер текста <input class="input-field" type="number" min="10" max="36" value="${element.fontSize || 18}" data-prop="fontSize"></label>
                <button class="tool-button wide" data-command="editTable"><i class="fa-solid fa-table"></i><span>Заполнить примером</span></button>
            </div>
        `;
    } else if (element.type === 'chart') {
        specific = `
            <div class="settings-stack">
                <label>Цвет столбцов <input class="input-field" type="color" value="${element.fill}" data-prop="fill"></label>
                <label>Данные <input class="input-field" type="text" value="${element.values.join(', ')}" data-chart-values></label>
            </div>
        `;
    }

    els.properties.innerHTML = specific + base;
    bindPropertyControls();
}

function bindPropertyControls() {
    els.properties.querySelectorAll('[data-prop]').forEach((input) => {
        input.addEventListener('change', () => updateSelectedProperty(input.dataset.prop, readInputValue(input)));
        input.addEventListener('input', () => {
            if (input.type === 'range' || input.type === 'color') updateSelectedProperty(input.dataset.prop, readInputValue(input), true);
        });
    });

    els.properties.querySelectorAll('[data-slide-prop]').forEach((input) => {
        input.addEventListener('change', () => {
            saveSnapshot();
            if (input.dataset.slideProp === 'theme') applyTheme(input.value, false);
            else currentSlide()[input.dataset.slideProp] = input.value;
            render();
        });
    });

    els.properties.querySelectorAll('[data-toggle]').forEach((button) => {
        button.addEventListener('click', () => {
            const element = selectedElement();
            if (!element) return;
            saveSnapshot();
            element[button.dataset.toggle] = !element[button.dataset.toggle];
            render();
        });
    });

    els.properties.querySelectorAll('[data-align]').forEach((button) => {
        button.addEventListener('click', () => updateSelectedProperty('align', button.dataset.align));
    });

    els.properties.querySelectorAll('[data-command]').forEach((button) => {
        button.addEventListener('click', () => runElementCommand(button.dataset.command));
    });

    els.properties.querySelectorAll('[data-ai-current]').forEach((button) => {
        button.addEventListener('click', () => runTextAI(button.dataset.aiCurrent));
    });

    const chartInput = els.properties.querySelector('[data-chart-values]');
    if (chartInput) {
        chartInput.addEventListener('change', () => {
            const values = chartInput.value.split(',').map((value) => Number(value.trim())).filter((value) => Number.isFinite(value) && value > 0);
            if (!values.length) return toast('Введите числа через запятую');
            saveSnapshot();
            selectedElement().values = values;
            render();
        });
    }
}

function addSlide(type) {
    saveSnapshot();
    const newSlide = createSlide(type, els.themeSelect.value || 'modern');
    state.slides.splice(state.selectedSlide + 1, 0, newSlide);
    state.selectedSlide += 1;
    state.selectedElementId = null;
    toast('Слайд добавлен');
    render();
}

function duplicateSlide() {
    saveSnapshot();
    const copy = structuredClone(currentSlide());
    copy.id = id();
    copy.elements.forEach((element) => element.id = id());
    state.slides.splice(state.selectedSlide + 1, 0, copy);
    state.selectedSlide += 1;
    toast('Слайд продублирован');
    render();
}

function confirmDeleteSlide() {
    if (state.slides.length === 1) {
        toast('Нельзя удалить единственный слайд');
        return;
    }
    $('#confirmTitle').textContent = 'Удалить слайд?';
    $('#confirmText').textContent = 'Слайд и все элементы на нём будут удалены. Это действие можно отменить через Undo.';
    $('#confirmActionBtn').onclick = () => {
        closeModal('confirmModal');
        saveSnapshot();
        state.slides.splice(state.selectedSlide, 1);
        state.selectedSlide = Math.max(0, state.selectedSlide - 1);
        state.selectedElementId = null;
        toast('Слайд удалён');
        render();
    };
    openModal('confirmModal');
}

function moveSlide(direction) {
    const next = state.selectedSlide + direction;
    if (next < 0 || next >= state.slides.length) return;
    saveSnapshot();
    [state.slides[state.selectedSlide], state.slides[next]] = [state.slides[next], state.slides[state.selectedSlide]];
    state.selectedSlide = next;
    render();
}

function addElement(type) {
    saveSnapshot();
    const slide = currentSlide();
    const z = nextZ();
    const x = 250 + Math.random() * 80;
    const y = 170 + Math.random() * 50;
    let element;
    if (type === 'text') element = textEl('Новый текст', x, y, 280, 70, 28, currentTheme().fg);
    if (type === 'image') element = imageEl(300, 145, 330, 210, placeholderImage(currentTheme().accent, 'UPLOAD'));
    if (type === 'icon') element = iconEl(420, 220);
    if (type === 'shape') element = shapeEl(330, 170, 240, 140, currentTheme().soft, currentTheme().accent, 2, 18);
    if (type === 'line') element = lineEl(330, 260, 260, 0, currentTheme().accent, 5);
    if (type === 'table') element = tableEl(180, 150, 600, 230, currentTheme().fg);
    if (type === 'chart') element = chartEl(220, 130, 520, 280, currentTheme().accent);
    element.id = id();
    element.z = z;
    slide.elements.push(element);
    state.selectedElementId = element.id;
    toast('Элемент добавлен');
    render();
}

function startDrag(event, elementId) {
    if (event.target.classList.contains('resize-handle')) return;
    const element = getElement(elementId);
    if (!element) return;
    state.selectedElementId = elementId;
    renderProperties();
    interactionSnapshot = snapshot();
    const start = { x: event.clientX, y: event.clientY, left: element.x, top: element.y };
    const node = event.currentTarget;
    node.setPointerCapture(event.pointerId);

    const move = (moveEvent) => {
        const dx = (moveEvent.clientX - start.x) / currentScale();
        const dy = (moveEvent.clientY - start.y) / currentScale();
        element.x = clamp(start.left + dx, -element.w + 20, STAGE.w - 20);
        element.y = clamp(start.top + dy, -element.h + 20, STAGE.h - 20);
        node.style.left = `${element.x}px`;
        node.style.top = `${element.y}px`;
        autosave('Перемещение');
    };

    const up = () => {
        node.removeEventListener('pointermove', move);
        node.removeEventListener('pointerup', up);
        saveSnapshotFromInteraction();
        render();
    };

    node.addEventListener('pointermove', move);
    node.addEventListener('pointerup', up);
}

function startResize(event, elementId) {
    event.stopPropagation();
    const element = getElement(elementId);
    if (!element) return;
    interactionSnapshot = snapshot();
    const start = { x: event.clientX, y: event.clientY, w: element.w, h: element.h };
    const node = event.currentTarget.parentElement;
    event.currentTarget.setPointerCapture(event.pointerId);

    const move = (moveEvent) => {
        const dx = (moveEvent.clientX - start.x) / currentScale();
        const dy = (moveEvent.clientY - start.y) / currentScale();
        element.w = Math.max(24, start.w + dx);
        element.h = Math.max(element.type === 'line' ? 1 : 24, start.h + dy);
        node.style.width = `${element.w}px`;
        node.style.height = `${element.h}px`;
        autosave('Размер');
    };

    const up = () => {
        event.currentTarget.removeEventListener('pointermove', move);
        event.currentTarget.removeEventListener('pointerup', up);
        saveSnapshotFromInteraction();
        render();
    };

    event.currentTarget.addEventListener('pointermove', move);
    event.currentTarget.addEventListener('pointerup', up);
}

function updateSelectedProperty(prop, value, live = false) {
    const element = selectedElement();
    if (!element) return;
    if (!live) saveSnapshot();
    element[prop] = value;
    render();
}

function runElementCommand(command) {
    const element = selectedElement();
    if (!element) return;
    if (command === 'copy') {
        state.clipboard = structuredClone(element);
        toast('Элемент скопирован');
    } else if (command === 'front') {
        saveSnapshot();
        element.z = nextZ();
        render();
    } else if (command === 'back') {
        saveSnapshot();
        element.z = 1;
        normalizeZ();
        render();
    } else if (command === 'replaceImage') {
        uploadTargetElementId = element.id;
        els.imageUpload.click();
    } else if (command === 'cropImage') {
        toast('Изображение обрезается по центру внутри рамки');
    } else if (command === 'editTable') {
        saveSnapshot();
        element.cells = [
            ['Раздел', 'Идея', 'Статус'],
            ['Контент', 'Готов', '✓'],
            ['Дизайн', 'Улучшить', 'AI']
        ];
        render();
    }
}

function deleteSelectedElement() {
    if (!state.selectedElementId) return toast('Выберите элемент');
    saveSnapshot();
    currentSlide().elements = currentSlide().elements.filter((element) => element.id !== state.selectedElementId);
    state.selectedElementId = null;
    toast('Элемент удалён');
    render();
}

function handleImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
        saveSnapshot();
        const element = uploadTargetElementId ? getElement(uploadTargetElementId) : selectedElement();
        if (element && element.type === 'image') {
            element.src = reader.result;
        } else {
            const newElement = imageEl(250, 130, 460, 280, reader.result);
            newElement.id = id();
            newElement.z = nextZ();
            currentSlide().elements.push(newElement);
            state.selectedElementId = newElement.id;
        }
        uploadTargetElementId = null;
        event.target.value = '';
        toast('Изображение загружено');
        render();
    };
    reader.readAsDataURL(file);
}

function applyTheme(themeId, toDeck) {
    const theme = themes[themeId] || themes.modern;
    saveSnapshot();
    const slides = toDeck ? state.slides : [currentSlide()];
    slides.forEach((slide) => {
        slide.theme = themeId;
        slide.background = theme.bg;
        slide.elements.forEach((element) => {
            if (element.type === 'text' || element.type === 'table') element.color = theme.fg;
            if (element.type === 'shape') {
                element.fill = theme.soft;
                element.stroke = theme.accent;
            }
            if (element.type === 'line' || element.type === 'chart') element.stroke ? element.stroke = theme.accent : element.fill = theme.accent;
        });
    });
    toast(toDeck ? 'Шаблон применён ко всей презентации' : 'Шаблон применён к слайду');
    render();
}

async function generateDeckWithAI() {
    const prompt = $('#aiPrompt').value.trim();
    if (!prompt) return toast('Введите запрос для AI');
    $('#aiGenerateBtn').disabled = true;
    $('#aiGenerateBtn').innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i><span>Генерация...</span>';

    try {
        const json = await fetchDeckJson(prompt);
        const slides = deckFromAiJson(json);
        pendingProposal = {
            title: 'Создать презентацию',
            apply: () => {
                saveSnapshot();
                state.title = json.title || 'AI-презентация';
                els.deckTitle.value = state.title;
                state.slides = slides;
                state.selectedSlide = 0;
                state.selectedElementId = null;
            }
        };
        $('#aiProposalTitle').textContent = 'AI предлагает новую презентацию';
        $('#aiProposalPreview').innerHTML = `<strong>${escapeHtml(json.title || 'AI-презентация')}</strong>\n\n${json.slides.map((slide, index) => `${index + 1}. ${slide.title}\n${(slide.points || []).join('\n')}`).join('\n\n')}`;
        closeModal('aiModal');
        openModal('aiProposalModal');
    } catch (error) {
        const fallback = fallbackDeck(prompt);
        pendingProposal = {
            title: 'Создать презентацию',
            apply: () => {
                saveSnapshot();
                state.title = fallback.title;
                els.deckTitle.value = state.title;
                state.slides = deckFromAiJson(fallback);
                state.selectedSlide = 0;
            }
        };
        $('#aiProposalTitle').textContent = 'AI-план готов офлайн';
        $('#aiProposalPreview').textContent = fallback.slides.map((slide, index) => `${index + 1}. ${slide.title}\n${slide.points.join('\n')}`).join('\n\n');
        closeModal('aiModal');
        openModal('aiProposalModal');
    } finally {
        $('#aiGenerateBtn').disabled = false;
        $('#aiGenerateBtn').innerHTML = '<i class="fa-solid fa-wand-magic-sparkles"></i><span>Сгенерировать структуру</span>';
    }
}

async function runTextAI(command) {
    const element = selectedElement();
    if (!element || element.type !== 'text') return toast('Выберите текстовый блок');
    const source = element.content;
    const proposed = await transformText(command, source);
    pendingProposal = {
        title: command,
        apply: () => {
            saveSnapshot();
            element.content = proposed;
        }
    };
    $('#aiProposalTitle').textContent = command;
    $('#aiProposalPreview').textContent = proposed;
    closeModal('aiModal');
    openModal('aiProposalModal');
}

async function runDesignAI(command) {
    const proposal = designProposal(command);
    pendingProposal = {
        title: command,
        apply: () => {
            saveSnapshot();
            proposal.apply();
        }
    };
    $('#aiProposalTitle').textContent = command;
    $('#aiProposalPreview').textContent = proposal.description;
    closeModal('aiModal');
    openModal('aiProposalModal');
}

function applyAiProposal() {
    if (!pendingProposal) return;
    pendingProposal.apply();
    pendingProposal = null;
    closeModal('aiProposalModal');
    toast('Изменения AI применены');
    render();
}

async function fetchDeckJson(prompt) {
    const system = `Создай презентацию на русском языке по запросу: "${prompt}". Верни только JSON без markdown. Формат: {"title":"...","theme":"modern","slides":[{"type":"title|headingText|twoBlocks|textImage|imageText|imageOnly|quote|stats|chart|table|final","title":"...","points":["..."],"visual":"..."}]}. Сделай 6-10 слайдов, если число не указано.`;
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: system }] }], generationConfig: { temperature: 0.7 } })
    });
    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    return JSON.parse(text.replace(/```json|```/g, '').trim());
}

function deckFromAiJson(json) {
    const themeId = themes[json.theme] ? json.theme : 'modern';
    return (json.slides || []).map((item, index, arr) => {
        const type = item.type || (index === 0 ? 'title' : index === arr.length - 1 ? 'final' : 'headingText');
        const slide = createSlide(type, themeId);
        const textElements = slide.elements.filter((element) => element.type === 'text');
        if (textElements[0]) textElements[0].content = item.title || textElements[0].content;
        if (textElements[1]) textElements[1].content = (item.points || []).join('\n') || item.visual || textElements[1].content;
        if (type === 'stats') {
            textElements.forEach((element, textIndex) => {
                if (textIndex > 0 && item.points?.[textIndex - 1]) element.content = item.points[textIndex - 1];
            });
        }
        slide.elements.push({
            id: id(),
            z: nextZFor(slide),
            ...textEl(item.visual ? `Визуал: ${item.visual}` : 'Визуальная идея: добавить схему, фото или иконки', 620, 410, 280, 62, 16, themes[themeId].accent)
        });
        return slide;
    });
}

function fallbackDeck(prompt) {
    const topic = prompt.replace(/создай презентацию|на тему|для школьников|слайдов|\d+/gi, '').trim() || 'Новая тема';
    return {
        title: `Презентация: ${topic}`,
        theme: 'modern',
        slides: [
            { type: 'title', title: topic, points: ['Краткое введение в тему'], visual: 'Крупный заголовок и акцентная форма' },
            { type: 'headingText', title: 'Почему это важно', points: ['Связь с реальной жизнью', 'Практическая польза', 'Интересные факты'], visual: 'Иконки преимуществ' },
            { type: 'twoBlocks', title: 'Основные понятия', points: ['Что нужно знать сначала', 'Как это применяется'], visual: 'Два смысловых блока' },
            { type: 'chart', title: 'Данные и примеры', points: ['Сравнение показателей', 'Рост интереса', 'Наглядная диаграмма'], visual: 'Столбчатый график' },
            { type: 'table', title: 'Сравнение', points: ['Параметры', 'Преимущества', 'Ограничения'], visual: 'Таблица' },
            { type: 'final', title: 'Вывод', points: ['Главная мысль', 'Вопросы для обсуждения'], visual: 'Минимальный финальный слайд' }
        ]
    };
}

async function transformText(command, source) {
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: `${command}. Верни только новый текст на русском языке без пояснений:\n${source}` }] }], generationConfig: { temperature: 0.65 } })
        });
        const data = await response.json();
        return data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || localTextTransform(command, source);
    } catch {
        return localTextTransform(command, source);
    }
}

function localTextTransform(command, source) {
    const clean = source.trim();
    if (command.includes('Сократить')) return clean.split(/[.!?]/).filter(Boolean).slice(0, 2).join('. ') + '.';
    if (command.includes('Расширить')) return `${clean}\n\nЭто можно объяснить через пример, ключевые факты и короткий вывод для аудитории.`;
    if (command.includes('официальным')) return `Следует отметить, что ${clean.charAt(0).toLowerCase()}${clean.slice(1)}`;
    if (command.includes('простым')) return `Проще говоря: ${clean}`;
    if (command.includes('убедительным')) return `${clean}\n\nГлавный аргумент: это помогает быстрее понять тему и применить знания на практике.`;
    if (command.includes('Перевести')) return `English version: ${clean}`;
    return clean.replace(/\s+/g, ' ').replace(/^./, (char) => char.toUpperCase());
}

function designProposal(command) {
    const slide = currentSlide();
    if (command.includes('минималистично')) {
        return { description: 'Фон станет белым, текст тёмным, лишние декоративные элементы будут приглушены, блоки выровнены по сетке.', apply: () => applyTheme('minimal', false) };
    }
    if (command.includes('корпоративный')) {
        return { description: 'Будет применён деловой стиль Business: светлый фон, синий акцент, строгие отступы и единая типографика.', apply: () => applyTheme('business', false) };
    }
    if (command.includes('палитру')) {
        return { description: 'AI подберёт спокойную современную палитру: бирюзовый акцент, светлый фон и контрастный текст.', apply: () => applyTheme('modern', false) };
    }
    if (command.includes('Выровнять')) {
        return {
            description: 'Элементы выбранного слайда будут выровнены по аккуратной сетке с равными отступами.',
            apply: () => alignSlideElements(slide)
        };
    }
    if (command.includes('единый стиль')) {
        return { description: 'Единый стиль Modern будет применён ко всем слайдам презентации.', apply: () => applyTheme('modern', true) };
    }
    return {
        description: 'Будут усилены контраст, отступы и визуальная иерархия выбранного слайда. Текстовые блоки станут крупнее, формы получат аккуратные акценты.',
        apply: () => {
            slide.elements.forEach((element) => {
                if (element.type === 'text') {
                    element.fontFamily = 'Inter';
                    element.lineHeight = 1.18;
                }
                if (element.type === 'shape') {
                    element.borderRadius = Math.max(element.borderRadius || 0, 18);
                    element.opacity = 0.92;
                }
            });
            alignSlideElements(slide);
        }
    };
}

function alignSlideElements(slide) {
    const margin = 60;
    slide.elements.forEach((element) => {
        element.x = Math.round(element.x / 10) * 10;
        element.y = Math.round(element.y / 10) * 10;
        element.x = clamp(element.x, margin, STAGE.w - element.w - margin / 2);
        element.y = clamp(element.y, 40, STAGE.h - element.h - 40);
    });
}

function openPreview() {
    previewIndex = state.selectedSlide;
    $('#previewMode').classList.add('active');
    $('#previewMode').setAttribute('aria-hidden', 'false');
    renderPreview();
}

function closePreview() {
    $('#previewMode').classList.remove('active');
    $('#previewMode').setAttribute('aria-hidden', 'true');
}

function navigatePreview(direction) {
    previewIndex = clamp(previewIndex + direction, 0, state.slides.length - 1);
    renderPreview();
}

function renderPreview() {
    const slide = state.slides[previewIndex];
    const preview = $('#previewSlide');
    preview.style.background = slide.background;
    preview.innerHTML = '';
    slide.elements.slice().sort((a, b) => (a.z || 0) - (b.z || 0)).forEach((element) => preview.appendChild(createElementNode(element, false)));
    $('#previewCounter').textContent = `${previewIndex + 1} / ${state.slides.length}`;
}

async function exportPdf() {
    const status = $('#exportStatus');
    const button = $('#startExportBtn');
    button.disabled = true;
    button.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i><span>Генерация...</span>';
    status.textContent = 'Подготовка страниц...';

    try {
        if (!window.jspdf || !window.html2canvas) {
            status.textContent = 'Внешние PDF-библиотеки недоступны. Использую встроенный экспорт...';
            await exportPdfFallback(status);
            closeModal('exportModal');
            toast('PDF скачан');
            return;
        }

        const { jsPDF } = window.jspdf;
        const format = $('#pdfFormat').value;
        const orientation = $('#pdfOrientation').value;
        const quality = Number($('#pdfQuality').value);
        const includeNumbers = $('#pdfSlideNumbers').checked;
        const pdf = new jsPDF({ orientation, unit: 'pt', format });
        const pageW = pdf.internal.pageSize.getWidth();
        const pageH = pdf.internal.pageSize.getHeight();
        const root = $('#exportRoot');
        root.innerHTML = '';

        for (let i = 0; i < state.slides.length; i += 1) {
            status.textContent = `Генерация слайда ${i + 1} из ${state.slides.length}...`;
            const slideNode = renderSlideForExport(state.slides[i], includeNumbers ? i + 1 : null);
            root.appendChild(slideNode);
            const canvas = await html2canvas(slideNode, { scale: quality, backgroundColor: null, useCORS: true });
            const img = canvas.toDataURL('image/png');
            if (i > 0) pdf.addPage(format, orientation);
            pdf.addImage(img, 'PNG', 0, 0, pageW, pageH);
            root.removeChild(slideNode);
        }

        pdf.save(`${safeFileName(state.title)}.pdf`);
        status.textContent = 'PDF готов.';
        closeModal('exportModal');
        toast('PDF скачан');
    } catch (error) {
        console.error(error);
        status.textContent = 'Не удалось сформировать PDF. Проверьте подключение библиотек.';
    } finally {
        button.disabled = false;
        button.innerHTML = '<i class="fa-solid fa-download"></i><span>Сформировать PDF</span>';
    }
}

async function exportPdfFallback(status) {
    const format = $('#pdfFormat').value;
    const orientation = $('#pdfOrientation').value;
    const quality = Number($('#pdfQuality').value);
    const includeNumbers = $('#pdfSlideNumbers').checked;
    const page = pdfPageSize(format, orientation);
    const images = [];

    for (let i = 0; i < state.slides.length; i += 1) {
        status.textContent = `Встроенный экспорт: слайд ${i + 1} из ${state.slides.length}...`;
        images.push(await slideToJpeg(state.slides[i], includeNumbers ? i + 1 : null, quality));
    }

    const pdfBytes = buildImagePdf(images, page.width, page.height);
    downloadBlob(new Blob([pdfBytes], { type: 'application/pdf' }), `${safeFileName(state.title)}.pdf`);
}

function pdfPageSize(format, orientation) {
    const sizes = {
        a4: { width: 595.28, height: 841.89 },
        letter: { width: 612, height: 792 }
    };
    const base = sizes[format] || sizes.a4;
    if (orientation === 'landscape') return { width: base.height, height: base.width };
    return base;
}

function slideToJpeg(slide, number, quality) {
    return new Promise((resolve, reject) => {
        const svg = `
            <svg xmlns="http://www.w3.org/2000/svg" width="${STAGE.w}" height="${STAGE.h}" viewBox="0 0 ${STAGE.w} ${STAGE.h}">
                <foreignObject width="100%" height="100%">
                    ${slideToInlineHtml(slide, number)}
                </foreignObject>
            </svg>
        `;
        const image = new Image();
        const svgBlob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(svgBlob);
        image.onload = () => {
            const scale = Math.max(1, quality || 1);
            const canvas = document.createElement('canvas');
            canvas.width = STAGE.w * scale;
            canvas.height = STAGE.h * scale;
            const ctx = canvas.getContext('2d');
            ctx.fillStyle = slide.background;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
            URL.revokeObjectURL(url);
            resolve({
                width: canvas.width,
                height: canvas.height,
                bytes: base64ToBytes(canvas.toDataURL('image/jpeg', 0.94).split(',')[1])
            });
        };
        image.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error('Не удалось отрисовать слайд для PDF'));
        };
        image.src = url;
    });
}

function slideToInlineHtml(slide, number) {
    const children = slide.elements
        .slice()
        .sort((a, b) => (a.z || 0) - (b.z || 0))
        .map(elementToInlineHtml)
        .join('');
    const pageNumber = number ? `<div style="position:absolute;right:22px;bottom:16px;color:rgba(15,23,42,.55);font:700 14px Arial,sans-serif;z-index:9999">${number}</div>` : '';
    return `
        <div xmlns="http://www.w3.org/1999/xhtml" style="position:relative;width:${STAGE.w}px;height:${STAGE.h}px;overflow:hidden;background:${escapeAttr(slide.background)};font-family:Inter,Arial,sans-serif;color:#111827">
            ${children}${pageNumber}
        </div>
    `;
}

function elementToInlineHtml(element) {
    const base = `position:absolute;left:${element.x}px;top:${element.y}px;width:${element.w}px;height:${element.h}px;z-index:${element.z || 1};opacity:${element.opacity ?? 1};transform:rotate(${element.rotation || 0}deg);overflow:hidden;box-sizing:border-box;`;
    if (element.type === 'text') {
        return `<div style="${base}font-family:${escapeAttr(element.fontFamily || 'Inter')},Arial,sans-serif;font-size:${element.fontSize}px;color:${escapeAttr(element.color)};font-weight:${element.bold ? 800 : 500};font-style:${element.italic ? 'italic' : 'normal'};text-decoration:${element.underline ? 'underline' : 'none'};text-align:${element.align};line-height:${element.lineHeight};padding:${element.padding || 0}px;white-space:pre-wrap;">${escapeHtml(element.content)}</div>`;
    }
    if (element.type === 'image') {
        return `<div style="${base}border-radius:${element.borderRadius || 0}px;"><img src="${escapeAttr(element.src)}" style="width:100%;height:100%;object-fit:cover;display:block;border-radius:${element.borderRadius || 0}px;" /></div>`;
    }
    if (element.type === 'shape') {
        return `<div style="${base}background:${escapeAttr(element.fill)};border:${element.strokeWidth || 0}px solid ${escapeAttr(element.stroke || 'transparent')};border-radius:${element.borderRadius || 0}px;"></div>`;
    }
    if (element.type === 'line') {
        return `<div style="${base}height:${element.strokeWidth || 3}px;background:${escapeAttr(element.stroke)};border-radius:999px;"></div>`;
    }
    if (element.type === 'table') {
        const rows = element.cells.map((row) => `<tr>${row.map((cell) => `<td style="border:1px solid currentColor;padding:7px;">${escapeHtml(cell)}</td>`).join('')}</tr>`).join('');
        return `<div style="${base}color:${escapeAttr(element.color)};font-size:${element.fontSize || 18}px;"><table style="width:100%;height:100%;border-collapse:collapse;color:inherit;font:inherit;">${rows}</table></div>`;
    }
    if (element.type === 'chart') {
        const max = Math.max(...element.values, 1);
        const bars = element.values.map((value) => `<span style="flex:1;height:${(value / max) * 100}%;border-radius:6px 6px 0 0;background:${escapeAttr(element.fill)};"></span>`).join('');
        return `<div style="${base}display:flex;align-items:flex-end;gap:10px;padding:16px;">${bars}</div>`;
    }
    return '';
}

function buildImagePdf(images, pageW, pageH) {
    const encoder = new TextEncoder();
    const chunks = [];
    const offsets = [0];
    let length = 0;
    const addBytes = (bytes) => {
        chunks.push(bytes);
        length += bytes.length;
    };
    const addString = (text) => addBytes(encoder.encode(text));
    const objects = [];

    objects.push({ id: 1, body: '<< /Type /Catalog /Pages 2 0 R >>' });
    const kids = images.map((_, index) => `${3 + index * 3} 0 R`).join(' ');
    objects.push({ id: 2, body: `<< /Type /Pages /Kids [${kids}] /Count ${images.length} >>` });
    images.forEach((image, index) => {
        const pageObj = 3 + index * 3;
        const contentObj = pageObj + 1;
        const imageObj = pageObj + 2;
        const imageName = `Im${index}`;
        const content = `q\n${pageW} 0 0 ${pageH} 0 0 cm\n/${imageName} Do\nQ`;
        objects.push({ id: pageObj, body: `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageW} ${pageH}] /Resources << /XObject << /${imageName} ${imageObj} 0 R >> >> /Contents ${contentObj} 0 R >>` });
        objects.push({ id: contentObj, body: `<< /Length ${content.length} >>\nstream\n${content}\nendstream` });
        objects.push({
            id: imageObj,
            binary: image.bytes,
            head: `<< /Type /XObject /Subtype /Image /Width ${image.width} /Height ${image.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${image.bytes.length} >>\nstream\n`,
            tail: '\nendstream'
        });
    });

    addString('%PDF-1.4\n%\xFF\xFF\xFF\xFF\n');
    objects.sort((a, b) => a.id - b.id).forEach((object) => {
        offsets[object.id] = length;
        addString(`${object.id} 0 obj\n`);
        if (object.binary) {
            addString(object.head);
            addBytes(object.binary);
            addString(object.tail);
        } else {
            addString(object.body);
        }
        addString('\nendobj\n');
    });

    const xrefOffset = length;
    addString(`xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`);
    for (let i = 1; i <= objects.length; i += 1) {
        addString(`${String(offsets[i]).padStart(10, '0')} 00000 n \n`);
    }
    addString(`trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`);

    const output = new Uint8Array(length);
    let cursor = 0;
    chunks.forEach((chunk) => {
        output.set(chunk, cursor);
        cursor += chunk.length;
    });
    return output;
}

function base64ToBytes(base64) {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
    return bytes;
}

function downloadBlob(blob, fileName) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
}

function renderSlideForExport(slide, number) {
    const node = document.createElement('div');
    node.className = 'render-slide';
    node.style.background = slide.background;
    slide.elements.slice().sort((a, b) => (a.z || 0) - (b.z || 0)).forEach((element) => node.appendChild(createElementNode(element, false)));
    if (number) {
        const page = document.createElement('div');
        page.textContent = String(number);
        page.style.cssText = 'position:absolute;right:22px;bottom:16px;color:rgba(15,23,42,.55);font:700 14px Inter,sans-serif;z-index:9999;';
        node.appendChild(page);
    }
    return node;
}

function shareDeck() {
    saveNow();
    const payload = btoa(unescape(encodeURIComponent(JSON.stringify(minimalState()))));
    const url = `${location.origin}${location.pathname}?deck=${payload}`;
    navigator.clipboard?.writeText(url).then(() => toast('Ссылка скопирована')).catch(() => {
        prompt('Скопируйте ссылку:', url);
    });
}

function handleKeyboard(event) {
    const tag = document.activeElement?.tagName;
    const editing = document.activeElement?.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(tag);
    if ($('#previewMode').classList.contains('active')) {
        if (event.key === 'ArrowLeft') navigatePreview(-1);
        if (event.key === 'ArrowRight') navigatePreview(1);
        if (event.key === 'Escape') closePreview();
        return;
    }
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'z') {
        event.preventDefault();
        event.shiftKey ? redo() : undo();
    }
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'y') {
        event.preventDefault();
        redo();
    }
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'c' && state.selectedElementId) {
        state.clipboard = structuredClone(selectedElement());
        toast('Элемент скопирован');
    }
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'v' && state.clipboard) {
        event.preventDefault();
        saveSnapshot();
        const copy = structuredClone(state.clipboard);
        copy.id = id();
        copy.x += 24;
        copy.y += 24;
        copy.z = nextZ();
        currentSlide().elements.push(copy);
        state.selectedElementId = copy.id;
        render();
    }
    if (!editing && (event.key === 'Delete' || event.key === 'Backspace')) deleteSelectedElement();
}

function undo() {
    if (!state.history.length) return;
    state.future.push(snapshot());
    const previous = state.history.pop();
    restore(previous);
    render();
}

function redo() {
    if (!state.future.length) return;
    state.history.push(snapshot());
    restore(state.future.pop());
    render();
}

function saveSnapshot() {
    state.history.push(snapshot());
    if (state.history.length > 60) state.history.shift();
    state.future = [];
}

function saveSnapshotFromInteraction() {
    if (!interactionSnapshot) return;
    state.history.push(interactionSnapshot);
    if (state.history.length > 60) state.history.shift();
    state.future = [];
    interactionSnapshot = null;
}

function snapshot() {
    return JSON.stringify(minimalState());
}

function restore(serialized) {
    const restored = JSON.parse(serialized);
    state.title = restored.title;
    state.selectedSlide = restored.selectedSlide;
    state.selectedElementId = restored.selectedElementId;
    state.slides = restored.slides;
    els.deckTitle.value = state.title;
}

function minimalState() {
    return {
        title: state.title,
        selectedSlide: state.selectedSlide,
        selectedElementId: state.selectedElementId,
        slides: state.slides
    };
}

function loadState() {
    const urlDeck = new URLSearchParams(location.search).get('deck');
    if (urlDeck) {
        try {
            const parsed = JSON.parse(decodeURIComponent(escape(atob(urlDeck))));
            return { history: [], future: [], ...parsed };
        } catch {
            toast('Ссылка презентации повреждена');
        }
    }
    try {
        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
        return saved ? { history: [], future: [], ...saved } : null;
    } catch {
        return null;
    }
}

function saveNow() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(minimalState()));
    autosave('Сохранено');
}

function scheduleSave() {
    clearTimeout(saveTimer);
    autosave('Есть изменения');
    saveTimer = setTimeout(saveNow, 500);
}

function autosave(text) {
    els.autosave.innerHTML = `<i class="fa-solid fa-cloud"></i> ${text}`;
}

function currentSlide() {
    return state.slides[state.selectedSlide];
}

function currentTheme() {
    return themes[currentSlide()?.theme || 'modern'] || themes.modern;
}

function selectedElement() {
    return getElement(state.selectedElementId);
}

function getElement(elementId) {
    return currentSlide()?.elements.find((element) => element.id === elementId);
}

function selectElement(elementId) {
    state.selectedElementId = elementId;
    render();
}

function nextZ() {
    return nextZFor(currentSlide());
}

function nextZFor(slide) {
    return Math.max(0, ...slide.elements.map((element) => element.z || 0)) + 1;
}

function normalizeZ() {
    currentSlide().elements.sort((a, b) => (a.z || 0) - (b.z || 0)).forEach((element, index) => element.z = index + 1);
}

function labelForElement(element) {
    return ({ text: 'Текст', image: 'Изображение', shape: 'Фигура', line: 'Линия', table: 'Таблица', chart: 'График' })[element.type] || 'Элемент';
}

function currentScale() {
    const rect = els.stage.getBoundingClientRect();
    return rect.width / STAGE.w;
}

function readInputValue(input) {
    if (input.type === 'number' || input.type === 'range') return Number(input.value);
    return input.value;
}

function openModal(idName) {
    const modal = document.getElementById(idName);
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
}

function closeModal(idName) {
    const modal = document.getElementById(idName);
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
}

function addAiCommandButton(target, label, handler) {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = label;
    button.addEventListener('click', handler);
    document.querySelector(target).appendChild(button);
}

function toast(message) {
    if (!els.toastStack) return;
    const node = document.createElement('div');
    node.className = 'toast';
    node.textContent = message;
    els.toastStack.appendChild(node);
    setTimeout(() => node.remove(), 2600);
}

function placeholderImage(color, text) {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="960" height="540" viewBox="0 0 960 540"><rect width="960" height="540" fill="${color}"/><circle cx="740" cy="120" r="90" fill="rgba(255,255,255,.26)"/><path d="M70 420 260 230l150 135 90-85 190 140z" fill="rgba(255,255,255,.72)"/><text x="70" y="105" font-family="Arial" font-size="56" font-weight="700" fill="rgba(255,255,255,.92)">${text}</text></svg>`;
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function id() {
    return `id-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
}

function plural(value, words) {
    const abs = Math.abs(value) % 100;
    const last = abs % 10;
    if (abs > 10 && abs < 20) return words[2];
    if (last > 1 && last < 5) return words[1];
    if (last === 1) return words[0];
    return words[2];
}

function safeFileName(name) {
    return (name || 'presentation').replace(/[<>:"/\\|?*]+/g, '').trim() || 'presentation';
}

function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' })[char]);
}

function escapeAttr(value) {
    return escapeHtml(value).replace(/`/g, '&#096;');
}
