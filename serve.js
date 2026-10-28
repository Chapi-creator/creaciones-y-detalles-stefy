import { serve } from "bun";
import { existsSync, readFileSync } from "node:fs";

const port = Number(process.env.PORT ?? 3000);
const base = "./public";
const basePath = new URL(base, import.meta.url).pathname;

console.log(`Serving ${basePath} on port ${port}`);
serve({
  port,
  async fetch(request) {
    const url = new URL(request.url);

    let rawPath = url.pathname;
    if (rawPath === "/") rawPath = "/index.html";
    if (!rawPath.startsWith("/")) rawPath = "/" + rawPath;

    const relativePath = rawPath.startsWith("/") ? rawPath.slice(1) : rawPath;
    const filePath = basePath + "/" + relativePath.split("/").map((part) =>
      part === ".." ? "__invalid__" : part
    ).join("/");

    try {
      if (!existsSync(filePath)) {
        return new Response("Not found", { status: 404 });
      }

      const data = readFileSync(filePath);
      if (!data || data.length === 0) return new Response("Not found", { status: 404 });

      const lower = filePath.toLowerCase();
      const type =
        lower.endsWith(".html")
          ? "text/html"
          : lower.endsWith(".css")
          ? "text/css"
          : lower.endsWith(".js")
          ? "application/javascript"
          : lower.endsWith(".png")
          ? "image/png"
          : lower.endsWith(".jpg") || lower.endsWith(".jpeg")
          ? "image/jpeg"
          : lower.endsWith(".svg")
          ? "image/svg+xml"
          : lower.endsWith(".webp")
          ? "image/webp"
          : "application/octet-stream";

      return new Response(data, {
        headers: { "Content-Type": type },
      });
    } catch {
      return new Response("Not found", { status: 404 });
    }
  },
});
