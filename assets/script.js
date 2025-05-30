// Quran API URL
const QURAN_API = 'https://api.alquran.cloud/v1';

// State management
let state = {
    currentSurah: null,
    startVerse: 1,
    endVerse: 1,
    verses: [],
    sections: [],
    currentSection: 0,
    currentRepeat: 0,
    sectionCount: 3,
    repeatCount: 5,
    progress: 0,
    timer: null,
    startTime: null,
    finalTimer: null,
    finalStartTime: null,
    finalRepeatCount: 0
};

// DOM Elements
const elements = {
    surahSelect: document.getElementById('surahSelect'),
    startVerse: document.getElementById('startVerse'),
    endVerse: document.getElementById('endVerse'),
    sectionCount: document.getElementById('sectionCount'),
    repeatCount: document.getElementById('repeatCount'),
    startButton: document.getElementById('startButton'),
    verseDisplay: document.getElementById('verseDisplay'),
    currentSection: document.getElementById('currentSection'),
    totalSections: document.getElementById('totalSections'),
    currentRepeat: document.getElementById('currentRepeat'),
    totalRepeats: document.getElementById('totalRepeats'),
    remainingRepeats: document.getElementById('remainingRepeats'),
    repeatButton: document.getElementById('repeatButton'),
    finalDisplay: document.getElementById('finalDisplay'),
    finalCurrentRepeat: document.getElementById('finalCurrentRepeat'),
    finalTotalRepeats: document.getElementById('finalTotalRepeats'),
    finalRemainingRepeats: document.getElementById('finalRemainingRepeats'),
    repeatFinalButton: document.getElementById('repeatFinalButton'),
    finishButton: document.getElementById('finishButton'),
    progressFill: document.getElementById('progressFill'),
    feedback: document.getElementById('feedback'),
    timer: document.getElementById('timer'),
    finalTimer: document.getElementById('finalTimer'),
    memorizationArea: document.querySelector('.memorization-area'),
    finalSection: document.querySelector('.final-section')
};

// مراجعة السور المحفوظة
const reviewSection = document.getElementById('reviewSection');
const reviewList = document.getElementById('review-list');
const navButtons = document.querySelectorAll('.nav-button');

// زر تجربة طريقة أخرى
const tryOtherMethodBtn = document.getElementById('tryOtherMethod');
const customTextArea = document.getElementById('customTextArea');
const startCustomMemorizationBtn = document.getElementById('startCustomMemorization');
const customTextInput = document.getElementById('customText');

// Initialize the app
async function init() {
    try {
        // Fetch surahs list
        const response = await fetch(`${QURAN_API}/surah`);
        const data = await response.json();
        
        if (data.code === 200) {
            populateSurahSelect(data.data);
        } else {
            throw new Error('Failed to fetch surahs');
        }
    } catch (error) {
        showFeedback('حدث خطأ في تحميل السور. يرجى المحاولة مرة أخرى.', 'error');
    }
    setupEventListeners();
}

// Populate surah select dropdown
function populateSurahSelect(surahs) {
    elements.surahSelect.innerHTML = '<option value="">اختر السورة</option>';
    surahs.forEach(surah => {
        const option = document.createElement('option');
        option.value = surah.number;
        option.textContent = `${surah.number}. ${surah.name} (${surah.englishName})`;
        elements.surahSelect.appendChild(option);
    });
}

// Update end verse max value when surah is selected
elements.surahSelect.addEventListener('change', async (e) => {
    const surahNumber = e.target.value;
    if (surahNumber) {
        try {
            const response = await fetch(`${QURAN_API}/surah/${surahNumber}`);
            const data = await response.json();
            
            if (data.code === 200) {
                const verseCount = data.data.numberOfAyahs;
                elements.endVerse.max = verseCount;
                elements.endVerse.value = Math.min(elements.endVerse.value, verseCount);
                elements.startVerse.max = verseCount;
            }
        } catch (error) {
            showFeedback('حدث خطأ في تحميل معلومات السورة', 'error');
        }
    }
});

