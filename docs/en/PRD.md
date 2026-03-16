# ObsidianHub Product Requirements Document (PRD)

## 1. Overview

ObsidianHub is a self-hosted Obsidian server for personal use. Its core goal is to provide a service layer for a personal vault with:

- remote access
- sync safety improvements
- controlled multi-agent editing
- auditability, rollback, and recovery

It is not an Obsidian replacement and not a team knowledge platform.

## 2. Target Users

### Core users
- people who use Obsidian as a personal knowledge base
- self-hosting users with VPS / NAS / home servers
- advanced users who want AI / automation to help organize, index, or publish notes

### Non-target users
- teams needing enterprise collaboration permissions
- organizations requiring real-time collaborative editing
- users looking for a full online document platform replacement

## 3. User Problems

1. Accessing a vault remotely is inconvenient
2. Multiple devices, processes, or agents can create conflicts or overwrite content
3. Existing sync tools usually do not provide safe agent-oriented APIs
4. Letting agents touch the raw filesystem is too risky
5. After automation mistakes, rollback and auditability are often missing

## 4. Product Goals

### Must achieve
- users can remotely access and inspect their vault
- agents can operate notes through controlled APIs
- critical writes are protected by conflict-handling and recovery mechanisms
- deployment and setup are simple enough for Docker-based self-hosting

### Not a priority in this phase
- team collaboration
- complex permission systems
- real-time collaborative editing
- becoming an all-in-one platform

## 5. Core Scenarios

### Scenario A: Remote viewing and search
Users browse notes, search content, and download attachments from a browser while away from their main machine.

### Scenario B: Lightweight remote editing
Users make small note edits from a temporary device without syncing the whole vault.

### Scenario C: Agent-driven organization
An organization agent creates, renames, archives, and updates frontmatter within controlled folders.

### Scenario D: Agent-driven indexing
An indexing agent reads the full vault, generates tags, links, or index files, but cannot arbitrarily edit primary notes.

### Scenario E: Recovery after mistakes
If an agent or user damages content, the system restores it through snapshots or conflict copies.
