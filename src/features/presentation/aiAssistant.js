import { SlideRenderer } from './components/SlideRenderer.js';

export class AiAssistant {
    constructor(store, uiManager, aiClient) {
        this.store = store;
        this.ui = uiManager;
        this.client = aiClient;
        
        this.bindEvents();
        this.store.subscribe(this.updateContextualActions.bind(this));
    }

    bindEvents() {
        document.getElementById('hero-ai-form')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.generatePresentation();
        });

        document.getElementById('btn-ai-assistant')?.addEventListener('click', () => {
            const panel = document.getElementById('ai-assistant-panel');
            if (panel) panel.classList.toggle('translate-x-full');
            this.updateContextualActions(this.store.getState());
        });

        document.getElementById('btn-close-assistant')?.addEventListener('click', () => {
            document.getElementById('ai-assistant-panel')?.classList.add('translate-x-full');
        });

        document.getElementById('ai-chat-form')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleAssistantCommand();
        });

        document.querySelectorAll('.ai-cmd-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const cmd = e.target.textContent;
                this.executeAssistantQuickAction(cmd);
            });
        });
    }
    
    updateContextualActions(state) {
        const quickActions = document.getElementById('ai-quick-actions');
        if (!quickActions) return;
        
        const id = state.selectedElementId;
        if (id && state.currentMode === 'editor') {
            const slide = state.slides[state.currentSlideIndex];
            if (slide) {
                const el = slide.elements.find(e => e.id === id);
                if (el && el.type === 'text') {
                    quickActions.classList.remove('hidden');
                    return;
                }
            }
        }
        quickActions.classList.add('hidden');
    }

    async generatePresentation() {
        const promptInput = document.getElementById('hero-ai-prompt');
        const promptText = promptInput ? promptInput.value.trim() : '';

        if (!promptText) {
            this.ui.showToast('Пожалуйста, опишите тему презентации', 'error');
            return;
        }

        this.ui.showAiLoading(true);

        try {
            const parsed = await this.client.generatePresentation(promptText);
            this.buildPresentationFromJSON(parsed);
            
            this.ui.showToast('Презентация готова!', 'success');
            this.ui.switchMode('viewer');
            
        } catch (error) {
            console.error(error);
            this.ui.showToast('Ошибка: ' + error.message, 'error');
        } finally {
            this.ui.showAiLoading(false);
        }
    }

    buildPresentationFromJSON(data) {
        const title = data.title || "Новая презентация";
        const titleInput = document.getElementById('presentation-title');
        if(titleInput) titleInput.value = title;
        
        const theme = data.theme || { backgroundColor: '#ffffff', textColor: '#1e293b', accentColor: '#6366f1' };

        const slides = data.slides.map((s, idx) => {
            const slideId = 'slide-' + Date.now() + '-' + idx;
            const elements = SlideRenderer.createDefaultElementsForLayout(s.layout || 'title-content', theme, s.title, s.content, s.list, s.imageIdea);

            // Give unique prefix to elements
            elements.forEach(el => el.id = el.id.replace('el-', `el-${idx}-`));

            return {
                id: slideId,
                background: theme.backgroundColor,
                layout: s.layout,
                elements: elements
            };
        });

        this.store.setSlides(slides, title);
    }

    async handleAssistantCommand() {
        const input = document.getElementById('ai-chat-input');
        const cmd = input.value.trim();
        if (!cmd) return;
        
        input.value = '';
        this.appendChatMessage(cmd, 'user');
        
        const state = this.store.getState();
        const selectedId = state.selectedElementId;
        const slide = state.slides[state.currentSlideIndex];
        
        let context = `Вы находитесь в редакторе презентаций. `;
        
        if (selectedId && state.currentMode === 'editor' && slide) {
            const el = slide.elements.find(e => e.id === selectedId);
            if (el && el.type === 'text') {
                context += `Пользователь выделил текст: "${el.content.replace(/<[^>]*>?/gm, '')}". ВАЖНО: Примените команду ИМЕННО к этому тексту.`;
            }
        }

        this.appendChatMessage('<i class="fa-solid fa-ellipsis animate-pulse"></i>', 'bot', 'loading-msg');
        
        try {
            const aiResponse = await this.client.editContent(context, cmd);
            
            document.getElementById('loading-msg')?.remove();
            this.appendChatMessage(aiResponse, 'bot');
            
            if (selectedId && state.currentMode === 'editor') {
                const el = slide.elements.find(e => e.id === selectedId);
                if (el && el.type === 'text') {
                    this.store.updateElement(selectedId, { content: aiResponse });
                    this.ui.showToast('Текст обновлен', 'success');
                }
            }
        } catch (err) {
            document.getElementById('loading-msg')?.remove();
            this.appendChatMessage('Произошла ошибка при обращении к ИИ.', 'bot');
        }
    }

    executeAssistantQuickAction(action) {
        const input = document.getElementById('ai-chat-input');
        if(input) input.value = action;
        this.handleAssistantCommand();
    }

    appendChatMessage(text, role, id = null) {
        const container = document.getElementById('ai-chat-history');
        if(!container) return;
        const msg = document.createElement('div');
        msg.className = role === 'user' 
            ? 'bg-purple-600 rounded-xl rounded-br-none p-3 text-white self-end ml-4 shadow-sm' 
            : 'bg-white rounded-xl rounded-tl-none p-3 text-slate-700 border border-gray-100 mr-4 shadow-sm';
        
        if (id) msg.id = id;
        msg.innerHTML = text;
        
        container.appendChild(msg);
        container.scrollTop = container.scrollHeight;
    }
}
