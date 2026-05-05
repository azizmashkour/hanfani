"use client";

import { useMemo } from "react";
import { coalitionChaiModelCardV3 } from "@/data/chai/coalition-chai-v3-card";
import { definitionFromChaiTemplate } from "@/lib/chai/apply-org-mode";
import type { ChaiTestScenario } from "@/lib/chai/chai-test-scenarios";
import { ChaiOrbdocCardShell } from "./ChaiOrbdocCardShell";

export function ChaiCoalitionV3ModelCard({
  scenario,
}: {
  scenario: ChaiTestScenario;
}) {
  const definition = useMemo(() => {
    const base = definitionFromChaiTemplate(coalitionChaiModelCardV3);
    return scenario.apply(base);
  }, [scenario]);
  return (
    <ChaiOrbdocCardShell
      definition={definition}
      variant="sky"
      subtitle="CHAI public API v3"
      scenario={scenario}
    />
  );
}
