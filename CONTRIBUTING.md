
---

### 📄 `CONTRIBUTING.md` Content

```markdown
# 🤝 Contributing to TrendAnalyst AI

First off, thank you for considering contributing to this open-source project! We are following a strict **"One Feature a Day"** delivery model to maintain high momentum and code quality.

---

## 🚀 The Daily Workflow
To ensure we maintain a high "index of product usage" and clean versioning, please follow this cycle:

1. **Find a Ticket:** Check the [GitHub Project Board](https://github.com/users/azizmashkour/projects/3).
2. **Assign Yourself:** Move the ticket to **In Progress**.
3. **Branching:** Use the convention `feat/#issue-id-short-description` (e.g., `feat/#2-google-trends-api`).
4. **Document First:** Before coding, ensure the `docs/` folder reflects the feature's logic.
5. **PR & Link:** When opening a Pull Request, you **must** link it to the issue by adding `Closes #ID` in the description.
6. **Merge & Close:** Once the PR is merged, the ticket will automatically close.

---

## 📝 Coding Standards & Best Practices

### 1. Clear JSDoc (Frontend)
Every React component or utility in `apps/web` must be documented. We use JSDoc to make the code self-explanatory for new contributors.

```javascript
/**
 * @name TrendList
 * @description Renders a categorized list of Google Trends.
 * @param {Array} trends - Array of trend objects.
 * @param {string} mode - 'dark' | 'light' theme toggle.
 */

```

### 2. FastAPI Type Hints (Backend)

The backend must use Python type hints and Pydantic models. This ensures our **Swagger API documentation** (available at `/docs`) is always accurate and "self-healing."

### 3. Localization (i18n)

Since we support **English & French**, do not hardcode strings in the UI. Use the internationalization files provided in `apps/web/locales`.

### 4. Versioning & MIT License

We use Semantic Versioning (SemVer). Every feature merge will result in a version bump (e.g., `0.1.0` -> `0.2.0`). All contributions fall under the **MIT License**.

---

## 🐳 Development Environment

We use **Docker** to ensure the environment is identical for everyone.

* Run `docker-compose up` to start the full stack.
* Use `pnpm` for all frontend package management.

## 🛠️ Definition of Done (DoD)

A feature is only considered "Delivered" if:

* [ ] User Story is satisfied.
* [ ] JSDoc/Docstrings are present.
* [ ] Feature documentation is updated in `/docs`.
* [ ] Dark/Light mode is verified.
* [ ] All tests pass in CI/CD.