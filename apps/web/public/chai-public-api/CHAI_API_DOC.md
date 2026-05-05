# Public Model Cards API

Trusted companies can publish model cards to the CHAI Registry via a single API call. The payload aligns with **SolutionDetailSchema** (create) and **UpdateSolutionPayload** (partial updates not supported—full payload required).

## Endpoint

```
POST /api/v1/model-cards
```

## Authentication

Send these headers with every request:

| Header | Description |
|--------|-------------|
| `Chai-Registry-Public-Key` | API key (Hanfani web: `CHAI_REGISTRY_PUBLIC_KEY` or `CHAI_API_KEY` in `.env.local`) |
| `Chai-Registry-Secret-Key` | API secret (Hanfani web: `CHAI_REGISTRY_SECRET_KEY` or `CHAI_API_SECRET`) |
| `Chai-Registry-Org-Slug` | Optional; trusted company org slug (Hanfani web: `CHAI_REGISTRY_ORG_SLUG`) |
| `Content-Type` | `application/json` |

## Request Body

The payload must include three sections: `user`, `organization`, and `model_card` (or `solution`).

### Top-Level Structure

```json
{
  "user": { "email": "...", "full_name": "...", "role": "..." },
  "organization": { "name": "...", "slug": "..." },
  "model_card": { /* SolutionDetailSchema fields (slug required) */ }
}
```

### model_card / solution (SolutionDetailSchema)

All fields from `SolutionDetailSchema` are accepted. Required for published status:

| Field | Type | Required |
|------|------|----------|
| `slug` | string | Yes |
| `model_developer` | string | Yes |
| `developer_contact` | string | Yes |
| `release_stage` | string | Yes |
| `release_date` | string | Yes |
| `release_version` | string | Yes |
| `global_availability` | string | Yes |
| `summary` | string | Yes |
| `intended_use_and_workflow` | string | Yes |
| `primary_intended_users` | string | Yes |
| `how_to_use` | string | Yes |
| `targeted_patient_population` | string | Yes |
| `cautioned_out_of_scope_settings` | string | Yes |
| `known_risks_and_limitations` | string | Yes |
| `known_biases_or_ethical_considerations` | string | Yes |
| `clinical_risk_level` | string | Yes |
| `outcomes_and_outputs` | string | Yes |
| `model_type` | string | Yes |
| `input_data_source` | string | Yes |
| `output_and_input_data_types` | string | Yes |
| `development_data_characterization` | string | Yes |
| `bias_mitigation_approaches` | string | Yes |
| `ongoing_maintenance` | string | Yes |
| `funding_source` | string | Yes |
| `stakeholders_consulted` | string | Yes |
| `peer_reviewed_publications` | string | Yes |
| `patient_consent_or_disclosure` | string | Yes |

Optional fields (align with SolutionDetailSchema):

| Field | Type |
|-------|------|
| `model_name` | string (defaults to title-case from slug) |
| `regulatory_approval` | string |
| `keywords` | string[] |
| `foundation_models` | string |
| `security` | string |
| `transparency` | string |
| `third_party_information` | string |
| `evaluation_references` | string |
| `clinical_trial` | string |
| `reimbursement_status` | string |
| `bibliography` | string |
| `ehr_compatibility` | string[] |
| `regulatory_compliance` | string |
| `key_metrics` | KeyMetrics (see below) |

### key_metrics (KeyMetricsSchema)

```json
{
  "usefulness": {
    "metric_goal": "...",
    "results": [
      { "label": "AUC-ROC", "value": { "kind": "single", "value": 0.92, "unit": "%" } }
    ],
    "interpretation": "...",
    "test_type": "...",
    "testing_data_description": "...",
    "validation_process_and_justification": "..."
  },
  "fairness": { "metric_goal": "", "results": [], "interpretation": "", "test_type": "", "testing_data_description": "", "validation_process_and_justification": "" },
  "safety": { "metric_goal": "", "results": [], "interpretation": "", "test_type": "", "testing_data_description": "", "validation_process_and_justification": "" }
}
```

MetricValue `kind` options: `single` (value, unit?), `estimate_ci` (estimate, lower, upper), `mean_sd` (mean, sd), `median_iqr` (median, p25, p75).

### Slug Rules

- Lowercase letters, numbers, and hyphens only
- Example: `heart-disease-predictor-v1`

## Sample Payloads

Use the JSON files in `docs/sample-model-cards/` for testing:

- `card-1-heart-disease.json` – Heart disease risk prediction model
- `card-2-radiology-reader.json` – Radiology image analysis model

## Quick Test (curl)

```bash
curl -X POST http://localhost:8000/api/v1/model-cards \
  -H "Content-Type: application/json" \
  -H "Chai-Registry-Public-Key: YOUR_API_KEY" \
  -H "Chai-Registry-Secret-Key: YOUR_API_SECRET" \
  -d @docs/sample-model-cards/card-1-heart-disease.json
```

## Responses

| Status | Meaning |
|--------|---------|
| 201 | Success – returns the created model card (SolutionDetail) |
| 400 | Invalid payload (missing sections, invalid email, etc.) |
| 401 | Missing or invalid API credentials |
| 409 | Slug already exists for this organization |

## Configuration

### Hanfani web app (`apps/web`)

Set **two separate environment variables** (no JSON array) in `.env.local`:

```bash
CHAI_REGISTRY_PUBLIC_KEY=your-public-key
CHAI_REGISTRY_SECRET_KEY=your-secret
CHAI_PUBLIC_API_BASE_URL=http://localhost:8000
# Optional: forwarded as Chai-Registry-Org-Slug on the upstream request
CHAI_REGISTRY_ORG_SLUG=coalition-for-health-ai
```

Optional aliases if the primary names are unset: `CHAI_API_KEY`, `CHAI_API_SECRET`.

### CHAI registry server (upstream)

The registry may still configure trusted companies as JSON (e.g. `TRUSTED_COMPANIES_CREDS_JSON` on the API server). The `ORG_SLUG` in that config must match an existing `ChaiOrganization` with `can_auto_approve_subsidiaries=True`.

## Integration (Next.js / React + TypeScript)

The `model_card` payload aligns with your frontend schemas:

- **Create payload**: Use `SolutionDetailSchema` for the full model card. Omit `slug` and `organization` from the inner payload when building from `UpdateSolutionPayload`—the public API wraps `user`, `organization`, and `model_card` separately.
- **UpdateSolutionPayload**: This API does not support PATCH; it requires a full create payload. Use `UpdateSolutionPayload` fields to build the `model_card` object, then wrap with `user` and `organization`.

```typescript
// Build public API payload from your existing types
const payload = {
  user: { email, full_name, role },
  organization: { name, slug },
  model_card: solutionDetail, // SolutionDetailSchema (omit slug/org if from UpdateSolutionPayload)
};
```

Call from a server-side route or backend to keep the secret key secure.

## Related

- **[CHAI test scenarios](/chai-public-api/CHAI_TEST_SCENARIOS.md)** — every `/chai-open-api` automated test case (id, payload notes, how to test, expected result). Source: `apps/web/src/lib/chai/chai-test-scenarios.ts`.
- **[CHAI use cases & simulation](/chai-public-api/CHAI_USE_CASES_TEST_SIMULATION.md)** — all 23 cases with example JSON bodies, proxy vs CHAI status codes, and expected response shapes.
