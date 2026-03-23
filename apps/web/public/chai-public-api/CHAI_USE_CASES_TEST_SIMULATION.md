# CHAI public model cards — full use cases & simulation matrix (23 tests)

This document describes the **23 automated test scenarios** used on Hanfani’s **`/chai`** page: each case’s purpose, the **JSON POST body** sent to the app proxy, and **expected HTTP status codes** and response shapes.

**Canonical source (TypeScript):** `apps/web/src/lib/chai/chai-test-scenarios.ts`  
**Related:** [CHAI_API_DOC.md](./CHAI_API_DOC.md) · [CHAI_TEST_SCENARIOS.md](./CHAI_TEST_SCENARIOS.md)

---

## Request path & responsibilities

| Hop | Endpoint | Role |
|-----|-----------|------|
| Browser | `POST /api/chai/public-model-cards` | Next.js **proxy**: JSON parse, require `user` + `organization` + `model_card`, whitelist org name/slug pairs only. |
| Proxy → CHAI | `POST {CHAI_PUBLIC_API_BASE_URL}/api/v1/model-cards` | **CHAI registry**: validation, persistence, conflict rules. |

Headers added by the proxy to CHAI (not shown in browser): `Chai-Registry-Public-Key`, `Chai-Registry-Secret-Key`, optional `Chai-Registry-Org-Slug`.

---

## Proxy (`/api/chai/public-model-cards`) — fixed responses

These are **always** returned by the Next route before CHAI is called (or when the server cannot read credentials).

| Condition | HTTP | Response body (JSON) |
|-----------|------|----------------------|
| Registry env keys missing / invalid | **500** | `{ "error": "<message from credential loader>" }` |
| Body is not valid JSON | **400** | `{ "error": "Invalid JSON body" }` |
| Body missing any of `user`, `organization`, `model_card` | **400** | `{ "error": "Expected JSON with user, organization, and model_card" }` |
| `organization` not one of the **exact** allowed name/slug pairs (see `CHAI_ALLOWED_ORGANIZATIONS` in `constants.ts`: Coalition for Health AI, orbdoc, aidoc) | **400** | `{ "error": "Invalid organization: allowed name/slug pairs are <comma-separated list>" }` (text is generated from the allowlist) |

If the proxy forwards to CHAI, the **HTTP status code** and **JSON body** are passed through from CHAI (with non-JSON upstream text wrapped as `{ "message": "<text>" }`).

---

## UI error display (browser)

On failure, the UI prefers, in order:

1. `status_message` (string) from the JSON body  
2. `error` (string) from the JSON body  
3. Fetch status text / generic “Request failed”

See `apps/web/src/lib/chai/chai-api-response.ts`.

---

## Reference payload (simulation default)

All scenarios that **do not** use `buildRequestPayload` send:

```json
{
  "user": <ChaiRegistryCardDefinition.user>,
  "organization": <ChaiRegistryCardDefinition.organization>,
  "model_card": <ChaiRegistryCardDefinition.model_card>
}
```

Definitions come from `apps/web/src/data/chai/orbdoc-sample-cards.ts` after `applyOrgModeToCard(template, "orbdoc" | "aidoc")` (`apps/web/src/lib/chai/apply-org-mode.ts`).

### Example: **orbdoc** mode, **heart** card (valid baseline body)

This is the **full** request body for scenario `valid-baseline` when the selected card is **heart** and org mode is **orbdoc**:

