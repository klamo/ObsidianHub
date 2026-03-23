# ObsidianHub Note Actions / Tool Contract（草案）

## 1. 目的

本文档用于把 ObsidianHub 当前的 note 操作能力，从底层 `packages/vault` API 收敛成：

- 面向 agent / tool 的统一动作模型
- 面向未来服务端 API 的稳定契约
- 面向双执行通道（Server Executor / Client CLI Executor）的可路由任务定义

它解决的问题不是“底层如何写文件”，而是：

- 对外到底暴露哪些动作
- 每个动作的输入/输出怎么定义
- 错误与冲突如何表达
- 哪些动作应先在 MVP 中支持
- 哪些动作由服务端原生执行，哪些未来可路由到 CLI 执行器

---

## 2. 设计原则

### 2.1 动作要比底层文件操作更高层

不要把外部契约直接暴露成“任意路径写文件”。

更合理的方式是暴露语义化动作，例如：

- `create_note`
- `read_note`
- `update_note_body`
- `update_frontmatter`
- `rename_note`
- `archive_note`

这样更容易做：

- 权限控制
- 审计
- 安全约束
- 日志归因
- 后续执行器切换

### 2.2 默认保守，不追求无限灵活

MVP 阶段优先：

- 明确
- 可审计
- 可恢复
- 低歧义

不优先：

- 一次性塞入过多自由度
- 让 agent 直接拿到底层文件系统式能力
- 让多个动作边界重叠过多

### 2.3 动作契约与执行器解耦

对外看到的是统一 action。

内部执行时，控制平面可路由到：

- `server-vault-executor`
- `client-cli-executor`（后续）

因此 action contract 不应绑定某个具体执行器实现。

### 2.4 冲突必须是一等公民

只要涉及写入，就必须有：

- optimistic concurrency（如 `expectedMtimeMs`）
- 原子写入
- 冲突错误返回
- 审计与恢复空间

---

## 3. 动作分层

建议把动作分成三层：

### A. Note Core Actions

最核心、最常用、MVP 必须稳定：

- `read_note`
- `create_note`
- `update_note_body`
- `update_frontmatter`
- `rename_note`
- `archive_note`

### B. Note Utility Actions

有用但不一定第一批全部开放：

- `append_note`
- `copy_note`
- `restore_archived_note`
- `list_directory`
- `stat_note`

### C. Knowledge Actions

依赖搜索 / 索引层：

- `search`
- `list_tags`
- `list_backlinks`（后续）
- `find_by_frontmatter`（后续）

MVP 建议优先打磨 A 层，再逐步扩到 B/C。

---

## 4. 统一动作 envelope

建议所有 tool / API action 都使用统一 envelope：

```json
{
  "action": "update_frontmatter",
  "requestId": "req_123",
  "vaultId": "default",
  "actor": {
    "type": "agent",
    "id": "organizer-agent"
  },
  "payload": { ... }
}
```

返回统一为：

```json
{
  "ok": true,
  "requestId": "req_123",
  "action": "update_frontmatter",
  "result": { ... },
  "meta": {
    "executor": "server-vault-executor"
  }
}
```

失败时：

```json
{
  "ok": false,
  "requestId": "req_123",
  "action": "update_frontmatter",
  "error": {
    "code": "CONFLICT",
    "message": "Vault file changed since the caller last read it.",
    "details": { ... }
  }
}
```

### 统一字段建议

#### 通用请求字段
- `action`: 动作名
- `requestId`: 请求 ID，便于审计与幂等追踪
- `vaultId`: 当前先固定单 vault，也保留字段
- `actor`: 调用者身份
- `payload`: 动作参数

#### 通用响应字段
- `ok`: 是否成功
- `requestId`: 原样回传
- `action`: 原样回传
- `result`: 成功结果
- `error`: 失败对象
- `meta.executor`: 实际执行器
- `meta.auditId`: 审计记录 ID（后续可加）

---

## 5. MVP 核心动作定义

## 5.1 `read_note`

读取单篇 note 的结构化内容。

### 请求

