# ObsidianHub Product Requirements Document (PRD)

## 1. Overview

ObsidianHub is a self-hosted Obsidian server for personal use. Its core goal is to provide a service layer for a personal vault with:

- remote access
- multi-device work-state sync
- Git-first version management
- controlled multi-agent editing
- auditability, rollback, and recovery

It is not an Obsidian replacement and not a team knowledge platform.

## 2. Target Users

### Core users
- people who use Obsidian as a personal knowledge base
- self-hosting users with VPS / NAS / home servers
- advanced users who want AI / automation to help organize, index, or publish notes
- users who want to keep working in local Obsidian while syncing and managing their data through their own server

### Non-target users
- teams needing enterprise collaboration permissions
- organizations requiring real-time collaborative editing
- users looking for a full online document platform replacement

## 3. User Problems

1. Accessing a vault remotely is inconvenient
2. There is no unified and controllable sync path across devices
3. Multiple devices, processes, or agents can create conflicts or overwrite content
4. Existing sync tools usually do not provide safe agent-oriented APIs
5. Letting agents touch the raw filesystem is too risky
6. After automation mistakes, rollback and auditability are often missing
7. Users want a smooth real-time workflow while still preserving Git-grade version history

## 4. Product Goals

### Must achieve
- users can remotely access and inspect their vault
- users can continue working in local Obsidian and connect it to ObsidianHub
- current work state can sync across devices
- Git is used to preserve more stable, meaningful version checkpoints
- agents can operate notes through controlled APIs
- critical writes are protected by conflict-handling and recovery mechanisms
- deployment and setup are simple enough for Docker-based self-hosting

### Not a priority in this phase
- team collaboration
- complex permission systems
- heavy real-time collaborative editing
- CRDT / OT
- becoming an all-in-one platform

## 5. Core Scenarios

### Scenario A: Remote viewing and search
Users browse notes, search content, and download attachments from a browser while away from their main machine.

### Scenario B: Continue working inside local Obsidian
Users keep editing in their own Obsidian app while connecting to their ObsidianHub service and syncing current work state across devices.

### Scenario C: Lightweight plugin connection
Users configure server address, credentials, and sync state through a lightweight Obsidian plugin and trigger basic sync operations.

### Scenario D: Agent-driven organization
An organization agent creates, renames, archives, and updates frontmatter within controlled folders.

### Scenario E: Agent-driven indexing
An indexing agent reads the full vault, generates tags, links, or index files, but cannot arbitrarily edit primary notes.

### Scenario F: Recovery after mistakes
If an agent or user damages content, the system restores it through snapshots, Git checkpoints, or conflict copies.
