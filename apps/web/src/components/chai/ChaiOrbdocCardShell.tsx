"use client";

import { useMemo, useState } from "react";
import type { ChaiRegistryCardDefinition } from "@/lib/chai/apply-org-mode";
import type { ChaiTestScenario } from "@/lib/chai/chai-test-scenarios";
import { resolveChaiRequestPayload } from "@/lib/chai/chai-test-scenarios";
import { submitChaiRegistryRequest } from "@/lib/chai/submit-public-model-card";
import { ChaiPublishPayloadModal } from "./ChaiPublishPayloadModal";

const shellVariants = {
  emerald: {
    border:
      "border-emerald-200/90 dark:border-emerald-800/50",
    accent: "bg-emerald-500 dark:bg-emerald-600",
    badge:
      "bg-emerald-100 text-emerald-900 dark:bg-emerald-900/50 dark:text-emerald-100",
  },
  sky: {
    border: "border-sky-200/90 dark:border-sky-800/50",
    accent: "bg-sky-500 dark:bg-sky-600",
    badge:
      "bg-sky-100 text-sky-900 dark:bg-sky-900/50 dark:text-sky-100",
  },
  violet: {
    border: "border-violet-200/90 dark:border-violet-800/50",
    accent: "bg-violet-500 dark:bg-violet-600",
    badge:
      "bg-violet-100 text-violet-900 dark:bg-violet-900/50 dark:text-violet-100",
  },
} as const;

/** High-visibility org badge (distinct per org). */
const orgBadgeBySlug: Record<string, string> = {
  orbdoc:
    "shrink-0 rounded-full border-2 border-amber-400/90 bg-gradient-to-br " +
    "from-amber-300 to-amber-500 px-3.5 py-1.5 text-[13px] font-bold uppercase " +
    "tracking-widest text-amber-950 shadow-md shadow-amber-500/25 " +
    "ring-2 ring-amber-200/80 dark:border-amber-500 dark:from-amber-600 " +
    "dark:to-amber-800 dark:text-amber-50 dark:ring-amber-700/60",
  aidoc:
    "shrink-0 rounded-full border-2 border-indigo-400/90 bg-gradient-to-br " +
    "from-indigo-500 to-violet-600 px-3.5 py-1.5 text-[13px] font-bold uppercase " +
    "tracking-widest text-white shadow-md shadow-indigo-500/30 " +
    "ring-2 ring-indigo-300/60 dark:border-indigo-400 dark:from-indigo-600 " +
    "dark:to-violet-800 dark:ring-indigo-500/40",
  "coalition-for-health-ai":
    "shrink-0 rounded-full border-2 border-teal-400/90 bg-gradient-to-br " +
    "from-teal-500 to-cyan-600 px-3.5 py-1.5 text-[11px] font-bold uppercase " +
    "tracking-wide text-white shadow-md shadow-teal-500/25 " +
    "ring-2 ring-teal-200/70 dark:border-teal-500 dark:from-teal-600 " +
    "dark:to-cyan-800 dark:ring-teal-600/50",
};

export type ChaiCardVariant = keyof typeof shellVariants;

export interface ChaiOrbdocCardShellProps {
  definition: ChaiRegistryCardDefinition;
  variant: ChaiCardVariant;
  /** Short label for the model (e.g. "Cardiovascular risk") */
  subtitle: string;
  scenario: ChaiTestScenario;
}

