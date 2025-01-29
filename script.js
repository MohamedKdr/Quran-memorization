class TextRepeater {
    constructor() {
        this.form = document.getElementById('text-form');
        this.output = document.getElementById('output');
        this.finalOutput = document.getElementById('final-output');
        this.timer = new Timer();
        this.themeToggle = document.getElementById('theme-toggle');
        this.initialize();
    }

    initialize() {
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        document.getElementById('reset-btn').addEventListener('click', () => this.reset());
        document.getElementById('repeat-full-text').addEventListener('click', () => this.repeatFullText());
        this.themeToggle.addEventListener('click', () => this.toggleTheme());

        // تحميل الوضع الليلي من localStorage
        if (localStorage.getItem('theme') === 'dark') {
            document.body.setAttribute('data-theme', 'dark');
            this.themeToggle.textContent = '☀️';
        }
    }

    toggleTheme() {
        const isDark = document.body.getAttribute('data-theme') === 'dark';
        document.body.setAttribute('data-theme', isDark ? 'light' : 'dark');
        this.themeToggle.textContent = isDark ? '🌙' : '☀️';
        localStorage.setItem('theme', isDark ? 'light' : 'dark');
    }

    handleSubmit(e) {
        e.preventDefault();

        const text = document.getElementById('input-text').value.trim();
        const sections = parseInt(document.getElementById('section-count').value);
        const repeats = parseInt(document.getElementById('repeat-count').value);

        if (!this.validateInputs(text, sections, repeats)) return;

        this.timer.start();
        this.processText(text, sections, repeats);
    }

    validateInputs(text, sections, repeats) {
        const errorMessages = [];

        if (!text) errorMessages.push('الرجاء إدخال النص');
        if (sections < 1) errorMessages.push('عدد الأقسام غير صحيح');
        if (repeats < 1) errorMessages.push('عدد التكرارات غير صحيح');

        if (errorMessages.length > 0) {
            this.showError(errorMessages.join('<br>'));
            return false;
        }
        return true;
    }

    processText(text, sections, repeats) {
        const splitText = this.splitText(text, sections);
        this.generateSections(splitText, repeats);
        this.output.classList.remove('hidden');
    }

    splitText(text, sections) {
        const words = text.split(/\s+/);
        const wordsPerSection = Math.ceil(words.length / sections);
        const result = [];

        for (let i = 0; i < sections; i++) {
            result.push(
                words.slice(i * wordsPerSection, (i + 1) * wordsPerSection).join(' ')
            );
        }
        return result;
    }

    generateSections(sections, repeats) {
        const container = document.getElementById('sections');
        container.innerHTML = '';

        sections.forEach((section, index) => {
            const sectionDiv = this.createSectionElement(section, index + 1, repeats);
            container.appendChild(sectionDiv);
        });
    }

    createSectionElement(text, number, repeats) {
        const div = document.createElement('div');
        div.className = 'section';
        div.innerHTML = `
            <div class="section-header">
                <h3>القسم ${number}</h3>
                <button class="toggle-btn" aria-label="إظهار/إخفاء النص">👁️</button>
            </div>
            <div class="section-content hidden">${text}</div>
            <div class="section-controls">
                <span class="counter">التكرارات المتبقية: ${repeats}</span>
                <button class="repeat-btn">كرر</button>
            </div>
        `;

        this.addSectionListeners(div, repeats);
        return div;
    }

    addSectionListeners(sectionDiv, initialRepeats) {
        let remaining = initialRepeats;
        const counter = sectionDiv.querySelector('.counter');
        const btn = sectionDiv.querySelector('.repeat-btn');
        const content = sectionDiv.querySelector('.section-content');

        sectionDiv.querySelector('.toggle-btn').addEventListener('click', () => {
            content.classList.toggle('hidden');
        });

        btn.addEventListener('click', () => {
            remaining = Math.max(0, remaining - 1);
            counter.textContent = `التكرارات المتبقية: ${remaining}`;

            if (remaining === 0) {
                btn.disabled = true;
                btn.textContent = 'تم الحفظ!';
                sectionDiv.classList.add('completed', 'shake');
                this.checkCompletion();
            }
        });
    }

    checkCompletion() {
        const activeButtons = document.querySelectorAll('.repeat-btn:not(:disabled)');
        if (activeButtons.length === 0) {
            this.timer.stop();
            this.showFinalText();
        }
    }

    showFinalText() {
        const fullText = document.getElementById('input-text').value.trim();
        document.getElementById('full-text').textContent = fullText;
        this.finalOutput.classList.remove('hidden');
    }

    repeatFullText() {
        const fullText = document.getElementById('input-text').value.trim();
        alert(`كرر النص التالي:\n\n${fullText}`);
    }

    reset() {
        this.form.reset();
        this.output.classList.add('hidden');
        this.finalOutput.classList.add('hidden');
        this.timer.reset();
    }

    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.innerHTML = message;
        this.form.prepend(errorDiv);
        setTimeout(() => errorDiv.remove(), 5000);
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

    stop() {
        clearInterval(this.interval);
    }

    reset() {
        this.stop();
        this.timeDisplay.textContent = '00:00';
        this.timerElement.classList.add('hidden');
    }

    formatTime(ms) {
        const totalSeconds = Math.floor(ms / 1000);
        const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
        const seconds = (totalSeconds % 60).toString().padStart(2, '0');
        return `${minutes}:${seconds}`;
    }
}

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    new TextRepeater();
});