```json
{
  "user": {
    "full_name": "Dr. Sarah Chen",
    "email": "sarah.chen@orbdoc.com",
    "role": "ML Engineer"
  },
  "organization": {
    "name": "orbdoc",
    "slug": "orbdoc"
  },
  "model_card": {
    "slug": "orbdoc-heart-disease-predictor-v1",
    "model_name": "Heart Disease Predictor v1",
    "model_developer": "orbdoc",
    "developer_contact": "sarah.chen@orbdoc.com",
    "release_stage": "beta",
    "release_date": "2026-03-15",
    "release_version": "1.0.0",
    "global_availability": "yes",
    "regulatory_approval": "",
    "summary": "A risk prediction model for cardiovascular disease using EHR data. Outputs a 0–100 risk score to support clinical decision-making.",
    "keywords": ["cardiovascular", "risk prediction", "EHR", "clinical decision support"],
    "intended_use_and_workflow": "Used in clinical decision support to flag high-risk patients for follow-up. Integrates with Epic and Cerner EHRs.",
    "primary_intended_users": "Clinicians, care coordinators",
    "how_to_use": "Upload patient demographics and lab results via API or EHR integration. Review risk score and recommended actions in the dashboard.",
    "targeted_patient_population": "Adults 18+ with at least one cardiovascular risk factor",
    "cautioned_out_of_scope_settings": "Not for pediatric use. Not validated for emergency or acute care settings.",
    "known_risks_and_limitations": "May underperform on rare conditions. Performance not validated on non-English-speaking populations.",
    "known_biases_or_ethical_considerations": "Trained on US data; may have bias toward majority populations. Ongoing fairness monitoring.",
    "clinical_risk_level": "medium",
    "outcomes_and_outputs": "Risk score (0–100), recommended follow-up actions",
    "model_type": "classification",
    "foundation_models": "",
    "input_data_source": "EHR data (demographics, labs, vitals)",
    "output_and_input_data_types": "Structured clinical data, numeric risk score",
    "development_data_characterization": "Retrospective dataset from 50 US health systems, 2018–2024",
    "bias_mitigation_approaches": "Reweighting, stratified evaluation",
    "ongoing_maintenance": "Quarterly model updates and monitoring",
    "security": "Data encrypted at rest and in transit. SOC 2 Type II.",
    "transparency": "Model card and evaluation reports publicly available.",
    "funding_source": "Internal R&D",
    "third_party_information": "",
    "stakeholders_consulted": "Cardiologists, primary care physicians, patient advocates",
    "evaluation_references": "",
    "clinical_trial": "",
    "peer_reviewed_publications": "DOI:10.1234/orbdoc.2026.001",
    "reimbursement_status": "",
    "patient_consent_or_disclosure": "Obtained per institutional IRB",
    "bibliography": "Chen et al. (2026). Cardiovascular Risk Prediction in Clinical Practice. Journal of Clinical AI.",
    "ehr_compatibility": ["Epic", "Cerner"],
    "regulatory_compliance": "",
    "key_metrics": {
      "usefulness": {
        "metric_goal": "AUC-ROC ≥ 0.85",
        "results": [
          { "label": "AUC-ROC", "value": { "kind": "single", "value": 0.89 } },
          { "label": "Sensitivity", "value": { "kind": "single", "value": 0.82, "unit": "%" } }
        ],
        "interpretation": "Meets target. Strong discriminative performance.",
        "test_type": "Retrospective",
        "testing_data_description": "Holdout set from 10 health systems",
        "validation_process_and_justification": "5-fold cross-validation, external validation"
      },
      "fairness": {
        "metric_goal": "Demographic parity within 5%",
        "results": [],
        "interpretation": "",
        "test_type": "",
        "testing_data_description": "",
        "validation_process_and_justification": ""
      },
      "safety": {
        "metric_goal": "No critical failures in safety audit",
        "results": [],
        "interpretation": "",
        "test_type": "",
        "testing_data_description": "",
        "validation_process_and_justification": ""
      }
    }
  }
}
```

**Aidoc mode** (same card template): emails use `@aidoc.com`, `organization` is `{ "name": "aidoc", "slug": "aidoc" }`, and slugs starting with `orbdoc-` become `aidoc-` (e.g. `aidoc-heart-disease-predictor-v1`). Other templates (**radiology**, **triage**) swap `user` / `model_card` per `orbdoc-sample-cards.ts` with the same rules.

---

## The 23 test cases (detailed)

For each case: **ID**, **use case**, **request JSON strategy**, **expected HTTP**, **expected API / UI outcome**.

---

### 1. `coalition-chai-v3-baseline` — Coalition · CHAI v3 (featured)

