# CHAI Open API — UI test scenarios

This document lists every automated test case available on the **CHAI Open API** page (`/chai`) in the Hanfani web app. The canonical definitions (including payload transforms) live in source:

`apps/web/src/lib/chai/chai-test-scenarios.ts` (`CHAI_TEST_SCENARIOS`).

**Full simulation spec (JSON + HTTP codes):** [CHAI_USE_CASES_TEST_SIMULATION.md](./CHAI_USE_CASES_TEST_SIMULATION.md)

Scenarios are ordered: happy paths → Next.js proxy failures → malformed request bodies → registry / schema issues.

**Legend**

- **Default request body** — `{ user, organization, model_card }` derived from the card + scenario `apply()`.
- **Custom request body** — scenario supplies `buildRequestPayload`; the modal and `POST` use that shape instead.

---

## 1. Coalition · CHAI v3 (featured)

| | |
|---|---|
| **ID** | `coalition-chai-v3-baseline` |
| **Custom request body** | No |

### How to test

Featured full-width card first on `/chai`: **mashkour@chai.org**, organization slug **coalition-for-health-ai** (Coalition for Health AI), model card **v3** (`coalition-for-health-ai-public-model-card-v3`). Open **Review & publish** on that card and submit.

### Expected result

HTTP 201 if CHAI accepts the org and slug is new. HTTP 409 if that slug already exists. HTTP 400 if the registry rejects the org or schema.

---

## 2. Valid baseline

| | |
|---|---|
| **ID** | `valid-baseline` |
| **Custom request body** | No |

### How to test

Unmodified payload after org mode (orbdoc.com / aidoc.com). Open Review & publish on any card and submit.

Use to confirm env vars and registry connectivity for orbdoc/aidoc cards.

### Expected result

HTTP 201 if the slug is new and CHAI accepts the full model card. HTTP 409 if that slug already exists for that org.

---

## 3. Valid + shortened text

| | |
|---|---|
| **ID** | `valid-minimal-text-fields` |
| **Custom request body** | No |

### How to test

All required fields still present but many long strings trimmed to short placeholders. Good sanity check that minimal text still validates.

### Expected result

Usually 201 like baseline, unless the registry enforces minimum length on specific fields.

---

## 4. Proxy: unknown org

| | |
|---|---|
| **ID** | `proxy-unknown-org` |
| **Custom request body** | No |

### How to test

Organization switched to acme/acme. Our Next route only allows Coalition for Health AI, orbdoc, and aidoc (exact name/slug pairs).

Check the org badge and Organization section — they should show acme.

### Expected result

HTTP 400 from `/api/chai/public-model-cards` with an error about allowed organizations.

---

## 5. Proxy: name casing typo

| | |
|---|---|
| **ID** | `proxy-wrong-org-name-casing` |
| **Custom request body** | No |

### How to test

Wrong **name** for a correct **slug**: OrbDoc/orbdoc, AiDoc/aidoc, or `coalition-for-health-ai` as name instead of `Coalition for Health AI` on the coalition card. Whitelist requires an exact pair match.

### Expected result

HTTP 400 — invalid organization from the proxy.

---

## 6. Proxy: crossed name/slug

| | |
|---|---|
| **ID** | `proxy-crossed-org-slug` |
| **Custom request body** | No |

### How to test

Mismatched pairs: aidoc/orbdoc, orbdoc/aidoc, or orbdoc name with coalition slug on the featured card. Should fail whitelist matching.

### Expected result

HTTP 400 from the proxy.

---

## 7. Request: no organization key

| | |
|---|---|
| **ID** | `request-omit-organization` |
| **Custom request body** | Yes — `{ user, model_card }` only |

### How to test

Card UI still lists org for context, but the JSON body omits `organization` entirely (invalid per our proxy).

Preview modal must not show an organization property.

### Expected result

HTTP 400 — Expected JSON with user, organization, and model_card.

---

## 8. Request: user is a string

| | |
|---|---|
| **ID** | `request-user-not-object` |
| **Custom request body** | Yes — `user` is the string `"not-an-object"` |

### How to test

Body sends `user` as a plain string instead of an object. Proxy forwards to CHAI; CHAI should reject shape.

### Expected result

Often HTTP 400 from CHAI (invalid payload) or 400 from proxy if you add validation later.

---

## 9. Request: empty JSON `{}`

| | |
|---|---|
| **ID** | `request-empty-object` |
| **Custom request body** | Yes — `{}` |

### How to test

Sends an empty object. Exercises proxy body validation.

### Expected result

HTTP 400 — missing user, organization, model_card.

