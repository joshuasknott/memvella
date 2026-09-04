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
| Shared support workspace | `Workspace` | The shared area created by one account for the person being supported |
| Human participant in a Workspace | `Supporter` | A signed-in trusted person helping with memories, reminders, companion setup, or updates |
| Workspace creator with admin capability | `Workspace owner` | Use only where permission differences matter; prefer `you` in ordinary UI |
| Invited participant role | `Supporter` | Can help inside the Workspace without owning owner-only settings |
| Senior-grounding person | `Person` | Someone the senior knows; used for memory and companion context, not a signed-in Supporter |
| Senior-facing tablet experience | `Companion tablet` | The tablet connected by a Supporter for the senior-facing companion |
| Urgent actionable item | `Alert` | Stored separately from insights, but currently reviewed inside `/circle/insights` |
| Non-urgent summary or follow-up | `Update` | Owner-facing conversation note; stored as an insight internally |
| Shared event history | `Activity` | Reserved term; no dedicated shipped activity surface yet |
| Memvella itself | `digital wellness companion` or `companion` | Avoid medical framing |

## Canonical Internal Terms

- Use `circle` instead of `familySpace`.
- Use `circleMembership` instead of `familySpaceMembership`.
- Internal roles remain `organiser` and `member` until a schema migration changes them; product copy maps these to Workspace owner and Supporter.
- Use `people` for senior-grounding People the senior knows.
- Use `alerts` and `insights` for the stored awareness tables.
- `family_side` is still used in some internal helper code as a shorthand for the organiser/member role family. It is not product copy and should not become a route, table, or visible label.

## Retired Terms

- `Admin`
- `FamilySpace`
- `familyMembers`
- `Personal Profile`
- `Connection Code`

These terms should appear only when documenting legacy cleanup or historical implementation details.

## Product Copy Rules

- Prefer direct, concrete phrasing over sentimental phrasing.
- Use `Workspace` when a shared-area or permission distinction is needed. Ordinary screens can say Today, your memories, or the person’s name without repeating the underlying container.
- Use `Supporter` for signed-in trusted people who help inside a Workspace.
- Use `Companion tablet` for the senior-facing tablet flow.
- Keep role names stable across onboarding, settings, auth, and error states.
- Do not describe senior-grounding `People` as Supporters or Workspace participants.
- Do not label the combined `/circle/insights` queue as an `Activity` feed.

## Product Copy To Avoid

- `caregiver`
- `care circle`
- `loved one`
- `patient`
- `sufferer`
- `dementia` as a broad product label
- `support team` as a primary nav or entity label

These terms may appear only when legally, clinically, or historically necessary.
