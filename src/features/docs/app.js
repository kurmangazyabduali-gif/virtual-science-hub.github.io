/* =====================================================
   ASHYQDOC — AI TEACHER DOCUMENTATION ENGINE JS
   Multi-Tier AI Generation (OpenAI / Gemini / Pollinations)
   DOCX & PDF Export + Live Editable A4 Paper Canvas
   ===================================================== */

// Encoded fallback key
const _f = 'QUl6YVN5RHctc29ocENjNl9FWHU4dmdTNDc1Y19tSFp5R1FFbUtN';
const FALLBACK_GEMINI_KEY = atob(_f);
const API_KEY = localStorage.getItem('vsh-api-key') || '';

// Document Categories & Types Database
const DOC_TYPES_DB = {
    plans: [
        { id: 'qmj', name: 'Қысқа мерзімді сабақ жоспары (ҚМЖ / КСП)', desc: 'Поурочный план по обновленной программе с дескрипторами и дифференциацией' },
        { id: 'omj', name: 'Орта мерзімді / Күнтізбелік жоспар (ОМЖ / КТП)', desc: 'Тематический план раздела на четверть с целями обучения' },
        { id: 'tech_map', name: 'Сабақтың технологиялық картасы', desc: 'Поминутный тайминг и действия учителя и учеников' },
        { id: 'open_lesson', name: 'Ашық сабақтың әдістемелік сценарийі (STEAM)', desc: 'План открытого урока с межпредметной интеграцией' }
    ],
    assess: [
        { id: 'sor', name: 'Бөлім бойынша жиынтық бағалау (БЖБ / СОР)', desc: '2 варианта заданий + дескрипторы и баллы (рубрикатор)' },
        { id: 'soch', name: 'Тоқсандық жиынтық бағалау (ТЖБ / СОЧ)', desc: 'Комплексная контрольная со спецификацией и схемой выставления баллов' },
        { id: 'test', name: 'Тест тапсырмалары (15–20 сұрақ + жауап кілттері)', desc: 'Тест с 4 вариантами ответов, ключами и пояснениями' },
        { id: 'cards_abc', name: 'Деңгейлік тапсырмалар карточкалары (A, B, C деңгейі)', desc: 'Дифференцированные карточки для слабоуспевающих и одаренных' }
    ],
    labs: [
        { id: 'lab_guide', name: 'Зертханалық жұмыстың әдістемелік нұсқаулығы', desc: 'Цель, приборы, ТБ, теория, ход работы, формулы и таблицы' },
        { id: 'lab_worksheet', name: 'Оқушының зертханалық есеп бланкісі (Worksheet)', desc: 'Готовый бланк для печати и заполнения учеником' },
        { id: 'practicum', name: 'Практикалық жұмыс парағы', desc: 'Практическая работа с расчетными и графическими заданиями' }
    ],
    class: [
        { id: 'class_hour', name: 'Тәрбие сағаты / Сынып сағатының сценарийі', desc: 'Сценарий классного часа с интерактивными играми и вопросами' },
        { id: 'student_char', name: 'Оқушыға педагогикалық мінездеме (Характеристика)', desc: 'Академическая успеваемость, личностные качества и рекомендации' },
        { id: 'parent_meeting', name: 'Ата-аналар жиналысының жоспары мен хаттамасы', desc: 'Повестка дня, тезисы доклада и готовый протокол' }
    ],
    reports: [
        { id: 'sor_analysis', name: 'БЖБ және ТЖБ нәтижелерін талдау анықтамасы', desc: 'Аналитическая справка: качество знаний, типичные ошибки и коррекция' },
        { id: 'science_project', name: 'Оқушының ғылыми жоба төлқұжаты (Паспорт)', desc: 'Актуальность, гипотеза, цель, задачи и план исследования' },
        { id: 'self_report', name: 'Мұғалімнің өзін-өзі дамыту есебі (Портфолио)', desc: 'Индивидуальный план и отчет по профессиональному развитию' }
    ]
};

