// ------------------------
// HELPER FUNCTIONS
// ------------------------

/**
 * Generates a deterministic short code for a given URL.
 *
 * This function uses the SHA-256 hash of the input URL to produce a unique,
 * reproducible short code. The resulting short code is a substring of a
 * base36-encoded hash. The length of the short code can be configured using
 * the `SHORT_CODE_LENGTH` environment variable. If the environment variable
 * is not set, it defaults to 10 characters.
 *
 * Example:
 *   generateShortCode("https://example.com")
 *   // might return "1a2b3c4d5e"
 *
 * @param {string} url - The original URL to generate a short code for.
 * @returns {Promise<string>} A promise that resolves to the deterministic short code.
 */
export async function generateShortCode(url: string) {
  const encoder = new TextEncoder();
  const data = encoder.encode(url);

  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));

  const hashString = hashArray
    .map((b) => b.toString(36).padStart(2, "0"))
    .join("");

  return hashString.substring(
    0,
    process.env.SHORT_CODE_LENGTH ? parseInt(process.env.SHORT_CODE_LENGTH) : 10
  );
}