| Field | Value |
|--------|--------|
| **Use case** | **Featured** path: `mashkour@chai.org`, org slug `coalition-for-health-ai`, model card **v3** (`coalition-for-health-ai-public-model-card-v3`). Shown first on `/chai`. |
| **Request JSON** | Full `{ user, organization, model_card }` from `coalitionChaiModelCardV3` (`apps/web/src/data/chai/coalition-chai-v3-card.ts`) after scenario `apply` (default: clone only). |
| **Expected HTTP** | **201** if CHAI accepts the org and slug is new. **409** if that slug already exists for the org. **400** if registry rejects org or schema. |
| **Response body** | CHAI-defined (passed through). |

---

### 2. `valid-baseline` — Valid baseline

| Field | Value |
|--------|--------|
| **Use case** | End-to-end happy path: trusted org, complete model card, valid user. Confirms env vars and CHAI connectivity. |
| **Request JSON** | Reference structure above; **exact** `user` / `organization` / `model_card` depend on selected card + orbdoc/aidoc mode. |
| **Expected HTTP** | **201** if CHAI creates the resource and the slug is new for that org. **409** if the same org + slug already exists. |
| **Response body** | CHAI-defined success or conflict JSON (passed through). May include `status_message` or other fields per registry version. |

---

### 3. `valid-minimal-text-fields` — Valid + shortened text

| Field | Value |
|--------|--------|
| **Use case** | Same shape as baseline; every **string** value longer than 80 characters in `model_card` is truncated to 40 chars + `…`. |
| **Request JSON** | Same as § reference, with long strings shortened (algorithm in `chai-test-scenarios.ts`). |
| **Expected HTTP** | **201** (typical, same as baseline) unless CHAI enforces minimum string lengths. |
| **Response body** | CHAI success payload, or **400** with validation message if min length enforced. |

---

### 4. `proxy-unknown-org` — Proxy: unknown org

| Field | Value |
|--------|--------|
| **Use case** | Organization is not on the proxy whitelist (simulates wrong tenant). |
| **Request JSON** | Same as reference but replace `organization` (and card display context) with: |
| | ```json |
| | "organization": { "name": "acme", "slug": "acme" } |
| | ``` |
| **Expected HTTP** | **400** (proxy — CHAI not called with this org rejection path; actually CHAI is still called only if org passes whitelist — **here org fails first**). |
| **Response body** | `{"error":"Invalid organization: allowed name/slug pairs are <list>"}` (dynamic; includes Coalition, orbdoc, aidoc pairs). |

---

### 5. `proxy-wrong-org-name-casing` — Proxy: name casing typo

| Field | Value |
|--------|--------|
| **Use case** | Slug is correct but **name** must match the allowlist exactly. |
| **Request JSON** | Orbdoc: `{ "name": "OrbDoc", "slug": "orbdoc" }`. Aidoc: `{ "name": "AiDoc", "slug": "aidoc" }`. Coalition: `{ "name": "coalition-for-health-ai", "slug": "coalition-for-health-ai" }`. |
| **Expected HTTP** | **400** |
| **Response body** | Same dynamic `Invalid organization: allowed name/slug pairs...` as case 4. |

---

### 6. `proxy-crossed-org-slug` — Proxy: crossed name/slug

| Field | Value |
|--------|--------|
| **Use case** | Mismatched name/slug pairs across allowed orgs (e.g. aidoc name with orbdoc slug; orbdoc name with coalition slug). |
| **Request JSON** | Orbdoc card: `{ "name": "aidoc", "slug": "orbdoc" }`. Aidoc card: `{ "name": "orbdoc", "slug": "aidoc" }`. Coalition card: `{ "name": "orbdoc", "slug": "coalition-for-health-ai" }`. |
| **Expected HTTP** | **400** |
| **Response body** | Same proxy error as cases 4–5. |

---

### 7. `request-omit-organization` — Request: no `organization` key

| Field | Value |
|--------|--------|
| **Use case** | Client sends a malformed body missing `organization` (proxy contract). |
| **Request JSON** | Custom builder — **no** top-level `organization`: |
| **Expected HTTP** | **400** |
| **Response body** | `{"error":"Expected JSON with user, organization, and model_card"}` |

