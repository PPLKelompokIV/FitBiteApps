import { useMemo, useState } from "react";
import { HealthAppSidebarSection } from "../FotoAi/HealthAppSidebarSection";
import {
  BodyCheckBanner,
  BodyCheckFooter,
  BodyCheckHeader,
  BodyCheckOverviewSection,
} from "./bodycheckmainnavigation";

type CheckItem = {
  id: number;
  title: string;
  category: string;
  status: "Complete" | "In progress" | "Not started";
  score: number;
  updated: string;
};

const checkItems: CheckItem[] = [
  {
    id: 1,
    title: "Posture assessment",
    category: "Mobility",
    status: "Complete",
    score: 86,
    updated: "Today, 9:42 AM",
  },
  {
    id: 2,
    title: "Shoulder mobility",
    category: "Upper body",
    status: "Complete",
    score: 78,
    updated: "Today, 9:38 AM",
  },
  {
    id: 3,
    title: "Hip alignment",
    category: "Lower body",
    status: "In progress",
    score: 64,
    updated: "Today, 9:31 AM",
  },
  {
    id: 4,
    title: "Balance and stability",
    category: "Movement",
    status: "Not started",
    score: 0,
    updated: "Not yet checked",
  },
];

function Icon({
  size = 20,
}: {
  size?: number;
}): JSX.Element {
  const commonProps = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  return (
    <svg {...commonProps}>
      <circle cx="12" cy="12" r="8" />
    </svg>
  );
}

export const BodyCheckWorkspaceSection = (): JSX.Element => {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All");
  const [showAll, setShowAll] = useState(false);

  const filteredItems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return checkItems
      .filter((item) => filter === "All" || item.status === filter)
      .filter(
        (item) =>
          !normalizedQuery ||
          item.title.toLowerCase().includes(normalizedQuery) ||
          item.category.toLowerCase().includes(normalizedQuery),
      );
  }, [filter, query]);

  const visibleItems = showAll ? filteredItems : filteredItems.slice(0, 4);

  return (
    <main className="flex min-h-screen flex-1 bg-[#f6f7f2] text-[#173d30]">
      <div className="mx-auto flex w-full max-w-[1280px] flex-col px-5 pb-8 pt-4 sm:px-8 lg:px-10">
        <BodyCheckHeader />

        <section className="mt-4 rounded-[28px] border border-[#e5ebe4] bg-[#f8faf7] p-4 shadow-[0_12px_35px_rgba(17,39,31,0.04)] sm:p-6">
          <BodyCheckBanner isSaved={false} />

          <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(300px,0.75fr)]">
            <div className="rounded-2xl border border-[#e5ebe4] bg-white p-5 shadow-xs sm:p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex-1">
                  <label className="mb-2 block text-xs font-bold uppercase tracking-[0.12em] text-[#1a6e4d]">
                    Checklist body check
                  </label>
                  <input
                    type="text"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Cari area tubuh..."
                    className="w-full rounded-xl border border-[#e0e6de] bg-[#fbfdfb] px-3.5 py-2.5 text-sm text-[#183d30] outline-none transition focus:border-[#1a6e4d] focus:ring-1 focus:ring-[#1a6e4d]"
                  />
                </div>

                <div className="flex items-center gap-2">
                  {(["All", "Complete", "In progress", "Not started"] as const).map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setFilter(option)}
                      className={`rounded-lg px-2.5 py-2 text-[11px] font-semibold transition ${
                        filter === option
                          ? "bg-[#eaf3e9] text-[#14533a]"
                          : "bg-[#f3f6f2] text-[#66756d] hover:text-[#183d30]"
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-5 space-y-3">
                {visibleItems.length > 0 ? (
                  visibleItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between gap-4 rounded-2xl border border-[#edf0eb] bg-[#fafcf9] p-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#eaf3e9] text-[#14533a]">
                          <Icon size={18} />
                        </div>

                        <div>
                          <p className="text-sm font-bold text-[#183d30]">{item.title}</p>
                          <p className="text-[11px] text-[#77877e]">{item.category}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="rounded-full bg-[#eef3ed] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-[#466357]">
                          {item.status}
                        </span>
                        <span className="min-w-[46px] text-right text-sm font-bold text-[#183d30]">
                          {item.score}%
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-2xl border border-dashed border-[#d2dbd4] bg-[#fafcf9] p-6 text-center text-sm text-[#698077]">
                    Tidak ada hasil yang cocok dengan pencarian saat ini.
                  </div>
                )}
              </div>

              {filteredItems.length > 4 && (
                <div className="mt-5 flex justify-center">
                  <button
                    type="button"
                    onClick={() => setShowAll((current) => !current)}
                    className="rounded-xl border border-[#dfe8df] bg-[#f5f8f4] px-4 py-2 text-xs font-semibold text-[#14533a] transition hover:bg-[#ebf5ee]"
                  >
                    {showAll ? "Tampilkan lebih sedikit" : "Lihat semua"}
                  </button>
                </div>
              )}
            </div>

            <BodyCheckOverviewSection />
          </div>

          <BodyCheckFooter />
        </section>
      </div>
    </main>
  );
};

export const BodyCheckPagi = (): JSX.Element => {
  return (
    <div className="relative flex min-h-screen items-start bg-[#f6f7f2]">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-10 focus:rounded-md focus:bg-[#173f35] focus:px-3 focus:py-2 focus:text-sm focus:text-white"
      >
        Skip to content
      </a>
      <HealthAppSidebarSection />
      <BodyCheckWorkspaceSection />
    </div>
  );
};

export default BodyCheckPagi;