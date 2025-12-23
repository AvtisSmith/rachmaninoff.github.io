document.addEventListener("DOMContentLoaded", () => {
    const page = document.body.dataset.page;

    setupNavigation();
    setupThemeToggle();
    setupScrollTop();

    setupMembershipBadge();

    if (page === "home") setupQuotesWidget();
    if (page === "works") setupWorksFilter();
    if (page === "media") setupGalleryModal();
    if (page === "legacy") {
        setupQuiz();
        setupClubForm();
    }
    if (page === "member") {
        setupMemberPage();
    }
});

/* ---------- CONSTANTS ---------- */
const CLUB_STORAGE_KEY = "rahmaninov-club-member";

/* ---------- NAV ---------- */
function setupNavigation() {
    const navToggle = document.getElementById("navToggle");
    const navList = document.getElementById("navList");
    if (!navToggle || !navList) return;

    navToggle.addEventListener("click", () => {
        const isOpen = document.body.classList.toggle("nav-open");
        navToggle.setAttribute("aria-expanded", String(isOpen));
    });

    navList.addEventListener("click", (event) => {
        const target = event.target;
        if (target instanceof HTMLElement && target.matches("a.nav-link")) {
            document.body.classList.remove("nav-open");
            navToggle.setAttribute("aria-expanded", "false");
        }
    });
}

/* ---------- THEME ---------- */
function setupThemeToggle() {
    const themeToggle = document.getElementById("themeToggle");
    if (!themeToggle) return;

    const THEME_KEY = "rahmaninov-theme";
    const savedTheme = localStorage.getItem(THEME_KEY);

    if (savedTheme === "light") {
        document.body.classList.add("theme-light");
    }

    themeToggle.addEventListener("click", () => {
        const isLight = document.body.classList.toggle("theme-light");
        localStorage.setItem(THEME_KEY, isLight ? "light" : "dark");
    });
}

/* ---------- SCROLL TOP ---------- */
function setupScrollTop() {
    const btn = document.getElementById("scrollTopBtn");
    if (!btn) return;

    window.addEventListener("scroll", () => {
        const visible = window.scrollY > 300;
        btn.dataset.visible = visible ? "true" : "false";
    });

    btn.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    });
}

/* ---------- MEMBERSHIP BADGE ---------- */
function setupMembershipBadge() {
    const badge = document.getElementById("memberBadge");
    const pill = document.getElementById("memberPill");
    if (!badge || !pill) return;

    const data = safeReadMember();
    if (!data) {
        badge.hidden = true;
        pill.textContent = "";
        return;
    }

    badge.hidden = false;
    pill.textContent = `Участник: ${data.memberId}`;
}

/* ---------- HELPERS ---------- */
function safeReadMember() {
    const raw = localStorage.getItem(CLUB_STORAGE_KEY);
    if (!raw) return null;
    try {
        const data = JSON.parse(raw);
        if (!data?.memberId || !data?.email || !data?.tier || !data?.createdAt || !data?.name) return null;
        return data;
    } catch {
        return null;
    }
}

function tierToText(value) {
    if (value === "listener") return "Слушатель";
    if (value === "researcher") return "Исследователь";
    if (value === "volunteer") return "Волонтёр";
    return value || "";
}

function setButtonText(btn, text) {
    if (btn) btn.textContent = text;
}

/* ---------- QUOTES ---------- */
function setupQuotesWidget() {
    const quotes = [
        "«Музыка должна течь из сердца и обращаться к сердцу.»",
        "«Для меня музыка — это исповедь души.»",
        "«Я пишу музыку так, как её слышу, и не могу иначе.»"
    ];

    const quoteText = document.getElementById("quoteText");
    const quoteCounter = document.getElementById("quoteCounter");
    const prevBtn = document.getElementById("prevQuote");
    const nextBtn = document.getElementById("nextQuote");

    if (!quoteText || !quoteCounter || !prevBtn || !nextBtn) return;

    let currentIndex = 0;

    function render() {
        quoteText.textContent = quotes[currentIndex];
        quoteCounter.textContent = `${currentIndex + 1} / ${quotes.length}`;
    }

    prevBtn.addEventListener("click", () => {
        currentIndex = (currentIndex - 1 + quotes.length) % quotes.length;
        render();
    });

    nextBtn.addEventListener("click", () => {
        currentIndex = (currentIndex + 1) % quotes.length;
        render();
    });

    render();
}

