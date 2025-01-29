class TextRepeater {
    constructor() {
        this.form = document.getElementById('text-form');
        this.sectionsContainer = document.getElementById('sections-container');
        this.finalSection = document.getElementById('final-section');
        this.timer = new Timer();
        this.currentSectionIndex = 0;
        this.totalRepeats = 0;
        this.fullTextRepeats = 0;
        this.sectionsData = [];

        this.initialize();
    }

    initialize() {
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        document.getElementById('theme-toggle').addEventListener('click', () => this.toggleTheme());
    }

    handleSubmit(e) {
        e.preventDefault();
        const text = document.getElementById('input-text').value.trim();
        const sectionsCount = parseInt(document.getElementById('section-count').value);
        this.totalRepeats = parseInt(document.getElementById('repeat-count').value);
        this.fullTextRepeats = this.totalRepeats;

        if (this.validateInputs(text, sectionsCount)) {
            this.timer.start();
            this.prepareSections(text, sectionsCount);
            this.showFirstSection();
        }
    }

    validateInputs(text, sectionsCount) {
        const errorMessages = [];
        if (!text) errorMessages.push('الرجاء إدخال النص');
        if (isNaN(sectionsCount) || sectionsCount < 1) errorMessages.push('عدد الأقسام غير صحيح');
        if (isNaN(this.totalRepeats) || this.totalRepeats < 1) errorMessages.push('عدد التكرارات غير صحيح');

        if (errorMessages.length > 0) {
            alert(errorMessages.join('\n'));
            return false;
        }
        return true;
    }

    prepareSections(text, sectionsCount) {
        const words = text.split(/\s+/).filter(word => word.length > 0);
        if (words.length === 0) return;

        const wordsPerSection = Math.ceil(words.length / sectionsCount);
        this.sectionsContainer.innerHTML = '';
        this.sectionsData = [];

        for (let i = 0; i < sectionsCount; i++) {
            const sectionText = words.slice(i * wordsPerSection, (i + 1) * wordsPerSection).join(' ');
            this.sectionsData.push({
                text: sectionText,
                remaining: this.totalRepeats,
                completed: false
            });
            this.createSectionElement(sectionText, i + 1, this.sectionsContainer);
        }

        this.prepareFinalSection(text);
        this.sectionsContainer.classList.remove('hidden');
    }

    createSectionElement(text, sectionNumber, container) {
        const section = document.createElement('div');
        section.className = 'section';
        section.innerHTML = `
            <div class="section-header">
                <h3>القسم ${sectionNumber}</h3>
                <button class="toggle-btn">👁️</button>
            </div>
            <div class="section-content">${text}</div>
            <div class="section-controls">
                <span class="counter">التكرارات المتبقية: ${this.totalRepeats}</span>
                <button class="btn-primary repeat-btn">كرر</button>
            </div>
        `;

        const toggleBtn = section.querySelector('.toggle-btn');
        const content = section.querySelector('.section-content');

        toggleBtn.addEventListener('click', () => {
            content.classList.toggle('hidden');
            toggleBtn.classList.toggle('active');
        });

        section.querySelector('.repeat-btn').addEventListener('click', () => {
            this.handleSectionRepeat(section, sectionNumber - 1);
        });

        container.appendChild(section);
    }

    prepareFinalSection(text) {
        const finalSectionContent = this.finalSection.querySelector('.section-content');
        finalSectionContent.textContent = text;
        this.finalSection.querySelector('#repeat-full-text').addEventListener('click', () => {
            this.handleFinalRepeat();
        });
    }

    handleSectionRepeat(section, index) {
        this.sectionsData[index].remaining--;
        const counter = section.querySelector('.counter');
        counter.textContent = `التكرارات المتبقية: ${this.sectionsData[index].remaining}`;

        if (this.sectionsData[index].remaining <= 0) {
            section.classList.add('completed');
            this.sectionsData[index].completed = true;
            this.showNextSection();
        }
    }

    showFirstSection() {
        const sections = this.sectionsContainer.querySelectorAll('.section');
        if (sections.length > 0) {
            this.currentSectionIndex = 0;
            sections[0].classList.add('active');
        }
    }

    showNextSection() {
        const sections = this.sectionsContainer.querySelectorAll('.section');
        sections[this.currentSectionIndex].classList.remove('active');

        let nextIndex = this.currentSectionIndex + 1;
        while (nextIndex < sections.length && this.sectionsData[nextIndex].completed) {
            nextIndex++;
        }

        if (nextIndex < sections.length) {
            this.currentSectionIndex = nextIndex;
            sections[this.currentSectionIndex].classList.add('active');
        } else {
            this.showFinalSection();
        }
    }

    showFinalSection() {
        this.sectionsContainer.classList.add('hidden');
        this.finalSection.classList.remove('hidden');
        this.fullTextRepeats = this.totalRepeats;
        this.finalSection.querySelector('.counter').textContent =
            `التكرارات المتبقية: ${this.fullTextRepeats}`;
    }

    handleFinalRepeat() {
        this.fullTextRepeats--;
        const counter = this.finalSection.querySelector('.counter');
        counter.textContent = `التكرارات المتبقية: ${this.fullTextRepeats}`;

        if (this.fullTextRepeats <= 0) {
            this.timer.stop();
            this.showCongratulations();
            this.finalSection.classList.add('hidden');
        }
    }

    showCongratulations() {
        document.getElementById('total-time').textContent =
            document.getElementById('elapsed-time').textContent;
        document.getElementById('congrats-message').classList.remove('hidden');
    }

    toggleTheme() {
        const isDark = document.body.getAttribute('data-theme') === 'dark';
        document.body.setAttribute('data-theme', isDark ? 'light' : 'dark');
        document.getElementById('theme-toggle').textContent = isDark ? '🌙' : '☀️';
        localStorage.setItem('theme', isDark ? 'light' : 'dark');
    }
}

class Timer {
    constructor() {
        this.timerElement = document.getElementById('timer');
        this.timeDisplay = document.getElementById('elapsed-time');
        this.startTime = null;
        this.interval = null;
    }

    start() {
        this.reset();
        this.startTime = Date.now();
        this.timerElement.classList.remove('hidden');

        this.interval = setInterval(() => {
            const elapsed = Date.now() - this.startTime;
            this.timeDisplay.textContent = this.formatTime(elapsed);
        }, 1000);
    }

    formatTime(ms) {
        const totalSeconds = Math.floor(ms / 1000);
        const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
        const seconds = (totalSeconds % 60).toString().padStart(2, '0');
        return `${minutes}:${seconds}`;
    }

    stop() {
        clearInterval(this.interval);
    }

    reset() {
        this.stop();
        this.timeDisplay.textContent = '00:00';
        this.timerElement.classList.add('hidden');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.body.setAttribute('data-theme', savedTheme);
    document.getElementById('theme-toggle').textContent = savedTheme === 'dark' ? '☀️' : '🌙';

    new TextRepeater();
});
