# ObsidianHub MVP Definition

## 1. MVP Goal

Validate whether the following value proposition holds:

1. users are willing to mount a personal vault into a self-hosted service
2. remote access plus basic web management solves a real problem
3. users are willing to keep working in local Obsidian while connecting to their own server through a lightweight plugin
4. a controlled read/write API for agents is a meaningful differentiator
5. real-time work-state sync plus Git checkpoints plus snapshot rollback improve both usability and trust

## 2. Included in MVP

### Vault basics
- single vault mount
- persistent data directory
- attachment directory access

### Setup and admin
- setup wizard
- admin account creation
- fixed mounted path convention (such as `/data/vault` and `/data/app`)
- initial agent token setup
- automatic snapshot toggle and retention settings

### Agent API
- `list_files`
- `read_note`
- `write_note`
- `append_note`
- `search`
- `move_note`
- `create_note`
- `list_tags`
- `update_frontmatter`

### Real-time work-state sync
- Sync API
- local change upload
- latest remote state fetch
- basic sync status display
- basic conflict signaling

### Lightweight Obsidian plugin prototype
- server address configuration
- token / credential configuration
- connection test
- manual sync action
- Git / sync status display
- uncommitted change indication

### Git version layer
- local Git repository detection or initialization (optional enablement)
- manual version creation
- checkpoint commit capability
- recent commit inspection

### Safe write features
- atomic writes
- pre-write backup
- modified-time validation
- simple locking
- conflict copy retention

### Snapshot / rollback
- manual snapshot creation
- automatic scheduled snapshots
- file-level rollback
- vault-level rollback

## 3. Not in MVP

- multiple vaults
- multi-tenancy
- team sharing
- complex RBAC / ACL
- heavy real-time collaborative editing
- CRDT / OT
- plugin marketplace
- advanced publishing system
- complex multi-branch collaborative workflows
- complex merge UI

## 4. MVP Success Criteria

- the service can be started quickly with Docker
- users can complete setup and bind a vault
- users can continue working inside Obsidian while connecting to their own service
- multiple devices can sync current work state
- Git preserves stable version checkpoints rather than committing every save
- agents can safely read/write within allowed paths through the API
- conflicts or mistaken writes can be recovered
