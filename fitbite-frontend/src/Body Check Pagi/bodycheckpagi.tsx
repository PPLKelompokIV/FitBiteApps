import { useMemo, useState } from "react";

type NavigationItem = {
  label: string;
  icon: string;
};

type CheckItem = {
  id: number;
  title: string;
  category: string;
  status: "Complete" | "In progress" | "Not started";
  score: number;
  updated: string;
};

const navigationItems: NavigationItem[] = [
  { label: "Overview", icon: "grid" },
  { label: "Body Check", icon: "body" },
  { label: "Progress", icon: "chart" },
  { label: "Appointments", icon: "calendar" },
];

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
  name,
  size = 20,
}: {
  name: string;
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

  if (name === "grid") {
    return (
      <svg {...commonProps}>
        <rect x="4" y="4" width="6" height="6" rx="1" />
        <rect x="14" y="4" width="6" height="6" rx="1" />
        <rect x="4" y="14" width="6" height="6" rx="1" />
        <rect x="14" y="14" width="6" height="6" rx="1" />
      </svg>
    );
  }

  if (name === "body") {
    return (
      <svg {...commonProps}>
        <circle cx="12" cy="5" r="2.4" />
        <path d="M9.5 9.5 12 8l2.5 1.5" />
        <path d="M9.5 9.5 8 15l3 1.5V21" />
        <path d="M14.5 9.5 16 15l-3 1.5V21" />
        <path d="m8 12-3 2M16 12l3 2" />
      </svg>
    );
  }

  if (name === "chart") {
    return (
      <svg {...commonProps}>
        <path d="M4 19V5" />
        <path d="M4 19h16" />
        <path d="m7 15 3-4 3 2 5-7" />
        <path d="M18 6h-3M18 6v3" />
      </svg>
    );
  }

  if (name === "calendar") {
    return (
      <svg {...commonProps}>
        <rect x="4" y="5" width="16" height="15" rx="2" />
        <path d="M8 3v4M16 3v4M4 10h16" />
        <path d="M8 14h.01M12 14h.01M16 14h.01M8 17h.01M12 17h.01" />
      </svg>
    );
  }

  if (name === "bell") {
    return (
      <svg {...commonProps}>
        <path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
        <path d="M10 21h4" />
      </svg>
    );
  }

  if (name === "search") {
    return (
      <svg {...commonProps}>
        <circle cx="10.8" cy="10.8" r="6.8" />
        <path d="m16 16 4 4" />
      </svg>
    );
  }

  if (name === "arrow") {
    return (
      <svg {...commonProps}>
        <path d="M5 12h14M13 6l6 6-6 6" />
      </svg>
    );
  }

  if (name === "more") {
    return (
      <svg {...commonProps}>
        <circle cx="5" cy="12" r="1" fill="currentColor" />
        <circle cx="12" cy="12" r="1" fill="currentColor" />
        <circle cx="19" cy="12" r="1" fill="currentColor" />
      </svg>
    );
  }

  if (name === "check") {
    return (
      <svg {...commonProps}>
        <path d="m5 12 4 4L19 6" />
      </svg>
    );
  }

  return (
    <svg {...commonProps}>
      <circle cx="12" cy="12" r="8" />
    </svg>
  );
}

