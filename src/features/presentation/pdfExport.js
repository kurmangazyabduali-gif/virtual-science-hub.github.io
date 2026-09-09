import { SlideRenderer } from './components/SlideRenderer.js';

export class PdfExport {
    constructor(store, uiManager) {
        this.store = store;
        this.ui = uiManager;
        this.bindEvents();
    }

    bindEvents() {
        document.getElementById('btn-export-pdf')?.addEventListener('click', () => {
            this.exportToPdf();
        });
    }

    async exportToPdf() {
        if (typeof html2pdf === 'undefined') {
            this.ui.showToast('Библиотека экспорта не загружена.', 'error');
            return;
        }
        
        const state = this.store.getState();

        if (state.slides.length === 0) {
            this.ui.showToast('Презентация пуста', 'error');
            return;
        }

        this.ui.showToast('Генерация PDF, пожалуйста подождите...', 'info');

        const tempContainer = document.createElement('div');
        tempContainer.style.position = 'absolute';
        tempContainer.style.left = '-9999px';
        tempContainer.style.top = '0';
        tempContainer.style.width = '1920px';
        document.body.appendChild(tempContainer);

        state.slides.forEach(slide => {
            const slideDiv = document.createElement('div');
            // Standard 16:9 1080p slide size for crisp PDF
            slideDiv.style.width = '1920px';
            slideDiv.style.height = '1080px';
            slideDiv.style.position = 'relative';
            slideDiv.style.overflow = 'hidden';
            slideDiv.style.pageBreakAfter = 'always';

            // Use common SlideRenderer for PDF too
            SlideRenderer.renderSlide(slide, slideDiv, true);
            
            // Adjust scaling so 960x540 elements look right on 1920x1080 canvas
            // SlideRenderer renders at original percentages, so it naturally scales to 1920!
            
            tempContainer.appendChild(slideDiv);
        });

        const opt = {
            margin:       0,
            filename:     `${state.title || 'Presentation'}.pdf`,
            image:        { type: 'jpeg', quality: 1 },
            html2canvas:  { scale: 2, useCORS: true, logging: false },
            jsPDF:        { unit: 'px', format: [1920, 1080], orientation: 'landscape' }
        };

        try {
            await html2pdf().set(opt).from(tempContainer).save();
            this.ui.showToast('PDF успешно сохранен!', 'success');
        } catch (e) {
            console.error('PDF Export error', e);
            this.ui.showToast('Ошибка при экспорте PDF', 'error');
        } finally {
            document.body.removeChild(tempContainer);
        }
    }
}