// Setup event listeners
function setupEventListeners() {
    // Start button
    elements.startButton.addEventListener('click', startMemorization);
    
    // Repeat button
    elements.repeatButton.addEventListener('click', () => {
        if (!elements.repeatButton.disabled) {
            repeatSection();
        }
    });
    
    // Repeat final button
    elements.repeatFinalButton.addEventListener('click', repeatFinalSection);
    
    // Navigation buttons
    document.querySelectorAll('.nav-button').forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons
            document.querySelectorAll('.nav-button').forEach(btn => {
                btn.classList.remove('active');
            });
            // Add active class to clicked button
            button.classList.add('active');
        });
    });
    
    // زر "المراجعة"
    navButtons[1].addEventListener('click', () => {
        hideAllSections();
        reviewSection.classList.remove('hidden');
        loadReviewSessions();
    });
    
    // زر "حفظ جديد"
    navButtons[0].addEventListener('click', () => {
        hideAllSections();
        document.querySelector('.surah-selection').classList.remove('hidden');
    });
    
    // زر "الإحصائيات"
    navButtons[2].addEventListener('click', () => {
        hideAllSections();
        document.getElementById('statsSection').classList.remove('hidden');
        updateStatsSection();
    });
    
    if (tryOtherMethodBtn) {
        tryOtherMethodBtn.addEventListener('click', () => {
            customTextArea.classList.toggle('hidden');
            customTextInput.value = '';
            customTextInput.focus();
        });
    }

    if (startCustomMemorizationBtn) {
        startCustomMemorizationBtn.addEventListener('click', () => {
            const text = customTextInput.value.trim();
            const sectionCount = parseInt(elements.sectionCount.value);
            const repeatCount = parseInt(elements.repeatCount.value);
            if (!text || text.length < 5) {
                showFeedback('يرجى إدخال نص مناسب للحفظ', 'error');
                return;
            }
            if (!sectionCount || sectionCount < 1) {
                showFeedback('يرجى تحديد عدد الأقسام بشكل صحيح', 'error');
                return;
            }
            if (!repeatCount || repeatCount < 1) {
                showFeedback('يرجى تحديد عدد التكرارات بشكل صحيح', 'error');
                return;
            }
            // تقسيم النص إلى أقسام
            const words = text.split(/\s+/);
            const sectionSize = Math.ceil(words.length / sectionCount);
            state.verses = words.map(w => ({text: w}));
            state.sectionCount = sectionCount;
            state.repeatCount = repeatCount;
            state.currentSection = 0;
            state.currentRepeat = 0;
            state.progress = 0;
            state.sections = [];
            for (let i = 0; i < words.length; i += sectionSize) {
                state.sections.push(words.slice(i, i + sectionSize).map(w => ({text: w})));
            }
            // حفظ الجلسة في localStorage
            saveSessionToLocalStorage({
                surahNumber: 'نص مخصص',
                surahName: 'نص مخصص',
                startVerse: 1,
                endVerse: words.length,
                sectionCount,
                repeatCount,
                date: new Date().toLocaleString('ar-EG'),
                duration: '--:--',
                customText: text
            });
            elements.totalSections.textContent = sectionCount;
            elements.totalRepeats.textContent = repeatCount;
            elements.memorizationArea.classList.remove('hidden');
            elements.finalSection.classList.add('hidden');
            displayCurrentSection();
            startTimer();
            showFeedback('تم بدء الحفظ بالنص المخصص', 'success');
            customTextArea.classList.add('hidden');
        });
    }
}

