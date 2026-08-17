import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, extname, join, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = resolve(fileURLToPath(new URL("../", import.meta.url)));
const PAGES = [
    "index.html",
    "biography.html",
    "works.html",
    "media.html",
    "legacy.html",
    "sources.html",
    "member.html"
];

const read = (relativePath) => readFileSync(join(ROOT, relativePath), "utf8");
const occurrences = (value, expression) => [...value.matchAll(expression)].length;

function walk(directory) {
    return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
        const absolute = join(directory, entry.name);
        return entry.isDirectory() ? walk(absolute) : [absolute];
    });
}

test("в проекте есть все семь страниц", () => {
    PAGES.forEach((page) => assert.ok(existsSync(join(ROOT, page)), `Нет ${page}`));
});

for (const page of PAGES) {
    test(`${page}: базовая семантика и метаданные`, () => {
        const html = read(page);
        assert.match(html, /^<!doctype html>/i);
        assert.match(html, /<html\s+lang="ru"/i);
        assert.match(html, /<meta\s+name="viewport"/i);
        assert.match(html, /<meta\s+name="description"\s+content="[^"]{50,}"/i);
        assert.match(html, /<a\s+class="skip-link"\s+href="#main-content"/i);
        assert.match(html, /<main\s+id="main-content"/i);
        assert.equal(occurrences(html, /<h1\b/gi), 1, "Должен быть ровно один h1");
        assert.equal(occurrences(html, /aria-current="page"/gi), 1, "Должна быть ровно одна активная навигационная ссылка");
        assert.match(html, /href="img\/favicon\.png"/i);
        assert.match(html, /href="css\/style\.css"/i);
        assert.match(html, /src="js\/script\.js"/i);
    });

    test(`${page}: идентификаторы уникальны`, () => {
        const ids = [...read(page).matchAll(/\sid="([^"]+)"/gi)].map((match) => match[1]);
        assert.equal(new Set(ids).size, ids.length, "Обнаружены повторяющиеся id");
    });

    test(`${page}: все локальные href/src существуют`, () => {
        const html = read(page);
        const refs = [...html.matchAll(/\s(?:href|src)="([^"]+)"/gi)].map((match) => match[1]);
        refs.forEach((reference) => {
            if (/^(?:https?:|mailto:|tel:|data:|#)/i.test(reference)) return;
            const clean = decodeURIComponent(reference.split(/[?#]/)[0]);
            const target = resolve(ROOT, dirname(page), clean);
            assert.ok(target.startsWith(ROOT), `Ссылка выходит за каталог: ${reference}`);
            assert.ok(existsSync(target), `Не найден локальный ресурс ${reference}`);
        });
    });
}

test("каталог содержит ровно 10 уникальных произведений", () => {
    const html = read("works.html");
    const ids = [...html.matchAll(/data-work-card\s+data-work-id="([^"]+)"/g)].map((match) => match[1]);
    assert.equal(ids.length, 10);
    assert.equal(new Set(ids).size, 10);
    assert.equal(occurrences(html, /data-favorite-button="[^"]+"/g), 10);
});

test("интерактивные учебные сценарии присутствуют", () => {
    const script = read("js/script.js");
    assert.match(script, /function setupWorksCatalog\(/);
    assert.match(script, /function setupEraTabs\(/);
    assert.match(script, /function setupGallery\(/);
    assert.match(script, /function setupQuiz\(/);
    assert.match(script, /function renderRoute\(/);
    assert.equal(occurrences(script, /question: "/g), 5, "В викторине должно быть пять вопросов");
    assert.doesNotThrow(() => new Function(script), "JavaScript должен синтаксически разбираться");
});

test("в HTML нет старых подсказок разработчику и демо-заглушек", () => {
    const visibleMarkup = PAGES.map(read).join("\n").replace(/<script\b[\s\S]*?<\/script>/gi, "");
    assert.doesNotMatch(visibleMarkup, /добавь\s+2[–-]3|кликай|учебная\s+имитация|демонстрация\s+клиентской\s+логики|localStorage|demo[- ]?режим/i);
});

test("CSS содержит основные механизмы доступности и адаптивности", () => {
    const css = read("css/style.css");
    assert.match(css, /\.skip-link/);
    assert.match(css, /:focus-visible/);
    assert.match(css, /@media\s*\(max-width:\s*920px\)/);
    assert.match(css, /@media\s*\(max-width:\s*680px\)/);
    assert.match(css, /prefers-reduced-motion:\s*reduce/);
    assert.match(css, /@media\s+print/);
});

test("изображения соответствуют расширениям", () => {
    const images = walk(join(ROOT, "img")).filter((file) => [".jpg", ".jpeg", ".png"].includes(extname(file).toLowerCase()));
    assert.ok(images.length >= 10, "Ожидались полноразмерные изображения и превью");
    images.forEach((file) => {
        const bytes = readFileSync(file);
        const extension = extname(file).toLowerCase();
        if (extension === ".png") assert.deepEqual([...bytes.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10], file);
        else assert.deepEqual([...bytes.subarray(0, 2)], [255, 216], file);
    });
});

test("SEO-файлы перечисляют все страницы", () => {
    const sitemap = read("sitemap.xml");
    const robots = read("robots.txt");
    PAGES.forEach((page) => assert.match(sitemap, new RegExp(`/${page.replace(".", "\\.")}<`)));
    assert.match(robots, /Sitemap:\s+http:\/\/localhost:8000\/sitemap\.xml/);
});

test("фронтенд не загружает внешние стили или скрипты", () => {
    const allHtml = PAGES.map(read).join("\n");
    assert.doesNotMatch(allHtml, /<(?:script|link)[^>]+(?:src|href)="https?:\/\//i);
    assert.doesNotMatch(read("css/style.css"), /url\(["']?https?:\/\//i);
});

test("анимации появления не скрывают вложенный контент главной страницы", () => {
    const script = read("js/script.js");
    const index = read("index.html");
    assert.ok(occurrences(index, /class="[^"]*\breveal\b[^"]*"/g) > 0, "На главной должны быть элементы reveal");
    assert.match(script, /document\.querySelectorAll\("\.reveal"\)/, "Наблюдаться должны все элементы .reveal");
    assert.doesNotMatch(script, /classList\.add\("reveal"\)/, "Скрипт не должен скрывать целые секции после загрузки");
});

test("метаданные каталога не содержат ошибочный opus для оперы «Алеко»", () => {
    assert.doesNotMatch(read("works.html"), /op\.\s*78/i);
    assert.doesNotMatch(read("js/script.js"), /title:\s*"«Алеко»"[^\n]*op\.\s*78/i);
});
