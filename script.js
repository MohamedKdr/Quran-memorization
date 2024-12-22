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

    // تقسيم النص إلى عدد الأقسام المحدد
    const sections = splitTextIntoParts(text, sectionCount);

    // إنشاء الناتج
    const outputDiv = document.getElementById("output");
    const sectionsDiv = document.getElementById("sections");
    sectionsDiv.innerHTML = ""; // مسح المحتوى السابق

    sections.forEach((section, index) => {
        const sectionDiv = document.createElement("div");
        sectionDiv.className = "section";
        if (index > 0) {
            sectionDiv.classList.add("hidden");
        }

        let remainingRepeats = repeatCount;
        const repeatText = document.createElement("p");
        repeatText.innerHTML = `<strong>القسم ${index + 1}:</strong><br>${section}`;
        
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
                    }
                }
            }
        });

        const toggleVisibilityButton = document.createElement("button");
        toggleVisibilityButton.className = "toggle-visibility-btn";
        toggleVisibilityButton.innerHTML = "👁️";
        toggleVisibilityButton.addEventListener("click", () => {
            repeatText.style.display = repeatText.style.display === "none" ? "block" : "none";
        });

        sectionDiv.appendChild(toggleVisibilityButton);
        sectionDiv.appendChild(repeatText);
        sectionDiv.appendChild(counterText);
        sectionDiv.appendChild(repeatButton);
        sectionsDiv.appendChild(sectionDiv);
    });

    outputDiv.style.display = "block";
});

// دالة لتقسيم النص إلى عدد الأقسام المحدد
function splitTextIntoParts(text, partCount) {
    const length = text.length;
    const partSize = Math.ceil(length / partCount);
    const parts = [];

    for (let i = 0; i < partCount; i++) {
        const start = i * partSize;
        const end = start + partSize;
        parts.push(text.slice(start, end));
    }

    return parts;
}

// دالة لتحميل النص
document.getElementById("download-btn").addEventListener("click", () => {
    const sections = document.querySelectorAll(".section p:nth-child(3)");
    let downloadText = "";

    sections.forEach(section => {
        downloadText += section.innerText + "\n\n";
    });

    const blob = new Blob([downloadText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "sections.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
});
