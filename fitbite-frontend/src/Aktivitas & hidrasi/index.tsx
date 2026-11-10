import { useMemo, useState, type ReactElement } from "react";
import { HealthAppSidebarSection } from "../FotoAi/HealthAppSidebarSection";

type IconName =
  | "activity"
  | "bell"
  | "plus"
  | "chevron"
  | "check"
  | "more";

type HydrationEntry = {
  id: number;
  time: string;
  amount: number;
  type: string;
  completed: boolean;
};

const hydrationEntries: HydrationEntry[] = [
  {
    id: 1,
    time: "08:00",
    amount: 250,
    type: "Water",
    completed: true,
  },
  {
    id: 2,
    time: "10:30",
    amount: 350,
    type: "Water",
    completed: true,
  },
  {
    id: 3,
    time: "13:00",
    amount: 250,
    type: "Mineral water",
    completed: true,
  },
  {
    id: 4,
    time: "15:30",
    amount: 350,
    type: "Water",
    completed: false,
  },
  {
    id: 5,
    time: "18:00",
    amount: 250,
    type: "Water",
    completed: false,
  },
];

const iconPaths: Record<IconName, ReactElement> = {
  activity: <path d="M3 12h4l2.2-6 4.1 12 2.2-6H21" />,
  bell: (
    <>
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" />
    </>
  ),
  plus: <path d="M12 5v14M5 12h14" />,
  chevron: <path d="m9 18 6-6-6-6" />,
  check: <path d="m5 12 4 4L19 6" />,
  more: <path d="M5 12h.01M12 12h.01M19 12h.01" />,
};

function Icon({
  name,
  size = 20,
  strokeWidth = 1.8,
}: {
  name: IconName;
  size?: number;
  strokeWidth?: number;
}) {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height={size}
      viewBox="0 0 24 24"
      width={size}
      xmlns="http://www.w3.org/2000/svg"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={strokeWidth}
    >
      {iconPaths[name]}
    </svg>
  );
}

function HydrationProgress({
  completedAmount,
  goal,
}: {
  completedAmount: number;
  goal: number;
}) {
  const percentage = Math.min(Math.round((completedAmount / goal) * 100), 100);
  const radius = 84;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative flex h-[210px] w-[210px] items-center justify-center">
      <svg
        aria-label={`${percentage}% of hydration goal completed`}
        className="-rotate-90"
        height="210"
        role="img"
        viewBox="0 0 210 210"
        width="210"
      >
        <circle
          cx="105"
          cy="105"
          fill="none"
          r={radius}
          stroke="#e8eee2"
          strokeWidth="14"
        />
        <circle
          cx="105"
          cy="105"
          fill="none"
          r={radius}
          stroke="#b8d85e"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          strokeWidth="14"
        />
      </svg>
      <div className="absolute flex flex-col items-center text-center">
        <span className="text-4xl font-semibold tracking-[-0.04em] text-[#26352f]">
          {completedAmount}
        </span>
        <span className="mt-1 text-xs text-[#87928b]">of {goal} ml</span>
        <span className="mt-3 rounded-full bg-[#eef5df] px-3 py-1 text-[11px] font-semibold text-[#607d32]">
          {percentage}% complete
        </span>
      </div>
    </div>
  );
}

