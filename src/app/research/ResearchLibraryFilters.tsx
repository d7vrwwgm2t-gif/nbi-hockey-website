"use client";

import { useMemo, useState } from "react";
import type { SheetResearchItem } from "@/lib/googleSheets";

type Props = {
  items: SheetResearchItem[];
};

function getUniqueValues(items: SheetResearchItem[], key: keyof SheetResearchItem) {
  return Array.from(
    new Set(items.map((item) => item[key]).filter(Boolean))
  ).sort();
}

export default function ResearchLibraryFilters({ items }: Props) {
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [yearFilter, setYearFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");

  const categories = useMemo(() => getUniqueValues(items, "category"), [items]);
  const years = useMemo(() => getUniqueValues(items, "year"), [items]);
  const types = useMemo(() => getUniqueValues(items, "type"), [items]);

  const filteredItems = items.filter((item) => {
    const matchesCategory =
      categoryFilter === "All" || item.category === categoryFilter;

    const matchesYear = yearFilter === "All" || item.year === yearFilter;

    const matchesType = typeFilter === "All" || item.type === typeFilter;

    return matchesCategory && matchesYear && matchesType;
  });

  function resetFilters() {
    setCategoryFilter("All");
    setYearFilter("All");
    setTypeFilter("All");
  }

  return (
    <section className="rounded-xl border border-[#4DB5FF]/20 bg-[#0D1B2A]/95 p-8">
      <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-[#FFD54A]">
        Research Library
      </p>

      <h2 className="mb-6 text-3xl font-bold">
        Favourite hockey analytics resources
      </h2>

      <p className="mb-8 max-w-3xl text-gray-300">
        A curated collection of public hockey analytics research, PDFs,
        articles, methodology posts, and useful resources from other analysts,
        writers, and researchers.
      </p>

      {items.length > 0 ? (
        <>
          <div className="mb-8 grid gap-4 md:grid-cols-[1fr_1fr_1fr_auto]">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-gray-300">
                Category
              </span>

              <select
                value={categoryFilter}
                onChange={(event) => setCategoryFilter(event.target.value)}
                className="w-full rounded-lg border border-white/10 bg-[#07111F] px-4 py-3 text-sm text-white outline-none transition focus:border-[#4DB5FF]"
              >
                <option value="All">All Categories</option>

                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-gray-300">
                Year
              </span>

              <select
                value={yearFilter}
                onChange={(event) => setYearFilter(event.target.value)}
                className="w-full rounded-lg border border-white/10 bg-[#07111F] px-4 py-3 text-sm text-white outline-none transition focus:border-[#4DB5FF]"
              >
                <option value="All">All Years</option>

                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-gray-300">
                Type
              </span>

              <select
                value={typeFilter}
                onChange={(event) => setTypeFilter(event.target.value)}
                className="w-full rounded-lg border border-white/10 bg-[#07111F] px-4 py-3 text-sm text-white outline-none transition focus:border-[#4DB5FF]"
              >
                <option value="All">All Types</option>

                {types.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </label>

            <button
              type="button"
              onClick={resetFilters}
              className="self-end rounded-lg border border-[#4DB5FF]/40 px-4 py-3 text-sm font-semibold text-[#4DB5FF] transition hover:border-[#FFD54A] hover:text-[#FFD54A]"
            >
              Reset
            </button>
          </div>

          <div className="mb-5 text-sm text-gray-400">
            Showing {filteredItems.length} of {items.length} resources.
          </div>

          {filteredItems.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-3">
              {filteredItems.map((item) => (
                <a
                  key={`${item.title}-${item.url}`}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-xl border border-white/10 p-6 transition hover:border-[#4DB5FF]/50 hover:bg-[#10243A]"
                >
                  <div className="mb-4 flex flex-wrap gap-2">
                    <span className="rounded-full border border-[#FFD54A]/30 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-[#FFD54A]">
                      {item.type}
                    </span>

                    <span className="rounded-full border border-[#4DB5FF]/30 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-[#4DB5FF]">
                      {item.category}
                    </span>

                    <span className="rounded-full border border-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-gray-400">
                      {item.year}
                    </span>
                  </div>

                  <h3 className="mb-3 text-xl font-bold">{item.title}</h3>

                  <p className="mb-5 text-sm text-[#4DB5FF]">{item.author}</p>

                  <p className="text-sm font-semibold text-[#4DB5FF]">
                    Open Resource →
                  </p>
                </a>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-white/10 p-6">
              <p className="text-gray-400">
                No research resources match those filters.
              </p>
            </div>
          )}
        </>
      ) : (
        <p className="text-gray-400">
          External research links will appear here once added.
        </p>
      )}
    </section>
  );
}
