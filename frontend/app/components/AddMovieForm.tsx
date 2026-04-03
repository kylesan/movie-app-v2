"use client";
import React, { useState } from "react";

interface TmdbMovie {
  id: number;
  title: string;
  release_date: string;
  poster_path: string | null;
  overview: string;
}

type Mode = "search" | "bulk";

export default function AddMovieForm({
  onMovieAdded,
}: {
  onMovieAdded: () => void;
}) {
  const [mode, setMode] = useState<Mode>("search");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<TmdbMovie[]>([]);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [bulkText, setBulkText] = useState("");
  const [bulkProgress, setBulkProgress] = useState<string[]>([]);
  const [bulkRunning, setBulkRunning] = useState(false);
  const [bulkYear, setBulkYear] = useState<number | null>(null);
  const currentYear = new Date().getFullYear();

  const searchMovies = async () => {
    if (!query.trim()) return;
    setSearching(true);
    try {
      const res = await fetch(`/api/tmdb/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      setResults(data.results || []);
    } finally {
      setSearching(false);
    }
  };

  const addMovie = async (movie: TmdbMovie) => {
    setLoading(true);
    try {
      await fetch("/api/movies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tmdbId: movie.id.toString(),
          title: movie.title,
          watchedYear: currentYear,
          coverUrl: movie.poster_path
            ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
            : null,
          overview: movie.overview,
        }),
      });
      setResults([]);
      setQuery("");
      onMovieAdded();
    } finally {
      setLoading(false);
    }
  };

  const runBulkAdd = async () => {
    const watchedYear = bulkYear ?? currentYear;

    const lines = bulkText
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    if (lines.length === 0) return;

    setBulkRunning(true);
    setBulkProgress([]);

    for (const line of lines) {
      const yearMatch = line.match(/\s(\d{4})$/);
      const tmdbYear = yearMatch?.[1] ? parseInt(yearMatch[1]) : null;
      const title = yearMatch
        ? line.slice(0, line.lastIndexOf(yearMatch[0])).trim()
        : line.trim();

      setBulkProgress((prev) => [...prev, `🔍 Searching: ${line}`]);

      try {
        const res = await fetch(`/api/tmdb/search?q=${encodeURIComponent(title)}`);
        const data = await res.json();
        let results = data.results || [];

        if (tmdbYear) {
          const filtered = results.filter((m: any) =>
            m.release_date?.startsWith(tmdbYear.toString())
          );
          if (filtered.length > 0) results = filtered;
        }

        const top = results[0];

        if (!top) {
          setBulkProgress((prev) => [...prev, `❌ Not found: ${line}`]);
          continue;
        }

        await fetch("/api/movies", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tmdbId: top.id.toString(),
            title: top.title,
            watchedYear,
            coverUrl: top.poster_path
              ? `https://image.tmdb.org/t/p/w500${top.poster_path}`
              : null,
            overview: top.overview,
          }),
        });

        setBulkProgress((prev) => [
          ...prev,
          `✅ Added: ${top.title} (${top.release_date?.split("-")[0]}) → ${watchedYear}`,
        ]);
      } catch {
        setBulkProgress((prev) => [...prev, `❌ Error adding: ${line}`]);
      }
    }

    setBulkRunning(false);
    setBulkText("");
    onMovieAdded();
  };

  return (
    <div className="bg-gray-900 rounded-xl p-6 mb-8">
      <div className="flex gap-4 mb-4">
        <button
          onClick={() => setMode("search")}
          className={`px-4 py-2 rounded-lg font-medium ${mode === "search" ? "bg-blue-600" : "bg-gray-700 hover:bg-gray-600"}`}
        >
          Search & Add
        </button>
        <button
          onClick={() => setMode("bulk")}
          className={`px-4 py-2 rounded-lg font-medium ${mode === "bulk" ? "bg-blue-600" : "bg-gray-700 hover:bg-gray-600"}`}
        >
          Bulk Add from List
        </button>
      </div>

      {mode === "search" && (
        <>
          <div className="flex gap-3 mb-4">
            <input
              type="text"
              value={query}
              maxLength={128}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && searchMovies()}
              placeholder="Search for a movie..."
              className="flex-1 bg-gray-800 rounded-lg px-4 py-2 text-white placeholder-gray-500 outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={searchMovies}
              disabled={searching}
              className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg font-medium disabled:opacity-50"
            >
              {searching ? "Searching..." : "Search"}
            </button>
          </div>
          {results.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              {results.slice(0, 8).map((movie) => (
                <div
                  key={movie.id}
                  onClick={() => addMovie(movie)}
                  className="cursor-pointer bg-gray-800 rounded-lg overflow-hidden hover:ring-2 hover:ring-blue-500 transition"
                >
                  {movie.poster_path ? (
                    <img
                      src={`https://image.tmdb.org/t/p/w200${movie.poster_path}`}
                      alt={movie.title}
                      className="w-full"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gray-700 flex items-center justify-center text-gray-500 text-sm p-2 text-center">
                      {movie.title}
                    </div>
                  )}
                  <div className="p-2">
                    <p className="text-sm font-medium truncate">{movie.title}</p>
                    <p className="text-xs text-gray-400">{movie.release_date?.split("-")[0]}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
          {loading && <p className="text-blue-400 mt-4">Adding movie...</p>}
        </>
      )}

      {mode === "bulk" && (
        <>
          <p className="text-gray-400 text-sm mb-3">
            Paste your movie list below — one movie per line. Optionally add a year after the title (e.g. "Batman 1989") to pick the right version. The watched year is set by the dropdown below.
          </p>
          <div className="flex items-center gap-3 mb-4">
            <label className="text-gray-400 text-sm">Year Watched:</label>
            <select
              value={bulkYear ?? ""}
              onChange={(e) => setBulkYear(e.target.value ? parseInt(e.target.value) : null)}
              className="bg-gray-800 text-white px-4 py-2 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Defaults to current year ({currentYear})</option>
              {Array.from({ length: currentYear - 2022 }, (_, i) => currentYear - i).map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
            {bulkYear && (
              <span className="text-blue-400 text-sm">Adding to {bulkYear}</span>
            )}
          </div>
          <textarea
            value={bulkText}
            onChange={(e) => setBulkText(e.target.value)}
            placeholder={"Guyver\nBatman 1989\nThe Dark Knight\nInception 2010"}
            rows={10}
            className="w-full bg-gray-800 rounded-lg px-4 py-2 text-white placeholder-gray-500 outline-none focus:ring-2 focus:ring-blue-500 mb-4"
          />
          <button
            onClick={runBulkAdd}
            disabled={bulkRunning || !bulkText.trim()}
            className="bg-green-600 hover:bg-green-700 px-6 py-2 rounded-lg font-medium disabled:opacity-50"
          >
            {bulkRunning ? "Adding movies..." : `Add All Movies${bulkYear ? ` to ${bulkYear}` : ` to ${currentYear}`}`}
          </button>
          {bulkProgress.length > 0 && (
            <div className="mt-4 bg-gray-800 rounded-lg p-4 max-h-48 overflow-y-auto">
              {bulkProgress.map((msg, i) => (
                <p key={i} className="text-sm py-0.5">{msg}</p>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}