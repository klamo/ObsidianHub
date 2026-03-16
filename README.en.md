# ObsidianHub

[中文](README.md) | **English**

A self-hosted Obsidian server for personal use, focused on remote access, sync safety, and controlled multi-agent editing.

## Positioning

ObsidianHub is not trying to replace Obsidian. It adds a server layer for a personal Obsidian vault that is:

- remotely accessible
- manageable through the web
- safely operable by AI / agents
- auditable, recoverable, and rollback-friendly

It is closer to:

- an API-backed server layer for a personal knowledge base
- a remote operating layer / control plane for Obsidian
- a secure access gateway for automation and AI workflows

## Why

Obsidian works extremely well as a personal knowledge tool, but things get harder when you need to:

- access your vault securely while away from your main device
- browse, search, or edit notes from a browser
- let multiple remote agents work on the vault safely
- add automation without giving agents unrestricted filesystem access
- make all changes traceable, reversible, and recoverable

## Core Capabilities

### 1. Human Remote Access Layer
For safely accessing your Obsidian data away from your main machine:

- web file browsing
- Markdown preview
- search
- attachment access
- basic editing
- upload / download

### 2. Sync / Consistency Layer
For keeping the vault safe when multiple devices, processes, or agents touch it:

- file change detection
- atomic writes
- modified-time validation
- simple locking
- conflict copies
- snapshots and rollback

### 3. Agent Operation Layer
For giving remote agents controlled access to the vault instead of raw SSH-style file edits:

- agent tokens
- path scope restrictions
- read-only / read-write permissions
- operation set restrictions
- rate limits
- operation logs
- note-oriented APIs

## MVP Scope

### Included

- single vault mount
- web setup page
- admin account creation
- Agent API (`list_files`, `read_note`, `write_note`, `append_note`, `search`, `move_note`, `create_note`, `list_tags`, `update_frontmatter`)
- safe write mechanism
- manual / automatic snapshots
- file-level / vault-level rollback

### Not in MVP

- multi-tenancy
- team collaboration
- complex RBAC
- file-level ACL
- real-time collaborative editing
- plugin marketplace
- Notion-style block editor

## Agent Permission Model

The permission model is centered on agent identities rather than traditional multi-user groups.

Each agent may have:

- a name
- a token
- path-scoped access
- read-only / read-write permissions
- allowed operation sets
- rate limits
- operation logs

## Documentation

- [PRD (中文)](docs/zh-CN/PRD.md)
- [MVP（中文）](docs/zh-CN/MVP.md)
- [架构（中文）](docs/zh-CN/ARCHITECTURE.md)
- [PRD (English)](docs/en/PRD.md)
- [MVP (English)](docs/en/MVP.md)
- [Architecture (English)](docs/en/ARCHITECTURE.md)

## Docker Delivery

This project is a natural fit for Docker delivery.

The first version should start with a single-container deployment, and split later only when complexity truly requires it.

## Roadmap

### Phase 0
- define product positioning
- finish PRD
- finish technical design
- create the initial repository structure

### Phase 1
- setup flow
- Vault Access Layer
- basic Agent API
- snapshot / rollback capability

### Phase 2
- search and indexing
- agent permission model
- web admin UI
- conflict detection and logging

### Phase 3
- sync adapters
- richer agent workflows
- release and deployment improvements

## Current Status

The repository is in initialization stage. Current priorities are:

1. finish bilingual PRD
2. choose the MVP tech stack
3. create the minimum project skeleton
4. begin implementing the Vault Access Layer and Agent API
