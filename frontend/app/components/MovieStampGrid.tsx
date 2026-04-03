"use client";
import React, { useEffect, useState } from "react";

interface Movie {
  id: string;
  title: string;
  watchedYear: number;
  coverUrl: string | null;
  addedBy: string | null;
}

export default function MovieStampGrid({ year, onMoviesDeleted }: { year: number | null, onMoviesDeleted?: () => void }) {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [deleting, setDeleting] = useState(false);

  const fetchMovies = async () => {
  setLoading(true);
  try {
    const url = year ? `/api/movies?year=${year}` : `/api/movies/all`;
    const res = await fetch(url);
    const text = await res.text();
    if (!text) {
      setMovies([]);
      return;
    }
    const data = JSON.parse(text);
    setMovies(Array.isArray(data) ? data : []);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetchMovies();
    setSelected(new Set());
  }, [year]);

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const deleteSelected = async () => {
    if (!confirm(`Delete ${selected.size} movie(s)?`)) return;
    setDeleting(true);
    try {
      await fetch("/api/movies/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: Array.from(selected) }),
      });
      setSelected(new Set());
      await fetchMovies();
      onMoviesDeleted?.();
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <p className="text-gray-400">Loading movies...</p>;

  if (movies.length === 0) {
    return <p className="text-gray-500 text-center py-12">No movies logged yet!</p>;
  }

  const toolbar = selected.size > 0 && (
    <div className="flex items-center gap-4 mb-4 p-3 bg-red-900/30 rounded-lg border border-red-700">
      <span className="text-red-300 text-sm">{selected.size} movie(s) selected</span>
      <button
        onClick={deleteSelected}
        disabled={deleting}
        className="bg-red-600 hover:bg-red-700 px-4 py-1.5 rounded text-sm font-medium disabled:opacity-50"
      >
        {deleting ? "Deleting..." : "Delete Selected"}
      </button>
      <button
        onClick={() => setSelected(new Set())}
        className="text-gray-400 hover:text-white text-sm"
      >
        Cancel
      </button>
    </div>
  );

  if (!year) {
    const grouped = movies.reduce((acc, movie) => {
      const y = movie.watchedYear;
      if (!acc[y]) acc[y] = [];
      acc[y].push(movie);
      return acc;
    }, {} as Record<number, Movie[]>);

    const sortedYears = Object.keys(grouped).map(Number).sort((a, b) => b - a);

    return (
      <div>
        {toolbar}
        {sortedYears.map(y => (
          <div key={y} className="mb-10">
            <h3 className="text-xl font-bold mb-4 text-gray-300">{y}</h3>
            <StampGrid movies={grouped[y]} selected={selected} onToggle={toggleSelect} />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div>
      {toolbar}
      <StampGrid movies={movies} selected={selected} onToggle={toggleSelect} />
    </div>
  );
}

function StampGrid({ movies, selected, onToggle }: {
  movies: Movie[];
  selected: Set<string>;
  onToggle: (id: string) => void;
}) {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
      {movies.map((movie) => {
        const isSelected = selected.has(movie.id);
        return (
          <div
            key={movie.id}
            onClick={() => onToggle(movie.id)}
            className={`relative flex flex-col items-center bg-white text-black rounded p-1 shadow-md border-4 cursor-pointer transition ${
              isSelected ? "border-red-500 opacity-75" : "border-gray-200 hover:border-blue-400"
            }`}
            style={{ fontFamily: "serif" }}
          >
            {isSelected && (
              <div className="absolute top-1 right-1 bg-red-500 rounded-full w-5 h-5 flex items-center justify-center text-white text-xs font-bold">
                ✓
              </div>
            )}
            {movie.coverUrl ? (
              <img src={movie.coverUrl} alt={movie.title} className="w-full rounded" />
            ) : (
              <div className="w-full h-24 bg-gray-200 flex items-center justify-center text-gray-500 text-xs text-center p-1">
                {movie.title}
              </div>
            )}
            <p className="text-xs font-bold text-center mt-1 leading-tight line-clamp-2">{movie.title}</p>
            <p className="text-xs text-gray-500">{movie.watchedYear}</p>
          </div>
        );
      })}
    </div>
  );
}