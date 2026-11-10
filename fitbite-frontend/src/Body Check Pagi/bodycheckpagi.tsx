import { useMemo, useState } from "react";
import { HealthAppSidebarSection } from "../FotoAi/HealthAppSidebarSection";

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

                {/* Right Overview & Insights */}
                <BodyCheckOverviewSection />
              </div>
            </div>
          </main>
        </div>

        {/* Page Footer */}
        <div className="px-9">
          <BodyCheckFooter />
        </div>
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