```json
{
  "user": {
    "full_name": "Dr. Sarah Chen",
    "email": "sarah.chen@orbdoc.com",
    "role": "ML Engineer"
  },
  "model_card": {
    "slug": "orbdoc-heart-disease-predictor-v1",
    "model_name": "Heart Disease Predictor v1",
    "model_developer": "orbdoc",
    "developer_contact": "sarah.chen@orbdoc.com",
    "release_stage": "beta",
    "release_date": "2026-03-15",
    "release_version": "1.0.0",
    "global_availability": "yes",
    "regulatory_approval": "",
    "summary": "A risk prediction model for cardiovascular disease using EHR data. Outputs a 0–100 risk score to support clinical decision-making.",
    "keywords": ["cardiovascular", "risk prediction", "EHR", "clinical decision support"],
    "intended_use_and_workflow": "Used in clinical decision support to flag high-risk patients for follow-up. Integrates with Epic and Cerner EHRs.",
    "primary_intended_users": "Clinicians, care coordinators",
    "how_to_use": "Upload patient demographics and lab results via API or EHR integration. Review risk score and recommended actions in the dashboard.",
    "targeted_patient_population": "Adults 18+ with at least one cardiovascular risk factor",
    "cautioned_out_of_scope_settings": "Not for pediatric use. Not validated for emergency or acute care settings.",
    "known_risks_and_limitations": "May underperform on rare conditions. Performance not validated on non-English-speaking populations.",
    "known_biases_or_ethical_considerations": "Trained on US data; may have bias toward majority populations. Ongoing fairness monitoring.",
    "clinical_risk_level": "medium",
    "outcomes_and_outputs": "Risk score (0–100), recommended follow-up actions",
    "model_type": "classification",
    "foundation_models": "",
    "input_data_source": "EHR data (demographics, labs, vitals)",
    "output_and_input_data_types": "Structured clinical data, numeric risk score",
    "development_data_characterization": "Retrospective dataset from 50 US health systems, 2018–2024",
    "bias_mitigation_approaches": "Reweighting, stratified evaluation",
    "ongoing_maintenance": "Quarterly model updates and monitoring",
    "security": "Data encrypted at rest and in transit. SOC 2 Type II.",
    "transparency": "Model card and evaluation reports publicly available.",
    "funding_source": "Internal R&D",
    "third_party_information": "",
    "stakeholders_consulted": "Cardiologists, primary care physicians, patient advocates",
    "evaluation_references": "",
    "clinical_trial": "",
    "peer_reviewed_publications": "DOI:10.1234/orbdoc.2026.001",
    "reimbursement_status": "",
    "patient_consent_or_disclosure": "Obtained per institutional IRB",
    "bibliography": "Chen et al. (2026). Cardiovascular Risk Prediction in Clinical Practice. Journal of Clinical AI.",
    "ehr_compatibility": ["Epic", "Cerner"],
    "regulatory_compliance": "",
    "key_metrics": {
      "usefulness": {
        "metric_goal": "AUC-ROC ≥ 0.85",
        "results": [
          { "label": "AUC-ROC", "value": { "kind": "single", "value": 0.89 } },
          { "label": "Sensitivity", "value": { "kind": "single", "value": 0.82, "unit": "%" } }
        ],
        "interpretation": "Meets target. Strong discriminative performance.",
        "test_type": "Retrospective",
        "testing_data_description": "Holdout set from 10 health systems",
        "validation_process_and_justification": "5-fold cross-validation, external validation"
      },
      "fairness": {
        "metric_goal": "Demographic parity within 5%",
        "results": [],
        "interpretation": "",
        "test_type": "",
        "testing_data_description": "",
        "validation_process_and_justification": ""
      },
      "safety": {
        "metric_goal": "No critical failures in safety audit",
        "results": [],
        "interpretation": "",
        "test_type": "",
        "testing_data_description": "",
        "validation_process_and_justification": ""
      }
    }
  }
}
```

*(In the UI, other cards/modes substitute their own `user` and `model_card` — still without `organization`.)*

---

### 8. `request-user-not-object` — Request: `user` is a string

| Field | Value |
|--------|--------|
| **Use case** | `user` is not an object; exercises CHAI (and possibly future proxy) validation. |
| **Request JSON** | |
| **Expected HTTP** | **400** from CHAI (typical). Could be **422** if CHAI uses that for validation. |
| **Response body** | CHAI validation message (passed through). |

