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
        this.errorContainer = this.createErrorContainer();
        this.initialize();
    }

    initialize() {
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        document.getElementById('theme-toggle').addEventListener('click', () => this.toggleTheme());
        document.getElementById('pause-timer').addEventListener('click', () => this.toggleTimer());
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
        
        if (!text) {
            errorMessages.push('الرجاء إدخال النص');
        } else if (text.length < 10) {
            errorMessages.push('النص قصير جداً. يجب أن يكون طول النص 10 أحرف على الأقل');
        }
        
        if (isNaN(sectionsCount) || sectionsCount < 1) {
            errorMessages.push('عدد الأقسام غير صحيح');
        } else if (sectionsCount > 20) {
            errorMessages.push('الحد الأقصى لعدد الأقسام هو 20');
        }
        
        if (isNaN(this.totalRepeats) || this.totalRepeats < 1) {
            errorMessages.push('عدد التكرارات غير صحيح');
        } else if (this.totalRepeats > 100) {
            errorMessages.push('الحد الأقصى لعدد التكرارات هو 100');
        }

        if (errorMessages.length > 0) {
            this.showError(errorMessages.join('\n'));
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
        this.updateProgress();
    }
    showFinalSection() {
        this.sectionsContainer.classList.add('hidden');
        this.finalSection.classList.remove('hidden');
        this.fullTextRepeats = this.totalRepeats;
        const counter = this.finalSection.querySelector('#full-text-counter');
        counter.textContent = this.fullTextRepeats;
    }

    handleFinalRepeat() {
        this.fullTextRepeats--;
        const counter = this.finalSection.querySelector('#full-text-counter');
        counter.textContent = this.fullTextRepeats;
    
        if (this.fullTextRepeats <= 0) {
            this.timer.stop();
            this.showCongratulations();
            this.finalSection.classList.add('hidden');
            this.saveSession(); 
        }
    }

    showCongratulations() {
        const totalTime = document.getElementById('elapsed-time').textContent;
        document.getElementById('total-time').textContent = totalTime;
        document.getElementById('congrats-message').classList.remove('hidden');
        // Reset timer display
        document.getElementById('elapsed-time').textContent = '00:00';
    }
    async saveSession() {
        const sessionData = {
            text: document.getElementById('input-text').value,
            sections: parseInt(document.getElementById('section-count').value),
            repeats: this.totalRepeats,
            time: document.getElementById('elapsed-time').textContent,
            date: new Date().toLocaleString('ar-EG')
        };
    
        // Sauvegarde dans localStorage
        const history = JSON.parse(localStorage.getItem('memorizationHistory') || '[]');
        history.unshift(sessionData);
        localStorage.setItem('memorizationHistory', JSON.stringify(history.slice(0, 10)));
        
        // Afficher l'historique
        this.showHistory();
    }
    showHistory() {
        const history = JSON.parse(localStorage.getItem('memorizationHistory') || '[]');
        const container = document.getElementById('history-list');
        const historySection = document.getElementById('session-history');
        
        if (history.length > 0) {
            historySection.classList.remove('hidden');
            container.innerHTML = history.map((session, index) => `
                <div class="history-item">
                    <h3>الجلسة ${index + 1} (${session.date})</h3>
                    <p>الوقت: ${session.time} | الأقسام: ${session.sections}</p>
                    <button onclick="app.loadSession(${index})" class="btn-secondary">تحميل</button>
                </div>
            `).join('');
        }
    }
    
    loadSession(index) {
        const history = JSON.parse(localStorage.getItem('memorizationHistory') || '[]');
        const session = history[index];
        
        if (session) {
            document.getElementById('input-text').value = session.text;
            document.getElementById('section-count').value = session.sections;
            document.getElementById('repeat-count').value = session.repeats;
            alert('تم تحميل الجلسة! انقر على "بدء الحفظ" للبدء');
        }
    }


    toggleTheme() {
        const isDark = document.body.getAttribute('data-theme') === 'dark';
        document.body.setAttribute('data-theme', isDark ? 'light' : 'dark');
        document.getElementById('theme-toggle').textContent = isDark ? '🌙' : '☀️';
        localStorage.setItem('theme', isDark ? 'light' : 'dark');
    }

    updateProgress() {
        const completed = this.sectionsData.filter(s => s.completed).length;
        const total = this.sectionsData.length;
        const progress = (completed / total) * 100;
        
        document.querySelector('.progress-bar').style.width = `${progress}%`;
    }

    createErrorContainer() {
        const container = document.createElement('div');
        container.className = 'error-container hidden';
        document.querySelector('.app-main').insertBefore(container, this.form);
        return container;
    }

    showError(message) {
        this.errorContainer.textContent = message;
        this.errorContainer.classList.remove('hidden');
        setTimeout(() => {
            this.errorContainer.classList.add('hidden');
        }, 3000);
    }

    toggleTimer() {
        const pauseButton = document.getElementById('pause-timer');
        if (this.timer.isPaused) {
            this.timer.resume();
            pauseButton.textContent = '⏸️';
        } else {
            this.timer.pause();
            pauseButton.textContent = '▶️';
        }
    }
}

class Timer {
    constructor() {
        this.timerElement = document.getElementById('timer');
        this.timeDisplay = document.getElementById('elapsed-time');
        this.startTime = null;
        this.pauseTime = null;
        this.totalPausedTime = 0;
        this.interval = null;
        this.isPaused = false;
    }

    start() {
        this.reset();
        this.startTime = Date.now();
        this.timerElement.classList.remove('hidden');
        this.isPaused = false;
        
        this.interval = setInterval(() => {
            if (!this.isPaused) {
                const elapsed = Date.now() - this.startTime - this.totalPausedTime;
                this.timeDisplay.textContent = this.formatTime(elapsed);
            }
        }, 1000);
    }

    pause() {
        if (!this.isPaused) {
            this.isPaused = true;
            this.pauseTime = Date.now();
            this.timerElement.classList.add('paused');
        }
    }

    resume() {
        if (this.isPaused) {
            this.isPaused = false;
            this.totalPausedTime += Date.now() - this.pauseTime;
            this.timerElement.classList.remove('paused');
        }
    }

    stop() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
        this.timerElement.classList.add('hidden');
    }

    reset() {
        this.stop();
        this.startTime = null;
        this.pauseTime = null;
        this.totalPausedTime = 0;
        this.isPaused = false;
        this.timeDisplay.textContent = '00:00';
    }

    formatTime(ms) {
        const totalSeconds = Math.floor(ms / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.body.setAttribute('data-theme', savedTheme);
    document.getElementById('theme-toggle').textContent = savedTheme === 'dark' ? '☀️' : '🌙';
    
    new TextRepeater();
});