```json
{
  "action": "read_note",
  "payload": {
    "path": "notes/example.md",
    "include": {
      "raw": true,
      "frontmatter": true,
      "body": true
    }
  }
}
```

### 结果

```json
{
  "path": "notes/example.md",
  "content": "---\ntitle: Example\n---\nBody\n",
  "document": {
    "frontmatter": {
      "title": "Example"
    },
    "body": "Body\n"
  },
  "mtimeMs": 1742119200000,
  "size": 27
}
```

### 说明

- `read_note` 面向 note 语义，而不是任意二进制文件读取
- 后续可扩展 `include.attachments`、`include.stat`
- 底层当前映射到 `vault.readNote()`

---

## 5.2 `create_note`

创建新 note。

### 请求

```json
{
  "action": "create_note",
  "payload": {
    "path": "notes/example.md",
    "body": "Body\n",
    "frontmatter": {
      "mode": "replace",
      "data": {
        "title": "Example"
      }
    },
    "writeStrategy": "atomic"
  }
}
```

### 结果

```json
{
  "path": "notes/example.md",
  "created": true,
  "mtimeMs": 1742119200000,
  "bytesWritten": 27
}
```

### 语义

- 默认不覆盖已有文件
- 若目标已存在，返回 `CONFLICT`
- 底层映射到 `vault.createNote()`

---

## 5.3 `update_note_body`

只更新正文，不改 frontmatter。

### 请求

```json
{
  "action": "update_note_body",
  "payload": {
    "path": "notes/example.md",
    "body": "New body\n",
    "expectedMtimeMs": 1742119200000,
    "writeStrategy": "atomic",
    "backup": true
  }
}
```

### 结果

```json
{
  "path": "notes/example.md",
  "mtimeMs": 1742119260000,
  "bytesWritten": 31,
  "backup": {
    "path": ".obsidianhub/backups/notes/example.md.2026-03-16T10-01-00.000Z.bak"
  }
}
```

### 语义

- frontmatter 保留
- body 全量替换
- 若 `expectedMtimeMs` 不匹配，返回 `CONFLICT`
- 底层映射到 `vault.updateNoteBody()`

---

## 5.4 `update_frontmatter`

只更新 frontmatter，不改正文。

### 请求

```json
{
  "action": "update_frontmatter",
  "payload": {
    "path": "notes/example.md",
    "mutation": {
      "mode": "merge",
      "data": {
        "tags": ["project"],
        "draft": false
      }
    },
    "expectedMtimeMs": 1742119200000,
    "writeStrategy": "atomic",
    "backup": true
  }
}
```

### 结果

```json
{
  "path": "notes/example.md",
  "mtimeMs": 1742119300000,
  "bytesWritten": 52
}
```

### 语义

- `mode: replace | merge`
- 当前第一版 frontmatter 能力针对简单 YAML map
- 底层映射到 `vault.updateFrontmatter()`

### 当前边界

暂不承诺完整 YAML 保真：

- 注释保留
- key 顺序保留
- 原始格式保留
- 复杂块字符串
- 数组内嵌对象的完整保真

这类能力后续若有必要，再升级 parser/serializer 策略。

---

## 5.5 `rename_note`

在 vault 内移动 / 重命名 note。

### 请求

```json
{
  "action": "rename_note",
  "payload": {
    "fromPath": "notes/example.md",
    "toPath": "archive/example-renamed.md"
  }
}
```

### 结果

```json
{
  "fromPath": "notes/example.md",
  "toPath": "archive/example-renamed.md",
  "mtimeMs": 1742119340000
}
```

### 语义

- 默认不覆盖目标
- 目标父目录可自动创建
- 底层映射到 `vault.renameNote()`

---

## 5.6 `archive_note`

将 note 安全归档，而不是直接删除。

### 请求

```json
{
  "action": "archive_note",
  "payload": {
    "path": "notes/example.md"
  }
}
```

### 结果

```json
{
  "fromPath": "notes/example.md",
  "toPath": ".obsidianhub/archive/notes/example.md.2026-03-16T10-05-00.000Z.archived",
  "mtimeMs": 1742119500000
}
```