```json
{
  "user": "not-an-object",
  "organization": {
    "name": "orbdoc",
    "slug": "orbdoc"
  },
  "model_card": {
    "slug": "orbdoc-heart-disease-predictor-v1",
    "model_name": "Heart Disease Predictor v1",
    "model_developer": "orbdoc",
    "developer_contact": "sarah.chen@orbdoc.com",
    "release_stage": "beta",
    "release_date": "2026-03-15",
    "release_version": "1.0.0",
    "global_availability": "yes",
    "regulatory_approval": "",
    "summary": "A risk prediction model for cardiovascular disease using EHR data. Outputs a 0–100 risk score to support clinical decision-making.",
    "keywords": ["cardiovascular", "risk prediction", "EHR", "clinical decision support"],
    "intended_use_and_workflow": "Used in clinical decision support to flag high-risk patients for follow-up. Integrates with Epic and Cerner EHRs.",
    "primary_intended_users": "Clinicians, care coordinators",
    "how_to_use": "Upload patient demographics and lab results via API or EHR integration. Review risk score and recommended actions in the dashboard.",
    "targeted_patient_population": "Adults 18+ with at least one cardiovascular risk factor",
    "cautioned_out_of_scope_settings": "Not for pediatric use. Not validated for emergency or acute care settings.",
    "known_risks_and_limitations": "May underperform on rare conditions. Performance not validated on non-English-speaking populations.",
    "known_biases_or_ethical_considerations": "Trained on US data; may have bias toward majority populations. Ongoing fairness monitoring.",
    "clinical_risk_level": "medium",
    "outcomes_and_outputs": "Risk score (0–100), recommended follow-up actions",
    "model_type": "classification",
    "foundation_models": "",
    "input_data_source": "EHR data (demographics, labs, vitals)",
    "output_and_input_data_types": "Structured clinical data, numeric risk score",
    "development_data_characterization": "Retrospective dataset from 50 US health systems, 2018–2024",
    "bias_mitigation_approaches": "Reweighting, stratified evaluation",
    "ongoing_maintenance": "Quarterly model updates and monitoring",
    "security": "Data encrypted at rest and in transit. SOC 2 Type II.",
    "transparency": "Model card and evaluation reports publicly available.",
    "funding_source": "Internal R&D",
    "third_party_information": "",
    "stakeholders_consulted": "Cardiologists, primary care physicians, patient advocates",
    "evaluation_references": "",
    "clinical_trial": "",
    "peer_reviewed_publications": "DOI:10.1234/orbdoc.2026.001",
    "reimbursement_status": "",
    "patient_consent_or_disclosure": "Obtained per institutional IRB",
    "bibliography": "Chen et al. (2026). Cardiovascular Risk Prediction in Clinical Practice. Journal of Clinical AI.",
    "ehr_compatibility": ["Epic", "Cerner"],
    "regulatory_compliance": "",
    "key_metrics": {
      "usefulness": {
        "metric_goal": "AUC-ROC ≥ 0.85",
        "results": [
          { "label": "AUC-ROC", "value": { "kind": "single", "value": 0.89 } },
          { "label": "Sensitivity", "value": { "kind": "single", "value": 0.82, "unit": "%" } }
        ],
        "interpretation": "Meets target. Strong discriminative performance.",
        "test_type": "Retrospective",
        "testing_data_description": "Holdout set from 10 health systems",
        "validation_process_and_justification": "5-fold cross-validation, external validation"
      },
      "fairness": {
        "metric_goal": "Demographic parity within 5%",
        "results": [],
        "interpretation": "",
        "test_type": "",
        "testing_data_description": "",
        "validation_process_and_justification": ""
      },
      "safety": {
        "metric_goal": "No critical failures in safety audit",
        "results": [],
        "interpretation": "",
        "test_type": "",
        "testing_data_description": "",
        "validation_process_and_justification": ""
      }
    }
  }
}
```

---

### 9. `request-empty-object` — Request: empty JSON `{}`