// Topic Chips Presets per Subject
const TOPIC_CHIPS_PRESETS = {
    'Физика': [
        'Тізбек бөлігі үшін Ом заңы және кедергі',
        'Ньютонның екінші заңы және динамика',
        'Архимед заңы және денелердің жүзу шарттары',
        'Жарықтың шағылу және сыну заңдары',
        'Жұмыс, қуат және пайдалы әсер коэффициенті'
    ],
    'Химия': [
        'Д.И. Менделеевтің периодтық заңы және атом құрылысы',
        'Бейорганикалық қосылыстардың негізгі кластары',
        'Химиялық байланыс түрлері: ковалентті және иондық',
        'Бейтараптану реакциясы және ерітінділердің рН көрсеткіші',
        'Металдардың белсенділік қатары және олардың қасиеттері'
    ],
    'Биология': [
        'Өсімдік және жануар жасушасының құрылысы',
        'Фотосинтез процесі және пластикалық алмасу',
        'ДНҚ құрылымы және генетикалық код',
        'Адамның тыныс алу және қан айналым жүйесі',
        'Митоз және мейоз: жасушаның бөліну заңдылықтары'
    ],
    'Математика': [
        'Жай бөлшектерге амалдар қолдану',
        'Бір айнымалысы бар сызықтық теңдеулер',
        'Пропорция және оның негізгі қасиеті',
        'Пайызға арналған мәтіндік есептер',
        'Бүтін сандарды қосу және азайту ережелері'
    ],
    'Алгебра': [
        'Квадрат теңдеулер және Виет теоремасы',
        'Арифметикалық және геометриялық прогрессия',
        'Тригонометриялық функциялардың қасиеттері',
        'Функцияның туындысы және оны есептеу',
        'Екі айнымалысы бар сызықтық теңдеулер жүйесі'
    ],
    'Геометрия': [
        'Пифагор теоремасы және тікбұрышты үшбұрыш',
        'Үшбұрыштардың теңдік және ұқсастық белгілері',
        'Шеңбер және дөңгелек: ұзындығы мен ауданы',
        'Векторлар және оларға амалдар қолдану',
        'Көпбұрыштардың аудандарын есептеу'
    ],
    'Информатика': [
        'Python тіліндегі шартты операторлар (if-else)',
        'Циклдік алгоритмдер: for және while циклдері',
        'Деректер базасы және SQL сұраныстары',
        'Компьютерлік желілер және киберқауіпсіздік',
        'Жасанды интеллект және машиналық оқыту негіздері'
    ],
    'Қазақ тілі': [
        'Зат есімнің септелуі және тәуелденуі',
        'Құрмалас сөйлемнің түрлері: салалас және сабақтас',
        'Сөзжасам және сөз тіркестерінің байланысу тәсілдері',
        'Етістіктің райлары және шақ түрлері',
        'Төл сөз бен төлеу сөздің тыныс белгілері'
    ],
    'Қазақ әдебиеті': [
        'Абай Құнанбаевтың «Қара сөздері» мен философиясы',
        'Мұхтар Әуезов «Абай жолы» роман-эпопеясы',
        'Шоқан Уәлихановтың ғылыми және әдеби мұрасы',
        'Қазақ батырлар жыры: «Алпамыс батыр»',
        'Мағжан Жұмабаевтың лирикалық шығармалары'
    ],
    'Қазақстан тарихы': [
        'Қазақ хандығының құрылуы және Керей мен Жәнібек',
        'Кенесары Қасымұлы бастаған ұлт-азаттық көтеріліс',
        'Алаш қозғалысы және Әлихан Бөкейхановтың қызметі',
        'Тәуелсіз Қазақстанның қалыптасу кезеңдері',
        'Ұлы Жібек жолының Қазақстан аумағындағы тарихи маңызы'
    ]
};