### 语义

- MVP 阶段优先归档，不开放硬删除为默认动作
- 对 agent 更安全，也更符合“可恢复”路线
- 底层映射到 `vault.archiveNote()`

---

## 6. 与 MVP 既有动作名的关系

当前 MVP 文档已有：

- `list_files`
- `read_note`
- `write_note`
- `append_note`
- `search`
- `move_note`
- `create_note`
- `list_tags`
- `update_frontmatter`

建议做如下收敛：

### 保留
- `read_note`
- `create_note`
- `search`
- `list_tags`
- `update_frontmatter`

### 重命名 / 语义细化
- `move_note` → `rename_note`
  - 因为本质是 vault 内 rename / move
- `write_note` → 拆成：
  - `update_note_body`
  - `update_frontmatter`
  - 必要时保留 `replace_note`

### 暂缓或放到第二批
- `append_note`
  - 可以做，但优先级低于 `update_note_body`

我的建议是：MVP 的“写 note”不要只有一个 `write_note` 大口子。那样太宽，会把权限和审计做坏。

---

## 7. 错误模型

建议对外统一错误码：

- `NOT_FOUND`
- `CONFLICT`
- `VALIDATION_ERROR`
- `PATH_ACCESS_ERROR`
- `UNAUTHORIZED`
- `FORBIDDEN`
- `INTERNAL_ERROR`

### 重点错误

#### `CONFLICT`
用于：
- `expectedMtimeMs` 不匹配
- 原子写入准备阶段发现文件已变化
- create/rename 时目标已存在

#### `PATH_ACCESS_ERROR`
用于：
- 路径逃逸
- 越权访问未授权目录

#### `VALIDATION_ERROR`
用于：
- frontmatter mutation 非法
- 参数缺失
- payload 结构不合法

---

## 8. 审计与权限建议

每个 action 应天然带有可审计信息：

- 谁发起
- 何时发起
- 作用路径
- 是否成功
- 是否触发 backup
- 是否触发 conflict
- 实际使用的 executor

权限建议不要一开始做成复杂 RBAC，而是先做：

- 按 agent 限定允许路径前缀
- 按 agent 限定允许动作集合
- 对高风险动作单独开关

例如：

- organizer agent：可 `create_note` / `rename_note` / `update_frontmatter` / `archive_note`
- index agent：可 `read_note` / `search` / `list_tags`，不可写正式目录

---

## 9. 与执行器的映射

### 当前：Server Vault Executor

当前 MVP 第一版几乎都直接映射到 `packages/vault`：

- `read_note` → `readNote()`
- `create_note` → `createNote()`
- `update_note_body` → `updateNoteBody()`
- `update_frontmatter` → `updateFrontmatter()`
- `rename_note` → `renameNote()`
- `archive_note` → `archiveNote()`

### 后续：Client CLI Executor

未来 CLI 执行器接入后，不改变 action contract，只改变路由：

- `read_note`：仍可优先服务端读取
- `rename_note` / 某些高层 note 操作：可选路由到 CLI
- 最终仍由控制平面记录审计、同步结果、决定是否触发 checkpoint

---

## 10. 当前建议的对外最小动作集

如果现在就要开始做服务端 API / agent tool，我建议最小集合是：

1. `read_note`
2. `create_note`
3. `update_note_body`
4. `update_frontmatter`
5. `rename_note`
6. `archive_note`
7. `search`
8. `list_tags`

这是一个已经足够有用，同时边界还比较清楚的集合。

---

## 11. 下一步建议

基于本文档，下一步建议做三件事：

1. **把 MVP 文档中的 Agent API 名称同步收敛**
   - 特别是 `write_note` / `move_note`

2. **在服务端层定义 action schema**
   - zod / valibot / JSON Schema 均可

3. **补一个 executor adapter 层**
   - `packages/vault` 提供底层原语
   - `server actions` 负责参数校验、权限检查、审计、结果整形

---

## 12. 一句话结论

ObsidianHub 对外不应暴露“任意文件写入”，而应暴露**语义明确、可审计、可路由、带冲突保护的 note actions**。