function ActivityHydrationWorkspaceSection() {
  const [entries, setEntries] = useState(hydrationEntries);
  const [selectedDay, setSelectedDay] = useState("Today");
  const [showAll, setShowAll] = useState(false);

  const completedAmount = useMemo(
    () =>
      entries
        .filter((entry) => entry.completed)
        .reduce((total, entry) => total + entry.amount, 0),
    [entries],
  );

  const toggleEntry = (id: number) => {
    setEntries((currentEntries) =>
      currentEntries.map((entry) =>
        entry.id === id ? { ...entry, completed: !entry.completed } : entry,
      ),
    );
  };

  const visibleEntries = showAll ? entries : entries.slice(0, 4);

  return (
    <main
      className="min-h-screen min-w-0 flex-1 bg-[#f6f7f2]"
      data-id="activity-hydration-workspace-section"
      id="main-content"
    >
      <header className="flex items-center justify-between border-b border-[#e6e9e1] bg-[#fbfcf8] px-6 py-5 sm:px-10">
        <div>
          <p className="text-xs font-medium text-[#8c958d]">
            Tuesday, June 18, 2024
          </p>
          <h1 className="mt-1 text-xl font-semibold tracking-[-0.02em] text-[#26352f]">
            Activity
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            aria-label="Notifications"
            className="relative rounded-full p-2 text-[#758079] transition-colors hover:bg-[#edf1e9] hover:text-[#26352f]"
            type="button"
          >
            <Icon name="bell" size={21} />
            <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-[#d2ed69]" />
          </button>
          <div className="hidden h-8 w-px bg-[#e2e7de] sm:block" />
          <span className="hidden text-sm font-medium text-[#45554c] sm:block">
            Alya Morgan
          </span>
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#d9e7c4] text-xs font-semibold text-[#354b3e]">
            AM
          </span>
        </div>
      </header>
      <div className="mx-auto max-w-[1180px] px-6 py-8 sm:px-10 lg:px-14">
        <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="mb-2 text-sm font-medium text-[#799044]">
              Daily wellness
            </p>
            <h2 className="text-3xl font-semibold tracking-[-0.04em] text-[#26352f]">
              Hydration
            </h2>
            <p className="mt-2 max-w-md text-sm leading-6 text-[#87928b]">
              Keep your body energized and focused by reaching your daily water
              goal.
            </p>
          </div>
          <div
            className="flex rounded-xl bg-[#e9ede5] p-1"
            role="tablist"
            aria-label="Activity period"
          >
            {["Today", "This week", "This month"].map((period) => (
              <button
                aria-selected={selectedDay === period}
                className={`rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                  selectedDay === period
                    ? "bg-white text-[#34483c] shadow-sm"
                    : "text-[#8a958d] hover:text-[#34483c]"
                }`}
                key={period}
                onClick={() => setSelectedDay(period)}
                role="tab"
                type="button"
              >
                {period}
              </button>
            ))}
          </div>
        </div>
        <section className="grid gap-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
          <article className="rounded-2xl border border-[#e6eadf] bg-white p-6 sm:p-8">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-base font-semibold text-[#35483d]">
                  Today&apos;s progress
                </h3>
                <p className="mt-1 text-xs text-[#9aa39b]">
                  Your hydration goal resets at midnight
                </p>
              </div>
              <button
                aria-label="More progress options"
                className="rounded-lg p-1.5 text-[#9aa39b] hover:bg-[#f2f5ee] hover:text-[#35483d]"
                type="button"
              >
                <Icon name="more" size={20} />
              </button>
            </div>
            <div className="mt-8 flex flex-col items-center justify-center">
              <HydrationProgress
                completedAmount={completedAmount}
                goal={2000}
              />
              <p className="mt-5 text-center text-sm text-[#728078]">
                {2000 - completedAmount > 0
                  ? `${2000 - completedAmount} ml left to reach your goal`
                  : "You reached your daily goal"}
              </p>
            </div>
            <div className="mt-8 grid grid-cols-3 divide-x divide-[#edf0ea] border-t border-[#edf0ea] pt-5 text-center">
              <div>
                <p className="text-lg font-semibold text-[#35483d]">
                  {entries.length}
                </p>
                <p className="mt-1 text-[11px] text-[#9aa39b]">Entries</p>
              </div>
              <div>
                <p className="text-lg font-semibold text-[#35483d]">2.0 L</p>
                <p className="mt-1 text-[11px] text-[#9aa39b]">Daily goal</p>
              </div>
              <div>
                <p className="text-lg font-semibold text-[#35483d]">7 days</p>
                <p className="mt-1 text-[11px] text-[#9aa39b]">Best streak</p>
              </div>
            </div>
          </article>
          <article className="rounded-2xl border border-[#e6eadf] bg-white p-6 sm:p-8">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-base font-semibold text-[#35483d]">
                  Water intake
                </h3>
                <p className="mt-1 text-xs text-[#9aa39b]">
                  Scheduled for today
                </p>
              </div>
              <button
                aria-label="Add water intake"
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#e7f0d4] text-[#668034] transition-colors hover:bg-[#dce9c4]"
                onClick={() =>
                  setEntries((currentEntries) => [
                    ...currentEntries,
                    {
                      id: Date.now(),
                      time: "Now",
                      amount: 250,
                      type: "Water",
                      completed: true,
                    },
                  ])
                }
                type="button"
              >
                <Icon name="plus" size={18} />
              </button>
            </div>
            <div className="mt-6 space-y-2">
              {visibleEntries.map((entry) => (
                <div
                  className="flex items-center gap-3 rounded-xl px-2 py-3 transition-colors hover:bg-[#f8faf5]"
                  key={entry.id}
                >
                  <button
                    aria-label={`${entry.completed ? "Mark" : "Mark"} ${entry.time} intake as ${
                      entry.completed ? "incomplete" : "complete"
                    }`}
                    aria-pressed={entry.completed}
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                      entry.completed
                        ? "bg-[#dff0a7] text-[#607d32]"
                        : "border border-dashed border-[#cbd5c5] text-transparent"
                    }`}
                    onClick={() => toggleEntry(entry.id)}
                    type="button"
                  >
                    <Icon name="check" size={16} strokeWidth={2.4} />
                  </button>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-[#425249]">
                      {entry.time}
                    </p>
                    <p className="truncate text-[11px] text-[#a0a9a1]">
                      {entry.type}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-[#53665a]">
                    {entry.amount} ml
                  </span>
                </div>
              ))}
            </div>
            <button
              className="mt-5 flex w-full items-center justify-center gap-1 rounded-xl border border-[#e7ebe3] py-3 text-xs font-semibold text-[#74836f] transition-colors hover:bg-[#f6f8f2]"
              onClick={() => setShowAll((current) => !current)}
              type="button"
            >
              {showAll ? "Show less" : "View full schedule"}
              <Icon name="chevron" size={14} />
            </button>
          </article>
        </section>
        <section className="mt-5 grid gap-5 md:grid-cols-2">
          <article className="rounded-2xl border border-[#e6eadf] bg-[#e5eed5] p-6">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/70 text-[#78923c]">
                <Icon name="activity" size={21} />
              </span>
              <div>
                <h3 className="text-sm font-semibold text-[#3d513b]">
                  Great consistency!
                </h3>
                <p className="mt-1 text-xs text-[#72856e]">
                  You&apos;ve logged water for 7 days in a row.
                </p>
              </div>
            </div>
          </article>
          <article className="flex items-center justify-between rounded-2xl border border-[#e6eadf] bg-white p-6">
            <div>
              <p className="text-xs text-[#9aa39b]">Next reminder</p>
              <p className="mt-1 text-lg font-semibold text-[#35483d]">
                15:30 · 350 ml
              </p>
            </div>
            <span className="rounded-full bg-[#f1f5e9] px-3 py-1.5 text-[11px] font-semibold text-[#718848]">
              In 45 min
            </span>
          </article>
        </section>
      </div>
    </main>
  );
}

export const AktivitasHidrasi = (): ReactElement => {
  return (
    <div className="flex min-h-screen items-start bg-[#f6f7f2] text-[#26352f]">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-10 focus:rounded-md focus:bg-[#173f35] focus:px-3 focus:py-2 focus:text-sm focus:text-white"
      >
        Skip to content
      </a>
      <HealthAppSidebarSection />
      <ActivityHydrationWorkspaceSection />
    </div>
  );
};

export default AktivitasHidrasi;