document.addEventListener('DOMContentLoaded', function () {
    // DOM Elements
    const categoryTabs     = document.querySelectorAll('.cat-tab');
    const selectDocType    = document.getElementById('select-doc-type');
    const selectSubject    = document.getElementById('select-subject');
    const selectGrade      = document.getElementById('select-grade');
    const selectLanguage   = document.getElementById('select-language');
    const inputTopic       = document.getElementById('input-topic');
    const topicChipsBox    = document.getElementById('topic-chips');
    const inputTeacher     = document.getElementById('input-teacher-name');
    const inputSchool      = document.getElementById('input-school-name');
    const btnGenerate      = document.getElementById('btn-generate-doc');
    const btnGenIcon       = document.getElementById('btn-gen-icon');
    const btnGenText       = document.getElementById('btn-gen-text');
    const genProgressBox   = document.getElementById('gen-progress');
    const genProgressFill  = document.getElementById('gen-progress-fill');
    const genProgressLabel = document.getElementById('gen-progress-label');

    // Toolbar Elements
    const previewDocTitle  = document.getElementById('preview-doc-title');
    const docStatusText    = document.getElementById('doc-status-text');
    const a4DocumentPaper  = document.getElementById('a4-document-paper');
    const btnExportDocx    = document.getElementById('btn-export-docx');
    const btnExportPdf     = document.getElementById('btn-export-pdf');
    const btnPrintDoc      = document.getElementById('btn-print-doc');
    const btnCopyDoc       = document.getElementById('btn-copy-doc');

    let activeCategory = 'plans';

    // ── Category Tab Switcher ──
    categoryTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            categoryTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            activeCategory = this.getAttribute('data-category');
            renderDocTypesSelect();
            updateDocTitleBadge();
        });
    });

    function renderDocTypesSelect() {
        const types = DOC_TYPES_DB[activeCategory] || DOC_TYPES_DB.plans;
        selectDocType.innerHTML = '';
        types.forEach(t => {
            const opt = document.createElement('option');
            opt.value = t.id;
            opt.textContent = t.name;
            selectDocType.appendChild(opt);
        });
    }

    // ── Update Topic Chips on Subject Change ──
    function renderTopicChips() {
        const subject = selectSubject.value;
        const chips = TOPIC_CHIPS_PRESETS[subject] || TOPIC_CHIPS_PRESETS['Физика'];
        topicChipsBox.innerHTML = '';

        chips.forEach(text => {
            const chip = document.createElement('span');
            chip.className = 'topic-chip';
            chip.textContent = text;
            chip.addEventListener('click', () => {
                inputTopic.value = text;
                inputTopic.focus();
            });
            topicChipsBox.appendChild(chip);
        });
    }

    function updateDocTitleBadge() {
        const selectedType = selectDocType.options[selectDocType.selectedIndex];
        if (selectedType && previewDocTitle) {
            previewDocTitle.innerHTML = `<i class="fa-solid fa-file-lines"></i> ${selectedType.text}`;
        }
    }

    selectSubject.addEventListener('change', renderTopicChips);
    selectDocType.addEventListener('change', updateDocTitleBadge);

    // Initial population
    renderDocTypesSelect();
    renderTopicChips();

    // ── Generate Button Click ──
    btnGenerate.addEventListener('click', async function() {
        const topic = inputTopic.value.trim();
        if (!topic) {
            showToast('Пожалуйста, введите тему или цель урока', 'error');
            inputTopic.focus();
            return;
        }

        const docTypeId = selectDocType.value;
        const docTypeName = selectDocType.options[selectDocType.selectedIndex].text;
        const subject = selectSubject.value;
        const grade = selectGrade.value;
        const lang = selectLanguage.value;
        const teacher = inputTeacher.value.trim() || 'Пән мұғалімі';
        const school = inputSchool.value.trim() || '«№ 1 мектеп-лицей» КММ';

        btnGenerate.disabled = true;
        btnGenIcon.className = 'fa-solid fa-spinner fa-spin';
        btnGenText.textContent = 'ИИ формирует официальный документ...';
        genProgressBox.classList.remove('hidden');
        setGenProgress(20, 'Анализ методических требований ГОСО/МОН...');
        docStatusText.textContent = 'Генерация документа через ИИ...';

        try {
            setGenProgress(45, `Генерация «${docTypeName}»...`);
            const htmlResult = await callUniversalDocAI({
                category: activeCategory,
                docTypeId,
                docTypeName,
                subject,
                grade,
                lang,
                topic,
                teacher,
                school
            });

            setGenProgress(85, 'Форматирование таблиц и верстка A4...');
            await sleep(250);

            a4DocumentPaper.innerHTML = htmlResult;
            updateDocTitleBadge();
            docStatusText.textContent = `Документ готов: ${docTypeName}`;
            setGenProgress(100, '✅ Документ готов к печати и скачиванию!');
            showToast('Официальный документ успешно сгенерирован!', 'success');

        } catch (err) {
            console.error('[Doc Gen Error]', err);
            showToast(err.message || 'Ошибка генерации документа', 'error');
            docStatusText.textContent = 'Ошибка генерации';
        } finally {
            btnGenerate.disabled = false;
            btnGenIcon.className = 'fa-solid fa-wand-magic-sparkles';
            btnGenText.textContent = 'Сгенерировать официальный документ';
            setTimeout(() => genProgressBox.classList.add('hidden'), 2500);
        }
    });

    // ── Action Buttons Handlers ──

    // 1. Export to Microsoft Word (.doc)
    btnExportDocx.addEventListener('click', function() {
        exportToWord(a4DocumentPaper, selectDocType.options[selectDocType.selectedIndex].text, selectSubject.value);
    });

    // 2. Export to PDF
    btnExportPdf.addEventListener('click', function() {
        exportToPdf(a4DocumentPaper, selectDocType.options[selectDocType.selectedIndex].text, selectSubject.value);
    });

    // 3. Print
    btnPrintDoc.addEventListener('click', function() {
        window.print();
    });

    // 4. Copy Document Text
    btnCopyDoc.addEventListener('click', function() {
        const text = a4DocumentPaper.innerText;
        navigator.clipboard.writeText(text).then(() => {
            showToast('Текст документа скопирован в буфер обмена!', 'success');
        }).catch(() => {
            showToast('Не удалось скопировать текст', 'error');
        });
    });

    function setGenProgress(pct, label) {
        genProgressFill.style.width = Math.min(100, pct) + '%';
        if (label) genProgressLabel.textContent = label;
    }
});


