# ObsidianHub Client Connection Strategy

## 1. Design Goal

ObsidianHub should not be only a web admin console. It should also provide a client-side connection path so users can continue working inside local Obsidian while staying connected to the server.

## 2. MVP Conclusion

For MVP, WebDAV is not the primary sync core. The preferred direction is:

- **Git-first** versioning
- a **lightweight Obsidian plugin** as the client entry point
- an **ObsidianHub Sync API** as the work-state sync channel

## 3. Why Not WebDAV First

WebDAV is better treated as a general file-access protocol than as the primary real-time sync core under the current product philosophy.

This product needs a clear separation between:
- work-state sync
- version-state management
- snapshot-based recovery

WebDAV can still exist later as a compatibility feature rather than the main MVP path.

## 4. MVP Client Connection Method

### Local Obsidian
Users continue editing notes in their own Obsidian app.

### Lightweight plugin
The plugin is responsible for:
- configuring server address
- configuring token / credentials
- showing connection status
- triggering sync
- showing Git / sync status
- signaling uncommitted changes or sync issues

### Server side
ObsidianHub is responsible for:
- Sync API
- Git checkpoints
- snapshot recovery
- controlled agent operations

## 5. Future Compatibility Directions

Later optional support may include:
- Git remote backup
- WebDAV
- import / export features
- richer plugin control panels

## 6. Product Boundary

The MVP does not include:
- a full real-time collaboration system
- a heavy client-side sync engine
- multi-user simultaneous collaborative editing of the same file

The MVP should achieve:
- users continue working inside Obsidian
- users connect their Obsidian app to their own ObsidianHub service through a lightweight plugin
- multiple devices can sync current work state
- Git continues to represent more stable historical checkpoints
