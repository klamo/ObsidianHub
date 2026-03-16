# ObsidianHub Sync and Versioning

## 1. Core Philosophy

ObsidianHub uses a dual-layer model:

- **real-time sync layer** for work-in-progress state
- **Git version layer** for meaningful historical checkpoints

Core principle:

> Real-time sync should not mean creating a Git commit on every save.  
> A Git commit should represent a checkpoint, a milestone, or a meaningful version boundary.

## 2. Why Separate the Layers

If every edit-save becomes a Git commit, the result is:

- fragmented history
- too many low-value commits
- heavier daily workflow
- sync frequency tightly coupled to version frequency

So the responsibilities should be split.

### Real-time sync layer
Responsible for:
- autosave
- propagating current working state
- making recent edits visible across devices quickly
- basic conflict signaling

### Git version layer
Responsible for:
- checkpoints
- audit history
- rollback
- diff and comparison
- foundations for branching and remote backup

## 3. Real-Time Sync Layer

For MVP / MVP+1, the recommended approach is:

- a **lightweight Obsidian plugin**
- an **ObsidianHub Sync API**

rather than using WebDAV as the primary real-time sync mechanism.

### Lightweight plugin responsibilities
- configure the server connection
- watch local vault file changes
- upload debounced changes
- fetch the latest remote state
- show sync status
- show uncommitted changes / recent sync results
- provide manual sync actions

### Sync API responsibilities
- accept working-state changes
- maintain current working-copy state
- provide the latest content to other devices
- maintain basic conflict information
- integrate with the Git version layer

## 4. Git Version Layer

Git is not responsible for propagating every tiny edit in real time.

Git is mainly used for:
- manual version saves
- automatic checkpoint commits
- structured commits after agent batch operations
- history inspection
- file/version restore
- optional remote Git backup (for example GitHub)

### Good commit trigger moments
- the user clicks "create version"
- the user runs "sync and commit"
- an agent finishes a task batch
- a bulk operation completes
- a snapshot is created
- a stable checkpoint is reached
- an end-of-day or phase wrap-up happens

## 5. Snapshot Layer

The snapshot layer is a safety net beyond Git.

Responsible for:
- pre-write backup
- scheduled snapshots
- file restore
- full-vault restore

It complements Git rather than replacing it.

## 6. MVP Boundary

### Included in MVP
- Git-first versioning direction
- lightweight Obsidian plugin prototype
- Sync API as the work-state sync entry point
- basic Git checkpoint capabilities
- snapshots and recovery

### Not in MVP
- heavy real-time collaborative editing
- CRDT / OT
- complex merge UI
- multi-user cursor-level collaboration
- advanced multi-branch collaborative workflows

## 7. Product Experience Goal

The ideal experience is:

- work as smoothly as a real-time document system
- manage versions as reliably as Git
- recover and inspect state like a control plane