// Start the memorization process
async function startMemorization() {
    const surahNumber = elements.surahSelect.value;
    const startVerse = parseInt(elements.startVerse.value);
    const endVerse = parseInt(elements.endVerse.value);
    const sectionCount = parseInt(elements.sectionCount.value);
    const repeatCount = parseInt(elements.repeatCount.value);

    if (!surahNumber) {
        showFeedback('يرجى اختيار السورة', 'error');
        return;
    }

    if (!startVerse || !endVerse || startVerse > endVerse) {
        showFeedback('يرجى تحديد نطاق الآيات بشكل صحيح', 'error');
        return;
    }

    if (!sectionCount || sectionCount < 1) {
        showFeedback('يرجى تحديد عدد الأقسام بشكل صحيح', 'error');
        return;
    }

    if (!repeatCount || repeatCount < 1) {
        showFeedback('يرجى تحديد عدد التكرارات بشكل صحيح', 'error');
        return;
    }

    try {
        const response = await fetch(`${QURAN_API}/surah/${surahNumber}/ar.alafasy`);
        const data = await response.json();
        
        if (data.code === 200) {
            state.verses = data.data.ayahs.slice(startVerse - 1, endVerse);
            state.sectionCount = sectionCount;
            state.repeatCount = repeatCount;
            state.currentSection = 0;
            state.currentRepeat = 0;
            state.progress = 0;
            
            // Divide verses into sections
            const sectionSize = Math.ceil(state.verses.length / sectionCount);
            state.sections = [];
            for (let i = 0; i < state.verses.length; i += sectionSize) {
                state.sections.push(state.verses.slice(i, i + sectionSize));
            }
            // تخزين الجلسة في localStorage
            saveSessionToLocalStorage({
                surahNumber,
                surahName: data.data.englishName || '',
                startVerse,
                endVerse,
                sectionCount,
                repeatCount,
                date: new Date().toLocaleString('ar-EG'),
                duration: '--:--' // يمكن تحديثها لاحقاً عند نهاية الحفظ
            });
            // Update UI
            elements.totalSections.textContent = sectionCount;
            elements.totalRepeats.textContent = repeatCount;
            elements.memorizationArea.classList.remove('hidden');
            elements.finalSection.classList.add('hidden');
            
            displayCurrentSection();
            startTimer();
            showFeedback('تم بدء الحفظ بنجاح', 'success');
        } else {
            throw new Error('Failed to fetch surah verses');
        }
    } catch (error) {
        showFeedback('حدث خطأ في تحميل الآيات. يرجى المحاولة مرة أخرى.', 'error');
    }
}

// دالة لحفظ الجلسة في localStorage
function saveSessionToLocalStorage(session) {
    let sessions = [];
    if (localStorage.getItem('quran_sessions')) {
        sessions = JSON.parse(localStorage.getItem('quran_sessions'));
    }
    sessions.push(session);
    localStorage.setItem('quran_sessions', JSON.stringify(sessions));
}

// Display current section
function displayCurrentSection() {
    if (state.currentSection >= state.sections.length) {
        showFinalSection();
        return;
    }

    const currentVerses = state.sections[state.currentSection];
    elements.currentSection.textContent = state.currentSection + 1;
    elements.currentRepeat.textContent = state.currentRepeat + 1;
    elements.remainingRepeats.textContent = state.repeatCount - state.currentRepeat - 1;
    
    // Display verses
    elements.verseDisplay.textContent = currentVerses.map(verse => verse.text).join('\n');
    
    // Update repeat button state
    updateRepeatButtonState();
    
    updateProgress();
}

// Update repeat button state
function updateRepeatButtonState() {
    const remaining = state.repeatCount - state.currentRepeat - 1;
    elements.remainingRepeats.textContent = remaining;
    
    if (remaining === 0) {
        elements.repeatButton.disabled = true;
        elements.repeatButton.style.opacity = '0.7';
        elements.repeatButton.style.cursor = 'not-allowed';
        
        // Automatically move to next section after a short delay
        setTimeout(() => {
            if (state.currentSection < state.sections.length - 1) {
                state.currentSection++;
                state.currentRepeat = 0;
                displayCurrentSection();
                showFeedback('انتقل إلى القسم التالي', 'success');
            } else {
                showFinalSection();
                showFeedback('تم الانتقال إلى القسم النهائي', 'success');
            }
        }, 1000);
    } else {
        elements.repeatButton.disabled = false;
        elements.repeatButton.style.opacity = '1';
        elements.repeatButton.style.cursor = 'pointer';
    }
}