/* ---------- WORKS FILTER ---------- */
function setupWorksFilter() {
    const filterContainer = document.querySelector("[data-role='works-filter']");
    const cards = Array.from(document.querySelectorAll(".work-card"));
    if (!filterContainer || cards.length === 0) return;

    filterContainer.addEventListener("click", (event) => {
        const target = event.target;
        if (!(target instanceof HTMLElement)) return;
        if (!target.matches("[data-filter]")) return;

        const filterValue = target.dataset.filter || "all";

        filterContainer.querySelectorAll(".btn-filter").forEach((btn) => {
            btn.classList.toggle("active", btn === target);
        });

        cards.forEach((card) => {
            const category = card.getAttribute("data-category");
            const visible = filterValue === "all" || category === filterValue;
            card.style.display = visible ? "" : "none";
        });
    });
}

/* ---------- GALLERY MODAL ---------- */
function setupGalleryModal() {
    const gallery = document.querySelector("[data-role='gallery']");
    const modal = document.getElementById("imageModal");
    const modalImage = document.getElementById("modalImage");
    const modalCaption = document.getElementById("modalCaption");
    const modalClose = document.getElementById("modalClose");
    const modalBackdrop = document.getElementById("modalBackdrop");

    if (!gallery || !modal || !modalImage || !modalCaption || !modalClose || !modalBackdrop) return;

    function openModal(src, caption) {
        modalImage.src = src;
        modalImage.alt = caption || "Изображение";
        modalCaption.textContent = caption || "";
        modal.dataset.open = "true";
        modal.setAttribute("aria-hidden", "false");
        document.body.style.overflow = "hidden";
        modalClose.focus();
    }

    function closeModal() {
        modal.dataset.open = "false";
        modal.setAttribute("aria-hidden", "true");
        document.body.style.overflow = "";
    }

    gallery.addEventListener("click", (event) => {
        const target = event.target;
        if (!(target instanceof HTMLImageElement)) return;
        const full = target.dataset.full || target.src;
        const caption = target.closest("figure")?.querySelector("figcaption")?.textContent || "";
        openModal(full, caption);
    });

    modalClose.addEventListener("click", closeModal);
    modalBackdrop.addEventListener("click", closeModal);

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && modal.dataset.open === "true") {
            closeModal();
        }
    });
}

/* ---------- QUIZ (FIXED: no auto-next, show correct answer) ---------- */
function setupQuiz() {
    const quizRoot = document.querySelector("[data-role='quiz']");
    if (!quizRoot) return;

    const questionEl = document.getElementById("quizQuestion");
    const optionsEl = document.getElementById("quizOptions");
    const nextBtn = document.getElementById("quizNextBtn");
    const resultEl = document.getElementById("quizResult");
    const progressBar = document.getElementById("quizProgressBar");

    if (!questionEl || !optionsEl || !nextBtn || !resultEl || !progressBar) return;

    const questions = [
        { text: "В каком году родился Сергей Рахманинов?", options: ["1873", "1890", "1917"], correctIndex: 0 },
        { text: "Какой инструмент был центральным в его творчестве?", options: ["Скрипка", "Фортепиано", "Орган"], correctIndex: 1 },
        { text: "«Всенощное бдение» относится к жанру…", options: ["Симфония", "Духовная хоровая музыка", "Фортепианный концерт"], correctIndex: 1 }
    ];

    let current = 0;
    let answered = false;
    let selectedIndex = null;
    let correctCount = 0;

    function render() {
        const q = questions[current];
        answered = false;
        selectedIndex = null;

        questionEl.textContent = q.text;
        optionsEl.innerHTML = "";
        resultEl.textContent = "";
        nextBtn.disabled = true;
        nextBtn.textContent = current === questions.length - 1 ? "Завершить" : "Далее";

        progressBar.style.width = `${(current / questions.length) * 100}%`;

        q.options.forEach((opt, index) => {
            const btn = document.createElement("button");
            btn.type = "button";
            btn.className = "quiz-option";
            btn.textContent = opt;

            btn.addEventListener("click", () => {
                if (answered) return; // после ответа нельзя менять
                selectedIndex = index;
                answered = true;

                // отключить все кнопки
                const allBtns = Array.from(optionsEl.querySelectorAll(".quiz-option"));
                allBtns.forEach(b => b.disabled = true);

                // пометки
                const correctBtn = allBtns[q.correctIndex];
                if (correctBtn) correctBtn.dataset.correct = "true";

                const chosenBtn = allBtns[index];
                if (index !== q.correctIndex && chosenBtn) chosenBtn.dataset.wrong = "true";

                if (index === q.correctIndex) {
                    correctCount++;
                    resultEl.textContent = `Верно! Правильный ответ: «${q.options[q.correctIndex]}».`;
                } else {
                    resultEl.textContent = `Неверно. Правильный ответ: «${q.options[q.correctIndex]}».`;
                }

                nextBtn.disabled = false; // теперь можно нажимать Далее
            });

            optionsEl.appendChild(btn);
        });
    }

    nextBtn.addEventListener("click", () => {
        if (!answered) return;

        current++;

        if (current < questions.length) {
            render();
            return;
        }

        // финал
        progressBar.style.width = "100%";
        questionEl.textContent = "Викторина завершена!";
        optionsEl.innerHTML = "";
        nextBtn.disabled = true;
        resultEl.textContent = `Правильных ответов: ${correctCount} из ${questions.length}.`;
    });

    render();
}