| Field | Value |
|--------|--------|
| **Use case** | Completely empty body; proxy validation. |
| **Request JSON** | `{}` |
| **Expected HTTP** | **400** |
| **Response body** | `{"error":"Expected JSON with user, organization, and model_card"}` |

```json
{}
```

---

### 10. `user-empty-email` — User: empty email

| Field | Value |
|--------|--------|
| **Use case** | `user.email` and `model_card.developer_contact` set to `""`. |
| **Request JSON** | Reference payload with: `"user": { ..., "email": "" }` and `"developer_contact": ""`. |
| **Expected HTTP** | **400** (typical) from CHAI for invalid/empty email. |
| **Response body** | CHAI validation (passed through). |

---

### 11. `user-invalid-email` — User: invalid email

| Field | Value |
|--------|--------|
| **Use case** | Malformed email on user and developer contact. |
| **Request JSON** | `"user.email": "not-an-email"`, `"model_card.developer_contact": "not-an-email"` (other fields = reference). |
| **Expected HTTP** | **400** from CHAI. |
| **Response body** | CHAI validation (passed through). |

---

### 12. `user-empty-full-name` — User: empty full name

| Field | Value |
|--------|--------|
| **Use case** | `user.full_name` is `""`. |
| **Request JSON** | Reference with `"full_name": ""`. |
| **Expected HTTP** | **201** or **400** depending on whether CHAI requires non-empty `full_name`. |
| **Response body** | Success JSON or validation error. |

---

### 13. `model-missing-slug` — Model: missing `slug`

| Field | Value |
|--------|--------|
| **Use case** | `model_card` without required `slug`. |
| **Request JSON** | Reference `model_card` **with the `slug` property omitted** (all other fields unchanged). |
| **Expected HTTP** | **400** from CHAI. |
| **Response body** | CHAI “missing required field” style message (wording varies by version). |

---

### 14. `model-missing-summary` — Model: missing `summary`

| Field | Value |
|--------|--------|
| **Use case** | `model_card` without `summary`. |
| **Request JSON** | Reference `model_card` without `summary`. |
| **Expected HTTP** | **400** from CHAI. |
| **Response body** | CHAI validation (passed through). |

---

### 15. `model-empty-object` — Model: `model_card` is `{}`

| Field | Value |
|--------|--------|
| **Use case** | All required fields absent. |
| **Request JSON** | `{ "user": <ref user>, "organization": <ref org>, "model_card": {} }` |
| **Expected HTTP** | **400** from CHAI. |
| **Response body** | CHAI validation (passed through). |

---

### 16. `slug-with-spaces` — Slug: spaces (invalid)

| Field | Value |
|--------|--------|
| **Use case** | Slug violates typical rules (lowercase, numbers, hyphens). |
| **Request JSON** | Reference with `"model_card.slug": "bad slug with spaces"`. |
| **Expected HTTP** | **400** from CHAI. |
| **Response body** | CHAI validation (passed through). |

---

### 17. `slug-uppercase` — Slug: UPPERCASE

| Field | Value |
|--------|--------|
| **Use case** | Slug uppercased from current value (e.g. `ORBDOC-HEART-DISEASE-PREDICTOR-V1` for heart orbdoc). |
| **Request JSON** | Reference with `slug` = uppercase of template slug. |
| **Expected HTTP** | **400** from CHAI (if slug format enforced). |
| **Response body** | CHAI validation (passed through). |

---

### 18. `types-clinical-risk-number` — Types: `clinical_risk_level` number

| Field | Value |
|--------|--------|
| **Use case** | `clinical_risk_level` is number `2` instead of string enum-like value. |
| **Request JSON** | Reference with `"clinical_risk_level": 2`. |
| **Expected HTTP** | **400** if CHAI schema expects string only; **201** if coerced/accepted. |
| **Response body** | CHAI-dependent. |

---

### 19. `types-key-metrics-string` — Types: `key_metrics` string

| Field | Value |
|--------|--------|
| **Use case** | `key_metrics` replaced by string `"invalid"`. |
| **Request JSON** | Reference with `"key_metrics": "invalid"`. |
| **Expected HTTP** | **400** from CHAI. |
| **Response body** | CHAI validation (passed through). |

