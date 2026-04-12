# Terminology

Status: canonical
Scope: root
Last reviewed: 2026-04-12
Owners: product, engineering
Read when: touching UI copy, docs, routes, schema names, onboarding, or marketing
Depends on: docs/product.md

## Principle

Use one name for each concept. Do not introduce parallel labels for the same role, entity, or flow unless there is an explicit migration plan.

## Canonical Product Terms

| Concept | Preferred term | Notes |
| --- | --- | --- |
| Shared family-side workspace | `Circle` | The shared workspace for Organisers and Members |
| Human participant in a Circle | `Circle participant` | Generic label when the role does not matter |
| Administrative Circle role | `Organiser` | Can manage settings, invites, pairing, people, and routines |
| Lightweight Circle role | `Member` | Helps with memories and stays informed without owning admin surfaces |
| Senior-grounding person | `Person` | Used for memory context and companion grounding, not for Circle membership |
| Assisted senior using a linked device | `Tablet User` | Senior-facing assisted experience |
| Self-managing senior | `Independent User` | Standalone senior experience |
| Urgent actionable event | `Alert` | Organiser-directed by default |
| Non-urgent tracking and follow-up context | `Insight` | Separate from alerts |
| Shared event stream | `Activity` | Circle-level visibility surface |
| Memvella itself | `digital wellness companion` or `companion` | Avoid medical framing |

## Canonical Internal Terms

- Use `circle` instead of `familySpace`.
- Use `circleMembership` instead of `familySpaceMembership`.
- Use `organiser` instead of `supporter` or `admin`.
- Use `people` for senior-grounding people.
- Use `alerts`, `insights`, and `activity` as separate concepts.
- Do not use blind bulk-rewrite scripts to rename terms across the codebase. Terminology changes must be scoped, reviewed, and tied to a migration step.

## Retired Terms

- `Admin`
- `Supporter`
- `FamilySpace`
- `familyMembers`
- `Personal Profile`
- `Connection Code`

These terms should appear only when documenting migration work or historical implementation details.

## Product Copy Rules

- Prefer direct, concrete phrasing over sentimental phrasing.
- Use `Circle` consistently instead of mixing `family space`, `group`, and `network`.
- Use `Organiser`, `Member`, `Tablet User`, and `Independent User` consistently in product UI and docs.
- Keep role names stable across onboarding, settings, alerts, and error states.
- Do not describe senior-grounding `People` as family-side participants.

## Product Copy To Avoid

- `caregiver`
- `care circle`
- `loved one`
- `patient`
- `sufferer`
- `dementia` as a broad product label

These terms may appear only when legally, clinically, or historically necessary.

## Marketing Copy Guidance

- Marketing copy may be more emotional and consumer-facing than product UI.
- Marketing copy must still avoid implying diagnosis, treatment, clinical care, or medical-device positioning.
- Emotional language is acceptable only if it stays consistent with Memvella being a digital wellness companion.

## Implementation Note

The shipped codebase still contains legacy names in routes, modules, and schema surfaces. Those names are migration debt, not acceptable targets for new work.