// Show final section
function showFinalSection() {
    elements.memorizationArea.classList.add('hidden');
    elements.finalSection.classList.remove('hidden');
    elements.finalDisplay.textContent = state.verses.map(verse => verse.text).join('\n');
    
    // Update final section info
    elements.finalTotalRepeats.textContent = state.repeatCount;
    elements.finalCurrentRepeat.textContent = '1';
    elements.finalRemainingRepeats.textContent = state.repeatCount - 1;
    
    stopTimer();
    startFinalTimer();
    
    // Reset final repeat count
    state.finalRepeatCount = 0;
    updateFinalRepeatButton();
}

// Update final repeat button state
function updateFinalRepeatButton() {
    const remaining = state.repeatCount - state.finalRepeatCount - 1;
    elements.finalRemainingRepeats.textContent = remaining;
    elements.finalCurrentRepeat.textContent = state.finalRepeatCount + 1;
    
    if (remaining === 0) {
        elements.repeatFinalButton.disabled = true;
        elements.repeatFinalButton.style.opacity = '0.7';
        elements.repeatFinalButton.style.cursor = 'not-allowed';
        
        // Automatically finish after a short delay
        setTimeout(() => {
            finishMemorization();
        }, 1000);
    } else {
        elements.repeatFinalButton.disabled = false;
        elements.repeatFinalButton.style.opacity = '1';
        elements.repeatFinalButton.style.cursor = 'pointer';
    }
}

// Repeat current section
function repeatSection() {
    if (state.currentRepeat < state.repeatCount - 1) {
        state.currentRepeat++;
        displayCurrentSection();
        showFeedback('تم التكرار بنجاح', 'success');
    }
}

// Repeat final section
function repeatFinalSection() {
    if (state.finalRepeatCount < state.repeatCount - 1) {
        state.finalRepeatCount++;
        elements.finalDisplay.textContent = state.verses.map(verse => verse.text).join('\n');
        showFeedback(`تم التكرار ${state.finalRepeatCount + 1} من ${state.repeatCount}`, 'success');
        updateFinalRepeatButton();
    }
}

// Finish memorization
function finishMemorization() {
    stopTimer();
    stopFinalTimer();
    showFeedback('أحسنت! لقد أكملت حفظ الآيات المحددة', 'success');
    // تحديث مدة الجلسة في آخر جلسة محفوظة
    updateLastSessionDuration(elements.timer.textContent);
    resetState();
    
    // Reset form values
    elements.surahSelect.value = '';
    elements.startVerse.value = '1';
    elements.endVerse.value = '1';
    elements.sectionCount.value = '3';
    elements.repeatCount.value = '5';
}

// تحديث مدة الجلسة في آخر جلسة محفوظة
function updateLastSessionDuration(duration) {
    let sessions = [];
    if (localStorage.getItem('quran_sessions')) {
        sessions = JSON.parse(localStorage.getItem('quran_sessions'));
        if (sessions.length > 0) {
            sessions[sessions.length - 1].duration = duration;
            localStorage.setItem('quran_sessions', JSON.stringify(sessions));
        }
    }
}

// Start timer
function startTimer() {
    state.startTime = Date.now();
    updateTimer();
    state.timer = setInterval(updateTimer, 1000);
}

// Start final timer
function startFinalTimer() {
    state.finalStartTime = Date.now();
    updateFinalTimer();
    state.finalTimer = setInterval(updateFinalTimer, 1000);
}

