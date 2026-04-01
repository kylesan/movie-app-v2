import React from "react";
import { auth0 } from "./lib/auth0";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await auth0.getSession();

  if (!session) {
    redirect("/auth/login");
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">🎬 Movie Watch Log</h1>
          <a href="/auth/logout" className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-sm">
            Logout
          </a>
        </div>
        <p className="text-gray-400">Welcome, {session?.user?.name}!</p>
      </div>
    </main>
  );
}