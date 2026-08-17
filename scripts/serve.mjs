import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL("../", import.meta.url)));
const port = Number.parseInt(process.env.PORT || "8000", 10);
const types = new Map([
    [".html", "text/html; charset=utf-8"],
    [".css", "text/css; charset=utf-8"],
    [".js", "text/javascript; charset=utf-8"],
    [".json", "application/json; charset=utf-8"],
    [".xml", "application/xml; charset=utf-8"],
    [".txt", "text/plain; charset=utf-8"],
    [".jpg", "image/jpeg"],
    [".jpeg", "image/jpeg"],
    [".png", "image/png"]
]);

const server = createServer((request, response) => {
    try {
        const url = new URL(request.url || "/", "http://localhost");
        const pathname = decodeURIComponent(url.pathname);
        const requested = pathname.endsWith("/") ? `${pathname}index.html` : pathname;
        const candidate = resolve(join(root, normalize(requested).replace(/^[/\\]+/, "")));
        const insideRoot = candidate === root || candidate.startsWith(`${root}${sep}`);

        if (!insideRoot || !existsSync(candidate) || !statSync(candidate).isFile()) {
            response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
            response.end("Страница не найдена");
            return;
        }

        response.writeHead(200, {
            "Content-Type": types.get(extname(candidate).toLowerCase()) || "application/octet-stream",
            "Cache-Control": "no-cache"
        });
        createReadStream(candidate).pipe(response);
    } catch (_error) {
        response.writeHead(400, { "Content-Type": "text/plain; charset=utf-8" });
        response.end("Некорректный запрос");
    }
});

server.listen(port, "127.0.0.1", () => {
    console.log(`Выставка доступна по адресу http://127.0.0.1:${port}`);
});
