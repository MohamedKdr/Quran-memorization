class SessionsManager {
    constructor() {
        this.sessions = JSON.parse(localStorage.getItem('memorizationHistory') || '[]');
        this.initialize();
    }

    initialize() {
        this.loadSessions();
        this.updateStats();
        this.setupEventListeners();
        this.initializeTheme();
    }

    initializeTheme() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.body.setAttribute('data-theme', savedTheme);
        document.getElementById('theme-toggle').textContent = savedTheme === 'dark' ? '☀️' : '🌙';
    }

    setupEventListeners() {
        document.getElementById('theme-toggle').addEventListener('click', () => this.toggleTheme());
    }

    loadSessions() {
        const tableBody = document.getElementById('sessions-table-body');
        if (!tableBody) return;
        
        tableBody.innerHTML = '';

        this.sessions.forEach((session, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${session.date}</td>
                <td>${session.time}</td>
                <td>${session.sections}</td>
                <td>${session.repeats}</td>
                <td>
                    <button class="btn-secondary" onclick="sessionsManager.loadSession(${index})">
                        <i class="fas fa-redo"></i> تحميل
                    </button>
                    <button class="btn-danger" onclick="sessionsManager.deleteSession(${index})">
                        <i class="fas fa-trash"></i> حذف
                    </button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    }

    updateStats() {
        const totalTime = this.calculateTotalTime();
        const avgTime = this.calculateAverageTime();
        
        const totalTimeElement = document.getElementById('total-time');
        const totalSessionsElement = document.getElementById('total-sessions');
        const avgTimeElement = document.getElementById('avg-time');

        if (totalTimeElement) totalTimeElement.textContent = this.formatTime(totalTime);
        if (totalSessionsElement) totalSessionsElement.textContent = this.sessions.length;
        if (avgTimeElement) avgTimeElement.textContent = this.formatTime(avgTime);
    }

    calculateTotalTime() {
        return this.sessions.reduce((total, session) => {
            const [minutes, seconds] = session.time.split(':').map(Number);
            return total + (minutes * 60 + seconds);
        }, 0);
    }

    calculateAverageTime() {
        if (this.sessions.length === 0) return 0;
        return Math.floor(this.calculateTotalTime() / this.sessions.length);
    }

    formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    loadSession(index) {
        const session = this.sessions[index];
        if (session) {
            localStorage.setItem('currentSession', JSON.stringify(session));
            window.location.href = 'index.html';
        }
    }

    deleteSession(index) {
        if (confirm('هل أنت متأكد من حذف هذه الجلسة؟')) {
            this.sessions.splice(index, 1);
            localStorage.setItem('memorizationHistory', JSON.stringify(this.sessions));
            this.loadSessions();
            this.updateStats();
        }
    }

    toggleTheme() {
        const isDark = document.body.getAttribute('data-theme') === 'dark';
        const newTheme = isDark ? 'light' : 'dark';
        document.body.setAttribute('data-theme', newTheme);
        document.getElementById('theme-toggle').textContent = isDark ? '🌙' : '☀️';
        localStorage.setItem('theme', newTheme);
    }
}

// Initialize the sessions manager when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.sessionsManager = new SessionsManager();
}); 