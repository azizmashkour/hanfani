"use client";

import { useMemo } from "react";
import { orbdocTriageCard } from "@/data/chai/orbdoc-sample-cards";
import { applyOrgModeToCard } from "@/lib/chai/apply-org-mode";
import type { ChaiTestScenario } from "@/lib/chai/chai-test-scenarios";
import type { ChaiOrgMode } from "@/lib/chai/constants";
import { ChaiOrbdocCardShell } from "./ChaiOrbdocCardShell";

export function ChaiTriageModelCard({
  orgMode,
  scenario,
}: {
  orgMode: ChaiOrgMode;
  scenario: ChaiTestScenario;
}) {
  const definition = useMemo(() => {
    const base = applyOrgModeToCard(orbdocTriageCard, orgMode);
    return scenario.apply(base);
  }, [orgMode, scenario]);
  return (
    <ChaiOrbdocCardShell
      definition={definition}
      variant="violet"
      subtitle="ED triage"
      scenario={scenario}
    />
  );
}
