"use strict";

document.documentElement.classList.add("js");

const STORAGE_KEYS = {
    theme: "rachmaninov-theme",
    favorites: "rachmaninov-route"
};

const WORKS = [
    { id: "aleko", title: "«Алеко»", year: "1892", genre: "Опера", opus: "без номера опуса" },
    { id: "prelude", title: "Прелюдия до-диез минор", year: "1892", genre: "Фортепиано", opus: "op. 3 № 2" },
    { id: "symphony-1", title: "Симфония № 1 ре минор", year: "1895", genre: "Симфония", opus: "op. 13" },
    { id: "concerto-2", title: "Концерт для фортепиано № 2 до минор", year: "1900–1901", genre: "Концерт", opus: "op. 18" },
    { id: "symphony-2", title: "Симфония № 2 ми минор", year: "1906–1907", genre: "Симфония", opus: "op. 27" },
    { id: "concerto-3", title: "Концерт для фортепиано № 3 ре минор", year: "1909", genre: "Концерт", opus: "op. 30" },
    { id: "bells", title: "«Колокола»", year: "1913", genre: "Хор и оркестр", opus: "op. 35" },
    { id: "vespers", title: "«Всенощное бдение»", year: "1915", genre: "Хор a cappella", opus: "op. 37" },
    { id: "rhapsody", title: "Рапсодия на тему Паганини", year: "1934", genre: "Фортепиано с оркестром", opus: "op. 43" },
    { id: "symphonic-dances", title: "«Симфонические танцы»", year: "1940", genre: "Оркестр", opus: "op. 45" }
];

const QUIZ = [
    {
        question: "Когда родился Сергей Рахманинов по новому стилю?",
        options: ["1 апреля 1873 года", "2 апреля 1874 года", "20 марта 1875 года"],
        answer: 0,
        explanation: "1 апреля 1873 года — дата по новому стилю; 20 марта — по старому стилю."
    },
    {
        question: "Какое произведение стало важной вехой творческого возвращения после кризиса?",
        options: ["Симфонические танцы", "Второй фортепианный концерт", "Опера «Алеко»"],
        answer: 1,
        explanation: "Полное исполнение Второго фортепианного концерта в 1901 году обозначило выход из длительного творческого кризиса."
    },
    {
        question: "Для какого события был создан Третий фортепианный концерт?",
        options: ["Для первых гастролей в США", "Для выпускного экзамена", "Для работы в Большом театре"],
        answer: 0,
        explanation: "Концерт был написан к американскому турне 1909 года и впервые прозвучал в Нью-Йорке."
    },
    {
        question: "В каком году Рахманинов покинул Россию?",
        options: ["1909", "1917", "1918"],
        answer: 1,
        explanation: "Он выехал из России в декабре 1917 года; в США семья прибыла в конце 1918 года."
    },
    {
        question: "Как называется последнее крупное сочинение Рахманинова?",
        options: ["«Колокола»", "Третья симфония", "«Симфонические танцы»"],
        answer: 2,
        explanation: "«Симфонические танцы», op. 45, завершены в 1940 году."
    }
];

document.addEventListener("DOMContentLoaded", () => {
    setupTheme();
    setupMenu();
    setupScrollTop();
    setupReveals();
    updateFavoriteInterface();
    setupFavoriteButtons();
    setupWorksCatalog();
    setupEraTabs();
    setupGallery();
    setupQuiz();
    setupRoute();
});

window.addEventListener("storage", (event) => {
    if (event.key === STORAGE_KEYS.favorites) {
        updateFavoriteInterface();
        renderRoute();
    }
    if (event.key === STORAGE_KEYS.theme) applyTheme(event.newValue === "dark" ? "dark" : "light", false);
});

function readStorage(key) {
    try {
        return window.localStorage.getItem(key);
    } catch (_error) {
        return null;
    }
}

function writeStorage(key, value) {
    try {
        window.localStorage.setItem(key, value);
        return true;
    } catch (_error) {
        return false;
    }
}