/* ──────────────────────────────────────────────
   AI PROMPT BUILDER & MULTI-TIER ENGINE
─────────────────────────────────────────────── */
async function callUniversalDocAI(params) {
    const { category, docTypeId, docTypeName, subject, grade, lang, topic, teacher, school } = params;

    const isKazakh = lang === 'Қазақша';
    const isEnglish = lang === 'English';

    const systemPrompt = [
        'Ты ведущий государственный методист и эксперт Министерства просвещения.',
        'Твоя задача — составить ПОЛНОСТЬЮ готовый, профессиональный, подробный официальный документ для учителя.',
        'Ответь СТРОГО чистым семантическим HTML-кодом без markdown-оберток (без ```html и без ```).',
        '',
        'ТРЕБОВАНИЯ К ОФОРМЛЕНИЮ HTML:',
        '1. Используй официальную структуру с таблицами: <table class="doc-table-meta">, <table class="doc-table-steps">, <table class="doc-table-rubric">.',
        '2. В шапке документа обязательно размести <div class="doc-header-block"> с указанием Министерства, школы, типа документа и названия темы.',
        '3. Для каждого этапа урока (КСП) пиши ПОДРОБНЫЕ действия педагога, действия учащихся, формативное оценивание и дескрипторы.',
        '4. Для СОР/СОЧ создавай 2 полноценных варианта с заданиями разного уровня (А, В, С) + детальную таблицу дескрипторов и баллов (рубрикатор).',
        '5. Для лабораторных — таблицы измерений, ТБ, формулы, ход работы и контрольные вопросы.',
        '6. Для характеристик — подробные разделы (успеваемость, поведение, психоэмоциональные качества, олимпиады, рекомендации).',
        '7. Внизу документа обязательно добавь <div class="doc-signature-row"> с местом для подписи учителя и завуча.',
        `8. Весь текст документа пиши СТРОГО на языке: ${lang}!`
    ].join('\n');

    const userPrompt = [
        `ТИП ДОКУМЕНТА: ${docTypeName} (${docTypeId})`,
        `ПРЕДМЕТ: ${subject}`,
        `КЛАСС / АУДИТОРИЯ: ${grade}`,
        `ЯЗЫК ДОКУМЕНТА: ${lang}`,
        `ТЕМА / ЦЕЛИ ОБУЧЕНИЯ / ЗАДАЧА: ${topic}`,
        `ПЕДАГОГ: ${teacher}`,
        `ОРГАНИЗАЦИЯ: ${school}`,
        '',
        'Сформируй идеальный, исчерпывающий, официальный документ в формате HTML.'
    ].join('\n');

    // 1. TIER 1: OpenAI (if sk- key provided)
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
                        { role: 'user', content: userPrompt }
                    ],
                    temperature: 0.3
                })
            });
            if (res.ok) {
                const oaiData = await res.json();
                const content = oaiData?.choices?.[0]?.message?.content;
                if (content && content.includes('<')) {
                    return cleanHtmlOutput(content);
                }
            }
        } catch (e) {
            console.warn('OpenAI doc generation failed, fallback to Gemini...', e);
        }
    }

    // 2. TIER 2: Google Gemini (2.5-Flash & 1.5-Flash)
    const activeGeminiKey = (API_KEY && (API_KEY.startsWith('AQ.') || API_KEY.startsWith('AIzaSy'))) ? API_KEY : FALLBACK_GEMINI_KEY;
    const models = ['gemini-2.5-flash', 'gemini-1.5-flash-latest'];

    for (let model of models) {
        try {
            const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${activeGeminiKey}`;
            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    system_instruction: { parts: [{ text: systemPrompt }] },
                    contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
                    generationConfig: {
                        temperature: 0.3
                    }
                })
            });
            if (res.ok) {
                const data = await res.json();
                const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
                if (rawText && rawText.includes('<')) {
                    return cleanHtmlOutput(rawText);
                }
            }
        } catch (e) {
            console.warn(`Gemini doc model ${model} failed, trying next...`, e);
        }
    }

    // 3. TIER 3: Pollinations AI Zero-Key Fallback
    try {
        const fullPrompt = `${systemPrompt}\n\n${userPrompt}\n\nОтветь ТОЛЬКО чистым HTML кодом:`;
        const res = await fetch(`https://text.pollinations.ai/${encodeURIComponent(fullPrompt)}?model=openai`);
        if (res.ok) {
            const rawText = await res.text();
            if (rawText && rawText.includes('<')) {
                return cleanHtmlOutput(rawText);
            }
        }
    } catch (e) {
        console.warn('Pollinations doc fallback failed...', e);
    }

    throw new Error('ИИ временно недоступен. Пожалуйста, попробуйте еще раз.');
}

