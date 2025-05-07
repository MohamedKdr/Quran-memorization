class SessionsManager {
    constructor() {
        this.sessions = [];
        this.initialize();
    }

    async initialize() {
        await this.loadSessions();
        this.updateStats();
    }

    async loadSessions() {
        const tableBody = document.getElementById('sessions-table-body');
        if (!tableBody) return;
        tableBody.innerHTML = '';
        try {
            const response = await fetch('http://localhost:3000/api/sessions');
            if (!response.ok) throw new Error('فشل في تحميل الجلسات');
            this.sessions = await response.json();
            this.sessions.forEach((session, index) => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${new Date(session.date).toLocaleString('ar-EG')}</td>
                    <td>${session.time}</td>
                    <td>${session.sections}</td>
                    <td>${session.repeats}</td>
                    <td>
                        <button class="btn-secondary" onclick="sessionsManager.loadSession('${session._id}')">
                            <i class="fas fa-redo"></i> تحميل
                        </button>
                        <button class="btn-danger" onclick="sessionsManager.deleteSession('${session._id}')">
                            <i class="fas fa-trash"></i> حذف
                        </button>
                    </td>
                `;
                tableBody.appendChild(row);
            });
        } catch (error) {
            tableBody.innerHTML = `<tr><td colspan="5">${error.message}</td></tr>`;
        }
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

    async loadSession(sessionId) {
        try {
            const response = await fetch(`http://localhost:3000/api/sessions/${sessionId}`);
            if (!response.ok) throw new Error('فشل في تحميل الجلسة');
            const session = await response.json();
            if (session) {
                localStorage.setItem('currentSession', JSON.stringify(session));
                window.location.href = 'index.html';
            }
        } catch (error) {
            alert(error.message);
        }
    }

    async deleteSession(sessionId) {
        if (confirm('هل أنت متأكد من حذف هذه الجلسة؟')) {
            try {
                const response = await fetch(`http://localhost:3000/api/sessions/${sessionId}`, {
                    method: 'DELETE'
                });
                if (!response.ok) throw new Error('فشل في حذف الجلسة');
                await this.loadSessions();
                this.updateStats();
            } catch (error) {
                alert(error.message);
            }
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.sessionsManager = new SessionsManager();
}); 