import { useState } from "react";

export default function App() {
  const [url, setUrl] = useState("");
  const [shortUrl, setShortUrl] = useState("");
  const [error, setError] = useState("");

  const handleShorten = async () => {
    setError("");
    setShortUrl("");

    if (!url.trim()) {
      setError("Please enter a URL");
      return;
    }

    try {
      try {
        new URL(url);
      } catch {
        setError("Invalid URL format");
        return;
      }

      const res = await fetch("http://localhost:3010/api/shorten", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      const data: { shortUrl?: string; error?: string } = await res.json();

      if (!res.ok || data.error) {
        setError(data.error || "Failed to shorten URL");
      } else {
        setShortUrl(data.shortUrl!);
      }
    } catch (e) {
      console.error(e);
      setError("Failed to shorten URL");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-100 via-white to-blue-50 animate-gradient-x">
      <div className="w-full max-w-md p-8 bg-white border border-gray-100 shadow-xl rounded-2xl">
        <h1 className="mb-2 text-3xl font-extrabold text-center text-gray-800">
          ✂️ URL Shortener
        </h1>
        <p className="mb-6 text-center text-gray-500">
          Paste a long URL below to generate a short one instantly.
        </p>

        <div className="flex flex-col space-y-3">
          <input
            type="text"
            placeholder="Enter your long URL..."
            className="w-full px-4 py-3 transition border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />

          <button
            onClick={handleShorten}
            className="w-full py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 active:scale-[0.98] transition"
          >
            Shorten URL
          </button>
        </div>

        {error && (
          <p className="py-2 mt-4 text-sm text-center text-red-500 rounded-md bg-red-50">
            {error}
          </p>
        )}

        {shortUrl && (
          <div className="p-4 mt-6 text-center border border-green-200 rounded-lg bg-green-50">
            <p className="mb-1 font-medium text-gray-700">Your short link:</p>
            <a
              href={shortUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-indigo-600 break-all hover:underline"
            >
              {shortUrl}
            </a>
          </div>
        )}

        <footer className="mt-8 text-sm text-center text-gray-400">
          Tom Harwin 2025
        </footer>
      </div>
    </div>
  );
}