function cleanHtmlOutput(raw) {
    let clean = String(raw).trim();
    if (clean.startsWith('```html')) clean = clean.slice(7);
    if (clean.startsWith('```')) clean = clean.slice(3);
    if (clean.endsWith('```')) clean = clean.slice(0, -3);
    return clean.trim();
}


/* ──────────────────────────────────────────────
   EXPORT UTILITIES (WORD .DOC & PDF)
─────────────────────────────────────────────── */
function exportToWord(element, docTitle, subject) {
    showToast('Формирование файла Microsoft Word (.doc)...', 'info');
    
    const contentHtml = element.innerHTML;
    const filename = `${docTitle} - ${subject}.doc`.replace(/[/\\?%*:|"<>]/g, '-');

    const fullHtml = `
        <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
        <head>
            <meta charset='utf-8'>
            <title>${docTitle}</title>
            <style>
                body { font-family: 'Times New Roman', serif; font-size: 12pt; line-height: 1.4; color: #000; }
                table { width: 100%; border-collapse: collapse; margin-bottom: 12pt; font-size: 10.5pt; }
                th, td { border: 1pt solid #444; padding: 5pt 6pt; vertical-align: top; }
                th { background-color: #f2f2f2; font-weight: bold; text-align: center; }
                h1 { font-size: 15pt; font-weight: bold; text-align: center; text-transform: uppercase; margin-bottom: 12pt; }
                h2 { font-size: 12pt; font-weight: bold; margin-top: 14pt; margin-bottom: 6pt; border-bottom: 1pt solid #ccc; }
                .doc-header-block { text-align: center; margin-bottom: 14pt; }
                .doc-state-heading { font-size: 10pt; font-weight: bold; text-transform: uppercase; }
                .doc-signature-row { margin-top: 24pt; width: 100%; }
            </style>
        </head>
        <body>
            ${contentHtml}
        </body>
        </html>
    `;

    const blob = new Blob(['\ufeff' + fullHtml], { type: 'application/msword;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast(`Файл Word "${filename}" успешно скачан!`, 'success');
}

async function exportToPdf(element, docTitle, subject) {
    showToast('Подготовка официального PDF документа...', 'info');
    const filename = `${docTitle} - ${subject}.pdf`.replace(/[/\\?%*:|"<>]/g, '-');

    const opt = {
        margin: [12, 12, 12, 12],
        filename: filename,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: false },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    try {
        await html2pdf().set(opt).from(element).save();
        showToast(`PDF "${filename}" успешно сохранен!`, 'success');
    } catch (e) {
        console.error('[PDF Export Error]', e);
        showToast('Ошибка при скачивании PDF: ' + e.message, 'error');
    }
}

function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<i class="fa-solid ${type === 'success' ? 'fa-circle-check' : type === 'error' ? 'fa-triangle-exclamation' : 'fa-circle-info'}"></i> <span>${message}</span>`;
    container.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(12px)';
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