// Update timer display
function updateTimer() {
    const elapsed = Math.floor((Date.now() - state.startTime) / 1000);
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;
    elements.timer.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

// Update final timer display
function updateFinalTimer() {
    const elapsed = Math.floor((Date.now() - state.finalStartTime) / 1000);
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;
    elements.finalTimer.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

// Stop timer
function stopTimer() {
    if (state.timer) {
        clearInterval(state.timer);
        state.timer = null;
    }
}

// Stop final timer
function stopFinalTimer() {
    if (state.finalTimer) {
        clearInterval(state.finalTimer);
        state.finalTimer = null;
    }
}

// Update progress bar
function updateProgress() {
    const progress = ((state.currentSection * state.repeatCount + state.currentRepeat) / 
                     (state.sectionCount * state.repeatCount)) * 100;
    elements.progressFill.style.width = `${progress}%`;
}

// Show feedback message
function showFeedback(message, type) {
    elements.feedback.textContent = message;
    elements.feedback.className = `feedback feedback-${type}`;
    
    // Clear feedback after 3 seconds
    setTimeout(() => {
        elements.feedback.textContent = '';
        elements.feedback.className = 'feedback';
    }, 3000);
}

// Reset application state
function resetState() {
    state.currentSurah = null;
    state.startVerse = 1;
    state.endVerse = 1;
    state.verses = [];
    state.sections = [];
    state.currentSection = 0;
    state.currentRepeat = 0;
    state.sectionCount = 3;
    state.repeatCount = 5;
    state.progress = 0;
    state.timer = null;
    state.startTime = null;
    state.finalTimer = null;
    state.finalStartTime = null;
    state.finalRepeatCount = 0;
    
    elements.memorizationArea.classList.add('hidden');
    elements.finalSection.classList.add('hidden');
    elements.progressFill.style.width = '0%';
    elements.timer.textContent = '00:00';
    elements.finalTimer.textContent = '00:00';
    
    // Reset final repeat button
    elements.repeatFinalButton.disabled = false;
    elements.repeatFinalButton.style.opacity = '1';
    elements.repeatFinalButton.style.cursor = 'pointer';
}

// تحميل الجلسات المحفوظة وعرضها
async function loadReviewSessions() {
    reviewList.innerHTML = '<div class="spinner"></div>';
    try {
        // جلب الجلسات من localStorage أو API (هنا مثال باستخدام localStorage)
        let sessions = [];
        if (localStorage.getItem('quran_sessions')) {
            sessions = JSON.parse(localStorage.getItem('quran_sessions'));
        } else {
            // إذا كان هناك API:
            // const res = await fetch('/api/sessions');
            // sessions = await res.json();
        }
        if (!sessions.length) {
            reviewList.innerHTML = '<div class="no-data">لا توجد سور محفوظة بعد.</div>';
            return;
        }
        reviewList.innerHTML = sessions.map((s, i) => `
            <div class="review-item">
                <div class="review-info">
                    <h3>${s.surahName ? s.surahName : 'سورة'} ${s.surahNumber ? '('+s.surahNumber+')' : ''}</h3>
                    <p>من الآية ${s.startVerse} إلى ${s.endVerse}</p>
                    <p>تاريخ الحفظ: <span>${s.date || ''}</span></p>
                    <p>مدة الجلسة: <span>${s.duration || '--:--'}</span></p>
                </div>
                <button class="button button-primary" data-index="${i}" data-tooltip="مراجعة الآن">مراجعة الآن</button>
            </div>
        `).join('');
        // إضافة حدث "مراجعة الآن"
        reviewList.querySelectorAll('button[data-index]').forEach(btn => {
            btn.addEventListener('click', function() {
                const idx = this.getAttribute('data-index');
                startReviewSession(sessions[idx]);
            });
        });
    } catch (e) {
        reviewList.innerHTML = '<div class="feedback feedback-error">حدث خطأ أثناء تحميل السور المحفوظة</div>';
    }
}

// بدء مراجعة الجلسة (إعادة الحفظ)
function startReviewSession(session) {
    // تعبئة الحقول وإظهار واجهة الحفظ
    elements.surahSelect.value = session.surahNumber;
    elements.startVerse.value = session.startVerse;
    elements.endVerse.value = session.endVerse;
    elements.sectionCount.value = session.sectionCount;
    elements.repeatCount.value = session.repeatCount;
    // إظهار واجهة الحفظ
    hideAllSections();
    document.querySelector('.surah-selection').classList.remove('hidden');
    // يمكن للمستخدم الضغط على "ابدأ الحفظ" مباشرة
}

// Hide all sections
function hideAllSections() {
    document.querySelector('.surah-selection').classList.add('hidden');
    document.querySelector('.memorization-area').classList.add('hidden');
    document.querySelector('.final-section').classList.add('hidden');
    document.querySelector('.progress-section').classList.add('hidden');
    reviewSection.classList.add('hidden');
}

// إحصائيات المستخدم
function updateStatsSection() {
    let sessions = [];
    if (localStorage.getItem('quran_sessions')) {
        sessions = JSON.parse(localStorage.getItem('quran_sessions'));
    }
    // عدد الجلسات
    document.getElementById('statSessions').textContent = sessions.length;
    // عدد السور الفريدة
    const surahSet = new Set(sessions.map(s => s.surahNumber + '-' + s.startVerse + '-' + s.endVerse));
    document.getElementById('statSurahs').textContent = surahSet.size;
    // إجمالي الوقت
    let totalSeconds = 0;
    sessions.forEach(s => {
        if (s.duration && s.duration.includes(':')) {
            const [min, sec] = s.duration.split(':').map(Number);
            totalSeconds += (min * 60 + sec);
        }
    });
    const tMin = Math.floor(totalSeconds / 60);
    const tSec = totalSeconds % 60;
    document.getElementById('statTotalTime').textContent = `${tMin}:${tSec.toString().padStart(2, '0')}`;
    // نشاط الأسبوع
    drawWeekChart(sessions);
}

function drawWeekChart(sessions) {
    const days = ['الأحد','الإثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت'];
    const now = new Date();
    const week = Array(7).fill(0);
    sessions.forEach(s => {
        if (s.date) {
            const d = new Date(s.date);
            // فقط الجلسات خلال آخر 7 أيام
            const diff = (now - d) / (1000*60*60*24);
            if (diff <= 6) {
                week[d.getDay()]++;
            }
        }
    });
    const ctx = document.getElementById('weekChart').getContext('2d');
    ctx.clearRect(0,0,ctx.canvas.width,ctx.canvas.height);
    // رسم خط بياني أخضر متدرج
    const w = ctx.canvas.width;
    const h = ctx.canvas.height;
    const padding = 30;
    const stepX = (w - 2*padding) / 6;
    const max = Math.max(...week,1);
    // نقاط الرسم
    const points = week.map((val, i) => {
        const x = padding + i*stepX;
        const y = h - padding - (val/max)*(h-2*padding);
        return {x, y, val};
    });
    // تظليل أسفل الخط
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(points[0].x, h-padding);
    points.forEach(p => ctx.lineTo(p.x, p.y));
    ctx.lineTo(points[points.length-1].x, h-padding);
    ctx.closePath();
    const grad = ctx.createLinearGradient(0,0,0,h);
    grad.addColorStop(0,'#4ade80cc');
    grad.addColorStop(1,'#bbf7d000');
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.restore();
    // رسم الخط
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for(let i=1;i<points.length;i++) ctx.lineTo(points[i].x, points[i].y);
    ctx.strokeStyle = '#16a34a';
    ctx.lineWidth = 3;
    ctx.shadowColor = '#22c55e44';
    ctx.shadowBlur = 6;
    ctx.stroke();
    ctx.shadowBlur = 0;
    // رسم النقاط
    points.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 6, 0, 2*Math.PI);
        ctx.fillStyle = '#22c55e';
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#14532d';
        ctx.stroke();
        // الرقم
        ctx.font = 'bold 15px Amiri, serif';
        ctx.fillStyle = '#14532d';
        ctx.fillText(p.val, p.x-6, p.y-12);
    });
    // الأيام
    ctx.font = 'bold 14px Amiri, serif';
    ctx.fillStyle = '#134e4a';
    points.forEach((p,i) => {
        ctx.fillText(days[i], p.x-18, h-7);
    });
}

// Initialize the app
document.addEventListener('DOMContentLoaded', init);
