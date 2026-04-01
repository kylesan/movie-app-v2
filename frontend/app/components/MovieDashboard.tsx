"use client";
import React, { useState } from "react";
import AddMovieForm from "./AddMovieForm";
import MovieStampGrid from "./MovieStampGrid";

export default function MovieDashboard() {
  const [refreshKey, setRefreshKey] = useState(0);
  const currentYear = new Date().getFullYear();

  return (
    <div>
      <AddMovieForm onMovieAdded={() => setRefreshKey(k => k + 1)} />
      <h2 className="text-2xl font-bold mb-6">{currentYear} Movies</h2>
      <MovieStampGrid key={refreshKey} year={currentYear} />
    </div>
  );
}