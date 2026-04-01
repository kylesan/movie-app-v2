"use client";
import React, { useEffect, useState } from "react";

interface Movie {
  id: string;
  title: string;
  watchedYear: number;
  coverUrl: string | null;
  addedBy: string | null;
}

export default function MovieStampGrid({ year }: { year: number }) {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMovies = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/movies?year=${year}`);
      const data = await res.json();
      setMovies(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovies();
  }, [year]);

  if (loading) return <p className="text-gray-400">Loading movies...</p>;

  if (movies.length === 0) {
    return <p className="text-gray-500 text-center py-12">No movies logged for {year} yet!</p>;
  }

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
      {movies.map((movie) => (
        <div
          key={movie.id}
          className="flex flex-col items-center bg-white text-black rounded p-1 shadow-md border-4 border-gray-200"
          style={{ fontFamily: "serif" }}
        >
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
      ))}
    </div>
  );
}