/* ---------- CLUB FORM (FIXED: required name + edit mode) ---------- */
function setupClubForm() {
    const form = document.getElementById("clubForm");
    const successEl = document.getElementById("clubSuccess");
    const clearBtn = document.getElementById("clubClearBtn");
    const editBtn = document.getElementById("clubEditBtn");
    const submitBtn = document.getElementById("clubSubmitBtn");

    const card = document.getElementById("memberCard");
    const cardId = document.getElementById("memberId");
    const cardName = document.getElementById("memberName");
    const cardEmail = document.getElementById("memberEmail");
    const cardTier = document.getElementById("memberTier");
    const cardDate = document.getElementById("memberDate");

    if (!form || !successEl || !clearBtn || !editBtn || !submitBtn) return;
    if (!card || !cardId || !cardName || !cardEmail || !cardTier || !cardDate) return;

    // режим редактирования: false = "вступление", true = "изменение"
    let isEditMode = false;

    function setError(fieldName, text) {
        const el = form.querySelector(`[data-error-for='${fieldName}']`);
        if (el) el.textContent = text || "";
    }

    function clearAllErrors() {
        setError("clubName", "");
        setError("clubEmail", "");
        setError("clubTier", "");
        setError("clubAgree", "");
    }

    function showMemberCard(data) {
        card.hidden = false;
        cardId.textContent = data.memberId;
        cardName.textContent = data.name;
        cardEmail.textContent = data.email;
        cardTier.textContent = tierToText(data.tier);
        cardDate.textContent = new Date(data.createdAt).toLocaleString();
    }

    function hideMemberCard() {
        card.hidden = true;
        cardId.textContent = "";
        cardName.textContent = "";
        cardEmail.textContent = "";
        cardTier.textContent = "";
        cardDate.textContent = "";
    }

    function fillFormFromMember(data) {
        form.clubName.value = data.name || "";
        form.clubEmail.value = data.email || "";
        form.clubTier.value = data.tier || "";
        form.clubNote.value = data.note || "";
        form.clubAgree.checked = true; // раз уже был участник, логично поставить
    }

    function setMode(editMode, memberExists) {
        isEditMode = editMode;

        if (!memberExists) {
            // редактировать нечего
            isEditMode = false;
        }

        if (isEditMode) {
            setButtonText(submitBtn, "Сохранить изменения");
            successEl.textContent = "Режим редактирования: внеси изменения и нажми «Сохранить изменения».";
        } else {
            setButtonText(submitBtn, "Вступить в клуб");
            // successEl оставим как есть (не затираем)
        }
    }

    // восстановление
    const saved = safeReadMember();
    if (saved) {
        showMemberCard(saved);
        fillFormFromMember(saved);
        successEl.textContent = "Вы уже состоите в клубе — данные восстановлены из localStorage. Можно нажать «Изменить данные».";
        setMode(false, true);
    } else {
        hideMemberCard();
        setMode(false, false);
    }

    editBtn.addEventListener("click", () => {
        const currentSaved = safeReadMember();
        if (!currentSaved) {
            successEl.textContent = "Сначала вступите в клуб, чтобы можно было изменять данные.";
            return;
        }

        // переключаем режим
        if (!isEditMode) {
            fillFormFromMember(currentSaved);
            clearAllErrors();
            setMode(true, true);
        } else {
            setMode(false, true);
            successEl.textContent = "Редактирование отменено.";
        }
    });

    clearBtn.addEventListener("click", () => {
        localStorage.removeItem(CLUB_STORAGE_KEY);
        form.reset();
        clearAllErrors();
        successEl.textContent = "Участие сброшено (данные удалены из localStorage).";
        hideMemberCard();
        setMode(false, false);
        setupMembershipBadge();
    });

    form.addEventListener("submit", (event) => {
        event.preventDefault();

        clearAllErrors();
        successEl.textContent = "";

        const name = form.clubName.value.trim();
        const email = form.clubEmail.value.trim();
        const tier = form.clubTier.value;
        const note = form.clubNote.value.trim();
        const agree = form.clubAgree.checked;

        if (!name) {
            setError("clubName", "Введите имя (обязательно).");
            return;
        }

        const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        if (!email || !emailOk) {
            setError("clubEmail", "Введите корректный Email (например: name@example.com).");
            return;
        }
        if (!tier) {
            setError("clubTier", "Пожалуйста, выберите уровень участия.");
            return;
        }
        if (!agree) {
            setError("clubAgree", "Для вступления нужно согласие на обработку данных (учебная имитация).");
            return;
        }

        const existing = safeReadMember();

        // если редактируем и есть участник — сохраняем ID и createdAt
        let memberId;
        let createdAt;

        if (isEditMode && existing) {
            memberId = existing.memberId;
            createdAt = existing.createdAt;
        } else {
            memberId = `R150-${Math.floor(100000 + Math.random() * 900000)}`;
            createdAt = Date.now();
        }

        const payload = { memberId, name, email, tier, note, createdAt };

        localStorage.setItem(CLUB_STORAGE_KEY, JSON.stringify(payload));

        if (isEditMode && existing) {
            successEl.textContent = "Изменения сохранены! Ваш ID остался прежним.";
            setMode(false, true);
        } else {
            successEl.textContent = "Готово! Вы вступили в клуб. Карточка участника создана ниже.";
        }

        showMemberCard(payload);
        setupMembershipBadge();
    });
}

