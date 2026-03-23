/**
 * CHAI `/chai` UI test scenarios.
 * Human-readable exports:
 * - `public/chai-public-api/CHAI_TEST_SCENARIOS.md` (short list)
 * - `public/chai-public-api/CHAI_USE_CASES_TEST_SIMULATION.md` (full JSON + HTTP matrix)
 */
import type { ChaiModelCardPayload } from "@/lib/chai/constants";
import type { ChaiRegistryCardDefinition } from "@/lib/chai/apply-org-mode";

export type ChaiTestScenario = {
  id: string;
  /** Short tab label */
  title: string;
  /** How to exercise this case in the UI */
  description: string;
  /** What to expect after clicking Publish (proxy vs CHAI registry) */
  expectedResult: string;
  /** Visual + default request source; always receive a fresh clone from the card */
  apply: (def: ChaiRegistryCardDefinition) => ChaiRegistryCardDefinition;
  /**
   * JSON sent to the proxy + shown in the modal. Defaults to
   * `{ user, organization, model_card }` from the applied definition.
   */
  buildRequestPayload?: (def: ChaiRegistryCardDefinition) => Record<string, unknown>;
};

export function cloneRegistryDefinition(
  d: ChaiRegistryCardDefinition
): ChaiRegistryCardDefinition {
  return {
    ...d,
    user: { ...d.user },
    organization: { ...d.organization },
    model_card: structuredClone(d.model_card) as ChaiModelCardPayload,
  };
}

const defaultPayload = (def: ChaiRegistryCardDefinition) => ({
  user: def.user,
  organization: def.organization,
  model_card: def.model_card,
});

/**
 * Ordered list: happy paths first, then proxy failures, body-shape traps,
 * then registry/schema issues.
 */
