import { describe, it, expect, beforeEach } from "bun:test";
import { generateShortCode } from "./helpers";

describe("generateShortCode", () => {
  beforeEach(() => {
    // Reset environment variable before each test
    delete process.env.SHORT_CODE_LENGTH;
  });

  it("should generate the same short code for the same URL", async () => {
    const url = "https://example.com";
    const code1 = await generateShortCode(url);
    const code2 = await generateShortCode(url);
    expect(code1).toBe(code2);
  });

  it("should generate a short code of length 10 by default", async () => {
    const url = "https://example.com";
    const code = await generateShortCode(url);
    expect(code.length).toBe(10);
  });

  it("should respect the SHORT_CODE_LENGTH environment variable", async () => {
    process.env.SHORT_CODE_LENGTH = "5";
    const url = "https://example.com";
    const code = await generateShortCode(url);
    expect(code.length).toBe(5);
  });

  it("should generate different short codes for different URLs", async () => {
    const url1 = "https://example.com";
    const url2 = "https://another.com";
    const code1 = await generateShortCode(url1);
    const code2 = await generateShortCode(url2);
    expect(code1).not.toBe(code2);
  });

  it("should handle URLs with query parameters deterministically", async () => {
    const url = "https://example.com?foo=bar";
    const code1 = await generateShortCode(url);
    const code2 = await generateShortCode(url);
    expect(code1).toBe(code2);
  });

  it("should handle empty strings gracefully", async () => {
    const code = await generateShortCode("");
    expect(code.length).toBe(10);
  });
});
