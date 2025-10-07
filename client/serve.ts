import { serve } from "bun";
import fs from "fs";
import path from "path";

const clientDir = path.dirname(import.meta.url.replace("file://", ""));
const port = 5173;

serve({
  port,
  async fetch(req) {
    try {
      const url = new URL(req.url);
      let filePath = path.join(clientDir, url.pathname);

      // Serve index.html for root
      if (url.pathname === "/") {
        filePath = path.join(clientDir, "index.html");
      }

      // Read the file
      const file = fs.readFileSync(filePath);

      // Determine content type
      const ext = path.extname(filePath);
      let contentType = "text/plain";
      if (ext === ".html") contentType = "text/html";
      else if (ext === ".js" || ext === ".ts" || ext === ".tsx")
        contentType = "application/javascript";
      else if (ext === ".css") contentType = "text/css";

      return new Response(file, {
        headers: { "Content-Type": contentType },
      });
    } catch (err) {
      return new Response(`Not found - ${err}`, { status: 404 });
    }
  },
});

console.log(`🚀 Frontend served at http://localhost:${port}`);
