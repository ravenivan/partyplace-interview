"use client"

import { useState } from "react";

interface Venue {
  id: number;
  name: string;
  location: string;
  minBudget: number | null;
  maxGuestCount: number | null;
  occasions: string[];
  availableDays: string[];
  openTimes: string[];
}

interface SearchResult {
  valid: boolean;
  filters?: Record<string, string | number>;
  results?: Venue[];
  error?: string;
  suggestion?: string;
}

const EXAMPLE_PROMPTS = [
  "Birthday in Brooklyn, ~50 guests, Saturday",
  "Corporate dinner, Manhattan, evening",
  "Small wedding reception, outdoor, spring",
];

export default function Home() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emptyError, setEmptyError] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) {
      setEmptyError(true);
      return;
    }
    setEmptyError(false);
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('http://localhost:4000/venues/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });
      const data = await res.json();
      setResult(data);
    } catch (e) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-full flex flex-col font-sans">
      <div className="flex-1 flex flex-col items-center px-4 pt-14 pb-16 sm:pt-20 sm:pb-24">
        <div className="w-full max-w-2xl">
          <header className="text-center mb-10 sm:mb-12">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-gray-500 mb-3">
              PartyPlace
            </p>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-3">
              Find a venue
            </h1>
            <p className="text-gray-500 text-sm sm:text-base max-w-md mx-auto leading-relaxed">
              Describe your event in plain English. We match the details you care
              about—location, headcount, date, vibe.
            </p>
          </header>

          {/* Search bar */}
          <div className="rounded-2xl border border-gray-200 bg-white p-1 shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-stretch sm:gap-0 sm:p-1">
              <label className="sr-only" htmlFor="venue-search">
                Search query
              </label>
              <div className="relative flex-1 flex items-center min-h-[48px]">
                <span
                  className="pointer-events-none absolute left-3.5 text-gray-400"
                  aria-hidden
                >
                  <svg
                    className="size-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                    />
                  </svg>
                </span>
                <input
                  id="venue-search"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50/80 py-3 pl-11 pr-4 text-sm text-foreground placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent dark:border-neutral-700 dark:bg-neutral-900 dark:focus:ring-white sm:border-0 sm:bg-transparent sm:rounded-lg sm:py-2.5 dark:sm:bg-transparent"
                  placeholder="e.g. Birthday party in Brooklyn for 50 people on May 5th"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setEmptyError(false);
                  }}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  autoComplete="off"
                />
              </div>
              <button
                type="button"
                onClick={handleSearch}
                disabled={loading}
                className="shrink-0 rounded-xl bg-black px-6 py-3 text-sm font-medium text-white transition hover:bg-neutral-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 dark:bg-white dark:text-black dark:hover:bg-neutral-200 dark:focus-visible:ring-white dark:focus-visible:ring-offset-neutral-950 sm:rounded-lg sm:my-0.5 sm:mr-0.5 disabled:opacity-50"
              >
                {loading ? 'Searching...' : 'Search'}
              </button>
            </div>
          </div>

          {emptyError && (
            <p className="mt-2 text-xs text-red-500">Please enter a search query.</p>
          )}

          <p className="mt-4 text-center text-xs text-gray-400">
            Try an example below to fill the search box
          </p>

          {/* Example prompts */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            {EXAMPLE_PROMPTS.map((text) => (
              <button
                key={text}
                type="button"
                onClick={() => setQuery(text)}
                className="rounded-full border border-gray-200 bg-white px-3.5 py-1.5 text-xs text-gray-600 transition hover:border-gray-300 hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-black dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:border-neutral-600 dark:hover:bg-neutral-800 dark:focus-visible:ring-white"
              >
                {text}
              </button>
            ))}
          </div>

          {/* Search results */}
          <section
            className="mt-14 sm:mt-16 rounded-2xl border border-dashed border-gray-200 bg-gray-50/50 px-6 py-14 text-center dark:border-neutral-800 dark:bg-neutral-900/30"
            aria-label="Search results"
          >
            {/* Network error */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-left">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            {/* Validation error */}
            {result && !result.valid && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-left">
                <p className="text-red-700 font-medium text-sm">{result.error}</p>
                <p className="text-red-500 text-xs mt-1">💡 {result.suggestion}</p>
              </div>
            )}

            {/* Filter chips */}
            {result?.valid && result.filters && (
              <div className="flex flex-wrap gap-2 mb-6 justify-start">
                {Object.entries(result.filters).map(([key, value]) => (
                  <span key={key} className="bg-black text-white text-xs px-3 py-1 rounded-full">
                    {key}: {value}
                  </span>
                ))}
              </div>
            )}

            {/* Results */}
            {result?.valid && result.results && (
              <div className="space-y-4 text-left">
                <p className="text-sm text-gray-500">
                  {result.results.length} venue{result.results.length !== 1 ? 's' : ''} found
                </p>
                {result.results.length === 0 && (
                  <p className="text-gray-400 text-sm">No venues match your request. Try adjusting your filters.</p>
                )}
                {result.results.map((venue) => (
                  <article
                    key={venue.id}
                    className="group rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-gray-300 hover:shadow-md dark:border-neutral-800 dark:bg-neutral-950 dark:hover:border-neutral-700"
                  >
                    <div className="flex gap-4">
                      <div
                        className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-gray-100 to-gray-50 text-gray-600 ring-1 ring-gray-200/80 dark:from-neutral-800 dark:to-neutral-900 dark:text-neutral-400 dark:ring-neutral-700"
                        aria-hidden
                      >
                        <svg
                          className="size-6"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={1.5}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z"
                          />
                        </svg>
                      </div>
                      <div className="min-w-0 flex-1">
                        <h2 className="font-semibold text-lg leading-snug tracking-tight text-foreground">
                          {venue.name}
                        </h2>
                        <p className="mt-1.5 flex items-start gap-1.5 text-sm text-gray-500 dark:text-neutral-400">
                          <svg
                            className="mt-0.5 size-4 shrink-0 text-gray-400 dark:text-neutral-500"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={1.5}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"
                            />
                          </svg>
                          <span className="leading-snug">{venue.location}</span>
                        </p>
                      </div>
                    </div>

                    <div className="mt-5 flex flex-wrap gap-2 border-t border-gray-100 pt-5 dark:border-neutral-800">
                      {venue.minBudget != null && (
                        <div className="inline-flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2 text-sm dark:bg-neutral-900">
                          <span className="text-gray-400 dark:text-neutral-500" aria-hidden>
                            <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                            </svg>
                          </span>
                          <span className="font-medium text-gray-800 dark:text-neutral-200">
                            From ${venue.minBudget}
                          </span>
                        </div>
                      )}
                      {venue.maxGuestCount != null && (
                        <div className="inline-flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2 text-sm dark:bg-neutral-900">
                          <span className="text-gray-400 dark:text-neutral-500" aria-hidden>
                            <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
                            </svg>
                          </span>
                          <span className="font-medium text-gray-800 dark:text-neutral-200">
                            Up to {venue.maxGuestCount} guests
                          </span>
                        </div>
                      )}
                    </div>

                    {venue.occasions.length > 0 && (
                      <div className="mt-4">
                        <p className="mb-2 text-[11px] font-medium uppercase tracking-wider text-gray-400 dark:text-neutral-500">
                          Occasions
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {venue.occasions.map((o) => (
                            <span
                              key={o}
                              className="inline-flex items-center rounded-full border border-gray-200 bg-gray-50/80 px-2.5 py-1 text-xs font-medium text-gray-700 dark:border-neutral-700 dark:bg-neutral-900/80 dark:text-neutral-300"
                            >
                              {o}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </article>
                ))}
              </div>
            )}

            {/* Empty state */}
            {!result && !error && (
              <div className="mx-auto max-w-xs text-gray-400">
                <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-gray-100 dark:bg-neutral-800">
                  <svg className="size-6 text-gray-400 dark:text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.25}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-gray-500 dark:text-neutral-400">No search yet</p>
                <p className="mt-1 text-xs leading-relaxed text-gray-400 dark:text-neutral-500">
                  Your matching venues will show up here after you search.
                </p>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
