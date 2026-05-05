"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import type { ChaiTestScenario } from "@/lib/chai/chai-test-scenarios";
import {
  CHAI_TEST_SCENARIOS,
  DEFAULT_CHAI_TEST_SCENARIO_ID,
} from "@/lib/chai/chai-test-scenarios";
import { ChaiCoalitionV3ModelCard } from "./ChaiCoalitionV3ModelCard";
import { ChaiHeartModelCard } from "./ChaiHeartModelCard";
import { ChaiRadiologyModelCard } from "./ChaiRadiologyModelCard";
import { ChaiRunAllScenariosModal } from "./ChaiRunAllScenariosModal";
import { ChaiRunScenarioInstancesModal } from "./ChaiRunScenarioInstancesModal";
import { ChaiTriageModelCard } from "./ChaiTriageModelCard";

const SCENARIO_TOTAL = CHAI_TEST_SCENARIOS.length;

function ChevronIcon({ dir }: { dir: "left" | "right" }) {
  return (
    <svg
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden
    >
      {dir === "left" ? (
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
      ) : (
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
      )}
    </svg>
  );
}

export function ChaiRegistryPageContent() {
  const [scenarioId, setScenarioId] = useState(DEFAULT_CHAI_TEST_SCENARIO_ID);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrollEdge, setScrollEdge] = useState({ left: false, right: true });
  const [runAllOpen, setRunAllOpen] = useState(false);
  const [runAllTrigger, setRunAllTrigger] = useState(0);
  const [instancesOpen, setInstancesOpen] = useState(false);
  const [instancesScenario, setInstancesScenario] =
    useState<ChaiTestScenario | null>(null);
  const [instancesTrigger, setInstancesTrigger] = useState(0);

  const openRunAllModal = useCallback(() => {
    setRunAllTrigger((t) => t + 1);
    setRunAllOpen(true);
  }, []);

  const openInstancesModal = useCallback((s: ChaiTestScenario) => {
    setInstancesScenario(s);
    setInstancesTrigger((t) => t + 1);
    setInstancesOpen(true);
  }, []);

  const closeInstancesModal = useCallback(() => {
    setInstancesOpen(false);
    setInstancesScenario(null);
  }, []);

  const scenario = useMemo(
    () =>
      CHAI_TEST_SCENARIOS.find((s) => s.id === scenarioId) ??
      CHAI_TEST_SCENARIOS[0],
    [scenarioId]
  );

  const scenarioIndex = useMemo(
    () => CHAI_TEST_SCENARIOS.findIndex((s) => s.id === scenario.id),
    [scenario.id]
  );

  const updateScrollEdges = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    const max = scrollWidth - clientWidth;
    setScrollEdge({
      left: scrollLeft > 2,
      right: max > 2 && scrollLeft < max - 2,
    });
  }, []);

  useEffect(() => {
    updateScrollEdges();
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", updateScrollEdges, { passive: true });
    const ro = new ResizeObserver(updateScrollEdges);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", updateScrollEdges);
      ro.disconnect();
    };
  }, [updateScrollEdges]);

  useEffect(() => {
    const tabEl = document.getElementById(`chai-tab-${scenarioId}`);
    tabEl?.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    });
    requestAnimationFrame(updateScrollEdges);
  }, [scenarioId, updateScrollEdges]);

  const scrollTabsBy = useCallback((delta: number) => {
    scrollRef.current?.scrollBy({ left: delta, behavior: "smooth" });
  }, []);

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-8 py-14">
      <h1
        className={
          "mb-2 text-[28px] font-semibold tracking-tight " +
          "text-stone-900 dark:text-stone-50"
        }
      >
        CHAI public model cards
      </h1>
      <p
        className={
          "mb-4 max-w-3xl text-[15px] leading-relaxed text-stone-600 dark:text-stone-400"
        }
      >
        Trusted-company flow from{" "}
        <Link
          href="/chai-public-api/CHAI_API_DOC.md"
          className={
            "font-medium text-stone-800 underline underline-offset-2 " +
            "hover:text-stone-950 dark:text-stone-200 dark:hover:text-stone-50"
          }
        >
          CHAI_API_DOC
        </Link>
        {" "}
        ·{" "}
        <Link
          href="/chai-public-api/CHAI_TEST_SCENARIOS.md"
          className={
            "font-medium text-stone-800 underline underline-offset-2 " +
            "hover:text-stone-950 dark:text-stone-200 dark:hover:text-stone-50"
          }
        >
          Test scenarios (MD)
        </Link>
        {" "}
        ·{" "}
        <Link
          href="/chai-public-api/CHAI_USE_CASES_TEST_SIMULATION.md"
          className={
            "font-medium text-stone-800 underline underline-offset-2 " +
            "hover:text-stone-950 dark:text-stone-200 dark:hover:text-stone-50"
          }
        >
          Use cases + JSON (MD)
        </Link>
        . Pick a{" "}
        <strong className="font-semibold text-stone-800 dark:text-stone-200">
          test case
        </strong>{" "}
        tab — each one changes the payload (and sometimes the JSON shape).
        Cards stay in two columns: a featured Coalition for Health AI v3 card
        first, then orbdoc | aidoc per model. Use{" "}
        <strong className="font-semibold text-stone-800 dark:text-stone-200">
          Review &amp; publish
        </strong>{" "}
        to inspect JSON, then Publish.
      </p>
      <div className="mb-6">
        <p className="mb-2 text-[14px] text-stone-600 dark:text-stone-400">
          Registry proxy env (place in{" "}
          <code
            className={
              "rounded bg-stone-200/90 px-1.5 py-0.5 font-mono text-[12px] " +
              "text-stone-800 dark:bg-stone-800 dark:text-stone-200"
            }
          >
            apps/web/.env.local
          </code>
          ):
        </p>
        <pre
          className={
            "overflow-x-auto rounded-xl border border-stone-200 bg-stone-950 p-4 " +
            "font-mono text-[12px] leading-relaxed shadow-inner " +
            "text-emerald-100/95 dark:border-stone-700 dark:bg-stone-950 " +
            "sm:text-[13px] sm:leading-relaxed"
          }
          tabIndex={0}
        >
          <code className="block whitespace-pre text-left">
            <span className="text-stone-500">
              # apps/web/.env.local — CHAI registry proxy{"\n"}
              {"\n"}
            </span>
            <span className="text-stone-500"># Required{"\n"}</span>
            {"CHAI_REGISTRY_PUBLIC_KEY="}
            <span className="text-amber-200/90">your-public-key</span>
            {"\n"}
            {"CHAI_REGISTRY_SECRET_KEY="}
            <span className="text-amber-200/90">your-secret-key</span>
            {"\n"}
            {"CHAI_PUBLIC_API_BASE_URL="}
            <span className="text-sky-300/90">http://localhost:8000</span>
            {"\n"}
          </code>
        </pre>
      </div>

      <div className="mb-6">
        <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p
              className={
                "text-[12px] font-semibold uppercase tracking-wider " +
                "text-stone-500 dark:text-stone-500"
              }
            >
              Test cases
            </p>
            <p className="mt-1 text-[15px] font-medium text-stone-900 dark:text-stone-100">
              <span className="tabular-nums">
                {scenarioIndex + 1} / {SCENARIO_TOTAL}
              </span>
              <span className="mx-2 text-stone-300 dark:text-stone-600">·</span>
              <span className="text-stone-600 dark:text-stone-400">
                {SCENARIO_TOTAL} scenarios — scroll the row or use arrows
              </span>
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
            <button
              type="button"
              onClick={openRunAllModal}
              className={
                "rounded-xl bg-stone-900 px-4 py-2.5 text-[13px] font-semibold " +
                "text-white transition hover:bg-stone-800 dark:bg-stone-100 " +
                "dark:text-stone-900 dark:hover:bg-stone-200"
              }
            >
              Run all test cases
            </button>
            <span className="hidden text-[12px] text-stone-500 sm:inline dark:text-stone-500">
              Navigate
            </span>
            <button
              type="button"
              className={
                "inline-flex h-10 w-10 items-center justify-center rounded-xl border " +
                "border-stone-200 bg-white text-stone-700 transition " +
                "hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-40 " +
                "dark:border-stone-600 dark:bg-stone-800 dark:text-stone-200 " +
                "dark:hover:bg-stone-700"
              }
              aria-label="Scroll test cases left"
              disabled={!scrollEdge.left}
              onClick={() => scrollTabsBy(-280)}
            >
              <ChevronIcon dir="left" />
            </button>
            <button
              type="button"
              className={
                "inline-flex h-10 w-10 items-center justify-center rounded-xl border " +
                "border-stone-200 bg-white text-stone-700 transition " +
                "hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-40 " +
                "dark:border-stone-600 dark:bg-stone-800 dark:text-stone-200 " +
                "dark:hover:bg-stone-700"
              }
              aria-label="Scroll test cases right"
              disabled={!scrollEdge.right}
              onClick={() => scrollTabsBy(280)}
            >
              <ChevronIcon dir="right" />
            </button>
          </div>
        </div>

        <div
          className={
            "relative rounded-2xl border border-stone-200 bg-stone-50/90 " +
            "dark:border-stone-700 dark:bg-stone-900/40"
          }
        >
          {scrollEdge.left && (
            <div
              className={
                "pointer-events-none absolute left-0 top-0 z-10 h-full w-10 " +
                "rounded-l-2xl bg-gradient-to-r from-stone-50 to-transparent " +
                "dark:from-stone-950"
              }
              aria-hidden
            />
          )}
          {scrollEdge.right && (
            <div
              className={
                "pointer-events-none absolute right-0 top-0 z-10 h-full w-12 " +
                "rounded-r-2xl bg-gradient-to-l from-stone-50 to-transparent " +
                "dark:from-stone-950"
              }
              aria-hidden
            />
          )}
          <div
            ref={scrollRef}
            className={
              "overflow-x-auto overscroll-x-contain px-3 py-3 " +
              "[scrollbar-width:thin] [scrollbar-color:rgb(168_162_158)_transparent] " +
              "dark:[scrollbar-color:rgb(87_83_78)_transparent]"
            }
          >
            <div
              className="flex w-max flex-nowrap gap-2"
              role="tablist"
              aria-label={`CHAI test scenarios, ${SCENARIO_TOTAL} total`}
            >
              {CHAI_TEST_SCENARIOS.map((s, i) => {
                const selected = s.id === scenarioId;
                return (
                  <button
                    key={s.id}
                    type="button"
                    role="tab"
                    aria-selected={selected}
                    id={`chai-tab-${s.id}`}
                    onClick={() => setScenarioId(s.id)}
                    className={
                      "flex w-[min(200px,72vw)] shrink-0 flex-col rounded-xl border px-3 py-2.5 " +
                      "text-left text-[13px] transition focus:outline-none focus-visible:ring-2 " +
                      "focus-visible:ring-stone-400 dark:focus-visible:ring-stone-500 " +
                      (selected
                        ? "border-stone-900 bg-stone-900 text-white dark:border-stone-100 " +
                          "dark:bg-stone-100 dark:text-stone-900"
                        : "border-stone-200 bg-white text-stone-700 hover:border-stone-300 " +
                          "hover:bg-stone-50 dark:border-stone-600 dark:bg-stone-900 " +
                          "dark:text-stone-200 dark:hover:border-stone-500 dark:hover:bg-stone-800")
                    }
                  >
                    <span
                      className={
                        "mb-0.5 text-[10px] font-semibold uppercase " +
                        "tracking-wider opacity-70"
                      }
                    >
                      Case {i + 1}
                    </span>
                    <span className="line-clamp-2 font-semibold leading-snug">
                      {s.title}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {scrollEdge.right && (
          <p
            className={
              "mt-2 flex items-center gap-2 text-[13px] font-medium " +
              "text-amber-800 dark:text-amber-200/90"
            }
          >
            <span
              className={
                "inline-flex h-6 w-6 items-center justify-center rounded-full " +
                "bg-amber-200 text-amber-950 dark:bg-amber-900/60 dark:text-amber-100"
              }
              aria-hidden
            >
              →
            </span>
            More test cases on the right — scroll the bar, swipe on trackpad, or
            tap the right arrow.
          </p>
        )}
      </div>

      <div
        role="tabpanel"
        aria-labelledby={`chai-tab-${scenario.id}`}
        className={
          "mb-10 space-y-4 rounded-2xl border border-stone-200 " +
          "bg-stone-100/80 p-5 dark:border-stone-700 dark:bg-stone-900/50"
        }
      >
        <div>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <h2
              className={
                "text-[12px] font-semibold uppercase tracking-wider " +
                "text-stone-500 dark:text-stone-500"
              }
            >
              How to test
            </h2>
            <button
              type="button"
              onClick={() => openInstancesModal(scenario)}
              className={
                "shrink-0 rounded-xl border border-stone-300 bg-white px-3 py-2 " +
                "text-[12px] font-semibold text-stone-800 transition " +
                "hover:border-stone-400 hover:bg-stone-50 " +
                "dark:border-stone-600 dark:bg-stone-800 dark:text-stone-100 " +
                "dark:hover:border-stone-500 dark:hover:bg-stone-700"
              }
            >
              Run all instances
            </button>
          </div>
          <p
            className={
              "mt-2 whitespace-pre-line text-[14px] leading-relaxed " +
              "text-stone-700 dark:text-stone-300"
            }
          >
            {scenario.description}
          </p>
        </div>
        <div className="border-t border-stone-200 pt-4 dark:border-stone-700">
          <h2
            className={
              "text-[12px] font-semibold uppercase tracking-wider " +
              "text-amber-800 dark:text-amber-200"
            }
          >
            Expected result
          </h2>
          <p className="mt-2 text-[14px] leading-relaxed text-stone-800 dark:text-stone-200">
            {scenario.expectedResult}
          </p>
        </div>
      </div>

      <div className="mb-6">
        <p
          className={
            "mb-3 text-[12px] font-semibold uppercase tracking-wider " +
            "text-teal-800 dark:text-teal-200"
          }
        >
          Featured · mashkour@chai.org · coalition-for-health-ai
        </p>
        <ChaiCoalitionV3ModelCard scenario={scenario} />
      </div>

        <p
          className={
            "mb-4 text-[12px] font-semibold uppercase tracking-wider " +
            "text-stone-500 dark:text-stone-500"
          }
        >
        Orbdoc &amp; aidoc · three models × two orgs
      </p>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <ChaiHeartModelCard orgMode="orbdoc" scenario={scenario} />
        <ChaiHeartModelCard orgMode="aidoc" scenario={scenario} />
        <ChaiRadiologyModelCard orgMode="orbdoc" scenario={scenario} />
        <ChaiRadiologyModelCard orgMode="aidoc" scenario={scenario} />
        <ChaiTriageModelCard orgMode="orbdoc" scenario={scenario} />
        <ChaiTriageModelCard orgMode="aidoc" scenario={scenario} />
      </div>

      <ChaiRunAllScenariosModal
        open={runAllOpen}
        onClose={() => setRunAllOpen(false)}
        runTrigger={runAllTrigger}
      />
      <ChaiRunScenarioInstancesModal
        open={instancesOpen}
        onClose={closeInstancesModal}
        scenario={instancesScenario}
        runTrigger={instancesTrigger}
      />
    </main>
  );
}
