# ObsidianHub 当前进度看板

_最后更新：2026-03-23_

## 一句话状态

ObsidianHub 已经完成了**产品/架构收敛 + 数据核心第一版 + 动作层第一版**，当前主线卡在：

**Phase 3 的最小 HTTP / API 入口已落地并完成验证，主线已切到后续能力补齐。**

也就是说：

- 现在已经不是“空想项目”
- 但还没进入“可持续演示”的状态

---

## 总体完成度（当前估算）

### 按 MVP 整体看
- **约 35%–40%**

### 按核心后端骨架看
- **约 50%**

### 按“第一版可调用服务”看
- **约 25%–30%**

说明：
- 前半段的文档、骨架、vault、actions 推进得比较快
- 现在最关键的缺口是：**服务入口层真正跑通**

---

## 里程碑视角

### 里程碑 A：方向定住
- 状态：**已完成**

### 里程碑 B：数据核心可用
- 状态：**已完成第一版**

### 里程碑 C：动作层可用
- 状态：**已完成第一版**

### 里程碑 D：服务入口打通
- 状态：**已完成第一版（已验证）**

### 里程碑 E：最小可演示 MVP
- 状态：**未完成**

---

## 分阶段进度

## Phase 0：产品 / 架构收敛

### 完成度
- **85%–90%**

### 已完成
- README / README.en
- PRD / MVP
- ARCHITECTURE
- TECH-STACK
- PROJECT-STRUCTURE
- CLIENT-CONNECTION
- SYNC-AND-VERSIONING
- CLI-EXECUTION-ARCHITECTURE
- DEVELOPMENT-ROADMAP

### 当前判断
- 已经足够支撑后续施工
- 后续仅需随代码推进做增量修订

---

## Phase 1：Vault Core

### 完成度
- **70%–75%**

### 已完成
- 路径规范化 / 防路径逃逸
- `readText()` / `readNote()`
- `writeText()`
- frontmatter `replace/merge`
- simple YAML map 解析与序列化第一版
- atomic write 第一版
- backup 第一版
- `expectedMtimeMs` optimistic concurrency
- `createNote()`
- `updateFrontmatter()`
- `updateNoteBody()`
- `renameNote()`
- `archiveNote()`
- `@obsidianhub/vault` 测试 15 条通过

### 尚未完成
- `appendNote()`
- `copyNote()`
- `restoreArchivedNote()`
- 更完整的 lock / conflict copy
- frontmatter 格式保真策略

### 当前判断
- 已经达到“可作为上层基础数据核心”的水平
- 但还没到“功能完全收口”的程度

---

## Phase 2：Action Layer

### 完成度
- **60%–70%**

### 已完成
- note action contract 文档
- `packages/actions`
- action types / envelope
- 手写 validator 第一版
- `ServerNoteActionExecutor` 第一版
- 已接通的动作：
  - `read_note`
  - `create_note`
  - `update_note_body`
  - `update_frontmatter`
  - `rename_note`
  - `archive_note`
- `@obsidianhub/actions` 测试 5 条通过

### 尚未完成
- 统一 response formatter
- 统一 error formatter
- audit meta
- actor / permission hook
- search actions

### 当前判断
- 动作层已经成型
- 现在不该继续无限往里细抠，应该先往 API 入口接

---

## Phase 3：HTTP / API Layer

### 完成度
- **75%–80%**

### 已完成
- 已开始起最小 note actions API handler
- 已明确目标是 `POST /api/actions/notes`
- 已打通 validate → execute → response 的业务骨架

### 后续关注
- 已完成 `apps/web` + workspace packages 的 build 链路打通
- `POST /api/actions/notes` 最小入口已可用并完成验证

### 当前判断
- Phase 3 第一刀已落地，可进入后续能力补齐

---

## Phase 4：Search / Index / 基础管理能力

### 完成度
- **5%**

### 状态
- 文档有定义
- 代码基本未开始

---

## Phase 5：Sync / Plugin 接入

### 完成度
- **5%–10%**

### 状态
- 插件骨架已存在
- 真正的 Sync / 插件功能未开始

---

## Phase 6：Git / Snapshot / Recovery

### 完成度
- **5%**

### 状态
- 架构与文档已有
- 代码未开始

---

## Phase 7：权限 / 审计 / 控制平面

### 完成度
- **0%–5%**

### 状态
- 只有初步设计思路
- 还未进入实现

---

## 已经拿在手里的资产

## 文档资产
- 双语 README
- 双语 PRD / MVP / ARCHITECTURE
- TECH-STACK / PROJECT-STRUCTURE
- CLI-EXECUTION-ARCHITECTURE
- NOTE-ACTIONS-AND-TOOL-CONTRACT
- DEVELOPMENT-ROADMAP

## 工程资产
- monorepo 骨架
- `apps/web` Next.js 骨架
- `plugins/obsidian` 插件骨架
- `packages/core`
- `packages/config` 第一版
- `packages/vault` 第一版
- `packages/actions` 第一版

## 能力资产
- 安全 note 读写核心
- frontmatter 更新
- atomic write / backup / mtime conflict
- note-level API
- action contract / validator / executor

这部分已经是比较扎实的基础盘。

---

## 当前最大卡点

### 不是产品方向
产品方向目前是清楚的。

### 不是 vault 能力不足
`vault` 已经足够支撑上层继续搭。

### 不是 action layer 完全没成型
action layer 已经有了第一版。

### 真正卡点是
**`apps/web` 没有把 workspace packages 稳定消费起来。**

更直接一点说：

> 当前最大的工程阻塞，不是功能不会写，而是 monorepo package resolution / build 链路还没统一。

---

## 下一步主线

## 当前最高优先级
**修通 `apps/web` + workspace packages 的 Next build 链路**

### 具体目标
- 明确 `apps/web` 消费 workspace packages 的唯一方式
- 统一 `src` / `dist` / Next bundling 的解析策略
- 让 `@obsidianhub/core` / `config` / `vault` / `actions` 在 `web` 里 build 通过

### 通过标准
- `@obsidianhub/web typecheck` 通过
- `@obsidianhub/web build` 通过
- `POST /api/actions/notes` 这一条最小入口可端到端成立

### 完成后应做
- **完成 Phase 3 第一刀后，提交并 push GitHub**

---

## 距离“可演示 MVP”还差什么

要到“可以拿出来连续演示”的程度，至少还缺：

1. `apps/web` API 入口打通
2. 最小 note actions API 可实际调用
3. 基础搜索 / list 能力补上部分
4. 一个最小管理台或最小调试入口
5. 至少一条从请求到 vault 的稳定演示链路

换句话说，**还差的不是“大量新概念”，而是把已有模块接起来。**

---

## 当前建议怎么理解项目状态

你可以把 ObsidianHub 现在理解成：

### 已完成的
- 基础盘已经搭起来了
- 数据核心与动作层已经有了
- 项目不是从 0 开始了

### 未完成的
- 还没有形成“可持续演示”的服务闭环
- 还不能说 MVP 已经跑起来

### 最准确的一句话
**ObsidianHub 现在已经完成了大约 4 成基础建设，但离“第一版可调用服务 MVP”还差最关键的一道坎：Phase 3 的 HTTP / API 打通。**
