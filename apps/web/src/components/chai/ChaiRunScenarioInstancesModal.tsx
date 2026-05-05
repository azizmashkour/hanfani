"use client";

import { useEffect, useId, useRef, useState } from "react";
import {
  applyOrgModeToCard,
  definitionFromChaiTemplate,
  type ChaiRegistryCardDefinition,
} from "@/lib/chai/apply-org-mode";
import type { ChaiOrgMode } from "@/lib/chai/constants";
import { getChaiApiStatusMessage } from "@/lib/chai/chai-api-response";
import type { ChaiTestScenario } from "@/lib/chai/chai-test-scenarios";
import { resolveChaiRequestPayload } from "@/lib/chai/chai-test-scenarios";
import { submitChaiRegistryRequest } from "@/lib/chai/submit-public-model-card";
import { coalitionChaiModelCardV3 } from "@/data/chai/coalition-chai-v3-card";
import type { ChaiCardTemplate } from "@/data/chai/orbdoc-sample-cards";
import {
  orbdocHeartCard,
  orbdocRadiologyCard,
  orbdocTriageCard,
} from "@/data/chai/orbdoc-sample-cards";

type ChaiRunInstanceDef =
  | { kind: "standalone"; template: ChaiCardTemplate; label: string; key: string }
  | {
      kind: "orbdoc-aidoc";
      template: ChaiCardTemplate;
      orgMode: ChaiOrgMode;
      label: string;
      key: string;
    };

function baseDefinitionForInstance(inst: ChaiRunInstanceDef): ChaiRegistryCardDefinition {
  if (inst.kind === "standalone") {
    return definitionFromChaiTemplate(inst.template);
  }
  return applyOrgModeToCard(inst.template, inst.orgMode);
}

const INSTANCE_DEFS: ChaiRunInstanceDef[] = [
  {
    kind: "standalone",
    template: coalitionChaiModelCardV3,
    label: "CHAI v3 · Coalition for Health AI · mashkour@chai.org",
    key: "coalition-chai-v3",
  },
  {
    kind: "orbdoc-aidoc",
    template: orbdocHeartCard,
    orgMode: "orbdoc",
    label: "Cardiovascular · orbdoc",
    key: "heart-orbdoc",
  },
  {
    kind: "orbdoc-aidoc",
    template: orbdocHeartCard,
    orgMode: "aidoc",
    label: "Cardiovascular · aidoc",
    key: "heart-aidoc",
  },
  {
    kind: "orbdoc-aidoc",
    template: orbdocRadiologyCard,
    orgMode: "orbdoc",
    label: "Radiology · orbdoc",
    key: "radiology-orbdoc",
  },
  {
    kind: "orbdoc-aidoc",
    template: orbdocRadiologyCard,
    orgMode: "aidoc",
    label: "Radiology · aidoc",
    key: "radiology-aidoc",
  },
  {
    kind: "orbdoc-aidoc",
    template: orbdocTriageCard,
    orgMode: "orbdoc",
    label: "ED triage · orbdoc",
    key: "triage-orbdoc",
  },
  {
    kind: "orbdoc-aidoc",
    template: orbdocTriageCard,
    orgMode: "aidoc",
    label: "ED triage · aidoc",
    key: "triage-aidoc",
  },
];

type RunRowState =
  | { phase: "pending" }
  | { phase: "running" }
  | {
      phase: "done";
      ok: boolean;
      httpStatus: number;
      ms: number;
      message: string;
    };

function SuccessBadge() {
  return (
    <span
      className={
        "flex h-8 w-8 shrink-0 items-center justify-center rounded-full " +
        "bg-emerald-500 text-[14px] font-bold leading-none text-white " +
        "shadow-sm dark:bg-emerald-600"
      }
      aria-label="Success"
    >
      ✓
    </span>
  );
}

function FailBadge() {
  return (
    <span
      className={
        "flex h-8 w-8 shrink-0 items-center justify-center rounded-full " +
        "bg-red-500 text-[16px] font-bold leading-none text-white " +
        "shadow-sm dark:bg-red-600"
      }
      aria-label="Failed"
    >
      ×
    </span>
  );
}

function SpinnerIcon() {
  return (
    <span
      className={
        "inline-flex h-8 w-8 shrink-0 animate-spin rounded-full border-2 " +
        "border-stone-200 border-t-stone-600 dark:border-stone-600 dark:border-t-stone-300"
      }
      aria-label="Loading"
    />
  );
}

export interface ChaiRunScenarioInstancesModalProps {
  open: boolean;
  onClose: () => void;
  scenario: ChaiTestScenario | null;
  runTrigger: number;
}

