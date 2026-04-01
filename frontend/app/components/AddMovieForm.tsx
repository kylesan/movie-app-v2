"use client";
import React, { useState } from "react";

interface TmdbMovie {
  id: number;
  title: string;
  release_date: string;
  poster_path: string | null;
  overview: string;
}

export default function AddMovieForm({ onMovieAdded }: { onMovieAdded: () => void }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<TmdbMovie[]>([]);
  const [watchedYear, setWatchedYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);

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
          watchedYear,
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

  return (
    <div className="bg-gray-900 rounded-xl p-6 mb-8">
      <h2 className="text-xl font-bold mb-4">Add a Movie</h2>
      <div className="flex gap-3 mb-4">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && searchMovies()}
          placeholder="Search for a movie..."
          className="flex-1 bg-gray-800 rounded-lg px-4 py-2 text-white placeholder-gray-500 outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="number"
          value={watchedYear}
          onChange={(e) => setWatchedYear(parseInt(e.target.value))}
          className="w-24 bg-gray-800 rounded-lg px-4 py-2 text-white outline-none focus:ring-2 focus:ring-blue-500"
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
    </div>
  );
}