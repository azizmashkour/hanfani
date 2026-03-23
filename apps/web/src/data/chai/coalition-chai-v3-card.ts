import type { ChaiCardTemplate } from "@/data/chai/orbdoc-sample-cards";
import { CHAI_COALITION_ORGANIZATION } from "@/lib/chai/constants";
import { orbdocHeartCard } from "@/data/chai/orbdoc-sample-cards";

/**
 * Featured CHAI.org / Coalition for Health AI model card (v3) for `/chai`.
 * User: mashkour@chai.org · org slug: coalition-for-health-ai
 */
export const coalitionChaiModelCardV3: ChaiCardTemplate = {
  id: "coalition-chai-v3",
  orgTitle: CHAI_COALITION_ORGANIZATION.name,
  organization: CHAI_COALITION_ORGANIZATION,
  user: {
    full_name: "Aziz Mashkour",
    email: "mashkour@chai.org",
    role: "API Integration",
  },
  model_card: (() => {
    const model_card = structuredClone(orbdocHeartCard.model_card);
    model_card.slug = "coalition-for-health-ai-public-model-card-v3";
    model_card.model_name = "CHAI public model card v3";
    model_card.model_developer = "Coalition for Health AI";
    model_card.developer_contact = "mashkour@chai.org";
    model_card.release_stage = "production";
    model_card.release_version = "3.0.0";
    model_card.release_date = "2026-02-18";
    model_card.summary =
      "Coalition for Health AI public model card schema v3 — submitted via " +
      "Hanfani CHAI Open API test harness (mashkour@chai.org). Demonstrates " +
      "end-to-end POST /api/v1/model-cards through the trusted proxy.";
    model_card.keywords = [
      "CHAI",
      "Coalition for Health AI",
      "public API",
      "model card v3",
      "registry",
    ];
    model_card.intended_use_and_workflow =
      "Reference submission for CHAI public model cards API v3 validation and registry onboarding.";
    model_card.funding_source = "Coalition for Health AI";
    model_card.peer_reviewed_publications =
      "Public API integration test — Hanfani /chai harness";
    return model_card;
  })(),
};