---

## 10. User: empty email

| | |
|---|---|
| **ID** | `user-empty-email` |
| **Custom request body** | No |

### How to test

`user.email` is an empty string. Often fails email validation upstream.

### Expected result

Typically HTTP 400 from CHAI (invalid email).

---

## 11. User: invalid email

| | |
|---|---|
| **ID** | `user-invalid-email` |
| **Custom request body** | No |

### How to test

Email without a valid structure (no proper domain).

### Expected result

HTTP 400 from CHAI for invalid email.

---

## 12. User: empty full name

| | |
|---|---|
| **ID** | `user-empty-full-name` |
| **Custom request body** | No |

### How to test

Clears `full_name`. Some APIs require a non-empty display name.

### Expected result

May be 400 from CHAI if full_name is required.

---

## 13. Model: missing slug

| | |
|---|---|
| **ID** | `model-missing-slug` |
| **Custom request body** | No |

### How to test

Removes `model_card.slug` — required in CHAI public API docs.

### Expected result

HTTP 400 from CHAI (missing required field).

---

## 14. Model: missing summary

| | |
|---|---|
| **ID** | `model-missing-summary` |
| **Custom request body** | No |

### How to test

Removes `summary` (required in sample schema).

### Expected result

HTTP 400 from CHAI.

---

## 15. Model: empty model_card `{}`

| | |
|---|---|
| **ID** | `model-empty-object` |
| **Custom request body** | No |

### How to test

Replaces `model_card` with an empty object — loses all required fields.

### Expected result

HTTP 400 from CHAI.

---

## 16. Slug: spaces (invalid)

| | |
|---|---|
| **ID** | `slug-with-spaces` |
| **Custom request body** | No |

### How to test

Slug rules: lowercase, numbers, hyphens only. Spaces should fail validation.

### Expected result

HTTP 400 from CHAI for invalid slug format.

---

## 17. Slug: UPPERCASE

| | |
|---|---|
| **ID** | `slug-uppercase` |
| **Custom request body** | No |

### How to test

Slug uses uppercase letters — typically invalid vs slug rules in the doc.

### Expected result

HTTP 400 from CHAI.

---

## 18. Types: clinical_risk_level number

| | |
|---|---|
| **ID** | `types-clinical-risk-number` |
| **Custom request body** | No |

### How to test

`clinical_risk_level` set to number `2` instead of string medium/low/etc.

### Expected result

May be 400 from CHAI if schema expects string only.

---

## 19. Types: key_metrics string

| | |
|---|---|
| **ID** | `types-key-metrics-string` |
| **Custom request body** | No |

### How to test

Replaces `key_metrics` object with a string — invalid nested shape.

### Expected result

HTTP 400 from CHAI.

---

## 20. Payload: huge summary

| | |
|---|---|
| **ID** | `payload-huge-summary` |
| **Custom request body** | No |

### How to test

Summary padded to ~25k extra characters. Tests limits / timeouts / payload size (switching to this tab may take a moment).

### Expected result

May hang, return 413, 400, or 500 depending on gateway and CHAI limits.

---

## 21. Visual: HTML in model name

| | |
|---|---|
| **ID** | `visual-xss-ish-model-name` |
| **Custom request body** | No |

### How to test

Model name contains angle brackets. Should render as plain text in the card (no script execution). Submit may still succeed or fail depending on registry.

### Expected result

UI: literal text only. Publish: 201 or 400 depending on CHAI sanitization.

---

## 22. String: SQL-ish summary

| | |
|---|---|
| **ID** | `sql-ish-summary-string` |
| **Custom request body** | No |

### How to test

Summary contains quotes and SQL-like fragments to visually confirm encoding in JSON preview.

### Expected result

Usually still 201 if other fields valid — tests how CHAI handles special characters.

---

## 23. 409 hint: fixed slug

| | |
|---|---|
| **ID** | `duplicate-slug-collider` |
| **Custom request body** | No |

### How to test

Forces every card to use the same slug for its org (`orbdoc-chai-collision-lab` or `aidoc-chai-collision-lab`). Publish the same org twice (two cards) or repeat Publish on one card to chase HTTP 409 slug conflict from CHAI.

### Expected result

First publish may succeed (201). Second with same org+slug should be 409 if the registry enforces uniqueness.

---

## Related

- [CHAI_API_DOC.md](./CHAI_API_DOC.md) — public model cards API
- **Run all test cases** — runs every scenario once against cardiovascular · orbdoc in the UI.
- **Run all instances** — runs the selected scenario against all six model × org combinations.
