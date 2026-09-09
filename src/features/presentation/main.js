import { Store } from './core/Store.js';
import { AIClient } from './core/AIClient.js';
import { Editor } from './editor.js';
import { AiAssistant } from './aiAssistant.js';
import { PdfExport } from './pdfExport.js';
import { UIManager } from './uiManager.js';
import { SlideRenderer } from './components/SlideRenderer.js';

document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize Core State and API
    const store = new Store();
    const aiClient = new AIClient();

    // 2. Initialize UI Managers
    const uiManager = new UIManager(store);
    
    // 3. Initialize Features
    const editor = new Editor(store, uiManager);
    const aiAssistant = new AiAssistant(store, uiManager, aiClient);
    const pdfExport = new PdfExport(store, uiManager);

    // Make store globally available for debugging if needed (optional)
    window.presentationStore = store;

    // Initial state setup
    store.setMode('prompt');

    // Resize observer to keep 16:9 canvas scaled properly
    const workspace = document.getElementById('editor-workspace');
    const canvas = document.getElementById('slide-canvas');
    
    function resizeCanvas() {
        if (!workspace || !canvas || store.getState().currentMode !== 'editor') return;
        
        const targetWidth = 960;
        const targetHeight = 540;
        
        const workspaceWidth = workspace.clientWidth - 64; // 32px padding on each side
        const workspaceHeight = workspace.clientHeight - 64;
        
        const scaleX = workspaceWidth / targetWidth;
        const scaleY = workspaceHeight / targetHeight;
        const scale = Math.min(scaleX, scaleY, 1.5);
        
        canvas.style.transform = `scale(${scale})`;
    }

    window.addEventListener('resize', resizeCanvas);

    // Bind title change
    const titleInput = document.getElementById('presentation-title');
    if (titleInput) {
        titleInput.addEventListener('input', (e) => {
            store.setState({ title: e.target.value });
        });
        
        store.subscribe((state) => {
            if (titleInput.value !== state.title) {
                titleInput.value = state.title;
            }
        });
    }

    // Save button (Mock implementation using LocalStorage)
    document.getElementById('btn-save')?.addEventListener('click', () => {
        const data = JSON.stringify(store.getState());
        localStorage.setItem('vsh-presentation-save', data);
        uiManager.showToast('Презентация сохранена в браузере', 'success');
    });
    
    // Try to load saved state (optional)
    const saved = localStorage.getItem('vsh-presentation-save');
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            if (parsed && parsed.slides && parsed.slides.length > 0) {
                store.setState(parsed);
                uiManager.showToast('Восстановлена предыдущая сессия', 'info');
            }
        } catch (e) {
            console.error('Failed to restore presentation', e);
        }
    }

    // Event listener for rendering viewer mode
    document.addEventListener('renderViewerMode', () => {
        const container = document.getElementById('viewer-slides-container');
        if (!container) return;
        container.innerHTML = '';
        
        const containerWidth = container.clientWidth;
        const targetWidth = 960;
        const scale = Math.min((containerWidth - 32) / targetWidth, 1.2);
        const targetHeight = 540;
        
        store.getState().slides.forEach((slide) => {
            const slideWrapper = document.createElement('div');
            slideWrapper.className = 'w-full flex justify-center mb-10';
            slideWrapper.style.height = `${targetHeight * scale}px`;
            
            const slideDiv = document.createElement('div');
            slideDiv.className = 'viewer-slide-card relative overflow-hidden shadow-lg border border-gray-100';
            slideDiv.style.width = `${targetWidth}px`;
            slideDiv.style.height = `${targetHeight}px`;
            slideDiv.style.transformOrigin = 'top center';
            slideDiv.style.transform = `scale(${scale})`;
            
            // Use common SlideRenderer for Viewer
            SlideRenderer.renderSlide(slide, slideDiv, true);
            
            slideWrapper.appendChild(slideDiv);
            container.appendChild(slideWrapper);
        });
    });

    // Handle window resize for viewer mode
    window.addEventListener('resize', () => {
        if (store.getState().currentMode === 'viewer') {
            document.dispatchEvent(new CustomEvent('renderViewerMode'));
        }
    });
});
