/* =====================================================
   ASHYQDOC — OFFICIAL TEACHER DOCUMENTATION ENGINE JS
   Multi-Tier AI Engine + Deterministic Table Structure
   Strict Ministry of Education (ГОСО РК) Compliant
   ===================================================== */

// Primary AI key provided by user for documentation generation
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
        document.documentElement.style.setProperty('--doc-zoom', currentZoom);
        zoomLevelText.textContent = `${Math.round(currentZoom * 100)}%`;
    }

    // ── Stamp Toggle Switch ──
    if (btnToggleStamp) {
        btnToggleStamp.addEventListener('click', () => {
            hasStamp = !hasStamp;
            btnToggleStamp.classList.toggle('active', hasStamp);
            const schoolName = inputSchool.value.trim() || '«№ 1 мектеп-лицей» КММ';
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
        const teacher = inputTeacher.value.trim() || (lang === 'Қазақша' ? 'Абдуғали К. М.' : 'Абдугали К. М.');
        const school = inputSchool.value.trim() || (lang === 'Қазақша' ? '«№ 1 мектеп-лицей» КММ' : 'КГУ «Школа-лицей № 1»');

        btnGenerate.disabled = true;
        btnGenIcon.className = 'fa-solid fa-spinner fa-spin';
        btnGenText.textContent = 'ИИ ресми құжатты түзуде...';
        genProgressBox.classList.remove('hidden');
        setGenProgress(20, 'ГОСО талаптары бойынша кестелерді құру...');
        docStatusText.textContent = 'ИИ құжатты генерациялауда...';

        try {
            setGenProgress(45, `«${docTypeName}» құжатын қалыптастыру...`);
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

            setGenProgress(85, 'Кестелік құрылымды стандарттау және верстка...');
            await sleep(250);

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


/* ──────────────────────────────────────────────
   AI PROMPT BUILDER & DETERMINISTIC ENGINE
─────────────────────────────────────────────── */
async function callUniversalDocAI(params) {
    const { category, docTypeId, docTypeName, subject, grade, lang, topic, teacher, school } = params;

    const isKazakh = lang === 'Қазақша';
    const isRussian = lang === 'Русский';

    const systemPrompt = [
        'Сен Қазақстан Республикасы Оқу-ағарту министрлігінің мемлекеттік жоғары санатты сарапшы-әдіскерісің.',
        'Сенің міндетің — мұғалімге арналған ресми, мінсіз, толық мазмұнды педагогикалық құжатты ГОСО кестелік үлгісінде дайындау.',
        'Жауапты ТЕК таза HTML түрінде қайтар (ешқандай markdown, ```html немесе түсіндірме мәтінсіз).',
        'БАРЛЫҚ кестелер міндетті түрде берілген CSS кластарымен түзілуі тиіс: doc-table-meta, doc-table-steps, doc-table-rubric.',
        `Құжаттың тілі СТРОГО: ${lang}!`
    ].join('\n');

    const userPrompt = [
        `ТИП ДОКУМЕНТА: ${docTypeName} (${docTypeId})`,
        `ПРЕДМЕТ: ${subject}`,
        `КЛАСС: ${grade}`,
        `ЯЗЫК: ${lang}`,
        `ТЕМА / БӨЛІМ / ЦЕЛЬ: ${topic}`,
        `ПЕДАГОГ: ${teacher}`,
        `ОРГАНИЗАЦИЯ: ${school}`,
        '',
        'Сформируй идеальный, исчерпывающий, официальный документ в формате HTML с обязательными таблицами doc-table-meta и doc-table-steps.'
    ].join('\n');

    let rawHtml = '';

    // 1. TIER 1: Pollinations AI Engine (with key sk-YDchG_DZqjknVNsuyJwSaA)
    const effectivePollinationsKey = (API_KEY && API_KEY.startsWith('sk-')) ? API_KEY : USER_POLLINATIONS_KEY;
    try {
        const res = await fetch('https://gen.pollinations.ai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + effectivePollinationsKey
            },
            body: JSON.stringify({
                model: 'openai',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userPrompt }
                ],
                temperature: 0.25
            })
        });
        if (res.ok) {
            const data = await res.json();
            const text = data?.choices?.[0]?.message?.content;
            if (text && text.trim().length > 50) {
                rawHtml = text;
            }
        }
    } catch (e) {
        console.warn('Pollinations chat completions failed, trying text endpoint...', e);
    }

    // 1.1 Direct Pollinations Text Endpoint Fallback with key
    if (!rawHtml) {
        try {
            const fullPrompt = `${systemPrompt}\n\n${userPrompt}\n\nСформируй официальный HTML документ:`;
            const res = await fetch(`https://text.pollinations.ai/${encodeURIComponent(fullPrompt)}?key=${effectivePollinationsKey}&model=openai`);
            if (res.ok) {
                const text = await res.text();
                if (text && text.trim().length > 50) {
                    rawHtml = text;
                }
            }
        } catch (e) {
            console.warn('Pollinations text endpoint failed, trying Gemini...', e);
        }
    }

    // 2. TIER 2: Google Gemini (2.5-Flash & 1.5-Flash)
    if (!rawHtml) {
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
                            temperature: 0.3
                        }
                    })
                });
                if (res.ok) {
                    const data = await res.json();
                    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
                    if (text && text.trim().length > 50) {
                        rawHtml = text;
                        break;
                    }
                }
            } catch (e) {
                console.warn(`Gemini model ${model} failed, trying next...`, e);
            }
        }
    }

    // 3. TIER 3: Deterministic High-Grade Pedagogical Generator (Never fails!)
    if (!rawHtml) {
        console.info('Using built-in deterministic pedagogical document generator');
        return generateDeterministicDocument(params);
    }

    // Clean markdown wrappers and enforce 100% official HTML standards
    const cleaned = cleanHtmlOutput(rawHtml);
    return postProcessOfficialDocument(cleaned, params);
}