/* ---------- MEMBER PAGE ---------- */
function setupMemberPage() {
    const stateEl = document.getElementById("memberState");
    const actionsEl = document.getElementById("memberActions");
    const previewWrap = document.getElementById("memberPreview");

    const profileId = document.getElementById("profileId");
    const profileEmail = document.getElementById("profileEmail");
    const profileTier = document.getElementById("profileTier");
    const profileName = document.getElementById("profileName");
    const profileDate = document.getElementById("profileDate");

    const downloadBtn = document.getElementById("downloadCardBtn");
    const printBtn = document.getElementById("printCardBtn");
    const deleteBtn = document.getElementById("deleteMemberBtn");

    if (!stateEl || !actionsEl || !previewWrap) return;

    const data = safeReadMember();

    if (!data) {
        stateEl.innerHTML = `
            <p><strong>Профиль не найден.</strong></p>
            <p>Сначала вступи в клуб на странице «Наследие», чтобы появились данные.</p>
            <a class="btn btn-primary" href="legacy.html">Перейти к вступлению</a>
        `;
        actionsEl.hidden = true;
        previewWrap.hidden = true;
        return;
    }

    stateEl.innerHTML = `
        <p><strong>Профиль загружен.</strong></p>
        <p>ID участника: <span style="color: var(--color-text); font-weight: 600;">${data.memberId}</span></p>
        <p style="margin-bottom: 0;">Можно скачать карточку или распечатать её как PDF.</p>
    `;

    profileId.textContent = data.memberId;
    profileEmail.textContent = data.email;
    profileTier.textContent = tierToText(data.tier);
    profileName.textContent = data.name;
    profileDate.textContent = new Date(data.createdAt).toLocaleString();

    actionsEl.hidden = false;
    previewWrap.hidden = false;

    downloadBtn?.addEventListener("click", () => {
        exportMemberCardAsPNG({
            memberId: data.memberId,
            name: data.name,
            email: data.email,
            tier: tierToText(data.tier),
            date: new Date(data.createdAt).toLocaleString()
        });
    });

    printBtn?.addEventListener("click", () => {
        window.print();
    });

    deleteBtn?.addEventListener("click", () => {
        localStorage.removeItem(CLUB_STORAGE_KEY);
        setupMembershipBadge();
        window.location.reload();
    });
}