export function ChaiRunScenarioInstancesModal({
  open,
  onClose,
  scenario,
  runTrigger,
}: ChaiRunScenarioInstancesModalProps) {
  const id = useId();
  const titleId = `${id}-title`;
  const [rows, setRows] = useState<RunRowState[]>(() =>
    INSTANCE_DEFS.map(() => ({ phase: "pending" }))
  );
  const [wallMs, setWallMs] = useState<number | null>(null);
  const [summary, setSummary] = useState<{
    passed: number;
    failed: number;
  } | null>(null);
  const cancelledRef = useRef(false);

  useEffect(() => {
    if (!open || !scenario) {
      return;
    }

    cancelledRef.current = false;
    setWallMs(null);
    setSummary(null);
    setRows(INSTANCE_DEFS.map(() => ({ phase: "running" })));

    const wallT0 = performance.now();

    const jobs = INSTANCE_DEFS.map((inst, i) =>
      (async (): Promise<boolean> => {
        const t0 = performance.now();
        try {
          const base = baseDefinitionForInstance(inst);
          const def = scenario.apply(base);
          const payload = resolveChaiRequestPayload(scenario, def);
          const result = await submitChaiRegistryRequest(payload);
          const ms = Math.round(performance.now() - t0);
          const message =
            getChaiApiStatusMessage(result.data) ??
            (!result.ok ? result.error : "");
          if (cancelledRef.current) return result.ok;
          setRows((prev) => {
            const next = [...prev];
            next[i] = {
              phase: "done",
              ok: result.ok,
              httpStatus: result.status,
              ms,
              message,
            };
            return next;
          });
          return result.ok;
        } catch (e) {
          const ms = Math.round(performance.now() - t0);
          const message = e instanceof Error ? e.message : String(e);
          if (cancelledRef.current) return false;
          setRows((prev) => {
            const next = [...prev];
            next[i] = {
              phase: "done",
              ok: false,
              httpStatus: 0,
              ms,
              message,
            };
            return next;
          });
          return false;
        }
      })()
    );

    void Promise.all(jobs).then((oks) => {
      if (cancelledRef.current) return;
      setWallMs(Math.round(performance.now() - wallT0));
      setSummary({
        passed: oks.filter(Boolean).length,
        failed: oks.filter((o) => !o).length,
      });
    });

    return () => {
      cancelledRef.current = true;
    };
  }, [open, scenario, runTrigger]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open || !scenario) return null;

  const allDone =
    rows.length > 0 && rows.every((r) => r.phase === "done");

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-6"
      role="presentation"
    >
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 bg-stone-900/60 backdrop-blur-[2px] dark:bg-black/70"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={
          "relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden " +
          "rounded-2xl border border-stone-200 bg-white shadow-2xl " +
          "dark:border-stone-700 dark:bg-stone-900"
        }
      >
        <div className="border-b border-stone-200 px-5 py-4 dark:border-stone-700">
          <h2
            id={titleId}
            className="text-lg font-semibold text-stone-900 dark:text-stone-50"
          >
            Run all instances
          </h2>
          <p className="mt-1 text-[14px] text-stone-600 dark:text-stone-400">
            <span className="font-medium text-stone-800 dark:text-stone-200">
              {scenario.title}
            </span>
            {" — "}
            seven requests (Coalition CHAI v3 + 3 models × orbdoc &amp;
            aidoc) in parallel.
          </p>
          {wallMs != null && summary != null && allDone && (
            <p className="mt-2 text-[13px] text-stone-600 dark:text-stone-400">
              <span className="font-semibold text-emerald-700 dark:text-emerald-300">
                {summary.passed} passed
              </span>
              <span className="mx-2 text-stone-300 dark:text-stone-600">·</span>
              <span className="font-semibold text-red-700 dark:text-red-300">
                {summary.failed} failed
              </span>
              <span className="mx-2 text-stone-300 dark:text-stone-600">·</span>
              Wall time{" "}
              <span className="tabular-nums font-medium text-stone-800 dark:text-stone-200">
                {wallMs} ms
              </span>
            </p>
          )}
        </div>

        <ul className="min-h-0 flex-1 list-none space-y-2 overflow-y-auto p-4">
          {INSTANCE_DEFS.map((inst, i) => {
            const row = rows[i] ?? { phase: "pending" };
            return (
              <li
                key={inst.key}
                className={
                  "flex gap-3 rounded-xl border border-stone-200 bg-stone-50/80 p-3 " +
                  "dark:border-stone-700 dark:bg-stone-800/40"
                }
              >
                <div className="flex w-8 shrink-0 justify-center pt-0.5">
                  {row.phase === "running" || row.phase === "pending" ? (
                    <SpinnerIcon />
                  ) : row.ok ? (
                    <SuccessBadge />
                  ) : (
                    <FailBadge />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <p className="text-[13px] font-semibold text-stone-900 dark:text-stone-100">
                      {inst.label}
                    </p>
                    {row.phase === "done" && (
                      <div
                        className={
                          "flex shrink-0 items-center gap-2 text-[12px] " +
                          "text-stone-500 dark:text-stone-400"
                        }
                      >
                        <span className="font-mono tabular-nums">
                          HTTP {row.httpStatus}
                        </span>
                        <span className="text-stone-300 dark:text-stone-600">
                          ·
                        </span>
                        <span className="font-mono tabular-nums">{row.ms} ms</span>
                      </div>
                    )}
                  </div>
                  {row.phase === "done" && row.message ? (
                    <p
                      className={
                        "mt-1 break-words text-[13px] leading-snug " +
                        (row.ok
                          ? "text-stone-600 dark:text-stone-400"
                          : "text-red-800 dark:text-red-200")
                      }
                    >
                      {row.message}
                    </p>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>

        <div className="border-t border-stone-200 px-5 py-4 dark:border-stone-700">
          <button
            type="button"
            onClick={onClose}
            className={
              "w-full rounded-xl bg-stone-900 py-2.5 text-[14px] font-semibold " +
              "text-white transition hover:bg-stone-800 sm:w-auto sm:px-6 " +
              "dark:bg-stone-100 dark:text-stone-900 " +
              "dark:hover:bg-stone-200"
            }
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
