class SettingsManager {
    constructor() {
        this.settings = this.loadSettings();
        this.initialize();
    }

    initialize() {
        this.setupEventListeners();
        this.loadCurrentSettings();
        this.applySettings();
    }

    loadSettings() {
        return JSON.parse(localStorage.getItem('appSettings') || JSON.stringify({
            language: 'ar',
            theme: localStorage.getItem('theme') || 'light',
            soundEnabled: true,
            notificationsEnabled: true
        }));
    }

    setupEventListeners() {
        document.getElementById('save-settings').addEventListener('click', () => this.saveSettings());
        document.getElementById('theme-toggle').addEventListener('click', () => this.toggleTheme());
        
        // Add change listeners for immediate feedback
        document.getElementById('language').addEventListener('change', () => {
            const newLanguage = document.getElementById('language').value;
            this.applyLanguage(newLanguage);
        });
        
        document.getElementById('theme').addEventListener('change', () => this.applySettings());
        document.getElementById('sound-enabled').addEventListener('change', () => this.applySettings());
        document.getElementById('notifications-enabled').addEventListener('change', () => this.applySettings());
    }

    loadCurrentSettings() {
        const languageSelect = document.getElementById('language');
        const themeSelect = document.getElementById('theme');
        const soundEnabled = document.getElementById('sound-enabled');
        const notificationsEnabled = document.getElementById('notifications-enabled');

        if (languageSelect) languageSelect.value = this.settings.language;
        if (themeSelect) themeSelect.value = this.settings.theme;
        if (soundEnabled) soundEnabled.checked = this.settings.soundEnabled;
        if (notificationsEnabled) notificationsEnabled.checked = this.settings.notificationsEnabled;
    }

    saveSettings() {
        const newSettings = {
            language: document.getElementById('language').value,
            theme: document.getElementById('theme').value,
            soundEnabled: document.getElementById('sound-enabled').checked,
            notificationsEnabled: document.getElementById('notifications-enabled').checked
        };

        localStorage.setItem('appSettings', JSON.stringify(newSettings));
        localStorage.setItem('theme', newSettings.theme);
        this.settings = newSettings;
        this.applySettings();
        this.showSuccessMessage();
    }

    applySettings() {
        // Apply theme
        const theme = document.getElementById('theme').value;
        document.body.setAttribute('data-theme', theme);
        document.getElementById('theme-toggle').textContent = theme === 'dark' ? '☀️' : '🌙';

        // Apply language
        const language = document.getElementById('language').value;
        this.applyLanguage(language);

        // Apply sound settings
        const soundEnabled = document.getElementById('sound-enabled').checked;
        // Implement sound settings logic here

        // Apply notification settings
        const notificationsEnabled = document.getElementById('notifications-enabled').checked;
        // Implement notification settings logic here
    }

    applyLanguage(language) {
        document.documentElement.lang = language;
        document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
        
        // Update all text content
        if (typeof updateLanguage === 'function') {
            updateLanguage(language);
        }
    }

    showSuccessMessage() {
        const message = document.createElement('div');
        message.className = 'success-message';
        message.textContent = getTranslation('settings.settingsSaved', this.settings.language);
        document.querySelector('.settings-container').prepend(message);

        setTimeout(() => {
            message.remove();
        }, 3000);
    }

    toggleTheme() {
        const isDark = document.body.getAttribute('data-theme') === 'dark';
        const newTheme = isDark ? 'light' : 'dark';
        document.body.setAttribute('data-theme', newTheme);
        document.getElementById('theme-toggle').textContent = isDark ? '🌙' : '☀️';
        document.getElementById('theme').value = newTheme;
        localStorage.setItem('theme', newTheme);
    }
}

// Initialize the settings manager when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.settingsManager = new SettingsManager();
}); 