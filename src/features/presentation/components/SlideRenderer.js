export class SlideRenderer {
    static renderSlide(slide, container, isViewer = false, onSelectElement = null) {
        container.innerHTML = '';
        container.style.backgroundColor = slide.background || '#ffffff';
        container.style.position = 'relative';

        const layout = slide.layout || 'title-content';
        
        // Base container for elements to allow grid/flex positioning or absolute mapping
        const contentArea = document.createElement('div');
        contentArea.style.width = '100%';
        contentArea.style.height = '100%';
        contentArea.style.position = 'relative';
        
        slide.elements.forEach(el => {
            const elNode = this.renderElement(el, isViewer);
            
            if (!isViewer && onSelectElement) {
                elNode.addEventListener('mousedown', (e) => {
                    // Prevent bubbling so canvas click doesn't deselect immediately
                    if(e.target.tagName !== 'INPUT' && e.target.getAttribute('contenteditable') !== 'true') {
                        onSelectElement(el.id);
                    }
                });
            }

            contentArea.appendChild(elNode);
        });

        container.appendChild(contentArea);
    }

    static renderElement(el, isViewer) {
        const domEl = document.createElement('div');
        domEl.className = isViewer ? 'viewer-element' : 'canvas-element group';
        domEl.id = el.id;
        
        Object.assign(domEl.style, el.style);
        
        if (el.type === 'text') {
            if (isViewer) {
                domEl.innerHTML = el.content;
            } else {
                domEl.innerHTML = `<div contenteditable="true" class="w-full h-full p-2 outline-none">${el.content}</div>`;
                const editable = domEl.querySelector('[contenteditable]');
                editable.addEventListener('input', (e) => {
                    el.content = e.target.innerHTML;
                });
            }
        } else if (el.type === 'image') {
            domEl.innerHTML = `<img src="${el.src}" class="w-full h-full object-cover pointer-events-none rounded-[inherit]">`;
        } else if (el.type === 'shape') {
            domEl.style.backgroundColor = el.style.backgroundColor;
            if (el.shapeType === 'circle') domEl.style.borderRadius = '50%';
            else domEl.style.borderRadius = el.style.borderRadius || '8px';
        }

        if (!isViewer) {
            domEl.innerHTML += `
                <div class="resize-handle handle-ne"></div>
                <div class="resize-handle handle-sw"></div>
            `;
        }

        return domEl;
    }

    static createDefaultElementsForLayout(layout, theme, title, content, list, imageIdea) {
        const elements = [];
        const themeAccent = theme?.accentColor || '#6366f1';
        const themeText = theme?.textColor || '#1e293b';

        // Title
        if (title) {
            elements.push({
                id: `el-t-${Date.now()}-0`,
                type: 'text',
                content: title,
                style: { top: '10%', left: '10%', width: '80%', fontSize: '48px', fontWeight: '800', color: themeAccent }
            });
        }

        // Content
        if (content) {
            elements.push({
                id: `el-c-${Date.now()}-1`,
                type: 'text',
                content: content,
                style: { top: '30%', left: '10%', width: layout.includes('image') ? '40%' : '80%', fontSize: '24px', color: themeText, lineHeight: '1.5' }
            });
        }

        // List
        if (list && list.length > 0) {
            const listHtml = `<ul style="list-style-type:disc; padding-left:20px; line-height: 1.6;">${list.map(l => `<li style="margin-bottom: 8px;">${l}</li>`).join('')}</ul>`;
            elements.push({
                id: `el-l-${Date.now()}-2`,
                type: 'text',
                content: listHtml,
                style: { top: content ? '50%' : '30%', left: '10%', width: layout.includes('image') ? '40%' : '80%', fontSize: '22px', color: themeText }
            });
        }

        // Image
        if (layout.includes('image') || imageIdea) {
            const isRight = layout === 'image-right' || !layout.includes('left');
            elements.push({
                id: `el-i-${Date.now()}-3`,
                type: 'image',
                src: 'https://via.placeholder.com/600x400/e2e8f0/64748b?text=' + encodeURIComponent(imageIdea || 'Изображение'),
                style: { top: '25%', left: isRight ? '55%' : '10%', width: '35%', height: '50%', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }
            });
            
            if (layout === 'image-left') {
                const textEls = elements.filter(e => e.type === 'text' && e.style.fontSize !== '48px');
                textEls.forEach(e => e.style.left = '50%');
            }
        }

        return elements;
    }
}