---

### 20. `payload-huge-summary` — Payload: huge summary

| Field | Value |
|--------|--------|
| **Use case** | `summary` extended by **25,000** `"x"` characters (size / timeout / gateway limits). |
| **Request JSON** | Reference with `summary` = original summary + `"x".repeat(25000)`. |
| **Expected HTTP** | **201**, **400**, **413**, **500**, or timeouts — depends on CHAI and reverse proxy. |
| **Response body** | Variable. |

---

### 21. `visual-xss-ish-model-name` — Visual: HTML in model name

| Field | Value |
|--------|--------|
| **Use case** | XSS-style string in `model_name`; UI must render text only. |
| **Request JSON** | Reference with `"model_name": "Test <img src=x onerror=\"alert(1)\">"`. |
| **Expected HTTP** | **201** or **400** depending on CHAI sanitization/rejection. |
| **Response body** | CHAI-dependent. **UI:** no script execution. |

---

### 22. `sql-ish-summary-string` — String: SQL-ish summary

| Field | Value |
|--------|--------|
| **Use case** | Summary contains quotes and SQL-like text; checks encoding in JSON preview and CHAI handling. |
| **Request JSON** | Reference with `summary` prefixed by: `'; DROP TABLE users; -- ` + first 80 chars of original summary. |
| **Expected HTTP** | **201** typical if other fields valid. |
| **Response body** | CHAI success or validation error. |

---

### 23. `duplicate-slug-collider` — 409 hint: fixed slug

| Field | Value |
|--------|--------|
| **Use case** | Forces a **fixed** slug per org so repeated publishes hit uniqueness rules. |
| **Request JSON** | Reference but `model_card.slug` = **`orbdoc-chai-collision-lab`** if `organization.slug === "orbdoc"`, else **`aidoc-chai-collision-lab`**. |
| **Expected HTTP** | First success: **201**. Second create same org+slug: **409** if CHAI enforces uniqueness. |
| **Response body** | CHAI conflict payload (passed through); may include `status_message`. |

Example (orbdoc):

```json
{
  "user": {
    "full_name": "Dr. Sarah Chen",
    "email": "sarah.chen@orbdoc.com",
    "role": "ML Engineer"
  },
  "organization": {
    "name": "orbdoc",
    "slug": "orbdoc"
  },
  "model_card": {
    "slug": "orbdoc-chai-collision-lab",
    "model_name": "Heart Disease Predictor v1",
    "model_developer": "orbdoc",
    "developer_contact": "sarah.chen@orbdoc.com",
    "release_stage": "beta",
    "release_date": "2026-03-15",
    "release_version": "1.0.0",
    "global_availability": "yes",
    "regulatory_approval": "",
    "summary": "A risk prediction model for cardiovascular disease using EHR data. Outputs a 0–100 risk score to support clinical decision-making.",
    "keywords": ["cardiovascular", "risk prediction", "EHR", "clinical decision support"],
    "intended_use_and_workflow": "Used in clinical decision support to flag high-risk patients for follow-up. Integrates with Epic and Cerner EHRs.",
    "primary_intended_users": "Clinicians, care coordinators",
    "how_to_use": "Upload patient demographics and lab results via API or EHR integration. Review risk score and recommended actions in the dashboard.",
    "targeted_patient_population": "Adults 18+ with at least one cardiovascular risk factor",
    "cautioned_out_of_scope_settings": "Not for pediatric use. Not validated for emergency or acute care settings.",
    "known_risks_and_limitations": "May underperform on rare conditions. Performance not validated on non-English-speaking populations.",
    "known_biases_or_ethical_considerations": "Trained on US data; may have bias toward majority populations. Ongoing fairness monitoring.",
    "clinical_risk_level": "medium",
    "outcomes_and_outputs": "Risk score (0–100), recommended follow-up actions",
    "model_type": "classification",
    "foundation_models": "",
    "input_data_source": "EHR data (demographics, labs, vitals)",
    "output_and_input_data_types": "Structured clinical data, numeric risk score",
    "development_data_characterization": "Retrospective dataset from 50 US health systems, 2018–2024",
    "bias_mitigation_approaches": "Reweighting, stratified evaluation",
    "ongoing_maintenance": "Quarterly model updates and monitoring",
    "security": "Data encrypted at rest and in transit. SOC 2 Type II.",
    "transparency": "Model card and evaluation reports publicly available.",
    "funding_source": "Internal R&D",
    "third_party_information": "",
    "stakeholders_consulted": "Cardiologists, primary care physicians, patient advocates",
    "evaluation_references": "",
    "clinical_trial": "",
    "peer_reviewed_publications": "DOI:10.1234/orbdoc.2026.001",
    "reimbursement_status": "",
    "patient_consent_or_disclosure": "Obtained per institutional IRB",
    "bibliography": "Chen et al. (2026). Cardiovascular Risk Prediction in Clinical Practice. Journal of Clinical AI.",
    "ehr_compatibility": ["Epic", "Cerner"],
    "regulatory_compliance": "",
    "key_metrics": {
      "usefulness": {
        "metric_goal": "AUC-ROC ≥ 0.85",
        "results": [
          { "label": "AUC-ROC", "value": { "kind": "single", "value": 0.89 } },
          { "label": "Sensitivity", "value": { "kind": "single", "value": 0.82, "unit": "%" } }
        ],
        "interpretation": "Meets target. Strong discriminative performance.",
        "test_type": "Retrospective",
        "testing_data_description": "Holdout set from 10 health systems",
        "validation_process_and_justification": "5-fold cross-validation, external validation"
      },
      "fairness": {
        "metric_goal": "Demographic parity within 5%",
        "results": [],
        "interpretation": "",
        "test_type": "",
        "testing_data_description": "",
        "validation_process_and_justification": ""
      },
      "safety": {
        "metric_goal": "No critical failures in safety audit",
        "results": [],
        "interpretation": "",
        "test_type": "",
        "testing_data_description": "",
        "validation_process_and_justification": ""
      }
    }
  }
}
```

