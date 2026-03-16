# ObsidianHub Architecture Draft

## 1. Overall Architecture

The MVP should start as a single-container, single-service deployment, with later service splitting only if complexity justifies it.

### Core modules
1. Web / API Service
2. Vault Access Layer
3. Sync API / Work-State Layer
4. Git Version Layer
5. Index / Search Layer
6. Snapshot / Backup Layer

## 2. Web / API Service

Responsible for:
- login and setup
- admin pages
- file browsing and basic editing
- exposing the Agent API
- showing system status
- serving as the plugin connection entry point

## 3. Vault Access Layer

Responsible for:
- path validation
- Markdown / frontmatter parsing
- atomic writes
- pre-write backup
- locking and conflict handling
- note-level operation wrappers

This is one of the most critical modules in the MVP.

## 4. Sync API / Work-State Layer

Responsible for:
- accepting work-state changes uploaded by the local Obsidian plugin
- providing the latest work state to other devices
- maintaining basic sync status
- exposing basic conflict information
- avoiding a one-save-one-commit mapping

## 5. Git Version Layer

Responsible for:
- Git repository detection / initialization
- checkpoint commits
- recent commit inspection
- diff / comparison
- file / version restore assistance
- later extension to remote Git backup

## 6. Index / Search Layer

Responsible for:
- full-text search
- tag extraction
- wikilink parsing
- frontmatter-aware search
- backlinks / metadata indexing (can start simplified)

## 7. Snapshot / Backup Layer

Responsible for:
- manual snapshots
- scheduled snapshots
- file restore
- full-vault restore

## 8. Suggested Data Mounts

- `/data/vault`: actual vault data
- `/data/app`: app state, indexes, logs, snapshot metadata, config

## 9. Future Extensions

- Git remote backup
- WebDAV compatibility
- finer-grained agent permissions
- richer search and structure understanding
- publishing and export features
- stronger plugin control panel