export function ChaiOrbdocCardShell({
  definition,
  variant,
  subtitle,
  scenario,
}: ChaiOrbdocCardShellProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const v = shellVariants[variant];
  const { user, organization, model_card: modelCard } = definition;
  const orgBadgeClass =
    orgBadgeBySlug[organization.slug] ??
    "shrink-0 rounded-full border-2 border-stone-300 bg-stone-200 px-3.5 py-1.5 " +
    "text-[13px] font-bold uppercase tracking-widest text-stone-800 " +
    "dark:border-stone-600 dark:bg-stone-700 dark:text-stone-100";

  const requestPayload = useMemo(
    () => resolveChaiRequestPayload(scenario, definition),
    [scenario, definition]
  );

  const headline =
    (typeof modelCard.slug === "string" && modelCard.slug) ||
    (typeof modelCard.model_name === "string" && modelCard.model_name) ||
    subtitle;

  return (
    <article
      className={
        `relative flex flex-col overflow-hidden rounded-2xl border bg-white ` +
        `dark:bg-stone-900 ${v.border}`
      }
    >
      <div className={`absolute left-0 top-0 h-full w-1 ${v.accent}`} />
      <div className="flex flex-1 flex-col p-6 pl-7">
        <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <span
              className={
                `rounded-md px-2 py-0.5 text-[11px] font-semibold uppercase ` +
                `tracking-wide ${v.badge}`
              }
            >
              {subtitle}
            </span>
          </div>
          <span
            className={orgBadgeClass}
            title={`Organization: ${organization.name}`}
          >
            {organization.name}
          </span>
        </div>
        <h2
          className={
            "text-lg font-semibold leading-snug tracking-tight " +
            "text-stone-900 dark:text-stone-50"
          }
        >
          {(modelCard.model_name as string) ?? subtitle}
        </h2>
        <p
          className={
            "mt-1 font-mono text-[12px] text-stone-500 dark:text-stone-500"
          }
        >
          {String(modelCard.slug ?? "")}
        </p>

        <div
          className={
            "mt-4 space-y-4 text-[14px] leading-relaxed " +
            "text-stone-600 dark:text-stone-400"
          }
        >
          <div>
            <h3
              className={
                "mb-2 text-[12px] font-semibold uppercase tracking-wider " +
                "text-stone-500 dark:text-stone-500"
              }
            >
              User
            </h3>
            <dl className="grid gap-1 sm:grid-cols-[8rem_1fr]">
              <dt className="text-stone-500 dark:text-stone-500">Name</dt>
              <dd className="text-stone-800 dark:text-stone-200">
                {user.full_name}
              </dd>
              <dt className="text-stone-500 dark:text-stone-500">Email</dt>
              <dd className="font-mono text-[13px] text-stone-800 dark:text-stone-200">
                {user.email}
              </dd>
              <dt className="text-stone-500 dark:text-stone-500">Role</dt>
              <dd className="text-stone-800 dark:text-stone-200">{user.role}</dd>
            </dl>
          </div>
          <div>
            <h3
              className={
                "mb-2 text-[12px] font-semibold uppercase tracking-wider " +
                "text-stone-500 dark:text-stone-500"
              }
            >
              Organization (API payload)
            </h3>
            <dl className="grid gap-1 sm:grid-cols-[8rem_1fr]">
              <dt className="text-stone-500 dark:text-stone-500">Name</dt>
              <dd className="text-stone-800 dark:text-stone-200">
                {organization.name}
              </dd>
              <dt className="text-stone-500 dark:text-stone-500">Slug</dt>
              <dd className="font-mono text-[13px] text-stone-800 dark:text-stone-200">
                {organization.slug}
              </dd>
            </dl>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className={
              "inline-flex items-center justify-center rounded-xl px-4 py-2.5 " +
              "text-[14px] font-semibold text-white transition " +
              "bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:text-stone-900 " +
              "dark:hover:bg-stone-200"
            }
          >
            Review &amp; publish
          </button>
          <p className="text-[12px] text-stone-500 dark:text-stone-500">
            Opens a preview of the full JSON, then{" "}
            <code
              className="rounded bg-stone-100 px-1 dark:bg-stone-800"
            >
              /api/v1/model-cards
            </code>{" "}
            via server proxy.
          </p>
        </div>
      </div>

      <ChaiPublishPayloadModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        headline={headline}
        payload={requestPayload}
        onPublish={() => submitChaiRegistryRequest(requestPayload)}
      />
    </article>
  );
}