function getFavorites() {
    const known = new Set(WORKS.map((work) => work.id));
    try {
        const value = JSON.parse(readStorage(STORAGE_KEYS.favorites) || "[]");
        if (!Array.isArray(value)) return [];
        return [...new Set(value.filter((id) => typeof id === "string" && known.has(id)))];
    } catch (_error) {
        return [];
    }
}

function setFavorites(favorites) {
    writeStorage(STORAGE_KEYS.favorites, JSON.stringify(favorites));
    updateFavoriteInterface();
    renderRoute();
}

function pluralizeWorks(count) {
    const remainder100 = count % 100;
    const remainder10 = count % 10;
    if (remainder100 >= 11 && remainder100 <= 14) return "произведений";
    if (remainder10 === 1) return "произведение";
    if (remainder10 >= 2 && remainder10 <= 4) return "произведения";
    return "произведений";
}

function setupTheme() {
    applyTheme(readStorage(STORAGE_KEYS.theme) === "dark" ? "dark" : "light", false);
    document.querySelectorAll("[data-theme-toggle]").forEach((button) => {
        button.addEventListener("click", () => {
            const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
            applyTheme(next, true);
        });
    });
}

function applyTheme(theme, persist) {
    const isDark = theme === "dark";
    document.documentElement.dataset.theme = isDark ? "dark" : "light";
    document.querySelectorAll("[data-theme-toggle]").forEach((button) => {
        button.setAttribute("aria-pressed", String(isDark));
        const label = button.querySelector("[data-theme-label]");
        const icon = button.querySelector("[data-theme-icon]");
        if (label) label.textContent = isDark ? "Включить светлую тему" : "Включить тёмную тему";
        if (icon) icon.textContent = isDark ? "☀" : "◐";
    });
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", isDark ? "#171612" : "#f3eee3");
    if (persist) writeStorage(STORAGE_KEYS.theme, isDark ? "dark" : "light");
}

function setupMenu() {
    const button = document.querySelector("[data-menu-toggle]");
    const nav = document.querySelector("[data-site-nav]");
    if (!button || !nav) return;
    const media = window.matchMedia("(max-width: 920px)");

    const close = (restoreFocus = false) => {
        button.setAttribute("aria-expanded", "false");
        const label = button.querySelector("[data-menu-label]");
        if (label) label.textContent = "Меню";
        if (media.matches) {
            nav.hidden = true;
            nav.setAttribute("aria-hidden", "true");
            nav.inert = true;
        }
        if (restoreFocus) button.focus();
    };

    const sync = () => {
        if (media.matches) close(false);
        else {
            nav.hidden = false;
            nav.removeAttribute("aria-hidden");
            nav.inert = false;
            button.setAttribute("aria-expanded", "false");
        }
    };

    button.addEventListener("click", () => {
        const open = button.getAttribute("aria-expanded") !== "true";
        button.setAttribute("aria-expanded", String(open));
        const label = button.querySelector("[data-menu-label]");
        if (label) label.textContent = open ? "Закрыть" : "Меню";
        nav.hidden = !open;
        nav.inert = !open;
        if (open) nav.removeAttribute("aria-hidden");
        else nav.setAttribute("aria-hidden", "true");
    });

    nav.addEventListener("click", (event) => {
        if (media.matches && event.target.closest("a")) close(false);
    });
    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && button.getAttribute("aria-expanded") === "true") close(true);
    });
    document.addEventListener("click", (event) => {
        if (media.matches && button.getAttribute("aria-expanded") === "true" && !nav.contains(event.target) && !button.contains(event.target)) close(false);
    });
    if (typeof media.addEventListener === "function") media.addEventListener("change", sync);
    else media.addListener(sync);
    sync();
}

function setupScrollTop() {
    const button = document.querySelector("[data-scroll-top]");
    if (!button) return;
    const update = () => { button.dataset.visible = String(window.scrollY > 600); };
    window.addEventListener("scroll", update, { passive: true });
    button.addEventListener("click", () => {
        const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
    });
    update();
}

