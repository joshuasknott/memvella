# Terminology

Status: canonical
Scope: root
Last reviewed: 2026-04-04
Owners: product, engineering
Read when: touching UI copy, docs, onboarding, or marketing
Depends on: docs/product.md

## Principle

Use one name for each concept. Do not introduce parallel labels for the same role or flow unless there is an explicit migration plan.

## Canonical Product Terms

| Concept | Preferred term | Notes |
| --- | --- | --- |
| Shared family space | `Circle` | Current core product term for the shared space |
| Family-side operator | `Supporter` | Preferred term for docs and new copy |
| Assisted tablet user | `Assisted Senior` | Device is paired by someone else |
| Self-managing user | `Independent Senior` | Uses passwordless sign-in and voice-driven creation |
| Memvella itself | `digital wellness companion` or `companion` | Avoid medical framing |

## Transitional Terms In The Current Codebase

- `Admin` currently appears in parts of `apps/core`.
- Treat `Admin` as a transitional implementation label, not as a separate role.
- Do not introduce new `Admin` strings into docs unless the work is specifically documenting current implementation drift.

## Avoid In Generic Product Copy

- `caregiver`
- `care circle`
- `loved one`
- `patient`
- `sufferer`
- `dementia` as a broad UI label

These words may appear only when they are legally, clinically, or historically necessary.

## Copy Rules

- Prefer direct, concrete phrasing over sentimental phrasing.
- Use `Circle` consistently instead of mixing `family space`, `group`, and `network`.
- Use `Supporter` in new product docs and new product copy unless a dedicated terminology review changes that decision.
- Keep role names consistent across onboarding, settings, and error states.

## Open Decision To Revisit

- Whether shipped UI should fully replace `Admin` with `Supporter` across `apps/core`
