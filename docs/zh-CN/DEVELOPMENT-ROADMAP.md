# ObsidianHub 开发路线图（MVP 实施版）

## 1. 目的

本文档用于把 ObsidianHub 的开发从“局部收敛式推进”升级为“阶段式推进”。

它回答四个问题：

1. 项目当前处于哪个阶段
2. 每个阶段的目标、边界、产物、验收标准是什么
3. 哪些工作适合 Moss 亲自收口，哪些适合交给 Codex 施工
4. 下一步应该做什么，而不是想到哪就做到哪

---

## 2. 当前总判断

截至现在，ObsidianHub 已经完成了：

- 产品定位与范围收敛
- 双语文档骨架
- monorepo 工程骨架
- `packages/core / config / vault` 第一轮基础实现
- `packages/vault` 的 note-level API 第一版
- note action contract 文档
- `packages/actions` 的 schema + server executor 第一版

也就是说，项目已经走过：

- **Phase 0：产品 / 架构收敛** 的大部分
- **Phase 1：Vault Core** 的核心部分
- **Phase 2：Action Layer** 的第一版

当前最自然的下一阶段入口是：

- **Phase 3：HTTP / API Layer 第一版**

---

## 3. 开发总阶段

MVP 期建议按 7 个阶段推进：

1. Phase 0：产品与架构收敛
2. Phase 1：Vault Core
3. Phase 2：Action Layer
4. Phase 3：HTTP / API Layer
5. Phase 4：Search / Index / 基础管理能力
6. Phase 5：Sync / Plugin 接入
7. Phase 6：Git / Snapshot / Recovery
8. Phase 7：权限 / 审计 / 控制平面收口

说明：
- 阶段之间不是绝对线性，允许少量交叉
- 但**主推进顺序**应尽量稳定，避免频繁切线

---

## 4. 各阶段定义

## Phase 0：产品与架构收敛

### 目标
把产品定位、系统边界、模块分层、MVP 范围先定住。

### 核心产物
- `README.md` / `README.en.md`
- `PRD.md`
- `MVP.md`
- `ARCHITECTURE.md`
- `TECH-STACK.md`
- `PROJECT-STRUCTURE.md`
- `CLIENT-CONNECTION.md`
- `SYNC-AND-VERSIONING.md`
- `CLI-EXECUTION-ARCHITECTURE.md`

### 当前状态
**已基本完成**。

### 验收标准
- 产品目标、非目标清楚
- 核心模块边界清楚
- Git / Sync / Vault 三层哲学清楚
- 后续施工不再反复摇摆主方向

### 谁来做更合适
- **Moss 主导**
- Codex 不适合主导这个阶段

---

## Phase 1：Vault Core

### 目标
建立一层可靠的 vault 数据核心，确保后续所有写操作都有安全基础。

### 核心能力
- 路径校验与规范化
- note 读取
- frontmatter 拆分与结构化读取
- frontmatter 写入入口
- atomic write
- backup
- optimistic concurrency
- note-level API

### 当前已完成
- `readText()` / `readNote()`
- `writeText()`
- frontmatter `replace/merge` 第一版
- `updateFrontmatter()`
- `createNote()`
- `updateNoteBody()`
- `renameNote()`
- `archiveNote()`
- 基础测试已跑通

### 当前未完成
- `appendNote()`
- `copyNote()`
- `restoreArchivedNote()`
- 更完整的 lock / conflict copy
- frontmatter 保真策略

### 当前状态
**核心已完成，进入可扩展阶段**。

### 验收标准
- note 级 CRUD/变体操作至少有一组稳定原语
- 写入具备 atomic + backup + mtime conflict
- 上层不必直接碰裸文件系统

### 谁来做更合适
- 核心语义与边界：**Moss**
- 成批补接口 / 测试铺量：**Codex**

---

## Phase 2：Action Layer

### 目标
把 `vault` 原语收敛为服务端与 agent 可调用的动作层。

### 核心能力
- note action types
- 请求 envelope
- payload schema / validator
- server executor adapter
- 统一错误模型

### 当前已完成
- note action contract 文档
- `packages/actions`
- `validateNoteAction()` 第一版
- `ServerNoteActionExecutor` 第一版
- 6 个核心动作已映射到 `vault`

### 当前未完成
- 统一 response formatter
- 统一 error formatter
- audit meta 补齐
- actor / permission hook
- search actions 接入

### 当前状态
**第一版已完成**。

### 验收标准
- 服务层已有统一动作接口，而不是直接暴露底层函数
- 关键 note actions 可被 schema 校验 + executor 执行

### 谁来做更合适
- schema / 边界 / contract：**Moss**
- 扩展更多 action 与批量测试：**Codex**

---

## Phase 3：HTTP / API Layer

### 目标
把 actions 真正挂到服务端入口，形成第一批可调用 API。

### 核心能力
- route handler / controller
- action validate → execute → format response
- 基础错误响应
- 基础 request tracing
- 最小认证/占位认证（MVP 可先简化）