function setupReveals() {
    const items = [...document.querySelectorAll(".reveal")];
    if (!items.length) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion || !("IntersectionObserver" in window)) {
        items.forEach((item) => { item.dataset.revealed = "true"; });
        return;
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.dataset.revealed = "true";
            observer.unobserve(entry.target);
        });
    }, { rootMargin: "0px 0px -8%", threshold: 0.05 });
    items.forEach((item) => observer.observe(item));
}

function updateFavoriteInterface() {
    const favorites = getFavorites();
    const favoriteSet = new Set(favorites);
    document.querySelectorAll("[data-favorites-count]").forEach((counter) => {
        counter.textContent = String(favorites.length);
        counter.setAttribute("aria-label", `${favorites.length} ${pluralizeWorks(favorites.length)} в маршруте`);
    });
    document.querySelectorAll("[data-favorite-button]").forEach((button) => {
        const selected = favoriteSet.has(button.dataset.favoriteButton);
        button.setAttribute("aria-pressed", String(selected));
        const parts = button.querySelectorAll("span");
        if (parts[0]) parts[0].textContent = selected ? "★" : "☆";
        if (parts[1]) parts[1].textContent = selected ? "В маршруте" : "В маршрут";
        const work = WORKS.find((item) => item.id === button.dataset.favoriteButton);
        if (work) button.setAttribute("aria-label", `${selected ? "Удалить из маршрута" : "Добавить в маршрут"}: ${work.title}`);
    });
}

function setupFavoriteButtons() {
    document.addEventListener("click", (event) => {
        const button = event.target.closest("[data-favorite-button]");
        if (!button) return;
        const id = button.dataset.favoriteButton;
        const favorites = getFavorites();
        setFavorites(favorites.includes(id) ? favorites.filter((item) => item !== id) : [...favorites, id]);
    });
}

function setupWorksCatalog() {
    const form = document.querySelector("[data-works-controls]");
    const grid = document.querySelector("[data-works-grid]");
    if (!form || !grid) return;
    const search = form.querySelector("[data-work-search]");
    const genre = form.querySelector("[data-work-genre]");
    const sort = form.querySelector("[data-work-sort]");
    const status = document.querySelector("[data-works-status]");
    const empty = document.querySelector("[data-works-empty]");
    const cards = [...grid.querySelectorAll("[data-work-card]")];
    const normalize = (value) => value.toLocaleLowerCase("ru").replace(/ё/g, "е").trim();

    const update = () => {
        const query = normalize(search.value);
        const selectedGenre = genre.value;
        let visible = 0;
        cards.forEach((card) => {
            const matchesQuery = !query || normalize(card.dataset.title).includes(query) || normalize(card.textContent).includes(query);
            const matchesGenre = selectedGenre === "all" || card.dataset.genre === selectedGenre;
            card.hidden = !(matchesQuery && matchesGenre);
            if (!card.hidden) visible += 1;
        });
        [...cards].sort((a, b) => {
            if (sort.value === "title") return a.dataset.title.localeCompare(b.dataset.title, "ru");
            const direction = sort.value === "year-desc" ? -1 : 1;
            return direction * (Number(a.dataset.year) - Number(b.dataset.year));
        }).forEach((card) => grid.append(card));
        if (status) status.textContent = `Показано ${visible} из ${cards.length}`;
        if (empty) empty.hidden = visible !== 0;
    };

    form.addEventListener("input", update);
    form.addEventListener("change", update);
    form.addEventListener("reset", () => window.setTimeout(update, 0));
    update();
    if (window.location.hash) {
        const target = document.getElementById(window.location.hash.slice(1));
        if (target && target.matches("[data-work-card]")) window.setTimeout(() => target.scrollIntoView({ block: "center" }), 0);
    }
}

