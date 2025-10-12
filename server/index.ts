import { serve, type Server } from "bun";
import db from "./db";
import { generateShortCode } from "./helpers";

interface ShortenRequestBody {
  url: string;
}

interface ErrorResponse {
  error: string;
}

/**
 * Main server instance — exported so it can be imported in tests.
 */
export const server: Server = serve({
  port: 3010,
  async fetch(req: Request): Promise<Response> {
    const url = new URL(req.url);

    // Handle CORS preflight
    if (req.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      });
    }

    // POST /api/shorten
    if (req.method === "POST" && url.pathname === "/api/shorten") {
      try {
        // Safe cast — validated immediately after
        const { url: longUrl } = (await req.json()) as ShortenRequestBody;

        // Validate URL presence
        if (!longUrl || typeof longUrl !== "string" || !longUrl.trim()) {
          const errorRes: ErrorResponse = { error: "Please provide a URL" };
          return new Response(JSON.stringify(errorRes), {
            status: 400,
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*",
            },
          });
        }

        // Validate URL format
        try {
          new URL(longUrl);
        } catch {
          const errorRes: ErrorResponse = { error: "Invalid URL format" };
          return new Response(JSON.stringify(errorRes), {
            status: 400,
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*",
            },
          });
        }

        // Generate deterministic short code
        const shortCode = await generateShortCode(longUrl);

        // Insert URL into DB (ignored if already exists)
        db.run(
          "INSERT OR IGNORE INTO urls (short_code, original_url) VALUES (?, ?)",
          [shortCode, longUrl]
        );

        // Response
        return new Response(
          JSON.stringify({ shortUrl: `http://localhost:3010/${shortCode}` }),
          {
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*",
            },
          }
        );
      } catch (err) {
        console.error(err);
        const errorRes: ErrorResponse = { error: "Failed to process request" };
        return new Response(JSON.stringify(errorRes), {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        });
      }
    }

    // Redirect short URL
    const short = url.pathname.slice(1);
    if (short) {
      const row = db
        .query<{ original_url: string }, [string]>(
          "SELECT original_url FROM urls WHERE short_code = ?"
        )
        .get(short);

      if (row) {
        return Response.redirect(row.original_url, 302);
      }
    }

    return new Response("Not Found", { status: 404 });
  },
});

console.log("🚀 Backend running at http://localhost:3010");
