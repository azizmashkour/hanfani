import type { ChaiModelCardPayload, ChaiOrgMode, ChaiPublicUser } from "@/lib/chai/constants";
import { CHAI_ORG_BY_MODE } from "@/lib/chai/constants";
import type { ChaiCardTemplate } from "@/data/chai/orbdoc-sample-cards";

export interface ChaiRegistryCardDefinition {
  id: string;
  orgTitle: string;
  user: ChaiPublicUser;
  organization: { name: string; slug: string };
  model_card: ChaiModelCardPayload;
}

/**
 * Builds a registry-ready card from the orbdoc template and selected org mode.
 */
export function applyOrgModeToCard(
  template: ChaiCardTemplate,
  mode: ChaiOrgMode
): ChaiRegistryCardDefinition {
  const cfg = CHAI_ORG_BY_MODE[mode];
  const localPart = template.user.email.split("@")[0] ?? template.user.email;
  const email = `${localPart}@${cfg.domain}`;

  const model_card = structuredClone(
    template.model_card
  ) as ChaiModelCardPayload;
  const slug = String(model_card.slug ?? "");
  if (mode === "aidoc") {
    model_card.slug = slug.replace(/^orbdoc-/, "aidoc-");
  } else {
    model_card.slug = slug.replace(/^aidoc-/, "orbdoc-");
  }
  model_card.model_developer = cfg.name;
  model_card.developer_contact = email;

  if (typeof model_card.funding_source === "string") {
    model_card.funding_source = model_card.funding_source.replace(
      /\borbdoc\b/gi,
      cfg.name
    );
  }

  return {
    id: template.id,
    orgTitle: cfg.name,
    organization: { name: cfg.name, slug: cfg.slug },
    user: { ...template.user, email },
    model_card,
  };
}

/**
 * Card template that already includes final `user`, `organization`, and `model_card`
 * (no orbdoc/aidoc domain swap). Used for Coalition for Health AI / CHAI.org payloads.
 */
export function definitionFromChaiTemplate(
  template: ChaiCardTemplate
): ChaiRegistryCardDefinition {
  return {
    id: template.id,
    orgTitle: template.orgTitle,
    user: { ...template.user },
    organization: { ...template.organization },
    model_card: structuredClone(template.model_card) as ChaiModelCardPayload,
  };
}
