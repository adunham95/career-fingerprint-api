## PR Title Format (Required)

Your PR title **must follow Conventional Commit format**, because our release automation
(semantic-release) uses the title to determine version bumps and generate changelogs.

**Format**

**Examples**

- `feat: add new meeting prep flow`
- `fix: correct timezone handling for reminders`
- `chore: update dependencies`
- `refactor: simplify goal matching logic`
- `docs: update README for setup instructions`

**Allowed Types**

- `feat` — new user-facing feature
- `fix` — bug fix
- `chore` — tooling/config changes
- `refactor` — code changes not affecting behavior
- `docs` — documentation only
- `perf` — performance improvements
- `test` — adding or updating tests
- `ci` — CI/CD pipeline changes
- `style` — formatting or lint-only changes

> **Important:**  
> Do not include emojis, ticket numbers, or prefixes like “WIP”.  
> PR titles must be clean and descriptive.
