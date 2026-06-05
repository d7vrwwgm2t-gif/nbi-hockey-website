"use client";

import { useState } from "react";

const ADMIN_PASSWORD = "X7StaSA#54";

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [error, setError] = useState("");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (password === ADMIN_PASSWORD) {
      setIsUnlocked(true);
      setError("");
      return;
    }

    setError("Incorrect password.");
  }

  if (!isUnlocked) {
    return (
      <main className="min-h-screen text-white">
        <div className="mx-auto flex min-h-screen max-w-md items-center px-6 py-24">
          <section className="w-full rounded-xl border border-white/10 bg-[#0D1B2A]/95 p-8">
            <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-[#FFD54A]">
              Admin Access
            </p>

            <h1 className="mb-4 text-3xl font-bold">
              NBI Hockey Admin
            </h1>

            <p className="mb-6 text-sm text-gray-400">
              Enter the admin password to access internal site tools.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-semibold text-gray-300"
                >
                  Password
                </label>

                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-[#07111F] px-4 py-3 text-white outline-none transition focus:border-[#4DB5FF]"
                  placeholder="Enter password"
                />
              </div>

              {error && (
                <p className="text-sm text-red-400">
                  {error}
                </p>
              )}

              <button
                type="submit"
                className="w-full rounded-lg bg-[#4DB5FF] px-4 py-3 font-semibold text-[#07111F] transition hover:bg-[#FFD54A]"
              >
                Enter Admin
              </button>
            </form>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen text-white">
      <div className="mx-auto max-w-6xl px-6 py-24">
        <section className="mb-12">
          <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-[#FFD54A]">
            Internal Tools
          </p>

          <h1 className="mb-6 text-5xl font-bold md:text-7xl">
            NBI Hockey Admin
          </h1>

          <p className="max-w-3xl text-xl text-gray-300">
            Internal workspace for research management, model uploads,
            season management, and future website administration.
          </p>
        </section>

        <div className="grid gap-8 md:grid-cols-2">
          {/* Research Manager */}
          <section className="rounded-xl border border-[#4DB5FF]/20 bg-[#0D1B2A]/95 p-8">
            <h2 className="mb-4 text-3xl font-bold">
              Research Manager
            </h2>

            <p className="mb-6 text-gray-300">
              Manage research papers and article sources through the connected
              Google Sheet.
            </p>

            <a
              href="https://docs.google.com/spreadsheets/d/1YMeIyVJXZF14OIc2kx61TVmGmSkRXBsE2DvqYH2NMHA/edit?usp=sharing"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex rounded-lg border border-[#4DB5FF]/40 px-4 py-2 text-sm font-semibold text-[#4DB5FF] transition hover:border-[#FFD54A] hover:text-[#FFD54A]"
            >
              Open Research Sheet →
            </a>
          </section>

          {/* Model Manager */}
          <section className="rounded-xl border border-[#4DB5FF]/20 bg-[#0D1B2A]/95 p-8">
            <h2 className="mb-4 text-3xl font-bold">
              Hockey Model Manager
            </h2>

            <p className="mb-6 text-gray-300">
              Upload season spreadsheets, manage season labels, shift seasons
              forward, and rebuild public player grades.
            </p>

            <a
              href="/admin/model-upload"
              className="inline-flex rounded-lg bg-[#4DB5FF] px-4 py-2 text-sm font-semibold text-[#07111F] transition hover:bg-[#FFD54A]"
            >
              Open Model Upload →
            </a>
          </section>
        </div>
      </div>
    </main>
  );
}