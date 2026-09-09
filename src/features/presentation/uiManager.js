export class UIManager {
    constructor(store) {
        this.store = store;
        this.bindEvents();
        this.store.subscribe(this.handleStateChange.bind(this));
    }

    bindEvents() {
        // Mode switching logic
        document.getElementById('btn-mode-switch')?.addEventListener('click', (e) => {
            const state = this.store.getState();
            if (state.currentMode === 'viewer') {
                this.switchMode('editor');
            } else {
                this.switchMode('viewer');
            }
        });
    }

    handleStateChange(state) {
        // Only react if the UI is out of sync with state mode
        // For simplicity, we can just ensure UI reflects state.currentMode
        this.switchMode(state.currentMode, true);
    }

    switchMode(mode, fromState = false) {
        if (!fromState) {
            this.store.setMode(mode);
            return;
        }

        document.querySelectorAll('.view-section').forEach(sec => sec.classList.remove('active'));
        
        const toolbar = document.getElementById('global-toolbar');
        const title = document.getElementById('presentation-title');
        const btnMode = document.getElementById('btn-mode-switch');
        
        if (mode === 'prompt') {
            document.getElementById('view-prompt')?.classList.add('active');
            if (toolbar) toolbar.style.display = 'none';
            if (title) title.style.display = 'none';
        } 
        else if (mode === 'viewer') {
            document.getElementById('view-viewer')?.classList.add('active');
            if (toolbar) toolbar.style.display = 'flex';
            if (title) title.style.display = 'block';
            if (btnMode) btnMode.innerHTML = '<i class="fa-solid fa-pen-ruler"></i> Ручное редактирование';
            
            // Dispatch event to render viewer slides (handled in main.js or separate viewer component)
            document.dispatchEvent(new CustomEvent('renderViewerMode'));
        } 
        else if (mode === 'editor') {
            document.getElementById('view-editor')?.classList.add('active');
            if (toolbar) toolbar.style.display = 'flex';
            if (title) title.style.display = 'block';
            if (btnMode) btnMode.innerHTML = '<i class="fa-solid fa-eye"></i> Режим просмотра';
            
            // Dispatch event to fix canvas scaling
            setTimeout(() => window.dispatchEvent(new Event('resize')), 50);
        }
    }

    showToast(message, type = 'info') {
        const container = document.getElementById('toast-container');
        if (!container) return;

        const toast = document.createElement('div');
        const bg = type === 'error' ? 'bg-red-500' : (type === 'success' ? 'bg-green-500' : 'bg-slate-800');
        const icon = type === 'error' ? 'fa-circle-exclamation' : (type === 'success' ? 'fa-circle-check' : 'fa-circle-info');
        
        toast.className = `toast ${bg} text-white px-5 py-3 rounded-xl shadow-lg flex items-center gap-3 text-sm font-medium pointer-events-auto`;
        toast.innerHTML = `<i class="fa-solid ${icon}"></i> <span>${message}</span>`;
        
        container.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(20px)';
            toast.style.transition = 'all 0.3s ease-in';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
    
    showAiLoading(show) {
        const overlay = document.getElementById('ai-loading-overlay');
        if (!overlay) return;
        
        if (show) {
            overlay.classList.remove('hidden');
            overlay.classList.add('flex');
        } else {
            overlay.classList.add('hidden');
            overlay.classList.remove('flex');
        }
    }
}
