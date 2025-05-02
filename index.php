<?php
session_start();
?>
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="أداة مساعدة لحفظ النصوص عبر التكرار والتقسيم">
    <title>تكرار النص للحفظ</title>
    <link href="https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="assets/styles.css">
</head>
<body>
    <div class="container">
        <header class="app-header">
            <h1>تكرار النص للحفظ</h1>
            <button id="theme-toggle" class="btn-theme">🌙</button>
        </header>

        <main class="app-main">
            <form id="text-form" class="input-form">
                <div class="form-group">
                    <label for="input-text">النص المراد حفظه</label>
                    <textarea id="input-text" placeholder="أدخل النص هنا..." rows="5" required></textarea>
                </div>

                <div class="input-grid">
                    <div class="form-group">
                        <label for="section-count">عدد الأقسام</label>
                        <input type="number" id="section-count" min="1" value="3" required>
                    </div>

                    <div class="form-group">
                        <label for="repeat-count">عدد التكرارات</label>
                        <input type="number" id="repeat-count" min="1" value="5" required>
                    </div>
                </div>

                <button type="submit" class="btn-primary">بدء الحفظ</button>
            </form>

            <div id="sections-container" class="hidden"></div>

            <div id="final-section" class="hidden">
                <div class="section">
                    <div class="section-header">
                        <h3>التكرار النهائي</h3>
                        <button class="toggle-btn">👁️</button>
                    </div>
                    <div class="section-content"></div>
                    <div class="section-controls">
                        <span class="counter">التكرارات المتبقية: <span id="full-text-counter">0</span></span>
                        <button id="repeat-full-text" class="btn-primary">كرر النص كاملاً</button>
                    </div>
                </div>
            </div>

            <div id="timer" class="timer hidden">
                <div class="timer-content">
                    <span class="icon">⏳</span>
                    <span id="elapsed-time">00:00</span>
                </div>
            </div>

            <div id="congrats-message" class="hidden">
                <div class="confetti"></div>
                <h2>مبروك! لقد أكملت الحفظ</h2>
                <p>الوقت المستغرق: <span id="total-time">00:00</span></p>
                <button onclick="location.reload()" class="btn-primary">بدء جديد</button>
            </div>
        </main>
    </div>

    <script src="assets/script.js"></script>
</body>
</html>