---

## Quick reference: status codes by scenario

| # | Scenario ID | Typical status | Layer |
|---|-------------|----------------|--------|
| 1 | `coalition-chai-v3-baseline` | 201 / 409 / 400 | CHAI |
| 2 | `valid-baseline` | 201 / 409 | CHAI |
| 3 | `valid-minimal-text-fields` | 201 (or 400) | CHAI |
| 4 | `proxy-unknown-org` | 400 | Proxy |
| 5 | `proxy-wrong-org-name-casing` | 400 | Proxy |
| 6 | `proxy-crossed-org-slug` | 400 | Proxy |
| 7 | `request-omit-organization` | 400 | Proxy |
| 8 | `request-user-not-object` | 400 / 422 | CHAI |
| 9 | `request-empty-object` | 400 | Proxy |
| 10 | `user-empty-email` | 400 | CHAI |
| 11 | `user-invalid-email` | 400 | CHAI |
| 12 | `user-empty-full-name` | 201 / 400 | CHAI |
| 13 | `model-missing-slug` | 400 | CHAI |
| 14 | `model-missing-summary` | 400 | CHAI |
| 15 | `model-empty-object` | 400 | CHAI |
| 16 | `slug-with-spaces` | 400 | CHAI |
| 17 | `slug-uppercase` | 400 | CHAI |
| 18 | `types-clinical-risk-number` | 400 / 201 | CHAI |
| 19 | `types-key-metrics-string` | 400 | CHAI |
| 20 | `payload-huge-summary` | varies | CHAI / gateway |
| 21 | `visual-xss-ish-model-name` | 201 / 400 | CHAI |
| 22 | `sql-ish-summary-string` | 201 (typical) | CHAI |
| 23 | `duplicate-slug-collider` | 201 then 409 | CHAI |

**Note:** CHAI response **codes and JSON fields** are not hardcoded in Hanfani; they are **forwarded** from the registry. Use this matrix for simulation expectations; confirm exact messages against your CHAI API version.

---

## Maintenance

When adding or changing scenarios in `chai-test-scenarios.ts`, update this file and [CHAI_TEST_SCENARIOS.md](./CHAI_TEST_SCENARIOS.md) accordingly.
