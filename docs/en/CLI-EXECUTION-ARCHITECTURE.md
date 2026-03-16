# Obsidian CLI Execution Channel and Its Role in ObsidianHub

## 1. Purpose

This document clarifies:

- the relationship between ObsidianHub and the official Obsidian CLI
- the role of client-side Obsidian CLI execution in the architecture
- why the CLI execution path is a complementary channel rather than a replacement for the server-side architecture
- how it relates to Sync, Git, snapshots, and the agent control plane

## 2. Core Conclusion

ObsidianHub should remain fundamentally built around a **server-side vault and control plane**.

The Obsidian CLI should not be a server runtime requirement, but it can become a highly valuable:

- **client-native command execution channel**
- **executor that stays closer to official Obsidian semantics**
- **supplementary path for controlled agent operations**

## 3. Two Execution Channels

### A. Server-native execution channel
The ObsidianHub server directly operates on the vault.

Best suited for:
- background jobs
- server-resident agents
- cases where no client is online
- batch organization
- infrastructure tasks such as indexing, backup, restore, and Git checkpoints

### B. Client CLI execution channel
A local client with Obsidian installed executes commands via the Obsidian CLI.

Best suited for:
- user-local interactive actions
- note operations that benefit from being closer to official Obsidian semantics
- command-oriented, auditable, constrained agent actions
- some higher-level actions where token use may be reduced

## 4. Why the CLI Channel Is Valuable

### 4.1 Closer to official semantics
Because the CLI is provided by Obsidian, some operations can stay closer to the real behavior of desktop Obsidian.

### 4.2 More controlled surface for agent actions
Compared with direct filesystem access, the CLI can provide a narrower and more explicit capability boundary.

### 4.3 Potential token savings in some workflows
When a high-level task can map directly to a command, the agent may not need to read large files and reason through low-level edits.

### 4.4 Helps reduce semantic drift on the server side
The CLI can serve as an official behavioral baseline for local semantics.

## 5. Why the CLI Should Not Become the Main Architecture

Even though it is valuable, the CLI should not become ObsidianHub's only primary execution path.

Reasons:
- it depends on some local client being online
- it depends on Obsidian being installed and running locally
- it is not suitable as the only foundation for server-resident automation
- in multi-client scenarios, executor selection becomes a coordination problem
- it does not replace the server's responsibilities for Git, snapshots, or the control plane

## 6. Recommended Architecture: Dual Execution Channels

ObsidianHub should use:

### A server-side control plane
The server remains responsible for:
- permissions
- routing
- logging
- auditability
- Git checkpoints
- snapshots / restore
- agent management

### Two executors
1. **Server Executor**: directly modifies the server-side vault
2. **Client CLI Executor**: executes through the local Obsidian CLI

## 7. Routing Principles

A future task router can decide between channels based on:

- whether an eligible client is online
- whether the task benefits from official local semantics
- whether the task is infrastructure-oriented (better on the server)
- whether a narrower command capability boundary is desirable
- whether the task must still work without any client online

## 8. Relationship to Other Modules

### Relationship to Sync
The CLI channel does not replace the Sync API. Sync is for work-state propagation; the CLI channel is for some semantically richer local execution tasks.

### Relationship to Git
The CLI channel does not replace Git checkpoints. Results from CLI execution should still flow back into the server-side control plane, which decides when to create a checkpoint.

### Relationship to snapshots / restore
Even if an operation is executed via client CLI, the server should still own the final snapshot and restore authority.

### Relationship to the agent control plane
Agents should not invoke local CLI commands without constraints. A better design is for ObsidianHub to decide when a task should be routed to a CLI executor.

## 9. Current Recommendation

At the current stage, it is not necessary to implement a full CLI executor immediately, but it is recommended to:

1. preserve the channel in the architecture
2. define its role and boundary in documentation
3. leave integration points in the lightweight plugin / client connection layer

## 10. One-sentence positioning

**Within ObsidianHub, the Obsidian CLI is best positioned as a client-native command execution channel, not a server-side runtime dependency.**
