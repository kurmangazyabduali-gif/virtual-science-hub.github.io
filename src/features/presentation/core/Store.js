export class Store {
    constructor() {
        this.state = {
            title: "Новая презентация",
            slides: [],
            currentSlideIndex: 0,
            selectedElementId: null,
            currentMode: 'prompt' // 'prompt', 'viewer', 'editor'
        };
        this.listeners = [];
    }

    subscribe(listener) {
        this.listeners.push(listener);
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    }

    notify() {
        this.listeners.forEach(listener => listener(this.state));
    }

    getState() {
        return this.state;
    }

    setState(newState) {
        this.state = { ...this.state, ...newState };
        this.notify();
    }

    // Actions
    setMode(mode) {
        this.setState({ currentMode: mode });
    }

    setSlides(slides, title = this.state.title) {
        this.setState({ slides, title, currentSlideIndex: 0, selectedElementId: null });
    }

    setCurrentSlide(index) {
        if (index >= 0 && index < this.state.slides.length) {
            this.setState({ currentSlideIndex: index, selectedElementId: null });
        }
    }

    addSlide(slide) {
        const slides = [...this.state.slides, slide];
        this.setState({ slides, currentSlideIndex: slides.length - 1, selectedElementId: null });
    }

    deleteSlide(index) {
        if (this.state.slides.length <= 1) return;
        const slides = this.state.slides.filter((_, i) => i !== index);
        let newIndex = this.state.currentSlideIndex;
        if (newIndex >= slides.length) newIndex = slides.length - 1;
        this.setState({ slides, currentSlideIndex: newIndex, selectedElementId: null });
    }

    reorderSlides(oldIndex, newIndex) {
        const slides = [...this.state.slides];
        const [movedItem] = slides.splice(oldIndex, 1);
        slides.splice(newIndex, 0, movedItem);

        let currentIndex = this.state.currentSlideIndex;
        if (currentIndex === oldIndex) currentIndex = newIndex;
        else if (oldIndex < currentIndex && newIndex >= currentIndex) currentIndex--;
        else if (oldIndex > currentIndex && newIndex <= currentIndex) currentIndex++;

        this.setState({ slides, currentSlideIndex: currentIndex });
    }

    selectElement(id) {
        this.setState({ selectedElementId: id });
    }

    addElement(element) {
        const slide = this.state.slides[this.state.currentSlideIndex];
        if (!slide) return;
        
        const updatedSlide = { ...slide, elements: [...slide.elements, element] };
        const slides = [...this.state.slides];
        slides[this.state.currentSlideIndex] = updatedSlide;
        
        this.setState({ slides, selectedElementId: element.id });
    }

    updateElement(id, updates) {
        const slideIndex = this.state.currentSlideIndex;
        const slide = this.state.slides[slideIndex];
        if (!slide) return;

        const elements = slide.elements.map(el => 
            el.id === id ? { ...el, ...updates } : el
        );

        const slides = [...this.state.slides];
        slides[slideIndex] = { ...slide, elements };
        this.setState({ slides });
    }

    deleteElement(id) {
        const slideIndex = this.state.currentSlideIndex;
        const slide = this.state.slides[slideIndex];
        if (!slide) return;

        const elements = slide.elements.filter(el => el.id !== id);
        const slides = [...this.state.slides];
        slides[slideIndex] = { ...slide, elements };
        this.setState({ slides, selectedElementId: null });
    }

    updateSlideBackground(background) {
        const slideIndex = this.state.currentSlideIndex;
        const slide = this.state.slides[slideIndex];
        if (!slide) return;

        const slides = [...this.state.slides];
        slides[slideIndex] = { ...slide, background };
        this.setState({ slides });
    }
}