function setupEraTabs() {
    const root = document.querySelector("[data-era-tabs]");
    if (!root) return;
    const tabs = [...root.querySelectorAll("[data-era-tab]")];
    const panels = [...root.querySelectorAll("[data-era-panel]")];
    const select = (tab, focus = false) => {
        tabs.forEach((item) => {
            const active = item === tab;
            item.setAttribute("aria-selected", String(active));
            item.tabIndex = active ? 0 : -1;
        });
        panels.forEach((panel) => { panel.hidden = panel.dataset.eraPanel !== tab.dataset.eraTab; });
        if (focus) tab.focus();
    };
    tabs.forEach((tab, index) => {
        tab.addEventListener("click", () => select(tab));
        tab.addEventListener("keydown", (event) => {
            let next = null;
            if (event.key === "ArrowRight" || event.key === "ArrowDown") next = (index + 1) % tabs.length;
            if (event.key === "ArrowLeft" || event.key === "ArrowUp") next = (index - 1 + tabs.length) % tabs.length;
            if (event.key === "Home") next = 0;
            if (event.key === "End") next = tabs.length - 1;
            if (next === null) return;
            event.preventDefault();
            select(tabs[next], true);
        });
    });
}

function setupGallery() {
    const dialog = document.querySelector("[data-gallery-dialog]");
    if (!dialog || typeof dialog.showModal !== "function") return;
    const image = dialog.querySelector("[data-dialog-image]");
    const title = dialog.querySelector("[data-dialog-title]");
    const description = dialog.querySelector("[data-dialog-description]");
    const close = dialog.querySelector("[data-dialog-close]");
    let trigger = null;
    document.querySelectorAll("[data-gallery-item]").forEach((button) => {
        button.addEventListener("click", () => {
            trigger = button;
            image.src = button.dataset.full;
            image.alt = button.dataset.title;
            title.textContent = button.dataset.title;
            description.textContent = button.dataset.description;
            dialog.showModal();
        });
    });
    close.addEventListener("click", () => dialog.close());
    dialog.addEventListener("click", (event) => {
        const bounds = dialog.getBoundingClientRect();
        const inside = event.clientX >= bounds.left && event.clientX <= bounds.right && event.clientY >= bounds.top && event.clientY <= bounds.bottom;
        if (!inside) dialog.close();
    });
    dialog.addEventListener("close", () => { if (trigger) trigger.focus(); });
}

function setupQuiz() {
    const root = document.querySelector("[data-quiz]");
    if (!root) return;
    const step = root.querySelector("[data-quiz-step]");
    const scoreText = root.querySelector("[data-quiz-score]");
    const progress = root.querySelector("[data-quiz-progress]");
    const progressBar = root.querySelector("[data-quiz-progress-bar]");
    const question = root.querySelector("[data-quiz-question]");
    const options = root.querySelector("[data-quiz-options]");
    const feedback = root.querySelector("[data-quiz-feedback]");
    const next = root.querySelector("[data-quiz-next]");
    const restart = root.querySelector("[data-quiz-restart]");
    let index = 0;
    let score = 0;
    let answered = false;

    const answer = (selected) => {
        if (answered) return;
        answered = true;
        const item = QUIZ[index];
        if (selected === item.answer) score += 1;
        [...options.children].forEach((button, optionIndex) => {
            button.disabled = true;
            if (optionIndex === item.answer) button.dataset.state = "correct";
            else if (optionIndex === selected) button.dataset.state = "wrong";
        });
        scoreText.textContent = `Верных ответов: ${score}`;
        feedback.textContent = `${selected === item.answer ? "Верно. " : "Не совсем. "}${item.explanation}`;
        next.disabled = false;
        next.focus();
    };

    const render = (moveFocus = false) => {
        const item = QUIZ[index];
        answered = false;
        step.textContent = `Вопрос ${index + 1} из ${QUIZ.length}`;
        scoreText.textContent = `Верных ответов: ${score}`;
        progress.setAttribute("aria-valuenow", String(index + 1));
        progressBar.style.width = `${(index + 1) / QUIZ.length * 100}%`;
        question.textContent = item.question;
        feedback.textContent = "";
        next.disabled = true;
        next.textContent = index === QUIZ.length - 1 ? "Показать результат" : "Следующий вопрос";
        options.replaceChildren();
        item.options.forEach((label, optionIndex) => {
            const button = document.createElement("button");
            button.className = "quiz-option";
            button.type = "button";
            button.textContent = label;
            button.addEventListener("click", () => answer(optionIndex));
            options.append(button);
        });
        if (moveFocus) question.focus();
    };

    const finish = () => {
        step.textContent = "Маршрут завершён";
        scoreText.textContent = `Результат: ${score} из ${QUIZ.length}`;
        progress.setAttribute("aria-valuenow", String(QUIZ.length));
        progressBar.style.width = "100%";
        question.textContent = score === QUIZ.length ? "Отлично: все ответы верны" : `Вы ответили верно на ${score} из ${QUIZ.length}`;
        options.replaceChildren();
        feedback.textContent = score >= 4 ? "Вы уверенно ориентируетесь в биографии и музыке Рахманинова." : "Вернитесь к биографии и каталогу, а затем попробуйте ещё раз.";
        next.hidden = true;
        restart.hidden = false;
        question.focus();
    };

    next.addEventListener("click", () => {
        if (!answered) return;
        if (index === QUIZ.length - 1) finish();
        else {
            index += 1;
            render(true);
        }
    });
    restart.addEventListener("click", () => {
        index = 0;
        score = 0;
        next.hidden = false;
        restart.hidden = true;
        render(true);
    });
    render();
}

