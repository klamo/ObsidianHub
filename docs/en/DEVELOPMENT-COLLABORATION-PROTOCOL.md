# ObsidianHub Development Collaboration Protocol (v1)

## 1. Purpose

This document defines the default development collaboration model for ObsidianHub at its current stage.

It is meant to solve three problems:

1. avoid the "implement a tiny part, stop, ask again" rhythm
2. clarify which decisions Moss can make directly and which require Klamo's confirmation
3. ensure the coding executor layer (Moss / Codex / a future dedicated coding agent) receives executable task packages instead of vague direction

This document is neither the product PRD nor a pure architecture document.

It is a:
- project-level execution protocol
- task handoff rule set
- default decision-boundary definition
- quality and delivery standard

---

## 2. Recommended collaboration model

At the current stage, ObsidianHub should use:

**Moss as controller + task-granular coding executor selection**

### Moss default responsibilities
- product goal convergence
- technical direction convergence
- phase goal definition
- task decomposition and prioritization
- API / schema / module boundary design
- producing structured task packages for Codex or a coding agent
- reviewing implementation output
- running typecheck / tests / basic acceptance
- updating docs, roadmap, and phase status
- directly making small code changes when appropriate

### Coding executor responsibilities
The coding executor can be:
- Moss
- Codex
- a future dedicated coding agent

Its core responsibilities are:
- implement within the task package
- modify code within the agreed scope
- add required tests
- report results, risks, and unfinished parts

### Default selection rules
- **small changes / local fixes / low-context tasks**: Moss may implement directly
- **medium-complexity / repetitive / clearly testable implementation tasks**: prefer Codex
- **when parallel coding demand becomes obvious**: introduce a dedicated coding agent

Conclusion:

> ObsidianHub should not default to "Moss always writes the code", and it does not need to become a skill first. Stabilizing the project-level execution protocol is the higher priority.

---

## 3. Why this protocol is needed

A recurring inefficient pattern is:

1. implement a tiny piece
2. stop
3. ask for the next direction
4. implement another tiny piece

The problem is not that coding is impossible. The problem is that:
- decisions get fragmented too early
- task packages are too small
- the executor layer cannot move continuously
- the controller layer gets dragged too deeply into implementation details
- the user becomes a live router too often

So the project should prefer:

**converge first, then execute continuously.**

That means:
- define the phase goal and technical constraints first
- form one executable task package
- let the executor complete it continuously
- let Moss review and close it out
- only stop when a real boundary-crossing decision appears

---

## 4. Documentation layers

To avoid mixing PRD, architecture, and execution rules, documents should stay in three layers.

### Layer 1: Product documents
Answer: what are we building, and why?

Examples:
- `PRD.md`
- `MVP.md`
- `README.md`

### Layer 2: Technical convergence documents
Answer: how is the system shaped and constrained?

Examples:
- `ARCHITECTURE.md`
- `TECH-STACK.md`
- `SYNC-AND-VERSIONING.md`
- `NOTE-ACTIONS-AND-TOOL-CONTRACT.md`
- other focused design documents

### Layer 3: Execution documents
Answer: how do we move this stage forward right now?

Examples:
- `DEVELOPMENT-ROADMAP.md`
- this document: `DEVELOPMENT-COLLABORATION-PROTOCOL.md`
- a future `TASK-PACKS/` directory if needed

---

## 5. Default working rhythm

### Step 1: Phase convergence
Moss should define:
- which phase is active
- the direct goal of this phase
- what is explicitly out of scope
- what counts as acceptance

### Step 2: Form one task package
Moss should provide a structured task package that at least includes:
- goal
- modification scope
- forbidden scope
- interface constraints
- testing requirements
- definition of done

### Step 3: Coding execution
Moss / Codex / the coding agent implements continuously without crossing boundaries.

### Step 4: Review and closeout
Moss is responsible for:
- reading the diff
- checking whether boundaries drifted
- running typecheck / tests
- adding small cleanup fixes when needed
- updating docs and status

### Step 5: Decide the next round
Klamo should only be interrupted again when:
- an architecture fork appears
- the scope must expand meaningfully
- a product boundary must change
- acceptance reveals that the current plan is flawed

---

## 6. Default decision boundaries

## What Moss can decide directly
Moss may generally decide and proceed on the following without asking first, then document the result afterward:

- local implementation details
- file splitting choices
- minor type naming adjustments
- helper / utility organization
- internal route / handler structure
- test file layout
- small refactors
- internal abstraction changes that do not alter public contracts
- document improvements and structural cleanup
- subtask ordering within the current phase

## What requires confirmation first
The following should be confirmed with Klamo before proceeding:

