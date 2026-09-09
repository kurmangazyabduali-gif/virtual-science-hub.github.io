import { SlideRenderer } from './components/SlideRenderer.js';

export class Editor {
    constructor(store, uiManager) {
        this.store = store;
        this.ui = uiManager;
        this.canvas = document.getElementById('slide-canvas');
        
        // Subscribe to store updates
        this.store.subscribe(this.render.bind(this));
        
        this.bindEvents();
        this.initInteract();
    }

    bindEvents() {
        document.querySelectorAll('.add-element-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const type = e.currentTarget.dataset.type;
                this.addElement(type);
            });
        });

        document.getElementById('btn-add-slide')?.addEventListener('click', () => {
            const newSlide = {
                id: 'slide-' + Date.now(),
                background: '#ffffff',
                layout: 'title-content',
                elements: [
                    {
                        id: 'el-title-' + Date.now(),
                        type: 'text',
                        content: 'Новый слайд',
                        style: { top: '10%', left: '10%', width: '80%', fontSize: '32px', fontWeight: 'bold', color: '#1e293b' }
                    }
                ]
            };
            this.store.addSlide(newSlide);
        });

        const btnDelete = document.getElementById('btn-delete-element');
        if (btnDelete) {
            btnDelete.addEventListener('click', () => {
                const id = this.store.getState().selectedElementId;
                if (id) this.store.deleteElement(id);
            });
        }
        
        document.addEventListener('keydown', (e) => {
            const state = this.store.getState();
            if (e.key === 'Delete' && state.selectedElementId && state.currentMode === 'editor') {
                if (document.activeElement.getAttribute('contenteditable') === 'true') return;
                this.store.deleteElement(state.selectedElementId);
            }
        });

        this.canvas?.addEventListener('mousedown', (e) => {
            if (e.target === this.canvas || e.target === this.canvas.firstElementChild) {
                this.store.selectElement(null);
            }
        });
    }

    initInteract() {
        if (typeof interact === 'undefined') return;

        interact('.canvas-element')
            .draggable({
                inertia: true,
                ignoreFrom: '[contenteditable="true"]',
                modifiers: [
                    interact.modifiers.restrictRect({
                        restriction: 'parent',
                        endOnly: true
                    })
                ],
                autoScroll: true,
                listeners: {
                    start: (event) => {
                        this.store.selectElement(event.target.id);
                    },
                    move: this.dragMoveListener.bind(this),
                    end: (event) => {
                        this.saveElementState(event.target);
                    }
                }
            })
            .resizable({
                edges: { left: '.handle-sw, .canvas-element::before', right: '.handle-ne, .canvas-element::after', bottom: '.handle-sw, .canvas-element::after', top: '.handle-ne, .canvas-element::before' },
                ignoreFrom: '[contenteditable="true"]',
                modifiers: [
                    interact.modifiers.restrictEdges({ outer: 'parent' }),
                    interact.modifiers.restrictSize({ min: { width: 50, height: 50 } })
                ],
                inertia: true
            })
            .on('resizemove', (event) => {
                let target = event.target;
                
                let x = (parseFloat(target.getAttribute('data-x')) || 0);
                let y = (parseFloat(target.getAttribute('data-y')) || 0);
                
                x += event.deltaRect.left;
                y += event.deltaRect.top;

                Object.assign(target.style, {
                    width: `${event.rect.width}px`,
                    height: `${event.rect.height}px`,
                    transform: `translate(${x}px, ${y}px)`
                });

                Object.assign(target.dataset, { x, y });
            })
            .on('resizeend', (event) => {
                this.saveElementState(event.target);
            });
    }

    dragMoveListener(event) {
        var target = event.target;
        var x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx;
        var y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

        target.style.transform = 'translate(' + x + 'px, ' + y + 'px)';
        target.setAttribute('data-x', x);
        target.setAttribute('data-y', y);
    }

    saveElementState(domEl) {
        if (!domEl) return;
        const id = domEl.id;
        const state = this.store.getState();
        const slide = state.slides[state.currentSlideIndex];
        const el = slide?.elements.find(e => e.id === id);
        
        if (el) {
            const parentWidth = this.canvas.clientWidth;
            const parentHeight = this.canvas.clientHeight;
            
            const x = parseFloat(domEl.getAttribute('data-x') || 0);
            const y = parseFloat(domEl.getAttribute('data-y') || 0);
            
            const baseLeft = parseFloat(domEl.style.left) || 0;
            const baseTop = parseFloat(domEl.style.top) || 0;
            
            let newLeftPercent = baseLeft;
            let newTopPercent = baseTop;
            
            if (domEl.style.left.includes('%')) {
                newLeftPercent = parseFloat(domEl.style.left) + (x / parentWidth * 100);
            }
            if (domEl.style.top.includes('%')) {
                newTopPercent = parseFloat(domEl.style.top) + (y / parentHeight * 100);
            }

            const updates = {
                style: {
                    ...el.style,
                    left: `${newLeftPercent}%`,
                    top: `${newTopPercent}%`,
                }
            };
            
            if (domEl.style.width) updates.style.width = domEl.style.width;
            if (domEl.style.height) updates.style.height = domEl.style.height;

            this.store.updateElement(id, updates);
        }
    }

    addElement(type) {
        const newEl = {
            id: 'el-' + Date.now(),
            type: type,
            style: { top: '30%', left: '30%', width: type === 'shape' ? '150px' : '300px', height: type === 'shape' ? '150px' : 'auto' }
        };

        if (type === 'text') {
            newEl.content = 'Новый текст';
            newEl.style.fontSize = '24px';
            newEl.style.color = '#1e293b';
        } else if (type === 'image') {
            newEl.src = 'https://via.placeholder.com/300x200/e2e8f0/64748b?text=Image';
            newEl.style.borderRadius = '8px';
        } else if (type === 'shape') {
            newEl.shapeType = 'rectangle';
            newEl.style.backgroundColor = '#8b5cf6';
            newEl.style.borderRadius = '8px';
        }

        this.store.addElement(newEl);
    }

    // Main render triggered by store changes
    render(state) {
        if (!this.canvas) return;
        
        // 1. Render slides list (sidebar)
        this.renderSlidesList(state);
        
        // 2. Render current slide (canvas)
        const slide = state.slides[state.currentSlideIndex];
        if (slide) {
            SlideRenderer.renderSlide(slide, this.canvas, false, (id) => this.store.selectElement(id));
            
            // Re-apply selection state to DOM
            if (state.selectedElementId) {
                const selectedDom = document.getElementById(state.selectedElementId);
                if (selectedDom) selectedDom.classList.add('selected');
                document.getElementById('btn-delete-element').disabled = false;
            } else {
                document.getElementById('btn-delete-element').disabled = true;
            }
        } else {
            this.canvas.innerHTML = '';
        }

        // 3. Render properties panel
        this.renderPropertiesPanel(state);
    }

    renderSlidesList(state) {
        const container = document.getElementById('slides-list');
        if (!container) return;
        container.innerHTML = '';

        state.slides.forEach((slide, idx) => {
            const isActive = idx === state.currentSlideIndex;
            
            const thumb = document.createElement('div');
            thumb.className = `slide-thumb ${isActive ? 'active' : ''}`;
            thumb.innerHTML = `
                <div class="slide-thumb-number">${idx + 1}</div>
                ${state.slides.length > 1 ? '<button class="slide-thumb-delete"><i class="fa-solid fa-xmark"></i></button>' : ''}
                <div class="thumb-preview w-full h-full bg-cover bg-center" style="background-color: ${slide.background}">
                    <div class="flex items-center justify-center h-full text-[8px] text-gray-400 opacity-50">Слайд ${idx+1}</div>
                </div>
            `;

            thumb.addEventListener('click', (e) => {
                if (e.target.closest('.slide-thumb-delete')) {
                    this.store.deleteSlide(idx);
                    return;
                }
                this.store.setCurrentSlide(idx);
            });

            container.appendChild(thumb);
        });

        if (typeof Sortable !== 'undefined' && !this.sortableInit) {
            this.sortableInit = true;
            Sortable.create(container, {
                animation: 150,
                onEnd: (evt) => {
                    this.store.reorderSlides(evt.oldIndex, evt.newIndex);
                }
            });
        }
    }

    renderPropertiesPanel(state) {
        const id = state.selectedElementId;
        const panel = document.getElementById('properties-content');
        if (!panel) return;

        if (!id) {
            const slide = state.slides[state.currentSlideIndex];
            if(!slide) return;
            panel.innerHTML = `
                <div class="space-y-4">
                    <h4 class="text-xs font-bold text-slate-400 uppercase tracking-wider">Свойства слайда</h4>
                    <div>
                        <label class="block text-xs font-medium text-slate-600 mb-1">Фон слайда</label>
                        <div class="flex items-center gap-2">
                            <input type="color" id="prop-slide-bg" value="${slide.background || '#ffffff'}" class="w-8 h-8 rounded cursor-pointer bg-white border border-gray-200 shadow-sm">
                            <input type="text" value="${slide.background || '#ffffff'}" class="flex-1 bg-white border border-gray-200 rounded px-2 py-1 text-sm text-slate-800 shadow-sm" readonly>
                        </div>
                    </div>
                </div>
            `;
            
            document.getElementById('prop-slide-bg')?.addEventListener('input', (e) => {
                this.store.updateSlideBackground(e.target.value);
            });
            return;
        }

        const slide = state.slides[state.currentSlideIndex];
        const el = slide.elements.find(e => e.id === id);
        if (!el) return;

        let extraProps = '';

        if (el.type === 'text') {
            extraProps = `
                <div>
                    <label class="block text-xs font-medium text-slate-600 mb-1">Цвет текста</label>
                    <input type="color" id="prop-color" value="${el.style.color || '#1e293b'}" class="w-full h-8 rounded cursor-pointer bg-white border border-gray-200 shadow-sm">
                </div>
                <div>
                    <label class="block text-xs font-medium text-slate-600 mb-1">Размер шрифта</label>
                    <select id="prop-fontSize" class="w-full bg-white border border-gray-200 rounded px-2 py-1.5 text-sm text-slate-800 shadow-sm">
                        ${[12, 16, 20, 24, 32, 40, 48, 64, 72, 96].map(s => `<option value="${s}px" ${el.style.fontSize === `${s}px` ? 'selected' : ''}>${s}px</option>`).join('')}
                    </select>
                </div>
                <div>
                    <label class="block text-xs font-medium text-slate-600 mb-1">Начертание</label>
                    <select id="prop-fontWeight" class="w-full bg-white border border-gray-200 rounded px-2 py-1.5 text-sm text-slate-800 shadow-sm">
                        <option value="normal" ${el.style.fontWeight === 'normal' ? 'selected' : ''}>Обычный</option>
                        <option value="500" ${el.style.fontWeight === '500' ? 'selected' : ''}>Полужирный (500)</option>
                        <option value="bold" ${el.style.fontWeight === 'bold' || el.style.fontWeight === '700' ? 'selected' : ''}>Жирный (700)</option>
                        <option value="800" ${el.style.fontWeight === '800' ? 'selected' : ''}>Экстра (800)</option>
                    </select>
                </div>
            `;
        } else if (el.type === 'shape') {
            extraProps = `
                <div>
                    <label class="block text-xs font-medium text-slate-600 mb-1">Цвет заливки</label>
                    <input type="color" id="prop-bg-color" value="${el.style.backgroundColor || '#8b5cf6'}" class="w-full h-8 rounded cursor-pointer bg-white border border-gray-200 shadow-sm">
                </div>
                <div>
                    <label class="block text-xs font-medium text-slate-600 mb-1">Форма</label>
                    <select id="prop-shape-type" class="w-full bg-white border border-gray-200 rounded px-2 py-1.5 text-sm text-slate-800 shadow-sm">
                        <option value="rectangle" ${el.shapeType !== 'circle' ? 'selected' : ''}>Прямоугольник</option>
                        <option value="circle" ${el.shapeType === 'circle' ? 'selected' : ''}>Круг</option>
                    </select>
                </div>
            `;
        } else if (el.type === 'image') {
            extraProps = `
                <div>
                    <label class="block text-xs font-medium text-slate-600 mb-1">URL изображения</label>
                    <input type="text" id="prop-img-src" value="${el.src}" class="w-full bg-white border border-gray-200 rounded px-2 py-1.5 text-sm text-slate-800 shadow-sm">
                </div>
            `;
        }

        panel.innerHTML = `
            <div class="space-y-4">
                <h4 class="text-xs font-bold text-slate-400 uppercase tracking-wider">Свойства элемента</h4>
                ${extraProps}
                <div class="pt-4 mt-4 border-t border-gray-100">
                    <button id="btn-prop-delete" class="w-full bg-red-50 hover:bg-red-100 text-red-600 font-medium py-2 rounded-lg transition text-sm flex items-center justify-center gap-2 border border-red-100">
                        <i class="fa-solid fa-trash-can"></i> Удалить элемент
                    </button>
                </div>
            </div>
        `;

        const bindProp = (id, propName, styleProp) => {
            const elNode = document.getElementById(id);
            if (elNode) {
                elNode.addEventListener('change', (e) => { // use change instead of input for better performance with store
                    const updates = {};
                    if (styleProp) updates.style = { ...el.style, [styleProp]: e.target.value };
                    else updates[propName] = e.target.value;
                    this.store.updateElement(el.id, updates);
                });
            }
        };

        if (el.type === 'text') {
            bindProp('prop-color', null, 'color');
            bindProp('prop-fontSize', null, 'fontSize');
            bindProp('prop-fontWeight', null, 'fontWeight');
        } else if (el.type === 'shape') {
            bindProp('prop-bg-color', null, 'backgroundColor');
            bindProp('prop-shape-type', 'shapeType', null);
        } else if (el.type === 'image') {
            bindProp('prop-img-src', 'src', null);
        }

        document.getElementById('btn-prop-delete')?.addEventListener('click', () => {
            this.store.deleteElement(id);
        });
    }
}
