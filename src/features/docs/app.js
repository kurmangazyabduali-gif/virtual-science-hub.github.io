/* =====================================================
   ASHYQDOC — OFFICIAL TEACHER DOCUMENTATION ENGINE JS
   Deterministic Template Assembly + High-Grade AI Pipeline
   Strict Kazakhstan Ministry of Education (ГОСО РК) Standard
   ===================================================== */

const USER_POLLINATIONS_KEY = 'sk-YDchG_DZqjknVNsuyJwSaA';
const FALLBACK_GEMINI_KEY = atob('QVEuQWI4Uk42SnZ1V19xZ0FmSlpBaURwbE1EbEdxR0tvYlRiZ3hMc2l3aWI0c1BNZXJHQnc=');
const API_KEY = localStorage.getItem('vsh-api-key') || USER_POLLINATIONS_KEY;

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
        'Атомның құрылысы. Элементар бөлшектер',
        'Д.И. Менделеевтің периодтық заңы және атом құрылысы',
        'Бейорганикалық қосылыстардың негізгі кластары',
        'Химиялық байланыс түрлері: ковалентті және иондық',
        'Бейтараптану реакциясы және ерітінділердің рН көрсеткіші'
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
    const btnZoomIn        = document.getElementById('btn-zoom-in');
    const btnZoomOut       = document.getElementById('btn-zoom-out');
    const zoomLevelText    = document.getElementById('zoom-level-text');
    const btnToggleStamp   = document.getElementById('btn-toggle-stamp');

    let activeCategory = 'plans';
    let currentZoom = 1.0;
    let hasStamp = false;

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

    // ── Zoom Stepper ──
    if (btnZoomIn && btnZoomOut && zoomLevelText) {
        btnZoomIn.addEventListener('click', () => {
            if (currentZoom < 1.3) {
                currentZoom = +(currentZoom + 0.1).toFixed(1);
                applyZoom();
            }
        });
        btnZoomOut.addEventListener('click', () => {
            if (currentZoom > 0.7) {
                currentZoom = +(currentZoom - 0.1).toFixed(1);
                applyZoom();
            }
        });
    }

    function applyZoom() {
        a4DocumentPaper.style.zoom = currentZoom;
        zoomLevelText.textContent = `${Math.round(currentZoom * 100)}%`;
    }

    // ── Stamp Toggle Switch ──
    if (btnToggleStamp) {
        btnToggleStamp.addEventListener('click', () => {
            hasStamp = !hasStamp;
            btnToggleStamp.classList.toggle('active', hasStamp);
            const schoolName = cleanSchoolName(inputSchool.value.trim(), selectLanguage.value === 'Қазақша');
            const lang = selectLanguage.value;

            const existingStamp = a4DocumentPaper.querySelector('.doc-approval-stamp');
            if (hasStamp) {
                if (!existingStamp) {
                    const stampDiv = document.createElement('div');
                    stampDiv.className = 'doc-approval-stamp';
                    if (lang === 'Русский') {
                        stampDiv.innerHTML = `
                            <div class="stamp-content">
                                <div class="stamp-title">УТВЕРЖДАЮ:</div>
                                <div>Директор ${schoolName}</div>
                                <div>___________ / _________________ /</div>
                                <div>«___» _____________ 2026 г.</div>
                            </div>
                        `;
                    } else if (lang === 'English') {
                        stampDiv.innerHTML = `
                            <div class="stamp-content">
                                <div class="stamp-title">APPROVED BY:</div>
                                <div>Principal of ${schoolName}</div>
                                <div>___________ / _________________ /</div>
                                <div>Date: «___» _____________ 2026</div>
                            </div>
                        `;
                    } else {
                        stampDiv.innerHTML = `
                            <div class="stamp-content">
                                <div class="stamp-title">БЕКІТЕМІН:</div>
                                <div>${schoolName} директоры</div>
                                <div>___________ / _________________ /</div>
                                <div>«___» _____________ 2026 ж.</div>
                            </div>
                        `;
                    }
                    a4DocumentPaper.insertBefore(stampDiv, a4DocumentPaper.firstChild);
                    showToast('«БЕКІТЕМІН» грифі құжатқа қосылды', 'info');
                }
            } else {
                if (existingStamp) {
                    existingStamp.remove();
                    showToast('«БЕКІТЕМІН» грифі өшірілді', 'info');
                }
            }
        });
    }

    // ── Generate Button Click ──
    btnGenerate.addEventListener('click', async function() {
        const topic = inputTopic.value.trim();
        if (!topic) {
            showToast('Сабақтың тақырыбын немесе оқу мақсатын енгізіңіз', 'error');
            inputTopic.focus();
            return;
        }

        const docTypeId = selectDocType.value;
        const docTypeName = selectDocType.options[selectDocType.selectedIndex].text;
        const subject = selectSubject.value;
        const grade = selectGrade.value;
        const lang = selectLanguage.value;
        const isKazakh = lang === 'Қазақша';
        const teacher = cleanTeacherName(inputTeacher.value.trim(), lang);
        const school = cleanSchoolName(inputSchool.value.trim(), isKazakh);

        btnGenerate.disabled = true;
        btnGenIcon.className = 'fa-solid fa-spinner fa-spin';
        btnGenText.textContent = 'ИИ ресми құжатты түзуде...';
        genProgressBox.classList.remove('hidden');
        setGenProgress(20, 'ГОСО стандарты бойынша құрылымды талдау...');
        docStatusText.textContent = 'ИИ құжатты қалыптастыруда...';

        try {
            setGenProgress(45, `«${docTypeName}» құжатының мазмұны түзілуде...`);
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

            setGenProgress(85, 'Кестелер мен ресми реквизиттерді біріктіру...');
            await sleep(200);

            // Insert generated document
            a4DocumentPaper.innerHTML = htmlResult;

            // Re-apply stamp if active
            if (hasStamp) {
                const existingStamp = a4DocumentPaper.querySelector('.doc-approval-stamp');
                if (!existingStamp) {
                    const stampDiv = document.createElement('div');
                    stampDiv.className = 'doc-approval-stamp';
                    if (lang === 'Русский') {
                        stampDiv.innerHTML = `
                            <div class="stamp-content">
                                <div class="stamp-title">УТВЕРЖДАЮ:</div>
                                <div>Директор ${school}</div>
                                <div>___________ / _________________ /</div>
                                <div>«___» _____________ 2026 г.</div>
                            </div>
                        `;
                    } else if (lang === 'English') {
                        stampDiv.innerHTML = `
                            <div class="stamp-content">
                                <div class="stamp-title">APPROVED BY:</div>
                                <div>Principal of ${school}</div>
                                <div>___________ / _________________ /</div>
                                <div>Date: «___» _____________ 2026</div>
                            </div>
                        `;
                    } else {
                        stampDiv.innerHTML = `
                            <div class="stamp-content">
                                <div class="stamp-title">БЕКІТЕМІН:</div>
                                <div>${school} директоры</div>
                                <div>___________ / _________________ /</div>
                                <div>«___» _____________ 2026 ж.</div>
                            </div>
                        `;
                    }
                    a4DocumentPaper.insertBefore(stampDiv, a4DocumentPaper.firstChild);
                }
            }

            updateDocTitleBadge();
            docStatusText.textContent = `Құжат дайын: ${docTypeName}`;
            setGenProgress(100, '✅ Ресми құжат толығымен әзірленді!');
            showToast('Ресми педагогикалық құжат сәтті қалыптастырылды!', 'success');

        } catch (err) {
            console.error('[Doc Gen Error]', err);
            showToast(err.message || 'Құжатты жасау кезінде қате орын алды', 'error');
            docStatusText.textContent = 'Генерация қатесі';
        } finally {
            btnGenerate.disabled = false;
            btnGenIcon.className = 'fa-solid fa-file-circle-check';
            btnGenText.textContent = 'Ресми құжатты қалыптастыру';
            setTimeout(() => genProgressBox.classList.add('hidden'), 2500);
        }
    });

    // ── Action Buttons Handlers ──

    // 1. Export to Microsoft Word (.docx / .doc)
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
            showToast('Құжат мәтіні буферге көшірілді!', 'success');
        }).catch(() => {
            showToast('Мәтінді көшіру мүмкін болмады', 'error');
        });
    });

    function setGenProgress(pct, label) {
        genProgressFill.style.width = Math.min(100, pct) + '%';
        if (label) genProgressLabel.textContent = label;
    }
});

