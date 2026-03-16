# ObsidianHub MVP Definition

## 1. MVP Goal

Validate whether the following value proposition holds:

1. users are willing to mount a personal vault into a self-hosted service
2. remote access plus basic web management solves a real problem
3. a controlled read/write API for agents is a meaningful differentiator
4. safe writes plus snapshot rollback materially improve user trust

## 2. Included in MVP

### Vault basics
- single vault mount
- persistent data directory
- attachment directory access

### Setup and admin
- setup wizard
- admin account creation
- vault path setting
- data path setting
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
- real-time collaborative editing
- plugin marketplace
- advanced publishing system

## 4. MVP Success Criteria

- the service can be started quickly with Docker
- users can complete setup and bind a vault
- users can remotely inspect basic content through the web
- agents can safely read/write within allowed paths through the API
- conflicts or mistaken writes can be recovered
