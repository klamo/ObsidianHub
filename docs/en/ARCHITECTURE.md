# ObsidianHub Architecture Draft

## 1. Overall Architecture

The MVP should start as a single-container, single-service deployment, with later service splitting only if complexity justifies it.

### Core modules
1. Web / API Service
2. Vault Access Layer
3. Index / Search Layer
4. Snapshot / Backup Layer

## 2. Web / API Service

Responsible for:
- login and setup
- admin pages
- file browsing and basic editing
- exposing the Agent API
- showing system status

## 3. Vault Access Layer

Responsible for:
- path validation
- Markdown / frontmatter parsing
- atomic writes
- pre-write backup
- locking and conflict handling
- note-level operation wrappers

This is one of the most critical modules in the MVP.

## 4. Index / Search Layer

Responsible for:
- full-text search
- tag extraction
- wikilink parsing
- backlinks / metadata indexing (can start simplified)

## 5. Snapshot / Backup Layer

Responsible for:
- manual snapshots
- scheduled snapshots
- file restore
- full vault restore

## 6. Suggested Data Mounts

- `/data/vault`: actual vault data
- `/data/app`: app state, indexes, logs, snapshot metadata

## 7. Future Extensions

- WebDAV / Git / S3 / Rsync adapters
- finer-grained agent permissions
- richer search and structure understanding
- publishing and export features
