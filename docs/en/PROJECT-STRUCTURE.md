# ObsidianHub Project Structure Design

## 1. Goal

This document defines the MVP-stage engineering skeleton for ObsidianHub, aligning:

- repository structure
- module boundaries
- separation between server and plugin responsibilities
- implementation boundaries for future Codex / coding-agent work

The goal at this stage is not to write everything at once, but to get the skeleton right first.

## 2. Repository Shape

A **monorepo** is recommended.

Reasons:
- the web admin app, server APIs, and lightweight plugin need shared types and protocol models
- Git / Sync / Vault concepts will be reused across multiple entry points
- module boundaries become clearer for multi-agent or Codex-assisted implementation later

## 3. Suggested Top-Level Structure

```text
apps/
  web/                 # Next.js main app (admin UI + API)

plugins/
  obsidian/            # lightweight Obsidian plugin

packages/
  core/                # shared domain models, types, constants
  vault/               # Vault Access Layer core library
  sync/                # Sync protocol and work-state sync logic
  git/                 # Git version-layer wrapper
  search/              # search and indexing core logic
  config/              # config loading, schemas, system init logic

infra/
  docker/              # Docker-related files and notes

scripts/               # local dev / check / helper scripts

docs/
  zh-CN/
  en/
```

## 4. apps/web

Responsible for:
- web admin UI
- setup wizard
- login / admin authentication
- API route handlers
- system status views
- snapshot management entry points
- agent management entry points

### Suggested sub-structure

```text
apps/web/src/
  app/                 # Next.js app router
  components/          # UI components
  server/              # server-side composition layer using packages/*
  lib/                 # web-side utilities
```

### Note

`apps/web` should not own all core business logic. Core capability should be pushed down into `packages/*` so it remains reusable by future entry points.

## 5. plugins/obsidian

Responsible for:
- server address / token configuration
- connection test
- basic sync trigger
- sync status display
- Git / uncommitted-change indication
- basic commands and status panel

### Explicitly not responsible for
- heavy sync engine logic
- CRDT / OT
- complex merge UI
- heavy local database responsibilities

### Design principle

The plugin is a **client entry layer / control layer**, not the full business logic container.

## 6. packages/core

Responsible for:
- shared types
- shared schemas
- common error types
- shared constants
- protocol-level interface definitions

This should be established early as the alignment center for all modules.

## 7. packages/vault

Responsible for:
- path validation
- path normalization
- frontmatter / markdown read-write
- atomic writes
- pre-write backup
- simple locking
- conflict copies
- note-level operation wrappers

This is one of the most critical MVP modules and should be prioritized early.

## 8. packages/sync

Responsible for:
- Sync API request / response models
- work-state sync logic
- sync status representation
- basic conflict information
- debounce / checkpoint-related strategy interfaces on the server side

It is responsible for work-state sync only, not the Git version layer.

## 9. packages/git

Responsible for:
- Git repo detection / initialization
- working-tree state inspection
- checkpoint commits
- recent commit inspection
- diff / history helpers
- future extension points for remote Git backup

It owns the version-history layer and should not be triggered on every save.

## 10. packages/search

Responsible for:
- basic full-text search
- simplified tags / wikilinks / frontmatter search
- index building and refresh

It should remain lightweight in MVP and avoid heavy search infrastructure.

## 11. packages/config

Responsible for:
- environment variable schema
- system setup configuration
- mounted path constraints
- default directory conventions
- app-level config loading / saving

## 12. infra/docker

Responsible for:
- Dockerfile
- docker-compose example (if needed)
- mounted path documentation
- deployment notes

MVP should remain single-container first.

## 13. Suggested Build Priority

### Phase A: Skeleton and shared models
1. monorepo base config
2. `packages/core`
3. `apps/web` base app
4. `plugins/obsidian` base plugin skeleton

### Phase B: Most critical capabilities
5. `packages/vault`
6. `packages/sync`
7. `packages/git`

### Phase C: Supporting capabilities
8. `packages/config`
9. `packages/search`
10. `infra/docker`

## 14. Why This Matters for Codex / Coding Agents

This structure makes it easier to:
- assign different modules to different agents later
- avoid mixing web/plugin/server logic in one place
- give clear implementation homes to the vault / sync / git philosophy

## 15. Current Recommendation

The ObsidianHub engineering skeleton should be built around three main lines:

1. **Vault is the data core**
2. **Sync is the work-state core**
3. **Git is the version core**

The web app and plugin are entry points into the system, not the system itself.
