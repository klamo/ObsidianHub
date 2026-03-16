# ObsidianHub MVP Tech Stack Proposal

> Status: discussion draft v2
> Goal: choose a pragmatic MVP stack that is Docker-friendly, strong at filesystem access, and well-suited for Markdown, Sync API, and Git-based version management.

## 1. Design Principles

MVP stack priorities:

1. **stability and maintainability** over novelty
2. **filesystem capability** over UI polish
3. **simple Docker delivery** over early microservice splitting
4. strong support for **Markdown / frontmatter / search**
5. support for a **lightweight plugin + Sync API + Git layered model**
6. easy collaboration later with **Codex / coding agents**

## 2. Recommended Primary Stack

### Backend / Web
- **TypeScript**
- **Node.js 22 LTS**
- **Next.js 15 (App Router)**

### API / service logic
- Next.js Route Handlers for the first-stage API layer
- service logic organized under `src/server/*`
- plus:
  - `src/server/sync` for work-state sync
  - `src/server/git` for Git version management

### Data and state
- **SQLite** for:
  - admin account
  - agent configuration
  - audit logs
  - snapshot metadata
  - system settings
  - sync-state metadata
- **filesystem** as the source of truth for vault content
- **Git repository** as the version-history layer (optionally enabled, but Git-first in design)

### Search / indexing
For MVP, start with:
- SQLite-backed lightweight index tables
- or Node-side scanning with memory / file cache
- support:
  - basic full-text search
  - simplified tags / wikilinks / frontmatter search
- do **not** introduce Elasticsearch / Meilisearch yet

### Markdown processing
- `gray-matter` for frontmatter
- `remark` / `remark-gfm` for Markdown structure
- `github-slugger` or similar helpers for heading anchors / slugs

### Auth and secrets
- admin password: `argon2`
- login session: simple cookie-based session
- agent tokens: randomly generated, stored hashed rather than plaintext
- plugin connection token: managed separately from admin sessions

### Scheduled jobs
- start with in-process Node scheduled jobs
- use for automatic snapshots, index refresh, and checkpoint triggers
- split into a worker later only if needed

### UI
- React UI through Next.js
- `shadcn/ui` + Tailwind if we want a faster admin console path
- keep the plugin UI intentionally minimal at first, focused on connection and status

### Docker
- single-container deployment first
- mounted volumes:
  - `/data/vault`
  - `/data/app`

## 3. Why This Stack

### Strengths
- web, API, and admin UI can live in one codebase
- Node is natural for filesystem-heavy workflows
- Markdown and frontmatter tooling is mature
- convenient for implementing plugin-facing APIs
- TS/Node is friendly for later Codex / agent-assisted implementation
- Dockerization is straightforward
- the path from MVP to a more complete product is smooth

### Risks
- Next.js may feel heavy if treated like a pure backend service
- if background jobs grow significantly, a separate worker may be needed later
- file locking, atomic writes, and Git checkpoint rules still need careful engineering

## 4. Sync and Version Layering

### Work-state sync layer
- implemented through a lightweight plugin + Sync API
- responsible for autosave, work-state propagation, and making recent changes visible across devices
- does not require a Git commit for every save

### Git version layer
- responsible for checkpoints, history, rollback, and foundations for remote backup
- commit triggers should map to meaningful checkpoints rather than every save event

### Snapshot layer
- a safety net beyond Git
- used for file-level and vault-level recovery

## 5. MVP Architecture Suggestion

### Draft structure

```text
apps/web                # Next.js application
src/server/auth         # login, session, admin auth
src/server/agents       # agent tokens, permissions, logs
src/server/vault        # vault access layer (critical)
src/server/sync         # work-state sync API
src/server/git          # Git version layer
src/server/search       # search and indexing
src/server/snapshot     # snapshots and rollback
src/server/config       # setup and system settings
plugins/obsidian        # lightweight Obsidian plugin (later)
```

### Data layering
- **vault files**: actual knowledge content
- **SQLite**: control-plane data and sync metadata
- **Git repo**: version history
- **app data**: indexes, logs, snapshot metadata, config

## 6. Critical Implementation Priorities

### A. Vault Access Layer
This is the true heart of the MVP.

It must handle:
- path normalization
- path traversal prevention
- atomic writes
- pre-write backup
- modified-time validation
- simple locking
- conflict copies

### B. Sync API
Suggested minimum capability:
- upload local work-state changes
- fetch latest remote state
- return sync status
- return basic conflict information

### C. Git Version Layer
Suggested minimum capability:
- detect / initialize repository
- inspect working-tree status
- create manual versions
- create checkpoint commits
- inspect recent commits

### D. Agent Permission Model
Suggested minimum model:
- path scope
- readonly / readwrite
- allowed operations
- rate limit
- audit log

### E. Snapshot / Recovery
At minimum, the system must ensure:
- users have a safe rollback path after mistakes
- operations are traceable
- file-level restore comes before full-vault restore in priority

## 7. Current Recommendation

If the goal is to ship a real Docker-based MVP quickly, the current recommendation is:

- **Node.js 22 + TypeScript + Next.js**
- **SQLite**
- **filesystem as source of truth**
- **Git-first version management**
- **lightweight plugin + Sync API as the work-state sync entry point**
- **single-container deployment**
- **no WebDAV as the primary sync core, no CRDT / OT, and no heavy collaboration system yet**

## 8. Confirmed Decisions

- main technical direction: **integrated TS / Next stack**
- admin UI style: **minimal and functional first**
- search: **basic full-text plus simplified tags / wikilinks / frontmatter support**
- setup path handling: **fixed mounted paths first**
- version strategy: **Git first**
- client direction: **lightweight Obsidian plugin + Sync API**
