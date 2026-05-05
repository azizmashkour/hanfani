"use client";

import { useMemo } from "react";
import { orbdocRadiologyCard } from "@/data/chai/orbdoc-sample-cards";
import { applyOrgModeToCard } from "@/lib/chai/apply-org-mode";
import type { ChaiTestScenario } from "@/lib/chai/chai-test-scenarios";
import type { ChaiOrgMode } from "@/lib/chai/constants";
import { ChaiOrbdocCardShell } from "./ChaiOrbdocCardShell";

export function ChaiRadiologyModelCard({
  orgMode,
  scenario,
}: {
  orgMode: ChaiOrgMode;
  scenario: ChaiTestScenario;
}) {
  const definition = useMemo(() => {
    const base = applyOrgModeToCard(orbdocRadiologyCard, orgMode);
    return scenario.apply(base);
  }, [orgMode, scenario]);
  return (
    <ChaiOrbdocCardShell
      definition={definition}
      variant="sky"
      subtitle="Radiology"
      scenario={scenario}
    />
  );
}
