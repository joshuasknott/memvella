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
| Circle creator and manager | `Organiser` | Creates the Circle, manages settings, and sends invitations |
| Family or friend invited into a Circle | `Member` | Joins an existing Circle to help out and stay connected |
| Assisted senior using a linked tablet | `Tablet User` | Replaces the vague connection-code persona label |
| Self-managing senior | `Independent User` | Creates and manages their own profile independently |
| Memvella itself | `digital wellness companion` or `companion` | Avoid medical framing |

## Transitional Terms In The Current Codebase

- `Admin` should only appear when documenting a historical implementation detail.
- `Supporter` now survives mainly in legacy route, module, API, and table names that have not been broadly renamed yet.
- The backend schema now stores `organiser`, `member`, and `independent_senior`, while still allowing legacy `supporter` rows during the migration window.
- `Personal Profile` and `Connection Code` are legacy onboarding labels and should not be reused.

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
- Use `Organiser`, `Member`, `Tablet User`, and `Independent User` in new product docs and new product copy.
- Keep role names consistent across onboarding, settings, and error states.

## Current Gap

- The shipped codebase still has legacy `supporter` implementation names in some routes, modules, and tables.
