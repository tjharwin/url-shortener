import { serve } from "bun";
import { Database } from "bun:sqlite";
import crypto from "crypto";

// Initialize SQLite database
const db = new Database("urls.sqlite");
db.run(`
  CREATE TABLE IF NOT EXISTS urls (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT UNIQUE,
    original_url TEXT
  )
`);

serve({
  port: 4000,
  async fetch(req) {
    const url = new URL(req.url);

    // Handle preflight CORS requests
    if (req.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      });
    }

    // POST /shorten -> create short URL
    if (req.method === "POST" && url.pathname === "/shorten") {
      try {
        const { url: originalUrl } = await req.json();

        // Validate URL
        if (!originalUrl || !originalUrl.startsWith("http")) {
          return new Response(JSON.stringify({ error: "Invalid URL" }), {
            status: 400,
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*",
            },
          });
        }

        // Generate random short code
        const code = crypto.randomBytes(3).toString("hex");

        // Save to database
        db.run("INSERT INTO urls (code, original_url) VALUES (?, ?)", [
          code,
          originalUrl,
        ]);

        return new Response(
          JSON.stringify({ short_url: `http://localhost:4000/${code}` }),
          {
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*",
            },
          }
        );
      } catch (err) {
        return new Response(
          JSON.stringify({ error: "Failed to shorten URL" }),
          {
            status: 500,
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*",
            },
          }
        );
      }
    }

    // GET /:code -> redirect to original URL
    const code = url.pathname.slice(1);
    if (code) {
      const row = db
        .query("SELECT original_url FROM urls WHERE code = ?")
        .get(code) as { original_url: string } | undefined;
      if (row) return Response.redirect(row.original_url, 302);
      return new Response("URL not found", { status: 404 });
    }

    // Default response
    return new Response("URL Shortener API", {
      headers: { "Content-Type": "text/plain" },
    });
  },
});

console.log("🚀 Bun URL shortener running on http://localhost:4000");