export const MainNavigationSection = (): JSX.Element => {
  const [activeItem, setActiveItem] = useState("Body Check");

  return (
    <aside
      aria-label="Main navigation"
      className="flex min-h-screen w-[154px] shrink-0 flex-col border-r border-[#e7e9e1] bg-[#fbfcf8] px-4 py-6"
    >
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-10 focus:rounded-md focus:bg-[#173f35] focus:px-3 focus:py-2 focus:text-sm focus:text-white"
      >
        Skip to content
      </a>
      <div className="mb-12 flex items-center justify-center">
        <div className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-[#173f35] text-lg font-semibold text-white">
          a
        </div>
      </div>
      <nav className="flex flex-1 flex-col gap-2">
        {navigationItems.map((item) => {
          const isActive = activeItem === item.label;

          return (
            <button
              key={item.label}
              type="button"
              aria-current={isActive ? "page" : undefined}
              onClick={() => setActiveItem(item.label)}
              className={`group flex flex-col items-center gap-2 rounded-xl px-2 py-3 text-center text-[11px] transition-colors ${
                isActive
                  ? "bg-[#e9f0e8] font-medium text-[#173f35]"
                  : "text-[#78817c] hover:bg-[#f0f3ed] hover:text-[#173f35]"
              }`}
            >
              <Icon name={item.icon} size={21} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
      <div className="mt-auto flex flex-col items-center gap-4">
        <button
          type="button"
          aria-label="Open notifications"
          className="relative rounded-full p-2 text-[#78817c] transition-colors hover:bg-[#eef2ec] hover:text-[#173f35]"
        >
          <Icon name="bell" size={20} />
          <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-[#d97552]" />
        </button>
        <button
          type="button"
          aria-label="Open profile menu"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-[#d8e4d7] text-xs font-semibold text-[#31594d]"
        >
          JD
        </button>
      </div>
    </aside>
  );
};

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
    <main
      id="main-content"
      className="min-h-screen min-w-0 flex-1 bg-[#f6f7f2] px-6 py-6 text-[#173f35] sm:px-10 lg:px-14"
    >
      <div className="mx-auto max-w-[1320px]">
        <header className="flex items-center justify-between gap-4">
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-[0.16em] text-[#87918a]">
              Tuesday, October 24, 2023
            </p>
            <h1 className="text-[28px] font-semibold tracking-[-0.03em] sm:text-[34px]">
              Body Check
            </h1>
          </div>
          <button
            type="button"
            aria-label="Open notifications"
            className="relative rounded-full border border-[#e0e5dd] bg-[#fbfcf8] p-3 text-[#617068] transition-colors hover:border-[#cdd8cc] hover:text-[#173f35]"
          >
            <Icon name="bell" size={20} />
            <span className="absolute right-2.5 top-2.5 h-1.5 w-1.5 rounded-full bg-[#d97552]" />
          </button>
        </header>
        <section
          aria-labelledby="welcome-heading"
          className="mt-8 overflow-hidden rounded-[22px] bg-[#dfead9] px-6 py-7 sm:px-9 sm:py-8"
        >
          <div className="max-w-[680px]">
            <p className="mb-3 text-sm font-medium text-[#567260]">
              Good morning, Jordan
            </p>
            <h2
              id="welcome-heading"
              className="max-w-[520px] text-2xl font-semibold leading-tight tracking-[-0.025em] text-[#173f35] sm:text-[30px]"
            >
              Keep your body moving well.
            </h2>
            <p className="mt-3 max-w-[500px] text-sm leading-6 text-[#60766a]">
              Complete today&apos;s checks to understand how your body is
              feeling and build healthier movement habits.
            </p>
            <button
              type="button"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#173f35] px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-[#28594d] focus:outline-none focus:ring-2 focus:ring-[#173f35] focus:ring-offset-2 focus:ring-offset-[#dfead9]"
            >
              Start body check
              <Icon name="arrow" size={16} />
            </button>
          </div>
        </section>
        <section aria-labelledby="summary-heading" className="mt-8">
          <div className="mb-4 flex items-center justify-between">
            <h2 id="summary-heading" className="text-lg font-semibold">
              Your overview
            </h2>
            <button
              type="button"
              className="text-sm font-medium text-[#6c8174] hover:text-[#173f35]"
            >
              View history
            </button>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <article className="rounded-2xl border border-[#e4e8df] bg-[#fbfcf8] p-5">
              <p className="text-xs font-medium uppercase tracking-[0.12em] text-[#87918a]">
                Overall score
              </p>
              <div className="mt-4 flex items-end gap-2">
                <span className="text-3xl font-semibold">76</span>
                <span className="mb-1 text-sm text-[#7d8c82]">/ 100</span>
              </div>
              <p className="mt-2 text-xs text-[#6c8174]">+8% from last check</p>
            </article>
            <article className="rounded-2xl border border-[#e4e8df] bg-[#fbfcf8] p-5">
              <p className="text-xs font-medium uppercase tracking-[0.12em] text-[#87918a]">
                Checks completed
              </p>
              <div className="mt-4 flex items-end gap-2">
                <span className="text-3xl font-semibold">2</span>
                <span className="mb-1 text-sm text-[#7d8c82]">of 4</span>
              </div>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#e5ebe3]">
                <div className="h-full w-1/2 rounded-full bg-[#6d9979]" />
              </div>
            </article>
            <article className="rounded-2xl border border-[#e4e8df] bg-[#fbfcf8] p-5">
              <p className="text-xs font-medium uppercase tracking-[0.12em] text-[#87918a]">
                Last check
              </p>
              <div className="mt-4 text-3xl font-semibold">Today</div>
              <p className="mt-2 text-xs text-[#6c8174]">9:42 AM</p>
            </article>
          </div>
        </section>
        <section aria-labelledby="checks-heading" className="mt-8 pb-8">
          <div className="mb-4 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <h2 id="checks-heading" className="text-lg font-semibold">
              Today&apos;s checks
            </h2>
            <div className="flex flex-wrap items-center gap-2">
              <label className="relative">
                <span className="sr-only">Search checks</span>
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#87918a]">
                  <Icon name="search" size={16} />
                </span>
                <input
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search"
                  className="h-9 w-[140px] rounded-full border border-[#e0e5dd] bg-[#fbfcf8] pl-9 pr-3 text-xs text-[#173f35] placeholder:text-[#a0aaa3] focus:border-[#8ca996] focus:ring-2 focus:ring-[#dce8dc]"
                />
              </label>
              <label className="sr-only" htmlFor="status-filter">
                Filter checks by status
              </label>
              <select
                id="status-filter"
                value={filter}
                onChange={(event) => setFilter(event.target.value)}
                className="h-9 rounded-full border border-[#e0e5dd] bg-[#fbfcf8] px-3 text-xs text-[#52665a] focus:border-[#8ca996] focus:ring-2 focus:ring-[#dce8dc]"
              >
                <option>All</option>
                <option>Complete</option>
                <option>In progress</option>
                <option>Not started</option>
              </select>
            </div>
          </div>
          <div className="overflow-hidden rounded-2xl border border-[#e4e8df] bg-[#fbfcf8]">
            <div className="hidden grid-cols-[minmax(220px,1.7fr)_1fr_1fr_100px_36px] gap-4 border-b border-[#edf0eb] px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#9aa49d] sm:grid">
              <span>Assessment</span>
              <span>Category</span>
              <span>Status</span>
              <span>Score</span>
              <span />
            </div>
            {visibleItems.length > 0 ? (
              visibleItems.map((item) => (
                <div
                  key={item.id}
                  className="grid items-center gap-3 border-b border-[#edf0eb] px-5 py-4 last:border-0 sm:grid-cols-[minmax(220px,1.7fr)_1fr_1fr_100px_36px] sm:gap-4"
                >
                  <div>
                    <p className="text-sm font-medium text-[#28483d]">
                      {item.title}
                    </p>
                    <p className="mt-1 text-xs text-[#99a39c] sm:hidden">
                      {item.category} · {item.updated}
                    </p>
                  </div>
                  <span className="hidden text-sm text-[#718078] sm:block">
                    {item.category}
                  </span>
                  <span
                    className={`w-fit rounded-full px-2.5 py-1 text-[11px] font-medium ${
                      item.status === "Complete"
                        ? "bg-[#e4f1e5] text-[#4f805d]"
                        : item.status === "In progress"
                          ? "bg-[#f8edd9] text-[#9a7440]"
                          : "bg-[#eef0ed] text-[#849087]"
                    }`}
                  >
                    {item.status}
                  </span>
                  <span className="text-sm font-medium text-[#52665a]">
                    {item.score > 0 ? `${item.score}/100` : "—"}
                  </span>
                  <button
                    type="button"
                    aria-label={`Open ${item.title}`}
                    className="justify-self-end rounded-full p-1 text-[#89958c] hover:bg-[#edf2eb] hover:text-[#173f35]"
                  >
                    <Icon name="more" size={18} />
                  </button>
                </div>
              ))
            ) : (
              <p className="px-5 py-8 text-center text-sm text-[#7d8c82]">
                No checks match your search.
              </p>
            )}

            {filteredItems.length > 4 && (
              <button
                type="button"
                onClick={() => setShowAll((current) => !current)}
                className="flex w-full items-center justify-center gap-2 border-t border-[#edf0eb] py-3 text-xs font-medium text-[#688171] hover:bg-[#f4f7f2] hover:text-[#173f35]"
              >
                {showAll ? "Show fewer checks" : "View all checks"}
                <Icon name="arrow" size={14} />
              </button>
            )}
          </div>
        </section>
      </div>
    </main>
  );
};

export const BodyCheckPagi = (): JSX.Element => {
  return (
    <div className="flex min-h-screen items-start relative bg-[#f6f7f2]">
      <MainNavigationSection />
      <BodyCheckWorkspaceSection />
    </div>
  );
};

export default BodyCheckPagi;