- product goals or non-goals change
- MVP scope expands
- public API contracts change significantly
- a new core dependency or infrastructure component is introduced
- a lightweight path turns into a heavier one
- deployment, cost, or long-term maintenance implications change
- a large completed implementation needs to be removed or replaced
- an external publishing / sync / third-party-impacting action happens without prior authorization

## Default "do first, report after" principle
A change can generally be done first and reported after if it:
- does not change product direction
- does not expand current phase scope
- does not change public contracts
- can be validated by typecheck / tests / docs
- has low rollback cost

---

## 7. Minimal technical execution PRD template

Before a phase enters continuous development, Moss should ensure the relevant execution-oriented technical plan covers these points, whether or not it becomes a separate file:

1. **Goal**
   - what this round is trying to unlock
2. **Scope**
   - which modules are allowed to change
   - which modules should stay untouched
3. **Interfaces**
   - input / output / error semantics
4. **Implementation constraints**
   - whether existing packages must be reused
   - whether bypassing the action layer is forbidden
5. **Testing requirements**
   - what tests are minimally required
6. **Definition of done**
   - what conditions make this round actually complete

This is not meant to increase paperwork.
Its purpose is to let the coding layer execute continuously instead of guessing while coding.

---

## 8. Task package template

Each implementation round should prefer the following structure:

### Task name
A one-line summary of the objective.

### Background
Why this round exists.

### Goal
What should be unlocked after this round.

### Modification scope
- allowed to modify:
- prefer not to modify:
- explicitly must not modify:

### Implementation requirements
- contract constraints
- error-handling requirements
- naming / organization expectations
- whether existing modules must be reused

### Testing requirements
- typecheck
- unit / integration tests
- minimal end-to-end verification

### Definition of done
Conditions that must be true before marking the task done.

### Delivery report
The executor should report:
- what actually changed
- what differed from the original plan
- what risks remain

---

## 9. Rules for choosing the coding executor

## When Moss should code directly
Appropriate for:
- tasks that can be finished in roughly 10-60 minutes
- local boundary adjustments requiring strong semantic judgment
- small changes where docs and code are tightly coupled
- cleanup patches discovered during review

## When Codex should be preferred
Appropriate for:
- scoped scaffold / wiring work
- repetitive handler / schema / test expansion
- batch implementation based on existing contracts
- task packages that are structured enough for direct execution and review

## When a dedicated coding agent becomes worth it
Consider introducing a dedicated coding agent when:
- parallel coding demand becomes persistent
- frontend and backend tasks need to advance simultaneously
- implementation volume per round grows significantly
- a stable long-lived coding thread becomes useful
- Moss's review / testing / documentation / task-management load grows too large

Current judgment:

> ObsidianHub is not yet at the point where it must have a dedicated coding agent first, but it is already suited to a controller + delegatable executor model.

---

## 10. Quality bar

By default, each code submission should try to satisfy:

- workspace `typecheck` passes
- relevant package tests pass
- the new capability has at least minimal verification
- existing contracts / action layers are not bypassed without reason
- docs are updated where needed
- commit granularity is clear enough to review later

For a documentation-only change, the minimum bar is:
- it can clearly constrain the next implementation round
- it does not conflict with existing architecture docs
- it can be referenced directly by future task packages

---

## 11. Immediate application to the current phase (Phase 3)

Based on current project status, this protocol should now be applied to:

### Current main goal
Wire the minimal HTTP / API handler for note actions inside `apps/web`.

### Current default boundaries
- reuse `packages/actions` first
- do not bypass the existing note action contract
- build one minimal unified entry first instead of a complex auth system
- first complete validate → execute → format response
- first cover the 6 core note actions

### Suggested split right now
- Moss: define handler shape, response envelope, error boundaries, task package, and acceptance standard
- Codex or another executor: implement route wiring, base formatter, and tests
- Moss: review, run typecheck/tests, update docs, and commit

---

## 12. Relationship to a future skill

This protocol should **not be turned into a skill yet**.

Why:
- it is first and foremost an ObsidianHub project execution protocol
- the current priority is speeding up real project progress
- not abstracting the method beautifully before proving it in practice

When it becomes suitable as a skill:
- the method has already worked across multiple ObsidianHub rounds
- it is likely to be reused across other software projects
- its templates, triggers, and boundaries have become stable

At that point it could become something like:
- `project-execution-protocol`
- or `pm-coding-orchestration`

But not yet.

---

## 13. Default conclusion

For ObsidianHub, the default execution model is now:

> **Moss controls direction, convergence, task decomposition, review, testing, and documentation; coding execution is assigned by task granularity between Moss and an external executor layer; the user is only interrupted when a boundary-crossing decision appears.**

This means:
- do not stop after every tiny implementation step by default
- converge direction into a task package first
- keep moving continuously when boundaries are clear
- only stop when real user judgment is needed

This is the most suitable development organization model for ObsidianHub at its current stage.