function cleanHtmlOutput(raw) {
    let clean = String(raw).trim();
    if (clean.startsWith('```html')) clean = clean.slice(7);
    if (clean.startsWith('```htm')) clean = clean.slice(6);
    if (clean.startsWith('```')) clean = clean.slice(3);
    if (clean.endsWith('```')) clean = clean.slice(0, -3);
    return clean.trim();
}

/**
 * Ensures the output ALWAYS contains official tables, headers, and signature lines
 */
function postProcessOfficialDocument(html, params) {
    const { docTypeName, subject, grade, lang, topic, teacher, school } = params;
    const isKazakh = lang === 'Қазақша';

    let result = html;

    // 1. Ensure Table classes exist
    result = result.replace(/<table>/gi, '<table class="doc-table-steps">');
    result = result.replace(/<table\s+border=["']?[0-9]*["']?>/gi, '<table class="doc-table-steps">');

    // 2. Ensure Official Header block exists
    if (!result.includes('doc-header-block') && !result.includes('doc-state-heading')) {
        const stateHead = isKazakh ? 'ҚАЗАҚСТАН РЕСПУБЛИКАСЫ ОҚУ-АҒАРТУ МИНИСТРЛІГІ' : 'МИНИСТЕРСТВО ПРОСВЕЩЕНИЯ РЕСПУБЛИКИ КАЗАХСТАН';
        const schoolHead = isKazakh ? `«${school}» КММ` : `КГУ «${school}»`;
        const headerBlock = `
            <div class="doc-header-block">
                <div class="doc-state-heading">${stateHead}</div>
                <div class="doc-school-heading">${schoolHead}</div>
                <h1 class="doc-main-title">${docTypeName.toUpperCase()}</h1>
            </div>
        `;
        result = headerBlock + result;
    }

    // 3. Ensure Signature block exists
    if (!result.includes('doc-signature-row')) {
        const sigBlock = isKazakh ? `
            <div class="doc-signature-row">
                <div class="sig-block">
                    <span>Пән мұғалімі: _________________ (қолы)</span>
                </div>
                <div class="sig-block">
                    <span>Тексерген оқу ісінің меңгерушісі: _________________</span>
                </div>
            </div>
        ` : `
            <div class="doc-signature-row">
                <div class="sig-block">
                    <span>Учитель-предметник: _________________ (подпись)</span>
                </div>
                <div class="sig-block">
                    <span>Проверил зав. учебной частью: _________________</span>
                </div>
            </div>
        `;
        result = result + sigBlock;
    }

    return result;
}

/**
 * Built-in Deterministic Generator according to official standard
 */
function generateDeterministicDocument(params) {
    const { docTypeId, docTypeName, subject, grade, lang, topic, teacher, school } = params;
    const isKazakh = lang === 'Қазақша';
    const isRussian = lang === 'Русский';

    const stateHeading = isKazakh 
        ? 'ҚАЗАҚСТАН РЕСПУБЛИКАСЫ ОҚУ-АҒАРТУ МИНИСТРЛІГІ' 
        : (isRussian ? 'МИНИСТЕРСТВО ПРОСВЕЩЕНИЯ РЕСПУБЛИКИ КАЗАХСТАН' : 'MINISTRY OF EDUCATION OF THE REPUBLIC OF KAZAKHSTAN');

    const schoolHeading = isKazakh 
        ? `«${school}» КММ` 
        : (isRussian ? `КГУ «${school}»` : `School «${school}»`);

    if (docTypeId === 'qmj' || docTypeId === 'tech_map' || docTypeId === 'open_lesson') {
        if (isKazakh) {
            return `
                <div class="doc-header-block">
                    <div class="doc-state-heading">${stateHeading}</div>
                    <div class="doc-school-heading">${schoolHeading}</div>
                    <h1 class="doc-main-title">${docTypeName.toUpperCase()}</h1>
                </div>

                <table class="doc-table-meta">
                    <tr>
                        <td class="cell-label"><strong>Бөлім:</strong></td>
                        <td>${topic.split(':')[0] || 'Негізгі оқу бөлімі'}</td>
                        <td class="cell-label"><strong>Педагогтің Т.А.Ә.:</strong></td>
                        <td>${teacher}</td>
                    </tr>
                    <tr>
                        <td class="cell-label"><strong>Күні:</strong></td>
                        <td>2026 жыл</td>
                        <td class="cell-label"><strong>Сынып / Пән:</strong></td>
                        <td>${grade} • ${subject}</td>
                    </tr>
                    <tr>
                        <td class="cell-label"><strong>Сабақтың тақырыбы:</strong></td>
                        <td colspan="3"><strong>${topic}</strong></td>
                    </tr>
                    <tr>
                        <td class="cell-label"><strong>Оқу мақсаттары:</strong></td>
                        <td colspan="3">${grade.replace(/[^0-9]/g, '') || '8'}.1.2 — тақырып бойынша негізгі ұғымдар мен формулаларды меңгеру, тәжірибелік есептер шығару және талдау жүргізу</td>
                    </tr>
                    <tr>
                        <td class="cell-label"><strong>Сабақтың мақсаты:</strong></td>
                        <td colspan="3"><strong>Барлығы:</strong> Тақырыптың теориялық негіздері мен заңдылықтарын біледі.<br><strong>Көпшілігі:</strong> Негізгі формулаларды қолданып, сапалық және есептік тапсырмаларды орындайды.<br><strong>Кейбіреулері:</strong> Құбылысты графиктер мен тәжірибелік мәліметтер негізінде терең талдайды.</td>
                    </tr>
                </table>

                <h2 class="doc-section-title">Сабақтың барысы мен кезеңдері</h2>

                <table class="doc-table-steps">
                    <thead>
                        <tr>
                            <th style="width:16%;">Сабақтың кезеңі / Уақыты</th>
                            <th style="width:34%;">Педагогтің әрекеті</th>
                            <th style="width:34%;">Оқушының әрекеті</th>
                            <th style="width:16%;">Бағалау / Ресурстар</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td><strong>1. Ұйымдастыру кезеңі</strong><br><span class="timing-badge">0–5 мин</span></td>
                            <td>Оқушылармен сәлемдесу, түгелдеу. Жағымды психологиялық ахуал орнату. Өткен тақырыптар бойынша сұрақ-жауап ұйымдастыру («Миға шабуыл»).</td>
                            <td>Мұғаліммен амандасады, сабаққа дайындалады. Қойылған сұрақтарға жауап беріп, сабақтың тақырыбы мен мақсатын анықтайды.</td>
                            <td><strong>Формативті:</strong><br>«Жарайсың!» ауызша мадақтау.<br><em>Интерактивті тақта</em></td>
                        </tr>
                        <tr>
                            <td><strong>2. Жаңа білімді меңгеру</strong><br><span class="timing-badge">5–25 мин</span></td>
                            <td>«${topic}» тақырыбының негізгі ұғымдарын, формулаларын түсіндіреді. AshyqLab виртуалды зертханалық үлгілері мен сызбаларын көрсетеді.</td>
                            <td>Жаңа ұғымдарды тыңдайды, формулалар мен анықтамаларды дәптерге жазады. Сұрақтар қойып, талқылауға қатысады.</td>
                            <td><strong>Дескриптор:</strong><br>- Негізгі заңдылықты біледі;<br>- Өлшем бірліктерін дұрыс қолданады (2 балл).</td>
                        </tr>
                        <tr>
                            <td><strong>3. Практикалық бекіту</strong><br><span class="timing-badge">25–38 мин</span></td>
                            <td>Деңгейлік тапсырмалар ұсынады (A, B, C деңгейі). Топтық және жеке жұмыстарды бақылайды, қиналған оқушыларға бағыт-бағдар береді.</td>
                            <td>Оқушылар деңгейлік есептерді шығарады, топта талқылайды, өзара жауаптарын салыстырып, тексеру жүргізеді.</td>
                            <td><strong>Өзара бағалау:</strong><br>«Бағдаршам» әдісі.<br><em>Тапсырма парақтары (3 балл)</em></td>
                        </tr>
                        <tr>
                            <td><strong>4. Қорытынды және Рефлексия</strong><br><span class="timing-badge">38–45 мин</span></td>
                            <td>Сабақты қорытындылайды, мақсатқа жету деңгейін бағалайды. Үй тапсырмасын береді. Кері байланыс парақтарын жинайды.</td>
                            <td>«БББ» (Білдім, Білгім келеді, Үйрендім) әдісі бойынша рефлексия жасайды. Күнделікке үй тапсырмасын жазады.</td>
                            <td><strong>Рефлексия парағы:</strong><br>Өзін-өзі бағалау.<br><em>Күнделік</em></td>
                        </tr>
                    </tbody>
                </table>

                <h2 class="doc-section-title">Саралау және қауіпсіздік ережелері</h2>
                <table class="doc-table-meta">
                    <tr>
                        <td class="cell-label"><strong>Саралау (Дифференциация):</strong></td>
                        <td>Қабілеті жоғары оқушыларға күрделі шығармашылық есептер беріледі. Қолдауды қажет ететін оқушыларға көмекші алгоритмдік сызбалар мен формулалар ұсынылады.</td>
                    </tr>
                    <tr>
                        <td class="cell-label"><strong>Денсаулық және қауіпсіздік:</strong></td>
                        <td>Кабинеттегі қауіпсіздік ережелерін сақтау. Көз жаттығулары мен сергіту сәтін уақытылы орындау.</td>
                    </tr>
                </table>

                <div class="doc-signature-row">
                    <div class="sig-block">
                        <span>Пән мұғалімі: _________________ (${teacher})</span>
                    </div>
                    <div class="sig-block">
                        <span>Тексерген оқу ісінің меңгерушісі: _________________</span>
                    </div>
                </div>
            `;
        } else {
            return `
                <div class="doc-header-block">
                    <div class="doc-state-heading">${stateHeading}</div>
                    <div class="doc-school-heading">${schoolHeading}</div>
                    <h1 class="doc-main-title">${docTypeName.toUpperCase()}</h1>
                </div>

                <table class="doc-table-meta">
                    <tr>
                        <td class="cell-label"><strong>Раздел:</strong></td>
                        <td>${topic.split(':')[0] || 'Основной учебный раздел'}</td>
                        <td class="cell-label"><strong>ФИО педагога:</strong></td>
                        <td>${teacher}</td>
                    </tr>
                    <tr>
                        <td class="cell-label"><strong>Дата:</strong></td>
                        <td>2026 год</td>
                        <td class="cell-label"><strong>Класс / Предмет:</strong></td>
                        <td>${grade} • ${subject}</td>
                    </tr>
                    <tr>
                        <td class="cell-label"><strong>Тема урока:</strong></td>
                        <td colspan="3"><strong>${topic}</strong></td>
                    </tr>
                    <tr>
                        <td class="cell-label"><strong>Цели обучения:</strong></td>
                        <td colspan="3">${grade.replace(/[^0-9]/g, '') || '8'}.1.2 — применять теоретические законы и формулы при решении расчетных и качественных задач</td>
                    </tr>
                    <tr>
                        <td class="cell-label"><strong>Цели урока:</strong></td>
                        <td colspan="3"><strong>Все:</strong> Знают базовые понятия и формулы изучаемой темы.<br><strong>Большинство:</strong> Умеют применять полученные знания при решении типовых задач.<br><strong>Некоторые:</strong> Способны анализировать графические зависимости и решать задачи повышенной сложности.</td>
                    </tr>
                </table>

                <h2 class="doc-section-title">Ход и этапы урока</h2>

                <table class="doc-table-steps">
                    <thead>
                        <tr>
                            <th style="width:16%;">Этап урока / Время</th>
                            <th style="width:34%;">Действия педагога</th>
                            <th style="width:34%;">Действия учащихся</th>
                            <th style="width:16%;">Оценивание / Ресурсы</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td><strong>1. Организационный этап</strong><br><span class="timing-badge">0–5 мин</span></td>
                            <td>Приветствие учащихся, проверка готовности к уроку. Актуализация опорных знаний методом фронтального опроса («Мозговой штурм»).</td>
                            <td>Приветствуют учителя, включаются в деловой ритм. Отвечают на вопросы, формулируют тему и цель урока.</td>
                            <td><strong>Формативное:</strong><br>Словесная похвала.<br><em>Интерактивная доска</em></td>
                        </tr>
                        <tr>
                            <td><strong>2. Изучение нового материала</strong><br><span class="timing-badge">5–25 мин</span></td>
                            <td>Объяснение темы «${topic}». Демонстрация интерактивных симуляций AshyqLab, вывод ключевых расчетных формул и физических величин.</td>
                            <td>Слушают объяснение, ведут записи в тетрадях, анализируют графики и схемы, задают уточняющие вопросы.</td>
                            <td><strong>Дескрипторы:</strong><br>- Знает формулировку закона;<br>- Применяет единицы измерения (2 балла).</td>
                        </tr>
                        <tr>
                            <td><strong>3. Первичное закрепление</strong><br><span class="timing-badge">25–38 мин</span></td>
                            <td>Организация разноуровневой работы (уровни A, B, C). Консультирование учащихся, индивидуальная поддержка при затруднениях.</td>
                            <td>Выполняют дифференцированные задания, работают в парах/группах, производят вычисления и взаимопроверку.</td>
                            <td><strong>Взаимооценивание:</strong><br>Метод «Светофор».<br><em>Карточки с заданиями (3 балла)</em></td>
                        </tr>
                        <tr>
                            <td><strong>4. Итоги и рефлексия</strong><br><span class="timing-badge">38–45 мин</span></td>
                            <td>Подведение итогов урока, оценка степени достижения целей. Инструктаж по выполнению домашнего задания.</td>
                            <td>Заполняют лист рефлексии (прием «Знаю - Хочу узнать - Узнал»). Записывают домашнее задание в дневники.</td>
                            <td><strong>Лист рефлексии:</strong><br>Самооценка.<br><em>Дневник</em></td>
                        </tr>
                    </tbody>
                </table>

                <h2 class="doc-section-title">Дифференциация и техника безопасности</h2>
                <table class="doc-table-meta">
                    <tr>
                        <td class="cell-label"><strong>Дифференциация:</strong></td>
                        <td>Учащимся с высокой мотивацией предлагаются нестандартные комбинированные задачи. Учащимся, требующим поддержки, предоставляются опорные алгоритмические карточки.</td>
                    </tr>
                    <tr>
                        <td class="cell-label"><strong>Охрана здоровья и ТБ:</strong></td>
                        <td>Соблюдение правил безопасной работы в кабинете. Проведение физкультминутки и гимнастики для глаз.</td>
                    </tr>
                </table>

                <div class="doc-signature-row">
                    <div class="sig-block">
                        <span>Учитель-предметник: _________________ (${teacher})</span>
                    </div>
                    <div class="sig-block">
                        <span>Проверил зав. учебной частью: _________________</span>
                    </div>
                </div>
            `;
        }
    }

    // Default generic official template for other categories (assess, labs, class, reports)
    return `
        <div class="doc-header-block">
            <div class="doc-state-heading">${stateHeading}</div>
            <div class="doc-school-heading">${schoolHeading}</div>
            <h1 class="doc-main-title">${docTypeName.toUpperCase()}</h1>
        </div>

        <table class="doc-table-meta">
            <tr>
                <td class="cell-label"><strong>Пән / Предмет:</strong></td>
                <td>${subject}</td>
                <td class="cell-label"><strong>Сынып / Класс:</strong></td>
                <td>${grade}</td>
            </tr>
            <tr>
                <td class="cell-label"><strong>Педагог:</strong></td>
                <td>${teacher}</td>
                <td class="cell-label"><strong>Оқу жылы / Дата:</strong></td>
                <td>2025–2026 оқу жылы</td>
            </tr>
            <tr>
                <td class="cell-label"><strong>Тақырыбы / Раздел:</strong></td>
                <td colspan="3"><strong>${topic}</strong></td>
            </tr>
        </table>

        <h2 class="doc-section-title">${isKazakh ? '1. Тапсырмалар мазмұны мен құрылымы' : '1. Содержание и структура заданий'}</h2>
        
        <table class="doc-table-rubric">
            <thead>
                <tr>
                    <th style="width:12%;">№</th>
                    <th style="width:48%;">${isKazakh ? 'Тапсырма шарты' : 'Условие задания'}</th>
                    <th style="width:25%;">${isKazakh ? 'Дескриптор' : 'Дескриптор'}</th>
                    <th style="width:15%;">${isKazakh ? 'Балл' : 'Баллы'}</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td style="text-align:center;">1</td>
                    <td>${topic} бойынша негізгі ұғымдар мен терминдердің анықтамасын жазыңыз.</td>
                    <td>Негізгі анықтамаларды дұрыс көрсетеді.</td>
                    <td style="text-align:center;">2 балл</td>
                </tr>
                <tr>
                    <td style="text-align:center;">2</td>
                    <td>Берілген шамалардың байланысын сипаттайтын формуланы пайдаланып, есептеулер жүргізіңіз.</td>
                    <td>Формуланы түрлендіреді және дұрыс есептейді.</td>
                    <td style="text-align:center;">3 балл</td>
                </tr>
                <tr>
                    <td style="text-align:center;">3</td>
                    <td>Тәжірибелік немесе графикалық мәліметтерге сүйене отырып, қорытынды жасаңыз.</td>
                    <td>Мәліметтерді талдап, дұрыс тұжырым жасайды.</td>
                    <td style="text-align:center;">5 балл</td>
                </tr>
            </tbody>
        </table>

        <div class="doc-signature-row">
            <div class="sig-block">
                <span>Құрастырушы педагог: _________________ (${teacher})</span>
            </div>
            <div class="sig-block">
                <span>Әдістемелік бірлестік жетекшісі: _________________</span>
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
