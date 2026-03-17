# ObsidianHub

[中文](README.md) | **English**

A self-hosted Obsidian server for personal use, focused on remote access, work-state sync across devices, Git-based versioning, and controlled multi-agent editing.

## Positioning

ObsidianHub is not trying to replace Obsidian. It adds a server layer for a personal Obsidian vault that is:

- remotely accessible
- manageable through the web
- safely operable by AI / agents
- auditable, recoverable, and rollback-friendly
- able to sync current working state across devices
- able to manage stable version checkpoints through Git

It is closer to:

- an API-backed server layer for a personal knowledge base
- a remote operating layer / control plane for Obsidian
- a secure access gateway for automation and AI workflows
- personal knowledge infrastructure that separates real-time work state from version history

## Why

Obsidian works extremely well as a personal knowledge tool, but things get harder when you need to:

- access your vault securely while away from your main device
- browse, search, or edit notes from a browser
- sync recent work across devices quickly
- let multiple remote agents work on the vault safely
- add automation without giving agents unrestricted filesystem access
- make all changes traceable, reversible, and recoverable
- keep version history meaningful without turning every tiny edit into a Git commit

## Core Capabilities

### 1. Human Remote Access Layer
For safely accessing your Obsidian data away from your main machine:

- web file browsing
- Markdown preview
- search
- attachment access
- basic editing
- upload / download

### 2. Real-Time Sync / Consistency Layer
For keeping the vault safe and making current work state visible across devices, processes, and agents:

- current work-state sync
- file change detection
- atomic writes
- modified-time validation
- simple locking
- conflict copies
- Sync API
- basic sync status signaling

### 3. Git Version Layer
For keeping meaningful history without turning every save into noisy version spam:

- checkpoint commits
- manual version saves
- structured commits after agent batch operations
- history inspection
- diff / comparison
- rollback
- optional remote Git backup (such as GitHub)

### 4. Agent Operation Layer
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
- Git-first versioning direction
- lightweight Obsidian plugin prototype
- Sync API as the work-state sync entry point

### Not in MVP

- multi-tenancy
- team collaboration
- complex RBAC
- file-level ACL
- heavy real-time collaborative editing
- CRDT / OT
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
- [技术栈（中文）](docs/zh-CN/TECH-STACK.md)
- [客户端连接（中文）](docs/zh-CN/CLIENT-CONNECTION.md)
- [同步与版本管理（中文）](docs/zh-CN/SYNC-AND-VERSIONING.md)
- [PRD (English)](docs/en/PRD.md)
- [MVP (English)](docs/en/MVP.md)
- [Architecture (English)](docs/en/ARCHITECTURE.md)
- [Tech Stack (English)](docs/en/TECH-STACK.md)
- [Client Connection (English)](docs/en/CLIENT-CONNECTION.md)
- [Sync and Versioning (English)](docs/en/SYNC-AND-VERSIONING.md)
- [Development Collaboration Protocol (English)](docs/en/DEVELOPMENT-COLLABORATION-PROTOCOL.md)

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
- Sync API
- Git checkpoint capability
- snapshot / rollback capability
- lightweight plugin prototype

### Phase 2
- search and indexing
- agent permission model
- stronger web admin UI
- conflict detection and logging
- optional Git remote backup

### Phase 3
- compatibility features (such as WebDAV / import-export)
- client CLI execution channel (if it proves worthwhile)
- richer agent workflows
- release and deployment improvements

## Current Status

The repository is in initialization stage. Current priorities are:

1. finalize the philosophy of work-state sync vs Git version checkpoints
2. finalize the MVP tech stack and client connection direction
3. create the minimum project skeleton
4. prioritize the design of the Vault Access Layer, Sync API, and Git checkpoint mechanism
t checkpoint mechanism
