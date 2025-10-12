import { describe, it, expect, beforeAll, afterAll } from "bun:test";
import { server } from "./index";

const BASE_URL = "http://localhost:3010";

afterAll(() => {
  server.stop();
});

describe("URL Shortener API", () => {
  it("should return 400 for missing URL in POST /api/shorten", async () => {
    const res = await fetch(`${BASE_URL}/api/shorten`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    expect(res.status).toBe(400);
    const json = (await res.json()) as { error: string };
    expect(json.error).toBe("Please provide a URL");
  });

  it("should return 400 for invalid URL format", async () => {
    const res = await fetch(`${BASE_URL}/api/shorten`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: "not-a-url" }),
    });
    expect(res.status).toBe(400);
    const json = (await res.json()) as { error: string };
    expect(json.error).toBe("Invalid URL format");
  });

  it("should create a short URL successfully", async () => {
    const res = await fetch(`${BASE_URL}/api/shorten`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: "https://example.com" }),
    });
    expect(res.status).toBe(200);
    const json = (await res.json()) as { shortUrl: string };
    expect(json.shortUrl).toContain(BASE_URL);
  });

  it("should redirect to the original URL when accessing a short code", async () => {
    // First, create the short code
    const shortenRes = await fetch(`${BASE_URL}/api/shorten`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: "https://example.com" }),
    });
    const { shortUrl } = (await shortenRes.json()) as { shortUrl: string };

    // Then, request that short URL
    const redirectRes = await fetch(shortUrl, { redirect: "manual" });
    expect(redirectRes.status).toBe(302);
    expect(redirectRes.headers.get("location")).toBe("https://example.com");
  });

  it("should return 404 for a non-existing short code", async () => {
    const res = await fetch(`${BASE_URL}/nonexistent`, { redirect: "manual" });
    expect(res.status).toBe(404);
  });
});
