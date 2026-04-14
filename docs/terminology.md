# Terminology

Status: canonical
Scope: root
Last reviewed: 2026-04-14
Owners: product, engineering
Read when: touching UI copy, docs, routes, schema names, or onboarding
Depends on: docs/product.md

## Principle

Use one name for each concept. Do not introduce parallel labels for the same role, entity, or flow unless there is an explicit migration step in `docs/legacy-removal.md`.

## Canonical Product Terms

| Concept | Preferred term | Notes |
| --- | --- | --- |
| Shared family-side workspace | `Circle` | The shared workspace for Organisers and Members |
| Human participant in a Circle | `Circle participant` | Generic label when the role does not matter |
| Administrative Circle role | `Organiser` | Can manage invite codes, pairing, notifications, people, and routines |
| Lightweight Circle role | `Member` | Helps with memories and stays informed without owning organiser-only settings |
| Senior-grounding person | `Person` | Used for memory context and companion grounding, not for Circle membership |
| Assisted senior using a linked tablet | `Tablet User` | Senior-facing assisted experience |
| Self-managing senior | `Independent User` | Standalone senior experience |
| Urgent actionable item | `Alert` | Stored separately from insights, but currently reviewed inside `/circle/insights` |
| Non-urgent summary or follow-up | `Insight` | Organiser-facing review queue item |
| Shared event history | `Activity` | Reserved term; no dedicated shipped activity surface yet |
| Memvella itself | `digital wellness companion` or `companion` | Avoid medical framing |

## Canonical Internal Terms

- Use `circle` instead of `familySpace`.
- Use `circleMembership` instead of `familySpaceMembership`.
- Use `organiser` instead of `supporter` or `admin`.
- Use `people` for senior-grounding people.
- Use `alerts` and `insights` for the stored awareness tables.
- `family_side` is still used in some internal helper code as a shorthand for the organiser/member role family. It is not product copy and should not become a route, table, or visible label.

## Retired Terms

- `Admin`
- `Supporter`
- `FamilySpace`
- `familyMembers`
- `Personal Profile`
- `Connection Code`

These terms should appear only when documenting legacy cleanup or historical implementation details.

## Product Copy Rules

- Prefer direct, concrete phrasing over sentimental phrasing.
- Use `Circle` consistently instead of mixing `family space`, `group`, and `network`.
- Use `Organiser`, `Member`, `Tablet User`, and `Independent User` consistently in product UI and docs.
- Keep role names stable across onboarding, settings, auth, and error states.
- Do not describe senior-grounding `People` as Circle participants.
- Do not label the combined `/circle/insights` queue as an `Activity` feed.

## Product Copy To Avoid

- `caregiver`
- `care circle`
- `loved one`
- `patient`
- `sufferer`
- `dementia` as a broad product label

These terms may appear only when legally, clinically, or historically necessary.