function setupRoute() {
    if (!document.querySelector("[data-route-list]")) return;
    document.querySelector("[data-clear-route]").addEventListener("click", () => {
        if (!window.confirm("Очистить весь слушательский маршрут?")) return;
        setFavorites([]);
        const status = document.querySelector("[data-route-status]");
        if (status) status.textContent = "Маршрут очищен.";
    });
    document.querySelector("[data-print-route]").addEventListener("click", () => window.print());
    renderRoute();
}

function renderRoute() {
    const list = document.querySelector("[data-route-list]");
    if (!list) return;
    const empty = document.querySelector("[data-route-empty]");
    const clear = document.querySelector("[data-clear-route]");
    const countLarge = document.querySelector("[data-route-count-large]");
    const countLabel = document.querySelector("[data-route-count-label]");
    const favorites = getFavorites();
    list.replaceChildren();

    favorites.forEach((id, index) => {
        const work = WORKS.find((item) => item.id === id);
        if (!work) return;
        const item = document.createElement("li");
        item.className = "route-item";
        const number = document.createElement("span");
        number.className = "route-item-index";
        number.textContent = String(index + 1).padStart(2, "0");
        const copy = document.createElement("div");
        const heading = document.createElement("h3");
        heading.textContent = work.title;
        const meta = document.createElement("p");
        meta.textContent = `${work.year} · ${work.genre} · ${work.opus}`;
        copy.append(heading, meta);
        const actions = document.createElement("div");
        actions.className = "route-item-actions";
        const open = document.createElement("a");
        open.href = `works.html#${work.id}`;
        open.textContent = "→";
        open.setAttribute("aria-label", `Открыть карточку: ${work.title}`);
        const remove = document.createElement("button");
        remove.className = "route-remove";
        remove.type = "button";
        remove.textContent = "×";
        remove.setAttribute("aria-label", `Удалить из маршрута: ${work.title}`);
        remove.addEventListener("click", () => {
            setFavorites(getFavorites().filter((favorite) => favorite !== work.id));
            const status = document.querySelector("[data-route-status]");
            if (status) status.textContent = `${work.title} удалено из маршрута.`;
        });
        actions.append(open, remove);
        item.append(number, copy, actions);
        list.append(item);
    });

    const hasItems = favorites.length > 0;
    list.hidden = !hasItems;
    empty.hidden = hasItems;
    clear.hidden = !hasItems;
    if (countLarge) countLarge.textContent = String(favorites.length);
    if (countLabel) countLabel.innerHTML = `${pluralizeWorks(favorites.length)}<br>в маршруте`;
}
