# ObsidianHub Development Collaboration Rules (v1)

## 1. Purpose

This document defines the default collaboration rules for ObsidianHub in its current stage. It aligns Moss and case on roles, repository workflow, task packaging, review visibility, and progress-estimation rules.

It does not replace:
- product documents
- architecture documents
- roadmap documents

Its purpose is to:
- keep orchestration and execution under the same defaults
- reduce scope drift
- keep delivery visible, reviewable, and reversible
- avoid inconsistent progress judgments

---

## 2. Default Roles

### Moss

Moss is responsible for:
- understanding the request
- narrowing scope
- breaking tasks down
- defining acceptance criteria
- reviewing code and outcomes
- deciding what enters `main`
- updating project docs and stage judgments

### case

case is responsible for:
- executing under a clear task package
- cloning / fetching / branching / editing / committing / pushing from a directory accessible to its own account
- performing the minimum required verification
- reporting results, blockers, branches, and commit info

Conclusion:

> Moss is the orchestration and review layer; case is the execution layer. Product-boundary decisions are not delegated to case by default.

---

## 3. Repository and Working Directory Rules

### Default rules

- case should not work directly inside `/root/...` repositories
- case should clone repositories into paths accessible to its own account
- root-side local repository paths should not be treated as case execution paths

### Remote URL rule

When assigning repository work to case, prefer **SSH remotes** by default.

Example:

```bash
git@github.com:klamo/ObsidianHub.git
```

Why:
- case is confirmed to have working GitHub SSH authentication
- tasks should not assume interactive HTTPS username/password/token flows

---

## 4. Branch Strategy

### Default prohibition

- case should not push directly to `main` by default

### Default workflow

- case should create a dedicated remote work branch per task
- branch names should describe the task intent, for example:
  - `case/phase3-route-tests`
  - `case/docs-progress-board-tune`
  - `case/actions-response-formatting`

### Default review flow

- case pushes to a remote work branch
- Moss reviews the real remote diff
- after review, Moss decides whether to:
  - merge
  - cherry-pick
  - request rework
  - or take over and finish locally

Conclusion:

> Without a remotely reviewable result, delivery is not considered complete.

---

## 5. Task Package Rules

Tasks sent to case should normally include these fields:

### Required fields

- Repo
- Base branch
- Work branch
- Goal
- Scope
- Constraints
- Verify
- Report back

### Meaning

#### Goal
What this task is meant to achieve and why.

#### Scope
Which files, directories, or modules may be changed.

#### Constraints
What must not be touched, plus branch / commit / push rules.

#### Verify
The minimum validation required before the task can be considered complete.

#### Report back
What case must report, such as:
- what changed
- branch name
- commit hash
- whether push succeeded
- the exact blocker if any

---

## 6. Scope Control

### Default principle

- change only what is explicitly allowed
- do not make unrelated drive-by changes
- do not do unrequested cleanup
- do not do unrequested refactors
- do not expand scope just because something nearby also looks improvable

### If a larger issue is discovered

case should:
- keep the current scope unchanged
- report the problem and impact
- propose an option
- wait for a new task package instead of widening scope unilaterally

---

## 7. Review Visibility Rules

### Not recommended

- case commits only locally and reports by text

Why:
- the result is not visible enough
- the diff is not transparent
- review quality drops
- remote state becomes harder to manage

### Default rule

- case pushes to a remote work branch
- Moss reviews based on the real remote result

In other words:

> The remotely visible branch result is the default deliverable.

---

## 8. Progress and Completion Estimation Rules

This is one of the default rules that must be followed.

### Default estimation rule

Stage completion percentage should be estimated based on:

**overall stage capability completeness**

not merely on:
- whether the main blocker was just removed
- whether the first vertical slice just landed
- whether the minimum loop just started working

### What may be stated separately

It is fine to state separately that:
- a key blocker has been crossed
- the first slice has landed
- the minimum viable loop now exists
- the stage can move into follow-up stabilization work

But these statements:

**do not automatically justify raising stage completion to 70%–80%.**

### Simple heuristic

If multiple items still remain unresolved, such as:
- multiple core paths
- response / error consolidation
- extensibility consolidation
- minimum testing coverage
- API stability validation
- stable handoff to downstream layers

then stage completion usually should not jump directly to `70%+`.

### Documentation rule of thumb

- objective fact updates may be made quickly
- percentages, milestone characterizations, and stage judgments should be more conservative
- case may update facts
- Moss owns final completion-percentage and stage-judgment wording

---

## 9. Default Commit Rules

### commit / push rules

- default to one task, one branch
- keep commit scope clean
- do not mix unrelated changes into the same commit
- by default include this commit trailer:

```text
Co-authored-by: Klamo <mr.klamo@gmail.com>
```

If the task package specifies the commit message, follow the task package.

---

## 10. Default Instruction to case

When assigning ObsidianHub tasks to case, the task package should normally start with:

> Before starting, read and follow `docs/zh-CN/DEVELOPMENT-COLLABORATION-RULES.md` (or the repository collaboration rules doc). Treat it as the default project protocol unless this task explicitly overrides a detail.

This avoids re-pasting the full rules every time while still explicitly binding the task to the repository defaults.

---

## 11. Recommended Workflow

The default ObsidianHub collaboration flow is:

1. Klamo raises a goal or problem
2. Moss narrows and structures the task
3. Moss decides whether to do it directly or delegate to case
4. If delegated, Moss creates a structured task package
5. case clones or updates its own local clone
6. case creates a work branch and executes
7. case commits and pushes to the remote work branch
8. Moss fetches and reviews the diff
9. Moss decides whether to:
   - merge into `main`
   - request rework
   - or take over and finish

---

## 12. Default Conclusion

For ObsidianHub, the default collaboration model is:

> Moss handles orchestration, narrowing, decomposition, review, and stage judgment; case handles visible, reviewable delivery through remote work branches under clear task packages.

The purpose of these rules is not to add bureaucracy, but to remove ambiguous defaults and improve coordination quality.
