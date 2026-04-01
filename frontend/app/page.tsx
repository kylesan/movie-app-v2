import React from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import MovieDashboard from "./components/MovieDashboard";

export default async function Home() {
  const cookieStore = await cookies();
  const userCookie = cookieStore.get("user");

  if (!userCookie) {
    redirect("/auth/login");
  }

  const user = JSON.parse(userCookie.value);

  return (
    <main className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">🎬 Movie Watch Log</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-400">Welcome, {user?.name}!</span>
            <a href="/auth/logout" className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-sm">Logout</a>
          </div>
        </div>
        <MovieDashboard />
      </div>
    </main>
  );
}