function cleanSchoolName(name, isKazakh) {
    let clean = String(name || '').trim();
    clean = clean.replace(/^[«"'\s]+|[»"'\s]+$/g, '');
    clean = clean.replace(/\s*КММ\s*$/i, '');
    clean = clean.replace(/^КГУ\s*/i, '');
    clean = clean.replace(/^[«"'\s]+|[»"'\s]+$/g, '');
    if (!clean) clean = isKazakh ? '№ 1 мектеп-лицей' : 'Школа-лицей № 1';
    return isKazakh ? `«${clean}» КММ` : `КГУ «${clean}»`;
}

function cleanTeacherName(name, lang) {
    let clean = String(name || '').trim();
    if (!clean) return lang === 'Қазақша' ? 'Абдуғали К. М.' : 'Абдугали К. М.';
    return clean;
}


/* ──────────────────────────────────────────────
   AI PROMPT & DETERMINISTIC BUILDER ENGINE
─────────────────────────────────────────────── */
async function callUniversalDocAI(params) {
    const { category, docTypeId, docTypeName, subject, grade, lang, topic, teacher, school } = params;
    const isKazakh = lang === 'Қазақша';
    const isRussian = lang === 'Русский';

    // 1. Prepare JSON prompt schema based on document type
    const jsonSchemaInstruction = getDocJsonSchema(docTypeId, lang);

    const systemPrompt = `Сен Қазақстан Республикасы Оқу-ағарту министрлігінің мемлекеттік жоғары санатты бас әдіскерісің.
Міндетің — сұралған педагогикалық құжаттың мазмұнын терең, кәсіби және толық деңгейде толтырып, ТЕК JSON форматында қайтару.
Ешқандай markdown немесе артық сөз жазба. ТЕК таза JSON қайтар.
Тіл: ${lang}.

${jsonSchemaInstruction}`;

    const userPrompt = `ПӘН: ${subject}
СЫНЫП: ${grade}
ТІЛ: ${lang}
ҚҰЖАТ ТҮРІ: ${docTypeName} (${docTypeId})
ТАҚЫРЫП / БӨЛІМ / МАҚСАТ: ${topic}
ПЕДАГОГ: ${teacher}
МЕКТЕП: ${school}`;

    let parsedData = null;

    // TIER 1: Google Gemini with responseMimeType: 'application/json'
    const activeGeminiKey = (API_KEY && (API_KEY.startsWith('AQ.') || API_KEY.startsWith('AIzaSy'))) ? API_KEY : FALLBACK_GEMINI_KEY;
    const geminiModels = ['gemini-2.5-flash', 'gemini-1.5-flash-latest', 'gemini-1.5-flash'];

    for (let model of geminiModels) {
        try {
            const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${activeGeminiKey}`;
            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    system_instruction: { parts: [{ text: systemPrompt }] },
                    contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
                    generationConfig: {
                        temperature: 0.2,
                        responseMimeType: 'application/json'
                    }
                })
            });
            if (res.ok) {
                const data = await res.json();
                const rawJson = data?.candidates?.[0]?.content?.parts?.[0]?.text;
                if (rawJson) {
                    parsedData = safeParseJson(rawJson);
                    if (parsedData) break;
                }
            }
        } catch (e) {
            console.warn(`Gemini JSON model ${model} failed, trying next...`, e);
        }
    }

    // TIER 2: Pollinations AI with user key
    if (!parsedData) {
        const effectivePollKey = (API_KEY && API_KEY.startsWith('sk-')) ? API_KEY : USER_POLLINATIONS_KEY;
        try {
            const promptText = `${systemPrompt}\n\nТапсырма:\n${userPrompt}\n\nҚайтар тек таза JSON:`;
            const res = await fetch(`https://text.pollinations.ai/${encodeURIComponent(promptText)}?json=true&model=openai&key=${effectivePollKey}`);
            if (res.ok) {
                const rawText = await res.text();
                parsedData = safeParseJson(rawText);
            }
        } catch (e) {
            console.warn('Pollinations JSON fallback failed...', e);
        }
    }

    // TIER 3: Deterministic High-Precision Template Assembly
    return renderDeterministicDocument(docTypeId, parsedData, params);
}

function safeParseJson(str) {
    try {
        let clean = String(str).trim();
        if (clean.startsWith('```json')) clean = clean.slice(7);
        if (clean.startsWith('```')) clean = clean.slice(3);
        if (clean.endsWith('```')) clean = clean.slice(0, -3);
        clean = clean.trim();
        return JSON.parse(clean);
    } catch (e) {
        return null;
    }
}

function getDocJsonSchema(docTypeId, lang) {
    if (docTypeId === 'sor' || docTypeId === 'soch' || docTypeId === 'cards_abc') {
        return `JSON СХЕМА:
{
  "unit": "Бөлім атауы / Раздел",
  "topic": "Тақырып / Тема",
  "learningObjectives": "Оқу мақсаттары (кодтарымен)",
  "thinkingLevel": "Ойлау дағдыларының деңгейі",
  "duration": "20–25 минут",
  "variant1": [
    { "taskNumber": 1, "question": "1-тапсырма шарты", "score": 2 },
    { "taskNumber": 2, "question": "2-тапсырма шарты", "score": 3 },
    { "taskNumber": 3, "question": "3-тапсырма (есеп/тәжірибе) шарты", "score": 5 }
  ],
  "variant2": [
    { "taskNumber": 1, "question": "1-тапсырма шарты", "score": 2 },
    { "taskNumber": 2, "question": "2-тапсырма шарты", "score": 3 },
    { "taskNumber": 3, "question": "3-тапсырма шарты", "score": 5 }
  ],
  "rubric": [
    { "taskNumber": 1, "objective": "Оқу мақсаты", "descriptor": "Білім алушы:... сипаттайды", "score": 2 },
    { "taskNumber": 2, "objective": "Оқу мақсаты", "descriptor": "Формуланы түрлендіреді және есептейді", "score": 3 },
    { "taskNumber": 3, "objective": "Оқу мақсаты", "descriptor": "Тәжірибелік мәліметтерге талдау жасайды", "score": 5 }
  ]
}`;
    }

    if (docTypeId === 'lab_guide' || docTypeId === 'lab_worksheet' || docTypeId === 'practicum') {
        return `JSON СХЕМА:
{
  "labNumber": "1",
  "topic": "Зертханалық жұмыс тақырыбы",
  "goal": "Жұмыстың мақсаты",
  "equipment": "Құрал-жабдықтар мен реактивтер тізімі",
  "safety": "Қауіпсіздік техникасы ережелері",
  "theory": "Қысқаша теориялық түсінік және формулалар",
  "steps": [
    "1. Құралдарды жинау және тексеру",
    "2. Өлшеулер жүргізу",
    "3. Мәндерді кестеге енгізу және есептеу"
  ],
  "tableHeaders": ["№", "Шама атауы", "Өлшем бірлігі", "1-тәжірибе", "2-тәжірибе", "Орташа мән"],
  "tableRows": [
    ["1", "Кернеу (U)", "В", "2.0", "4.0", "3.0"],
    ["2", "Ток күші (I)", "А", "0.4", "0.8", "0.6"]
  ],
  "questions": [
    "1. Тәжірибе нәтижелерінен қандай қорытынды шығаруға болады?",
    "2. Өлшеу қателіктерінің себептері неде?"
  ]
}`;
    }

    // Default QMJ Schema
    return `JSON СХЕМА:
{
  "unit": "Бөлім атауы / Раздел",
  "topic": "Сабақтың тақырыбы",
  "learningObjectives": "Оқу мақсаттары (кодтарымен, мысалы 8.1.2.5 — ...)",
  "lessonObjectives": "Сабақтың мақсаттары (барлық, көпшілік, кейбір оқушылар үшін)",
  "stages": [
    {
      "stageName": "1. Ұйымдастыру кезеңі",
      "time": "0–5 мин",
      "teacherAction": "Сәлемдесу, түгелдеу. Жағымды психологиялық ахуал. Қызығушылықты ояту («Миға шабуыл»)",
      "studentAction": "Амандасады, сабаққа дайындалады, сұрақтарға жауап береді",
      "assessment": "Формативті бағалау: «Жарайсың!» ауызша мадақтау. Слайд, тақта"
    },
    {
      "stageName": "2. Жаңа білімді меңгеру",
      "time": "5–25 мин",
      "teacherAction": "Жаңа тақырыпты түсіндіру, формулалар мен анықтамаларды беру, демонстрация",
      "studentAction": "Анықтамаларды дәптерге жазады, модельдерді талдайды, сұрақтарға жауап береді",
      "assessment": "Дескриптор: Негізгі заңдылықты біледі (1 б); Формуланы қолданады (2 б)"
    },
    {
      "stageName": "3. Практикалық бекіту",
      "time": "25–38 мин",
      "teacherAction": "Деңгейлік есептер ұсыну (А, В, С деңгейі), топтық және жұптық жұмыстарды бақылау",
      "studentAction": "Деңгейлік есептерді шығарады, өзара салыстырады және тексереді",
      "assessment": "Өзара бағалау: «Бағдаршам» әдісі. Тапсырма парақтары (3 балл)"
    },
    {
      "stageName": "4. Қорытынды және Рефлексия",
      "time": "38–45 мин",
      "teacherAction": "Сабақты қорытындылау, бағалау, үй тапсырмасын беру (§15 оқу, №4 есеп)",
      "studentAction": "«БББ» кестесі бойынша кері байланыс жасау, күнделікке үй жұмысын жазу",
      "assessment": "Рефлексия парағы: өзін-өзі бағалау. Күнделік"
    }
  ],
  "differentiation": "Қабілеті жоғары оқушыларға күрделі шығармашылық есептер. Қолдауды қажет ететін оқушыларға көмекші сызба-алгоритмдер.",
  "safety": "Кабинеттегі қауіпсіздік ережелерін сақтау. Көз жаттығулары мен сергіту сәті."
}`;
}


/* ──────────────────────────────────────────────
   DETERMINISTIC OFFICIAL HTML RENDERERS
─────────────────────────────────────────────── */
function renderDeterministicDocument(docTypeId, data, params) {
    const { category, docTypeName, subject, grade, lang, topic, teacher, school } = params;
    const isKazakh = lang === 'Қазақша';
    const isRussian = lang === 'Русский';

    const stateHead = isKazakh 
        ? 'ҚАЗАҚСТАН РЕСПУБЛИКАСЫ ОҚУ-АҒАРТУ МИНИСТРЛІГІ' 
        : (isRussian ? 'МИНИСТЕРСТВО ПРОСВЕЩЕНИЯ РЕСПУБЛИКИ КАЗАХСТАН' : 'MINISTRY OF EDUCATION OF THE REPUBLIC OF KAZAKHSTAN');

    // 1. Assessment Documents (СОР / СОЧ / Карточки)
    if (category === 'assess' || docTypeId === 'sor' || docTypeId === 'soch' || docTypeId === 'cards_abc') {
        const v1 = data?.variant1 || [
            { taskNumber: 1, question: `${topic} бойынша негізгі ұғымдар мен анықтамаларды жазыңыз.`, score: 2 },
            { taskNumber: 2, question: `Берілген мәндерді пайдаланып, есепті шығарыңыз және формуланы түрлендіріңіз.`, score: 3 },
            { taskNumber: 3, question: `Тәжірибелік мәліметтерге сүйене отырып, график құрыңыз және қорытынды жасаңыз.`, score: 5 }
        ];
        const v2 = data?.variant2 || [
            { taskNumber: 1, question: `${topic} заңдылықтары мен шарттарын сипаттаңыз.`, score: 2 },
            { taskNumber: 2, question: `Шамалар арасындағы тәуелділік графигін талдап, белгісіз мәнді есептеңіз.`, score: 3 },
            { taskNumber: 3, question: `Эксперименттік есепті шешіп, салыстырмалы қателікті анықтаңыз.`, score: 5 }
        ];
        const rubric = data?.rubric || [
            { taskNumber: 1, objective: data?.learningObjectives || 'Негізгі ұғымдарды меңгеру', descriptor: 'Негізгі анықтамаларды дұрыс көрсетеді', score: 2 },
            { taskNumber: 2, objective: data?.learningObjectives || 'Формулаларды қолдану', descriptor: 'Формуланы дұрыс түрлендіріп, есептейді', score: 3 },
            { taskNumber: 3, objective: data?.learningObjectives || 'Талдау және қорытынды', descriptor: 'Мәліметтерді талдап, дұрыс тұжырым жасайды', score: 5 }
        ];

        let v1Html = v1.map(t => `<div class="test-item-block"><p class="test-q-text"><strong>${t.taskNumber}-тапсырма [${t.score} балл]:</strong> ${t.question}</p></div>`).join('');
        let v2Html = v2.map(t => `<div class="test-item-block"><p class="test-q-text"><strong>${t.taskNumber}-тапсырма [${t.score} балл]:</strong> ${t.question}</p></div>`).join('');
        let rubHtml = rubric.map(r => `<tr><td style="text-align:center;font-weight:bold;">${r.taskNumber}</td><td>${r.objective}</td><td>${r.descriptor}</td><td style="text-align:center;font-weight:bold;">${r.score}</td></tr>`).join('');

        return `
            <div class="doc-header-block">
                <div class="doc-state-heading">${stateHead}</div>
                <div class="doc-school-heading">${school}</div>
                <h1 class="doc-main-title">${docTypeName.toUpperCase()}</h1>
            </div>

            <table class="doc-table-meta">
                <tr>
                    <td class="cell-label"><strong>Бөлім / Раздел:</strong></td>
                    <td>${data?.unit || topic}</td>
                    <td class="cell-label"><strong>Педагог:</strong></td>
                    <td>${teacher}</td>
                </tr>
                <tr>
                    <td class="cell-label"><strong>Пән / Сынып:</strong></td>
                    <td>${subject} • ${grade}</td>
                    <td class="cell-label"><strong>Орындау уақыты:</strong></td>
                    <td>${data?.duration || '20–25 минут'}</td>
                </tr>
                <tr>
                    <td class="cell-label"><strong>Оқу мақсаттары:</strong></td>
                    <td colspan="3">${data?.learningObjectives || topic + ' бойынша білім мен дағдыларды тексеру'}</td>
                </tr>
                <tr>
                    <td class="cell-label"><strong>Ойлау дағдылары:</strong></td>
                    <td colspan="3">${data?.thinkingLevel || 'Білу, түсіну, қолдану және жоғары деңгей дағдылары'}</td>
                </tr>
            </table>

            <h2 class="doc-section-title">1-нұсқа (Вариант 1)</h2>
            ${v1Html}

            <h2 class="doc-section-title">2-нұсқа (Вариант 2)</h2>
            ${v2Html}

            <h2 class="doc-section-title">Балл қою кестесі және дескрипторлар (Рубрикатор)</h2>
            <table class="doc-table-rubric">
                <thead>
                    <tr>
                        <th style="width:12%;">Тапсырма №</th>
                        <th style="width:38%;">Оқу мақсаты</th>
                        <th style="width:38%;">Дескриптор: Білім алушы</th>
                        <th style="width:12%;">Балл</th>
                    </tr>
                </thead>
                <tbody>
                    ${rubHtml}
                </tbody>
            </table>

            <div class="doc-signature-row">
                <div class="sig-block">
                    <span>Құрастырушы мұғалім: _________________ (${teacher})</span>
                </div>
                <div class="sig-block">
                    <span>Тексерген ӘБ жетекшісі: _________________</span>
                </div>
            </div>
        `;
    }

    // 2. Laboratory Documents
    if (category === 'labs' || docTypeId === 'lab_guide' || docTypeId === 'lab_worksheet' || docTypeId === 'practicum') {
        const steps = data?.steps || [
            '1. Құрал-жабдықтарды тексеріп, схема бойынша жинаңыз.',
            '2. Тізбекке ток көзін қосып, өлшеу құралдарының көрсеткіштерін жазып алыңыз.',
            '3. Тәжірибені 3 рет қайталап, орташа мәнін есептеңіз.',
            '4. Есептеу формуласы бойынша белгісіз шаманы тауып, қателікті анықтаңыз.'
        ];
        const stepsHtml = steps.map(s => `<p style="margin-bottom:4pt;">${s}</p>`).join('');

        const headers = data?.tableHeaders || ['№', 'Шама атауы', 'Өлшем бірлігі', '1-тәжірибе', '2-тәжірибе', '3-тәжірибе', 'Орташа мән'];
        const thHtml = headers.map(h => `<th>${h}</th>`).join('');

        const rows = data?.tableRows || [
            ['1', 'Кернеу (U)', 'В', '2.0', '4.0', '6.0', '4.0'],
            ['2', 'Ток күші (I)', 'А', '0.2', '0.4', '0.6', '0.4'],
            ['3', 'Кедергі (R)', 'Ом', '10.0', '10.0', '10.0', '10.0']
        ];
        const rowsHtml = rows.map(r => `<tr>${r.map(c => `<td style="text-align:center;">${c}</td>`).join('')}</tr>`).join('');

        const questions = data?.questions || [
            '1. Өлшенген шамалар арасында қандай тәуелділік байқалады?',
            '2. Тәжірибе нәтижесінің теориялық формуламен сәйкестігін түсіндіріңіз.'
        ];
        const qHtml = questions.map(q => `<p style="margin-bottom:4pt;">${q}</p>`).join('');

        return `
            <div class="doc-header-block">
                <div class="doc-state-heading">${stateHead}</div>
                <div class="doc-school-heading">${school}</div>
                <h1 class="doc-main-title">${docTypeName.toUpperCase()}</h1>
            </div>

            <table class="doc-table-meta">
                <tr>
                    <td class="cell-label"><strong>Пән / Сынып:</strong></td>
                    <td>${subject} • ${grade}</td>
                    <td class="cell-label"><strong>Педагог:</strong></td>
                    <td>${teacher}</td>
                </tr>
                <tr>
                    <td class="cell-label"><strong>Жұмыс тақырыбы:</strong></td>
                    <td colspan="3"><strong>${data?.topic || topic}</strong></td>
                </tr>
                <tr>
                    <td class="cell-label"><strong>Жұмыс мақсаты:</strong></td>
                    <td colspan="3">${data?.goal || topic + ' құбылысын эксперименттік түрде зерттеу және заңдылықтарды анықтау'}</td>
                </tr>
                <tr>
                    <td class="cell-label"><strong>Құрал-жабдықтар:</strong></td>
                    <td colspan="3">${data?.equipment || 'Зертханалық құралдар, өлшеу аспаптары, қосу сымдары, ток көзі, нұсқаулық парақ'}</td>
                </tr>
                <tr>
                    <td class="cell-label"><strong>Қауіпсіздік техникасы:</strong></td>
                    <td colspan="3">${data?.safety || 'Құралдармен жұмыс кезінде қауіпсіздік ережелерін қатаң сақтау, ток көзін тек мұғалімнің рұқсатымен қосу.'}</td>
                </tr>
            </table>

            <h2 class="doc-section-title">Теориялық түсінік және формулалар</h2>
            <p style="margin-bottom:8pt;">${data?.theory || topic + ' құбылысын сипаттайтын негізгі формулалар мен физикалық заңдылықтар.'}</p>

            <h2 class="doc-section-title">Жұмыс барысы</h2>
            ${stepsHtml}

            <h2 class="doc-section-title">Өлшеулер мен есептеулер кестесі</h2>
            <table class="doc-table-steps">
                <thead>
                    <tr>${thHtml}</tr>
                </thead>
                <tbody>
                    ${rowsHtml}
                </tbody>
            </table>

            <h2 class="doc-section-title">Қорытынды және бақылау сұрақтары</h2>
            ${qHtml}
            <div style="border-bottom:1px dashed #666; margin-top:20pt; padding-bottom:4pt;">Оқушының қорытындысы: __________________________________________________________________</div>

            <div class="doc-signature-row">
                <div class="sig-block">
                    <span>Пән мұғалімі: _________________ (${teacher})</span>
                </div>
                <div class="sig-block">
                    <span>Бағасы: ______ (қолы)</span>
                </div>
            </div>
        `;
    }

    // 3. Official Short-term Lesson Plan (ҚМЖ / КСП) — Strict 4-column Standard
    const rawStages = data?.stages || [];
    const stages = rawStages.length >= 3 ? rawStages : [
        {
            stageName: isKazakh ? '1. Ұйымдастыру кезеңі' : '1. Организационный этап',
            time: '0–5 мин',
            teacherAction: isKazakh 
                ? 'Оқушылармен сәлемдесу, түгелдеу. Жағымды психологиялық ахуал орнату. «Миға шабуыл» әдісі арқылы қызығушылықты ояту: өткен тақырыптар бойынша сұрақтар қою.'
                : 'Приветствие учащихся, проверка готовности к уроку. Актуализация опорных знаний методом фронтального опроса («Мозговой штурм»).',
            studentAction: isKazakh
                ? 'Мұғаліммен амандасады, сабаққа дайындалады. Қойылған сұрақтарға белсенді жауап беріп, сабақтың тақырыбы мен мақсатын анықтайды.'
                : 'Приветствуют учителя, включаются в учебный процесс. Отвечают на вопросы, формулируют тему и цели урока.',
            assessment: isKazakh
                ? 'Формативті бағалау: «Жарайсың!» ауызша мадақтау. Интерактивті тақта, презентация'
                : 'Формативное оценивание: Словесная похвала. Интерактивная доска, слайды'
        },
        {
            stageName: isKazakh ? '2. Жаңа білімді меңгеру' : '2. Изучение нового материала',
            time: '5–25 мин',
            teacherAction: isKazakh
                ? `«${topic}» тақырыбының негізгі ұғымдарын, заңдылықтары мен формулаларын түсіндіреді. AshyqLab виртуалды зертханалық үлгілері мен сызбаларын интерактивті тақтада көрсетеді.`
                : `Объяснение темы «${topic}». Демонстрация интерактивных симуляций AshyqLab, вывод ключевых формул, анализ физических величин и единиц измерения.`,
            studentAction: isKazakh
                ? 'Жаңа ұғымдарды зейін қойып тыңдайды, негізгі формулалар мен анықтамаларды дәптерге жазады. Сұрақтар қойып, талдауға қатысады.'
                : 'Слушают объяснение, ведут структурированный конспект, анализируют графики и схемы, задают уточняющие вопросы.',
            assessment: isKazakh
                ? 'Дескриптор: Негізгі ұғымдар мен анықтамаларды біледі (1 б); Формуланы дұрыс қолданады (2 б).'
                : 'Дескрипторы: Знает формулировку закона (1 б); Правильно применяет единицы измерения (2 б).'
        },
        {
            stageName: isKazakh ? '3. Практикалық бекіту' : '3. Первичное закрепление',
            time: '25–38 мин',
            teacherAction: isKazakh
                ? 'Деңгейлік тапсырмалар ұсынады (А, В, С деңгейі). Топтық және жұптық жұмыстарды үйлестіреді. Қиналған оқушыларға бағыт-бағдар береді.'
                : 'Организация разноуровневой практической работы (уровни A, B, C). Консультирование учащихся, индивидуальная поддержка при затруднениях.',
            studentAction: isKazakh
                ? 'Оқушылар деңгейлік есептерді өз бетінше және жұпта орындайды. Формулаларды түрлендіріп, есептеулер жүргізеді, өзара жауаптарын тексереді.'
                : 'Выполняют дифференцированные задания, производят расчеты, проверяют решения в парах по готовым критериям.',
            assessment: isKazakh
                ? 'Өзара бағалау: «Бағдаршам» әдісі. Тапсырма парақтары (3 балл)'
                : 'Взаимооценивание: Метод «Светофор». Раздаточные карточки (3 балла)'
        },
        {
            stageName: isKazakh ? '4. Қорытынды және Рефлексия' : '4. Итоги и рефлексия',
            time: '38–45 мин',
            teacherAction: isKazakh
                ? 'Сабақты қорытындылайды, оқу мақсаттарына жету деңгейін бағалайды. Үй тапсырмасын береді. Кері байланыс парақтарын жинайды.'
                : 'Подведение итогов урока, оценка степени достижения учебных целей. Инструктаж по выполнению домашнего задания.',
            studentAction: isKazakh
                ? '«БББ» (Білдім, Білгім келеді, Үйрендім) әдісі бойынша рефлексия жасайды. Үй жұмысын күнделікке жазып алады.'
                : 'Заполняют лист рефлексии (прием «Знаю - Хочу узнать - Узнал»). Записывают домашнее задание в дневники.',
            assessment: isKazakh
                ? 'Рефлексия парағы: өзін-өзі бағалау. Күнделік'
                : 'Лист рефлексии: самооценка. Дневник'
        }
    ];

    const stagesRowsHtml = stages.map(s => `
        <tr>
            <td><strong>${s.stageName || s.stage}</strong><br><span class="timing-badge">${s.time || ''}</span></td>
            <td>${s.teacherAction || ''}</td>
            <td>${s.studentAction || ''}</td>
            <td>${s.assessment || ''}</td>
        </tr>
    `).join('');

    const unitText = data?.unit || (topic.includes(':') ? topic.split(':')[0] : (isKazakh ? 'Негізгі оқу бөлімі' : 'Основной раздел'));
    const topicText = data?.topic || topic;
    const learningObj = data?.learningObjectives || (grade.replace(/[^0-9]/g, '') || '8') + '.1.2 — ' + (isKazakh ? topic + ' бойынша негізгі ұғымдар мен формулаларды меңгеру және қолдану' : 'применять основные понятия и формулы по теме ' + topic);
    const lessonObj = data?.lessonObjectives || (isKazakh 
        ? `<strong>Барлығы:</strong> Тақырыптың теориялық негіздерін біледі.<br><strong>Көпшілігі:</strong> Негізгі формулаларды есеп шығаруда қолданады.<br><strong>Кейбіреулері:</strong> Құбылысты талдап, күрделі есептерді шешеді.`
        : `<strong>Все:</strong> Знают базовые понятия и формулы темы.<br><strong>Большинство:</strong> Умеют применять знания при решении типовых задач.<br><strong>Некоторые:</strong> Способны анализировать графики и решать задачи повышенной сложности.`);

    const diffText = data?.differentiation || (isKazakh 
        ? 'Қабілеті жоғары оқушыларға шығармашылық күрделі есептер ұсынылады. Қолдауды қажет ететін оқушыларға дайын сызба-үлгілер мен көмек беріледі.'
        : 'Учащимся с высокой мотивацией предлагаются комбинированные задачи. Учащимся, требующим поддержки, предоставляются опорные карточки.');

    const safetyText = data?.safety || (isKazakh
        ? 'Кабинеттегі қауіпсіздік техникасы ережелерін сақтау. Көз жаттығулары мен сергіту сәті.'
        : 'Соблюдение правил техники безопасности в кабинете. Проведение физкультминутки и гимнастики для глаз.');

    return `
        <div class="doc-header-block">
            <div class="doc-state-heading">${stateHead}</div>
            <div class="doc-school-heading">${school}</div>
            <h1 class="doc-main-title">${isKazakh ? 'ҚЫСҚА МЕРЗІМДІ САБАҚ ЖОСПАРЫ (ҚМЖ)' : 'КРАТКОСРОЧНЫЙ ПЛАН УРОКА (КСП)'}</h1>
        </div>

        <table class="doc-table-meta">
            <tr>
                <td class="cell-label"><strong>${isKazakh ? 'Бөлім:' : 'Раздел:'}</strong></td>
                <td>${unitText}</td>
                <td class="cell-label"><strong>${isKazakh ? 'Педагогтің Т.А.Ә.:' : 'ФИО педагога:'}</strong></td>
                <td>${teacher}</td>
            </tr>
            <tr>
                <td class="cell-label"><strong>${isKazakh ? 'Күні:' : 'Дата:'}</strong></td>
                <td>2026 жыл</td>
                <td class="cell-label"><strong>${isKazakh ? 'Сынып / Пән:' : 'Класс / Предмет:'}</strong></td>
                <td>${grade} • ${subject}</td>
            </tr>
            <tr>
                <td class="cell-label"><strong>${isKazakh ? 'Сабақтың тақырыбы:' : 'Тема урока:'}</strong></td>
                <td colspan="3"><strong>${topicText}</strong></td>
            </tr>
            <tr>
                <td class="cell-label"><strong>${isKazakh ? 'Оқу мақсаттары:' : 'Цели обучения:'}</strong></td>
                <td colspan="3">${learningObj}</td>
            </tr>
            <tr>
                <td class="cell-label"><strong>${isKazakh ? 'Сабақтың мақсаты:' : 'Цели урока:'}</strong></td>
                <td colspan="3">${lessonObj}</td>
            </tr>
        </table>

        <h2 class="doc-section-title">${isKazakh ? 'Сабақтың барысы мен кезеңдері' : 'Ход и этапы урока'}</h2>

        <table class="doc-table-steps">
            <thead>
                <tr>
                    <th style="width:16%;">${isKazakh ? 'Сабақтың кезеңі / Уақыты' : 'Этап урока / Время'}</th>
                    <th style="width:34%;">${isKazakh ? 'Педагогтің әрекеті' : 'Действия педагога'}</th>
                    <th style="width:34%;">${isKazakh ? 'Оқушының әрекеті' : 'Действия учащихся'}</th>
                    <th style="width:16%;">${isKazakh ? 'Бағалау / Ресурстар' : 'Оценивание / Ресурсы'}</th>
                </tr>
            </thead>
            <tbody>
                ${stagesRowsHtml}
            </tbody>
        </table>

        <h2 class="doc-section-title">${isKazakh ? 'Саралау және қауіпсіздік ережелері' : 'Дифференциация и безопасность'}</h2>
        <table class="doc-table-meta">
            <tr>
                <td class="cell-label"><strong>${isKazakh ? 'Саралау (Дифференциация):' : 'Дифференциация:'}</strong></td>
                <td>${diffText}</td>
            </tr>
            <tr>
                <td class="cell-label"><strong>${isKazakh ? 'Денсаулық және қауіпсіздік:' : 'Охрана здоровья и ТБ:'}</strong></td>
                <td>${safetyText}</td>
            </tr>
        </table>

        <div class="doc-signature-row">
            <div class="sig-block">
                <span>${isKazakh ? 'Пән мұғалімі:' : 'Учитель-предметник:'} _________________ (${teacher})</span>
            </div>
            <div class="sig-block">
                <span>${isKazakh ? 'Тексерген оқу ісінің меңгерушісі:' : 'Проверил зав. учебной частью:'} _________________</span>
            </div>
        </div>
    `;
}


/* ──────────────────────────────────────────────
   EXPORT UTILITIES (WORD .DOCX & PDF)
─────────────────────────────────────────────── */
function exportToWord(element, docTitle, subject) {
    showToast('Microsoft Word (.doc) файлы дайындалуда...', 'info');
    
    const contentHtml = element.innerHTML;
    const filename = `${docTitle} - ${subject}.doc`.replace(/[/\\?%*:|"<>]/g, '-');

    const fullHtml = `
        <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
        <head>
            <meta charset='utf-8'>
            <title>${docTitle}</title>
            <style>
                @page Section1 {
                    size: 595.3pt 841.9pt; /* A4 */
                    margin: 42.5pt 42.5pt 42.5pt 56.7pt; /* 1.5cm / 2cm */
                    mso-header-margin: 35.4pt;
                    mso-footer-margin: 35.4pt;
                    mso-paper-source: 0;
                }
                div.Section1 { page: Section1; }
                body { font-family: 'Times New Roman', Times, serif; font-size: 12pt; line-height: 1.35; color: #000; }
                table { width: 100%; border-collapse: collapse; margin-bottom: 12pt; font-size: 10.5pt; font-family: 'Times New Roman', serif; }
                th, td { border: 1pt solid #000; padding: 5pt 6pt; vertical-align: top; }
                th { background-color: #f2f2f2; font-weight: bold; text-align: center; }
                h1 { font-size: 14pt; font-weight: bold; text-align: center; text-transform: uppercase; margin-bottom: 12pt; }
                h2 { font-size: 12pt; font-weight: bold; margin-top: 14pt; margin-bottom: 6pt; border-bottom: 1pt solid #000; padding-bottom: 2pt; }
                .cell-label { background-color: #f9f9f9; width: 22%; font-weight: bold; }
                .doc-header-block { text-align: center; margin-bottom: 14pt; }
                .doc-state-heading { font-size: 11pt; font-weight: bold; text-transform: uppercase; }
                .doc-school-heading { font-size: 11pt; font-weight: bold; }
                .doc-signature-row { margin-top: 24pt; width: 100%; display: flex; justify-content: space-between; }
                .doc-approval-stamp { width: 100%; text-align: right; margin-bottom: 14pt; font-size: 11pt; }
            </style>
        </head>
        <body>
            <div class="Section1">
                ${contentHtml}
            </div>
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
    showToast(`Word құжаты «${filename}» сәтті жүктелді!`, 'success');
}

async function exportToPdf(element, docTitle, subject) {
    showToast('Ресми PDF құжаты әзірленуде...', 'info');
    const filename = `${docTitle} - ${subject}.pdf`.replace(/[/\\?%*:|"<>]/g, '-');

    const opt = {
        margin: [15, 15, 15, 15],
        filename: filename,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: false },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    try {
        await html2pdf().set(opt).from(element).save();
        showToast(`PDF құжаты «${filename}» сақталды!`, 'success');
    } catch (e) {
        console.error('[PDF Export Error]', e);
        showToast('PDF сақтау қатесі: ' + e.message, 'error');
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