export const CHAI_TEST_SCENARIOS: ChaiTestScenario[] = [
  {
    id: "coalition-chai-v3-baseline",
    title: "Coalition · CHAI v3",
    description:
      "Featured card first: mashkour@chai.org with organization slug " +
      "coalition-for-health-ai (Coalition for Health AI). Model card v3 — " +
      "use the top full-width card, Review & publish, then Publish.\n\n" +
      "Other grid cards still use orbdoc/aidoc; this scenario is the " +
      "primary path for the CHAI.org / Coalition payload.",
    expectedResult:
      "HTTP 201 if CHAI accepts the org and slug is new. HTTP 409 if " +
      "coalition-for-health-ai-public-model-card-v3 already exists. " +
      "HTTP 400 if the registry rejects the org or schema.",
    apply: (d) => cloneRegistryDefinition(d),
  },
  {
    id: "valid-baseline",
    title: "Valid baseline",
    description:
      "Unmodified payload after org mode (orbdoc.com / aidoc.com). Open " +
      "Review & publish on any card and submit.\n\nUse to confirm env vars " +
      "and registry connectivity for orbdoc/aidoc cards.",
    expectedResult:
      "HTTP 201 if the slug is new and CHAI accepts the full model card. " +
      "HTTP 409 if that slug already exists for that org.",
    apply: (d) => cloneRegistryDefinition(d),
  },
  {
    id: "valid-minimal-text-fields",
    title: "Valid + shortened text",
    description:
      "All required fields still present but many long strings trimmed to " +
      "short placeholders. Good sanity check that minimal text validates.",
    expectedResult:
      "Usually 201 like baseline, unless the registry enforces minimum " +
      "length on specific fields.",
    apply: (d) => {
      const c = cloneRegistryDefinition(d);
      const mc = c.model_card;
      for (const k of Object.keys(mc)) {
        const v = mc[k];
        if (typeof v === "string" && v.length > 80) {
          mc[k] = `${String(v).slice(0, 40)}…`;
        }
      }
      return c;
    },
  },
  {
    id: "proxy-unknown-org",
    title: "Proxy: unknown org",
    description:
      "organization switched to acme/acme. Our Next route only allows " +
      "Coalition for Health AI, orbdoc, and aidoc.\n\nCheck the org badge " +
      "and Organization section — they should show acme.",
    expectedResult:
      "HTTP 400 from /api/chai/public-model-cards with an error about " +
      "allowed organizations.",
    apply: (d) => {
      const c = cloneRegistryDefinition(d);
      c.organization = { name: "acme", slug: "acme" };
      c.orgTitle = "acme";
      return c;
    },
  },
  {
    id: "proxy-wrong-org-name-casing",
    title: "Proxy: name casing typo",
    description:
      "Slug is correct but organization name is wrong casing or spelling. " +
      "Whitelist requires an exact name/slug pair match (orbdoc, aidoc, or " +
      "Coalition for Health AI).",
    expectedResult: "HTTP 400 — invalid organization from the proxy.",
    apply: (d) => {
      const c = cloneRegistryDefinition(d);
      if (c.organization.slug === "orbdoc") {
        c.organization = { name: "OrbDoc", slug: "orbdoc" };
      } else if (c.organization.slug === "aidoc") {
        c.organization = { name: "AiDoc", slug: "aidoc" };
      } else {
        c.organization = {
          name: "coalition-for-health-ai",
          slug: "coalition-for-health-ai",
        };
      }
      return c;
    },
  },
  {
    id: "proxy-crossed-org-slug",
    title: "Proxy: crossed name/slug",
    description:
      "Uses mismatched name/slug pairs (e.g. aidoc name with orbdoc slug, " +
      "or orbdoc name with coalition slug). Should fail whitelist matching.",
    expectedResult: "HTTP 400 from the proxy.",
    apply: (d) => {
      const c = cloneRegistryDefinition(d);
      if (c.organization.slug === "orbdoc") {
        c.organization = { name: "aidoc", slug: "orbdoc" };
      } else if (c.organization.slug === "aidoc") {
        c.organization = { name: "orbdoc", slug: "aidoc" };
      } else {
        c.organization = {
          name: "orbdoc",
          slug: "coalition-for-health-ai",
        };
      }
      return c;
    },
  },
  {
    id: "request-omit-organization",
    title: "Request: no organization key",
    description:
      "Card UI still lists org for context, but the JSON body omits " +
      "organization entirely (invalid per our proxy).\n\nPreview modal must " +
      "not show an organization property.",
    expectedResult:
      "HTTP 400 — Expected JSON with user, organization, and model_card.",
    apply: (d) => cloneRegistryDefinition(d),
    buildRequestPayload: (def) => ({
      user: def.user,
      model_card: def.model_card,
    }),
  },
  {
    id: "request-user-not-object",
    title: "Request: user is a string",
    description:
      "Body sends user as a plain string instead of an object. Proxy " +
      "forwards to CHAI; CHAI should reject shape.",
    expectedResult:
      "Often HTTP 400 from CHAI (invalid payload) or 400 from proxy if " +
      "you add validation later.",
    apply: (d) => cloneRegistryDefinition(d),
    buildRequestPayload: (def) => ({
      user: "not-an-object",
      organization: def.organization,
      model_card: def.model_card,
    }),
  },
  {
    id: "request-empty-object",
    title: "Request: empty JSON {}",
    description:
      "Sends an empty object. Exercises proxy body validation.",
    expectedResult: "HTTP 400 — missing user, organization, model_card.",
    apply: (d) => cloneRegistryDefinition(d),
    buildRequestPayload: () => ({}),
  },
  {
    id: "user-empty-email",
    title: "User: empty email",
    description:
      "user.email is an empty string. Often fails email validation upstream.",
    expectedResult: "Typically HTTP 400 from CHAI (invalid email).",
    apply: (d) => {
      const c = cloneRegistryDefinition(d);
      c.user = { ...c.user, email: "" };
      c.model_card = {
        ...c.model_card,
        developer_contact: "",
      };
      return c;
    },
  },
  {
    id: "user-invalid-email",
    title: "User: invalid email",
    description:
      "Email without a valid structure (no proper domain).",
    expectedResult: "HTTP 400 from CHAI for invalid email.",
    apply: (d) => {
      const c = cloneRegistryDefinition(d);
      c.user = { ...c.user, email: "not-an-email" };
      c.model_card = { ...c.model_card, developer_contact: "not-an-email" };
      return c;
    },
  },
  {
    id: "user-empty-full-name",
    title: "User: empty full name",
    description:
      "Clears full_name. Some APIs require a non-empty display name.",
    expectedResult: "May be 400 from CHAI if full_name is required.",
    apply: (d) => {
      const c = cloneRegistryDefinition(d);
      c.user = { ...c.user, full_name: "" };
      return c;
    },
  },
  {
    id: "model-missing-slug",
    title: "Model: missing slug",
    description:
      "Removes model_card.slug — required in CHAI public API docs.",
    expectedResult: "HTTP 400 from CHAI (missing required field).",
    apply: (d) => {
      const c = cloneRegistryDefinition(d);
      delete c.model_card.slug;
      return c;
    },
  },
  {
    id: "model-missing-summary",
    title: "Model: missing summary",
    description:
      "Removes summary (required in sample schema).",
    expectedResult: "HTTP 400 from CHAI.",
    apply: (d) => {
      const c = cloneRegistryDefinition(d);
      delete c.model_card.summary;
      return c;
    },
  },
  {
    id: "model-empty-object",
    title: "Model: empty model_card {}",
    description:
      "Replaces model_card with an empty object — loses all required fields.",
    expectedResult: "HTTP 400 from CHAI.",
    apply: (d) => {
      const c = cloneRegistryDefinition(d);
      c.model_card = {};
      return c;
    },
  },
  {
    id: "slug-with-spaces",
    title: "Slug: spaces (invalid)",
    description:
      "Slug rules: lowercase, numbers, hyphens only. Spaces should fail validation.",
    expectedResult: "HTTP 400 from CHAI for invalid slug format.",
    apply: (d) => {
      const c = cloneRegistryDefinition(d);
      c.model_card = {
        ...c.model_card,
        slug: "bad slug with spaces",
      };
      return c;
    },
  },
  {
    id: "slug-uppercase",
    title: "Slug: UPPERCASE",
    description:
      "Slug uses uppercase letters — typically invalid vs slug rules in the doc.",
    expectedResult: "HTTP 400 from CHAI.",
    apply: (d) => {
      const c = cloneRegistryDefinition(d);
      const s = String(c.model_card.slug ?? "x");
      c.model_card = {
        ...c.model_card,
        slug: s.toUpperCase(),
      };
      return c;
    },
  },
  {
    id: "types-clinical-risk-number",
    title: "Types: clinical_risk_level number",
    description:
      "clinical_risk_level set to number 2 instead of string medium/low/etc.",
    expectedResult:
      "May be 400 from CHAI if schema expects string only.",
    apply: (d) => {
      const c = cloneRegistryDefinition(d);
      (c.model_card as Record<string, unknown>).clinical_risk_level = 2;
      return c;
    },
  },
  {
    id: "types-key-metrics-string",
    title: "Types: key_metrics string",
    description:
      "Replaces key_metrics object with a string — invalid nested shape.",
    expectedResult: "HTTP 400 from CHAI.",
    apply: (d) => {
      const c = cloneRegistryDefinition(d);
      (c.model_card as Record<string, unknown>).key_metrics = "invalid";
      return c;
    },
  },
  {
    id: "payload-huge-summary",
    title: "Payload: huge summary",
    description:
      "Summary padded to ~25k extra characters. Tests limits / timeouts / " +
      "payload size (switching to this tab may take a moment).",
    expectedResult:
      "May hang, return 413, 400, or 500 depending on gateway and CHAI limits.",
    apply: (d) => {
      const c = cloneRegistryDefinition(d);
      const pad = "x".repeat(25_000);
      c.model_card = {
        ...c.model_card,
        summary: `${String(c.model_card.summary ?? "")}${pad}`,
      };
      return c;
    },
  },
  {
    id: "visual-xss-ish-model-name",
    title: "Visual: HTML in model name",
    description:
      "Model name contains angle brackets. Should render as plain text in " +
      "the card (no script execution). Submit may still succeed or fail " +
      "depending on registry.",
    expectedResult:
      "UI: literal text only. Publish: 201 or 400 depending on CHAI sanitization.",
    apply: (d) => {
      const c = cloneRegistryDefinition(d);
      c.model_card = {
        ...c.model_card,
        model_name: 'Test <img src=x onerror="alert(1)">',
      };
      return c;
    },
  },
  {
    id: "sql-ish-summary-string",
    title: "String: SQL-ish summary",
    description:
      "Summary contains quotes and SQL-like fragments to visually confirm " +
      "encoding in JSON preview.",
    expectedResult:
      "Usually still 201 if other fields valid — tests how CHAI handles " +
      "special characters.",
    apply: (d) => {
      const c = cloneRegistryDefinition(d);
      c.model_card = {
        ...c.model_card,
        summary: `'; DROP TABLE users; -- ${String(c.model_card.summary ?? "").slice(0, 80)}`,
      };
      return c;
    },
  },
  {
    id: "duplicate-slug-collider",
    title: "409 hint: fixed slug",
    description:
      "Forces every card to use the same slug for its org. Publish the " +
      "same org twice (two cards) or repeat Publish on one card to chase " +
      "HTTP 409 slug conflict from CHAI.",
    expectedResult:
      "First publish may succeed (201). Second with same org+slug should " +
      "be 409 if the registry enforces uniqueness.",
    apply: (d) => {
      const c = cloneRegistryDefinition(d);
      const slug = c.organization.slug;
      const prefix =
        slug === "aidoc"
          ? "aidoc"
          : slug === "coalition-for-health-ai"
            ? "coalition-for-health-ai"
            : "orbdoc";
      c.model_card = {
        ...c.model_card,
        slug: `${prefix}-chai-collision-lab`,
      };
      return c;
    },
  },
];

export const DEFAULT_CHAI_TEST_SCENARIO_ID = CHAI_TEST_SCENARIOS[0].id;

export function getChaiTestScenario(
  id: string
): ChaiTestScenario | undefined {
  return CHAI_TEST_SCENARIOS.find((s) => s.id === id);
}

export function resolveChaiRequestPayload(
  scenario: ChaiTestScenario,
  def: ChaiRegistryCardDefinition
): Record<string, unknown> {
  if (scenario.buildRequestPayload) {
    return scenario.buildRequestPayload(def);
  }
  return defaultPayload(def) as Record<string, unknown>;
}
