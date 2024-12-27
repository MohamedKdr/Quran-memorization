let startTime;
let timerInterval;

function startTimer() {
    startTime = Date.now();
    timerInterval = setInterval(() => {
        const elapsedTime = Date.now() - startTime;
        const minutes = Math.floor(elapsedTime / 60000);
        const seconds = Math.floor((elapsedTime % 60000) / 1000);
        document.getElementById("elapsed-time").textContent = `${minutes} دقيقة ${seconds} ثانية`;
    }, 1000);
    document.getElementById("timer").style.display = "block";
}

function stopTimer() {
    clearInterval(timerInterval);
}

function splitTextIntoParts(text, parts) {
    const length = text.length;
    const partSize = Math.ceil(length / parts);
    const sections = [];
    for (let i = 0; i < parts; i++) {
        sections.push(text.slice(i * partSize, (i + 1) * partSize));
    }
    return sections;
}

document.getElementById("process-btn").addEventListener("click", () => {
    const text = document.getElementById("input-text").value.trim();
    const sectionCount = parseInt(document.getElementById("section-count").value);
    const repeatCount = parseInt(document.getElementById("repeat-count").value);

    if (!text) {
        alert("يرجى إدخال النص!");
        return;
    }
    if (isNaN(sectionCount) || sectionCount <= 0) {
        alert("يرجى إدخال عدد صحيح للأقسام!");
        return;
    }
    if (isNaN(repeatCount) || repeatCount <= 0) {
        alert("يرجى إدخال عدد صحيح للتكرار!");
        return;
    }

    startTimer();

    const sections = splitTextIntoParts(text, sectionCount);
    const outputDiv = document.getElementById("output");
    const sectionsDiv = document.getElementById("sections");
    sectionsDiv.innerHTML = "";

    sections.forEach((section, index) => {
        const sectionDiv = document.createElement("div");
        sectionDiv.className = "section";
        if (index > 0) {
            sectionDiv.classList.add("hidden");
        }

        const toggleVisibilityButton = document.createElement("button");
        toggleVisibilityButton.className = "toggle-visibility-btn";
        toggleVisibilityButton.innerHTML = "👁️";
        toggleVisibilityButton.addEventListener("click", () => {
            const hiddenText = sectionDiv.querySelector(".hidden-text");
            hiddenText.style.display = hiddenText.style.display === "none" ? "block" : "none";
        });

        let remainingRepeats = repeatCount;
        const repeatText = document.createElement("p");
        repeatText.innerHTML = `<strong>القسم ${index + 1}:</strong><br><span class="hidden-text" style="display: block;">${section}</span>`;

        const counterText = document.createElement("p");
        counterText.textContent = `التكرار المتبقي: ${remainingRepeats}`;

        const repeatButton = document.createElement("button");
        repeatButton.textContent = "كرر النص";
        repeatButton.addEventListener("click", () => {
            if (remainingRepeats > 0) {
                remainingRepeats--;
                counterText.textContent = `التكرار المتبقي: ${remainingRepeats}`;
                if (remainingRepeats === 0) {
                    repeatButton.disabled = true;
                    repeatButton.textContent = "تم الحفظ!";
                    if (index < sections.length - 1) {
                        sectionsDiv.childNodes[index + 1].classList.remove("hidden");
                    } else {
                        document.getElementById("final-output").style.display = "block";
                    }
                }
            }
        });

        sectionDiv.appendChild(toggleVisibilityButton);
        sectionDiv.appendChild(repeatText);
        sectionDiv.appendChild(counterText);
        sectionDiv.appendChild(repeatButton);
        sectionsDiv.appendChild(sectionDiv);
    });

    const fullTextDiv = document.getElementById("full-text");
    fullTextDiv.innerHTML = "";
    const fullTextSection = document.createElement("div");
    fullTextSection.className = "section";

    let remainingRepeatsFullText = repeatCount;
    const fullTextP = document.createElement("p");
    fullTextP.innerHTML = `<strong>النص الكامل:</strong><br>${text}`;

    const fullTextCounter = document.createElement("p");
    fullTextCounter.textContent = `التكرار المتبقي: ${remainingRepeatsFullText}`;

    const fullTextRepeatButton = document.createElement("button");
    fullTextRepeatButton.textContent = "كرر النص الكامل";
    fullTextRepeatButton.addEventListener("click", () => {
        if (remainingRepeatsFullText > 0) {
            remainingRepeatsFullText--;
            fullTextCounter.textContent = `التكرار المتبقي: ${remainingRepeatsFullText}`;
            if (remainingRepeatsFullText === 0) {
                fullTextRepeatButton.disabled = true;
                fullTextRepeatButton.textContent = "تم الحفظ!";
                stopTimer();
            }
        }
    });

    fullTextSection.appendChild(fullTextP);
    fullTextSection.appendChild(fullTextCounter);
    fullTextSection.appendChild(fullTextRepeatButton);
    fullTextDiv.appendChild(fullTextSection);

    outputDiv.style.display = "block";
    document.getElementById("final-output").style.display = "none";
});