/* ---------- EXPORT PNG ---------- */
function exportMemberCardAsPNG({ memberId, name, email, tier, date }) {
    const scale = 2;
    const width = 980;
    const height = 560;

    const canvas = document.createElement("canvas");
    canvas.width = width * scale;
    canvas.height = height * scale;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.scale(scale, scale);

    const bg = ctx.createLinearGradient(0, 0, width, height);
    bg.addColorStop(0, "#121826");
    bg.addColorStop(1, "#1c2230");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = "rgba(196,154,63,0.18)";
    ctx.beginPath();
    ctx.arc(140, 110, 180, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "rgba(105,143,211,0.16)";
    ctx.beginPath();
    ctx.arc(860, 520, 220, 0, Math.PI * 2);
    ctx.fill();

    roundRect(ctx, 40, 40, width - 80, height - 80, 20);
    ctx.fillStyle = "rgba(255,255,255,0.06)";
    ctx.fill();

    ctx.strokeStyle = "rgba(255,255,255,0.14)";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = "#f5f5f5";
    ctx.font = "700 30px system-ui, -apple-system, Segoe UI, sans-serif";
    ctx.fillText("Клуб слушателей Рахманинова", 90, 110);

    ctx.fillStyle = "rgba(245,245,245,0.75)";
    ctx.font = "500 18px system-ui, -apple-system, Segoe UI, sans-serif";
    ctx.fillText("Учебная карточка участника (localStorage demo)", 90, 140);

    ctx.fillStyle = "#f5f5f5";
    ctx.font = "800 22px system-ui, -apple-system, Segoe UI, sans-serif";
    ctx.fillText(memberId, width - 290, 110);

    const leftX = 90;
    let y = 210;

    drawField(ctx, leftX, y, "Имя", name); y += 70;
    drawField(ctx, leftX, y, "Email", email); y += 70;
    drawField(ctx, leftX, y, "Уровень", tier); y += 70;
    drawField(ctx, leftX, y, "Дата", date);

    ctx.fillStyle = "rgba(245,245,245,0.65)";
    ctx.font = "500 14px system-ui, -apple-system, Segoe UI, sans-serif";
    ctx.fillText("150 лет С.В. Рахманинову • Клиентская часть (HTML/CSS/JS)", 90, height - 90);

    const a = document.createElement("a");
    a.href = canvas.toDataURL("image/png");
    a.download = `Rachmaninov_Club_${memberId}.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
}

function drawField(ctx, x, y, label, value) {
    ctx.fillStyle = "rgba(245,245,245,0.70)";
    ctx.font = "700 14px system-ui, -apple-system, Segoe UI, sans-serif";
    ctx.fillText(label.toUpperCase(), x, y);

    ctx.fillStyle = "#f5f5f5";
    ctx.font = "700 22px system-ui, -apple-system, Segoe UI, sans-serif";
    ctx.fillText(String(value), x, y + 30);

    ctx.strokeStyle = "rgba(255,255,255,0.12)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x, y + 46);
    ctx.lineTo(x + 800, y + 46);
    ctx.stroke();
}

function roundRect(ctx, x, y, w, h, r) {
    const radius = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.arcTo(x + w, y, x + w, y + h, radius);
    ctx.arcTo(x + w, y + h, x, y + h, radius);
    ctx.arcTo(x, y + h, x, y, radius);
    ctx.arcTo(x, y, x + w, y, radius);
    ctx.closePath();
}
