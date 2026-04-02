"use client";
import React, { useState } from "react";
import AddMovieForm from "./AddMovieForm";
import MovieStampGrid from "./MovieStampGrid";

export default function MovieDashboard() {
  const [refreshKey, setRefreshKey] = useState(0);
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState<number | null>(null);

  const years = Array.from({ length: 10 }, (_, i) => currentYear - i);

  return (
    <div>
      <AddMovieForm onMovieAdded={() => setRefreshKey((k) => k + 1)} />
      <div className="flex items-center gap-4 mb-6">
        <h2 className="text-2xl font-bold">
          {selectedYear ? `${selectedYear} Movies` : "All Movies"}
        </h2>
        <select
          value={selectedYear ?? ""}
          onChange={(e) =>
            setSelectedYear(e.target.value ? parseInt(e.target.value) : null)
          }
          className="bg-gray-800 text-white px-4 py-2 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Years</option>
          {years.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>
      <MovieStampGrid
        key={`${refreshKey}-${selectedYear}`}
        year={selectedYear}
        onMoviesDeleted={() => setRefreshKey((k) => k + 1)}
      />
    </div>
  );
}
