# Architecture Decision Records (ADR)

## What is an ADR?
An Architecture Decision Record (ADR) is a short document stored in the project repository that captures a significant architectural decision, explaining the context, options considered, final decision, and resulting consequences.

---

## Filename Conventions and Storage

### Storage Directory
All ADR documents must be stored in the codebase repository under:
`docs/adr/`

### File Naming Format
Files should be named using a sequential three-digit number followed by a short title in kebab-case:

`XXX-short-title.md`

#### Examples:
* `docs/adr/001-switch-to-typescript.md`
* `docs/adr/002-change-frontend-framework.md`

---

## How to Create an ADR

1. **Identify the Need:** Create an ADR whenever a significant architectural decision, technology selection, or structural modification is proposed or decided.
2. **Use the Standard Template:** Copy the standard structure outlined below into your new Markdown file.
3. **Be Concise:** Focus on clarity, trade-offs, and reasoning rather than length.
4. **Include Rejected Options:** Always list alternatives that were evaluated and rejected along with reasons why.
5. **Update Status Over Time:** If a decision is superseded later by a new choice, update the original ADR status to `Superseded` and link to the new ADR.

---

## ADR Template

```markdown
# ADR [NUMBER]: [TITLE]

* **Status:** [Proposed | Accepted | Rejected | Superseded]
* **Superseded decision:** [ADR reference if needed]
* **Date:** [DD-MM-YYYY]
* **Authors:** [Names]

## Context
Describe the problem, operational need, or architectural requirement that triggered this decision.

## Options Considered
* **Option 1:** [Description]
  * **Pros:** [Positive aspects]
  * **Cons:** [Negative aspects]
* **Option 2:** [Description]
  * **Pros:** [Positive aspects]
  * **Cons:** [Negative aspects]

## Decision
State the chosen option (or decision to reject all/stick with existing solution) and provide the justification for this choice.

## Consequences
* **Positive:** [Positive outcomes and impacts]
* **Negative / Risks:** [Trade-offs, limitations, or technical debt incurred]