### 建议第一批 API
- `POST /api/actions/notes`
  - 支持：
    - `read_note`
    - `create_note`
    - `update_note_body`
    - `update_frontmatter`
    - `rename_note`
    - `archive_note`

### 当前状态
**未开始，是下一阶段主入口**。

### 验收标准
- 从 HTTP 请求可打通到 `packages/actions`
- 能返回统一 success / error envelope
- 至少能端到端跑通 6 个核心 note actions

### 谁来做更合适
- API 形状、handler 边界：**Moss**
- route scaffold / 批量 wiring：**Codex**

---

## Phase 4：Search / Index / 基础管理能力

### 目标
把“能操作笔记”扩展成“能找得到、看得见、列得出”。

### 核心能力
- `search`
- `list_tags`
- `list_files`
- 基础目录浏览
- metadata / tag / frontmatter 索引

### 当前状态
**文档有定义，代码基本未开始**。

### 验收标准
- 能从 API 或管理台进行基础搜索
- agent 有最小知识检索能力
- 不必上重型搜索引擎

### 谁来做更合适
- 搜索边界与索引策略：**Moss**
- 轻量实现与测试：**Codex**

---

## Phase 5：Sync / Plugin 接入

### 目标
让用户继续在本地 Obsidian 中工作，并与服务端同步工作态。

### 核心能力
- 插件配置服务端地址 / token
- connection test
- 手动 sync
- 同步状态展示
- 服务端 Sync API

### 当前状态
**骨架有，尚未进入施工**。

### 验收标准
- 插件能连上服务端
- 能进行基础工作态同步
- 不要求完整复杂冲突解决

### 谁来做更合适
- 协议和边界：**Moss**
- 插件骨架和大量实现：**Codex**

---

## Phase 6：Git / Snapshot / Recovery

### 目标
补上可信恢复能力，把“能写”提升为“敢用”。

### 核心能力
- Git repo init/detect
- checkpoint commit
- snapshot create/list/restore
- file restore
- vault restore

### 当前状态
**文档已收敛，代码未开始**。

### 验收标准
- 误写后可恢复
- 版本与工作态两层职责不混
- 用户能理解何时看 Git、何时看 snapshot

### 谁来做更合适
- 恢复模型与风险边界：**Moss**
- 施工与测试：**Codex**

---

## Phase 7：权限 / 审计 / 控制平面收口

### 目标
让多 agent 操作变得可控，而不是只靠“功能能跑”。

### 核心能力
- action-level permission
- path prefix restriction
- actor identity
- audit log
- executor routing
- 后续 CLI executor 接口预留

### 当前状态
**仅文档层有初步想法**。

### 验收标准
- agent 不再拥有模糊的大写权限
- 关键动作可审计、可回放、可归因
- Server / CLI 双执行通道能纳入同一控制面

### 谁来做更合适
- **Moss 主导**
- Codex 配合实现

---

## 5. 当前阶段定位

### 已完成
- Phase 0：≈ 85%+
- Phase 1：≈ 70%+
- Phase 2：≈ 60%+

### 当前主阶段
- **进入 Phase 3：HTTP / API Layer 第一版**

### 当前不该分散精力的方向
- 不要现在就提前做复杂权限系统
- 不要现在就提前做完整 CLI executor
- 不要现在就被搜索、插件、Git 三线同时拉走
- 不要把 action layer 无限打磨到过度设计

---

## 6. 接下来 3 个最自然步骤

## Step 1：打通最小 note actions HTTP 入口

目标：
- 在 `apps/web` 中起一个最小 API handler
- 先只支持 note actions 的 6 个核心动作

产物：
- route handler
- request parsing
- 调用 `validateNoteAction()`
- 调用 `ServerNoteActionExecutor`
- 统一响应格式

这是**当前最高优先级**。

---

## Step 2：补 action response / error formatter

目标：
- 统一 success / error envelope
- 为后续 audit / tracing 留接口

原因：
- 现在 executor 已经有了
- 但 API 层要稳定，响应格式也要先收口

---

## Step 3：在 API 跑通后，再回头补 search actions

目标：
- 用同一 action pipeline 再接 `search` / `list_tags`

原因：
- 这能验证 action system 不是只适用于 note 写操作

---

## 7. Moss / Codex 协作策略

后续建议明确采用下面的分工：

### Moss 负责
- 阶段规划
- 边界定义
- action contract
- API 设计
- 风险识别
- 验收标准
- 最后收口与提交前审阅

### Codex 负责
- scaffold
- 批量实现
- 重复性 wiring
- 大块样板代码
- 根据任务包施工

### 默认工作流
1. Moss 先写阶段目标与任务包
2. 若任务小且边界敏感，Moss 可直接写
3. 若任务大、重复、可并行，则交给 Codex
4. Moss 统一跑 typecheck/test、审代码、收口提交

---

## 8. 当前结论

ObsidianHub 现在不该继续“哪里顺手就补哪里”，而应切换为：

- **阶段明确**
- **当前主线明确**
- **每阶段验收明确**
- **Moss / Codex 分工明确**

当前主线结论只有一句话：

**先把 note actions 通过最小 HTTP / API 入口打通。**
