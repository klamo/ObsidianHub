# ObsidianHub MVP 技术栈建议（讨论稿）

> 状态：讨论稿 v2
> 目标：为 MVP 选择一套实现成本可控、Docker 友好、对 Markdown / 文件系统 / Sync API / Git 版本管理友好的技术栈。

## 1. 设计原则

MVP 阶段技术栈优先级：

1. **稳定与可维护** 高于“炫技”
2. **文件系统操作能力** 高于前端体验花样
3. **Docker 交付简单** 高于微服务拆分
4. **对 Markdown / frontmatter / 搜索友好**
5. **支持轻插件 + Sync API + Git 分层模型**
6. **方便后续接入 Codex / agent 协作开发**

## 2. 建议方案（主推）

### 后端 / Web
- **TypeScript**
- **Node.js 22 LTS**
- **Next.js 15（App Router）**

### API / 服务逻辑
- Next.js Route Handlers 作为第一阶段 API 层
- 服务逻辑按模块拆到 `src/server/*`
- 增加：
  - `src/server/sync`：工作态同步
  - `src/server/git`：Git 版本管理

### 数据与状态
- **SQLite** 用于：
  - 管理员账号
  - agent 配置
  - 操作日志
  - 快照元数据
  - 系统设置
  - 同步状态元数据
- **文件系统** 作为 vault 真正的数据源
- **Git 仓库** 作为版本历史层（可选启用，但 Git-first 设计）

### 搜索 / 索引
- MVP 先做：
  - SQLite + 自建轻量索引表
  - 或 Node 侧扫描 + 内存/文件缓存
- 支持：
  - 全文基础搜索
  - tags / wikilinks / frontmatter 简化检索
- 暂不引入 Elasticsearch / Meilisearch 这类重依赖

### Markdown 处理
- `gray-matter`：frontmatter 解析
- `remark` / `remark-gfm`：Markdown 结构处理
- `github-slugger` 或同类工具：标题 anchor / slug 辅助

### 认证与密码
- 管理员密码：`argon2`
- 登录 session：简单 cookie session
- Agent token：随机生成、哈希存储，不明文保存
- 插件连接 token：独立管理，避免与管理端会话混用

### 定时任务
- MVP 先用 Node 进程内定时任务
- 用于自动快照、索引刷新、checkpoint 触发等
- 后续再视情况拆 worker

### UI
- Next.js 自带 React 前端
- `shadcn/ui` + Tailwind（如果想快速做管理台）
- 插件 UI 先保持克制，优先做连接与状态能力

### Docker
- 第一版单容器
- 卷挂载：
  - `/data/vault`
  - `/data/app`

## 3. 为什么主推 TS / Node / Next

### 优点
- Web + API + 管理台一体化，MVP 非常顺手
- 文件系统操作对 Node 很自然
- Markdown / frontmatter 生态成熟
- 对实现轻插件配套 API 很方便
- 后面接 Codex / agent 协作写 TS，资料与样板多
- Docker 化简单
- 从 MVP 演进到正式产品的路径比较平滑

### 风险
- Next.js 对“纯后端服务”来说会显得稍重
- 如果后面后台任务非常多，可能要拆出独立 worker
- 文件锁 / 原子写入 / Git checkpoint 触发规则要自己认真做好

## 4. 同步与版本分层建议

### 工作态同步层
- 通过轻插件 + Sync API 实现
- 负责 autosave、工作态传播、多设备尽快看到最新内容
- 不要求每次都生成 Git commit

### Git 版本层
- 负责 checkpoint、历史、回滚、远程备份基础
- commit 触发应按“有意义节点”而不是“每次保存”

### 快照层
- 作为 Git 之外的安全兜底
- 用于文件级 / vault 级恢复

## 5. MVP 架构建议

### 目录草案

```text
apps/web                # Next.js 主应用
src/server/auth         # 登录、session、管理员认证
src/server/agents       # agent token、权限、日志
src/server/vault        # 文件访问层（重点）
src/server/sync         # 工作态同步 API
src/server/git          # Git 版本层
src/server/search       # 搜索与索引
src/server/snapshot     # 快照与回滚
src/server/config       # 初始化与系统设置
plugins/obsidian        # 轻量 Obsidian 插件（后续）
```

### 数据分层

- **Vault 文件**：真实知识内容
- **SQLite**：系统控制面数据与同步元数据
- **Git repo**：版本历史
- **App data**：索引、日志、快照元数据、配置

## 6. 最关键的实现点

### A. Vault Access Layer
这是 MVP 的核心，不是 UI。

必须优先认真设计：
- 路径规范化
- 防路径逃逸
- 原子写入
- 前置备份
- 修改时间校验
- 简单锁
- 冲突副本

### B. Sync API
最小可用能力建议：
- 上传本地工作态变更
- 拉取远端最新状态
- 返回同步状态
- 返回基础冲突信息

### C. Git Version Layer
最小可用能力建议：
- 识别 / 初始化仓库
- 查看工作区状态
- 手动创建版本
- checkpoint commit
- 查看最近提交

### D. Agent Permission Model
最小可用权限模型建议：
- path scope
- readonly / readwrite
- allowed operations
- rate limit
- audit log

### E. Snapshot / Recovery
至少要保证：
- 改坏后有后悔药
- 操作可追踪
- 单文件恢复先于全库恢复

## 7. 当前推荐结论

如果以“尽快做出一个真能跑的 Docker MVP”为目标，我当前推荐：

- **Node.js 22 + TypeScript + Next.js**
- **SQLite**
- **文件系统作为主数据源**
- **Git-first 版本管理**
- **轻插件 + Sync API 作为工作态同步入口**
- **单容器部署**
- **先不做 WebDAV 主同步，不做 CRDT / OT，不做重型协同编辑**

## 8. 已拍板结论

- 技术主线：**TS / Next 一体化**
- 管理台风格：**克制、够用优先**
- 搜索：**基础全文 + tags / wikilinks / frontmatter 简化支持**
- 初始化路径：**固定挂载路径优先**
- 版本路线：**Git 优先**
- 客户端方向：**轻量 Obsidian 插件 + Sync API**
