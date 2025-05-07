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
        document.getElementById('congrats-message').classList.add('hidden');
    }

    handleFinalRepeat() {
        if (this.fullTextRepeats <= 0) {
            // Prevent further decrement and actions
            return;
        }
        this.fullTextRepeats--;
        const counter = this.finalSection.querySelector('#full-text-counter');
        counter.textContent = this.fullTextRepeats;

        if (this.fullTextRepeats === 0) {
            this.timer.stop();
            this.showCongratulations();
            this.finalSection.classList.add('hidden');
            this.saveSession(); 
        }
    }

    showCongratulations() {
        const totalTime = document.getElementById('elapsed-time').textContent;
        document.getElementById('total-time').textContent = totalTime;
        const congratsMsg = document.getElementById('congrats-message');
        congratsMsg.classList.remove('hidden');
        congratsMsg.style.display = 'flex';
        congratsMsg.style.justifyContent = 'center';
        congratsMsg.style.alignItems = 'center';
        congratsMsg.style.position = 'fixed';
        congratsMsg.style.top = '0';
        congratsMsg.style.left = '0';
        congratsMsg.style.width = '100vw';
        congratsMsg.style.height = '100vh';
        congratsMsg.style.background = 'rgba(255,255,255,0.95)';
        congratsMsg.style.zIndex = '3000';
        // Hide timer
        document.getElementById('timer').classList.add('hidden');
        // Add close button
        let okBtn = document.getElementById('congrats-ok-btn');
        if (!okBtn) {
            okBtn = document.createElement('button');
            okBtn.id = 'congrats-ok-btn';
            okBtn.className = 'btn-primary';
            okBtn.textContent = 'حسناً';
            okBtn.style.marginTop = '1.5rem';
            okBtn.onclick = function() {
                congratsMsg.classList.add('hidden');
                congratsMsg.style.display = '';
                congratsMsg.style.position = '';
                congratsMsg.style.background = '';
                congratsMsg.style.width = '';
                congratsMsg.style.height = '';
                congratsMsg.style.zIndex = '';
                document.getElementById('timer').classList.remove('hidden');
            };
            congratsMsg.appendChild(okBtn);
        }
    }

    async saveSession() {
        const sessionData = {
            text: document.getElementById('input-text').value,
            sections: parseInt(document.getElementById('section-count').value),
            repeats: this.totalRepeats,
            time: document.getElementById('elapsed-time').textContent,
            date: new Date().toLocaleString('ar-EG')
        };

        try {
            const response = await fetch('http://localhost:3000/api/sessions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(sessionData)
            });

            if (!response.ok) {
                throw new Error('Failed to save session');
            }

            // Show history after successful save
            await this.showHistory();
        } catch (error) {
            console.error('Error saving session:', error);
            this.showError('حدث خطأ أثناء حفظ الجلسة');
        }
    }

    async showHistory() {
        try {
            const response = await fetch('http://localhost:3000/api/sessions');
            if (!response.ok) {
                throw new Error('Failed to fetch sessions');
            }
            
            const sessions = await response.json();
            const container = document.getElementById('history-list');
            const historySection = document.getElementById('session-history');
            
            if (sessions.length > 0) {
                historySection.classList.remove('hidden');
                container.innerHTML = sessions.map((session, index) => `
                    <div class="history-item">
                        <h3>الجلسة ${index + 1} (${new Date(session.date).toLocaleString('ar-EG')})</h3>
                        <p>الوقت: ${session.time} | الأقسام: ${session.sections}</p>
                        <div class="history-actions">
                            <button onclick="app.loadSession('${session._id}')" class="btn-secondary">تحميل</button>
                            <button onclick="app.deleteSession('${session._id}')" class="btn-danger">حذف</button>
                        </div>
                    </div>
                `).join('');
            } else {
                historySection.classList.add('hidden');
            }
        } catch (error) {
            console.error('Error loading history:', error);
            this.showError('حدث خطأ أثناء تحميل السجل');
        }
    }
    
    async loadSession(sessionId) {
        try {
            const response = await fetch(`http://localhost:3000/api/sessions/${sessionId}`);
            if (!response.ok) {
                throw new Error('Failed to fetch session');
            }
            
            const session = await response.json();
            if (session) {
                document.getElementById('input-text').value = session.text;
                document.getElementById('section-count').value = session.sections;
                document.getElementById('repeat-count').value = session.repeats;
                alert('تم تحميل الجلسة! انقر على "بدء الحفظ" للبدء');
            }
        } catch (error) {
            console.error('Error loading session:', error);
            this.showError('حدث خطأ أثناء تحميل الجلسة');
        }
    }

    async deleteSession(sessionId) {
        if (confirm('هل أنت متأكد من حذف هذه الجلسة؟')) {
            try {
                const response = await fetch(`http://localhost:3000/api/sessions/${sessionId}`, {
                    method: 'DELETE'
                });

                if (!response.ok) {
                    throw new Error('Failed to delete session');
                }

                // Refresh history after deletion
                await this.showHistory();
            } catch (error) {
                console.error('Error deleting session:', error);
                this.showError('حدث خطأ أثناء حذف الجلسة');
            }
        }
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

class SectionManager {
    constructor() {
        this.currentSection = 0;
        this.sections = document.querySelectorAll('.section');
        this.totalSections = this.sections.length;
        this.initializeSections();
    }

    initializeSections() {
        // Hide all sections except the first one
        this.sections.forEach((section, index) => {
            if (index === 0) {
                section.classList.add('active');
            } else {
                section.classList.remove('active');
            }
        });

        // Add section numbers
        this.sections.forEach((section, index) => {
            const header = section.querySelector('.section-header');
            if (header) {
                const numberDiv = document.createElement('div');
                numberDiv.className = 'section-number';
                numberDiv.textContent = `القسم ${index + 1}`;
                header.prepend(numberDiv);
            }
        });

        // Add progress indicator
        this.updateProgress();
    }

    nextSection() {
        if (this.currentSection < this.totalSections - 1) {
            // Mark current section as completed
            this.sections[this.currentSection].classList.add('completed');
            
            // Hide current section
            this.sections[this.currentSection].classList.remove('active');
            
            // Show next section
            this.currentSection++;
            this.sections[this.currentSection].classList.add('active');
            
            // Update progress
            this.updateProgress();
            
            // Scroll to the new section
            this.sections[this.currentSection].scrollIntoView({ behavior: 'smooth' });
            
            return true;
        }
        return false;
    }

    previousSection() {
        if (this.currentSection > 0) {
            // Hide current section
            this.sections[this.currentSection].classList.remove('active');
            
            // Show previous section
            this.currentSection--;
            this.sections[this.currentSection].classList.add('active');
            
            // Update progress
            this.updateProgress();
            
            // Scroll to the previous section
            this.sections[this.currentSection].scrollIntoView({ behavior: 'smooth' });
            
            return true;
        }
        return false;
    }

    updateProgress() {
        const progress = ((this.currentSection + 1) / this.totalSections) * 100;
        const progressBar = document.querySelector('.progress-bar');
        if (progressBar) {
            progressBar.style.width = `${progress}%`;
        }
    }

    getCurrentSection() {
        return this.currentSection;
    }

    getTotalSections() {
        return this.totalSections;
    }
}

// Mobile Menu Functionality
class MobileMenu {
    constructor() {
        this.menuToggle = document.getElementById('menu-toggle');
        this.navLinks = document.getElementById('nav-links');
        this.menuOverlay = document.getElementById('menu-overlay');
        this.isOpen = false;
        this.initialize();
    }

    initialize() {
        this.menuToggle.addEventListener('click', () => this.toggleMenu());
        this.menuOverlay.addEventListener('click', () => this.closeMenu());
        
        // Add touch events for swipe
        let touchStartX = 0;
        let touchEndX = 0;
        
        this.navLinks.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        });
        
        this.navLinks.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            this.handleSwipe(touchStartX, touchEndX);
        });
        
        // Close menu when clicking a link
        this.navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => this.closeMenu());
        });
    }

    toggleMenu() {
        this.isOpen = !this.isOpen;
        this.navLinks.classList.toggle('active');
        this.menuOverlay.classList.toggle('active');
        this.menuToggle.innerHTML = this.isOpen ? 
            '<i class="fas fa-times"></i>' : 
            '<i class="fas fa-bars"></i>';
    }

    closeMenu() {
        if (this.isOpen) {
            this.isOpen = false;
            this.navLinks.classList.remove('active');
            this.menuOverlay.classList.remove('active');
            this.menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
        }
    }

    handleSwipe(startX, endX) {
        const swipeThreshold = 50;
        const swipeDistance = endX - startX;
        
        if (Math.abs(swipeDistance) > swipeThreshold) {
            if (swipeDistance > 0 && this.isOpen) {
                // Swipe right - close menu
                this.closeMenu();
            } else if (swipeDistance < 0 && !this.isOpen) {
                // Swipe left - open menu
                this.toggleMenu();
            }
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new TextRepeater();
    window.sectionManager = new SectionManager();
    window.mobileMenu = new MobileMenu();
});
