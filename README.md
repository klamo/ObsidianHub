# ObsidianHub

一个面向个人用户的自托管 Obsidian Server：支持远程访问、同步增强与多 agent 受控编辑。

## Why

Obsidian 已经是很强的个人知识工具，但当使用场景延伸到以下需求时，原生体验会开始吃力：

- 人不在本机，也希望安全访问自己的 vault
- 希望通过浏览器或轻量 Web 界面查看、搜索、管理笔记
- 希望多个远程 agent 能安全、受控地读写知识库
- 希望引入自动化能力，但不想让 agent 直接拿文件系统乱改
- 希望所有修改都可追踪、可回滚、可恢复

ObsidianHub 的目标不是替代 Obsidian，而是为个人 Obsidian vault 增加一层可远程访问、可编排、可审计的服务器能力。

## Positioning

ObsidianHub 不是：

- 团队知识库平台
- 企业协作系统
- Notion 替代品
- 在线富文本块编辑器

ObsidianHub 更像是：

- 个人知识库的 API 化服务器层
- Obsidian 的远程操作系统 / 控制平面
- 面向 AI / automation 的受控访问入口

## Core Product Direction

项目第一阶段聚焦三层能力：

### 1. Human Remote Access Layer
解决“人不在本机，也能安全访问 Obsidian 数据”的问题：

- Web 文件浏览
- Markdown 预览
- 搜索
- 附件访问
- 基础编辑
- 上传 / 下载

### 2. Sync & Consistency Layer
解决“多个端、多个进程、多个 agent 同时碰 vault 时，不把数据搞坏”的问题：

- 文件变更检测
- 原子写入
- 修改时间校验
- 简单锁机制
- 冲突保留副本
- 快照与回滚

### 3. Agent Operation Layer
解决“远程 agent 可以受控地操作 vault，而不是像 SSH 一样乱改文件”的问题：

- agent token
- 路径范围限制
- 只读 / 读写权限
- 操作集限制
- 速率限制
- 操作日志
- 面向 note 的 API（而不是裸文件系统）

## MVP Scope

第一版建议保持克制，只做真正必要的能力。

### Included in MVP

#### Vault Mount
- 指定宿主机目录作为 vault
- 容器挂载持久化目录
- 支持附件目录
- 单 vault 优先，暂不做多 vault

#### Web Setup
- 初始化页面
- 管理员账号创建
- vault 路径 / 数据路径设置
- 服务地址配置
- agent token 配置
- 自动快照配置

#### Agent API
首批接口以高价值、低歧义为主：

- `list_files`
- `read_note`
- `write_note`
- `append_note`
- `search`
- `move_note`
- `create_note`
- `list_tags`
- `update_frontmatter`

#### Safe Write Mechanism
- 原子写入
- 写前备份
- 修改时间校验
- 简单锁
- 冲突副本保留

#### Snapshot / Restore
- 手动创建快照
- 自动定时快照
- 单文件回滚
- 整体 vault 回滚

### Explicitly Not in MVP

- 多租户
- 团队共享
- 复杂 RBAC
- 文件级 ACL
- 实时协作编辑
- 在线插件市场
- 类 Notion 块编辑器
- 组织 / 空间 / 部门模型
- 一开始就做很多容器拆分

## Agent Permission Model

这个项目的权限设计重点不是“多人用户组”，而是“多个 agent 身份”。

每个 agent 可拥有：

- 名称
- token
- 可访问路径范围
- 只读 / 读写权限
- 可执行操作集
- 速率限制
- 操作日志

示例：

- Agent A：整理助手
  - 可读写 `Inbox/`、`Daily/`
  - 不可删除文件
  - 不可访问 `Archive/`

- Agent B：索引助手
  - 全库只读
  - 可写 `system/indexes/`
  - 不可编辑正式笔记

- Agent C：发布助手
  - 只能读取 `Publish/`
  - 可生成导出文件
  - 不可修改原文

## Technical Direction

建议的最小架构：

### 1. Web / API Service
负责：
- 登录
- 初始化设置
- 管理页面
- 文件浏览
- 搜索
- agent API

### 2. Vault Access Layer
负责：
- 文件读写封装
- 路径限制
- 锁与冲突控制
- 原子写入
- frontmatter / markdown 结构处理

### 3. Index / Search Layer
负责：
- 全文索引
- 标签提取
- wikilink 解析
- frontmatter 解析
- 附件引用分析

### 4. Snapshot / Backup Layer
负责：
- 写前备份
- 定时快照
- 恢复 / 回滚

### 5. Optional Sync Adapter Layer
后续再考虑：
- WebDAV
- Git
- S3
- Rsync
- 官方同步协同策略

## Docker Delivery Strategy

这个项目非常适合 Docker 交付。

### First Stage
第一版优先单容器：

- Web 服务
- API
- 文件访问层
- 搜索索引
- 定时任务

建议挂载：

- `/data/vault`
- `/data/app`

这样部署成本最低，也最容易让用户快速试用。

### Later Stage
复杂度上来后再考虑拆分：

- `app`
- `db`
- `search`
- `backup-worker`

## Product Principles

ObsidianHub 的核心价值不在“又一个文件管理网页”，而在于把以下三件事做扎实：

1. **理解 Obsidian / Markdown 结构**
   - frontmatter
   - wikilink
   - tags
   - attachments
   - daily notes
   - backlinks

2. **对 agent 操作做真正约束**
   - 不是直接开放文件系统
   - 而是基于能力边界、路径边界、操作边界开放 API

3. **强调可恢复性**
   - 所有重要改动可追溯
   - 可撤销
   - 可恢复
   - 可审计

## Roadmap

### Phase 0
- 明确产品定位
- 完成 PRD
- 完成技术方案
- 搭建仓库基础结构

### Phase 1
- 初始化配置流程
- Vault Access Layer
- 基础 Agent API
- 快照 / 回滚能力

### Phase 2
- 搜索与索引
- Agent 权限模型
- Web 管理台
- 冲突检测与日志

### Phase 3
- 同步适配层
- 更完善的 agent workflow
- 发布与部署优化

## Status

当前仓库处于项目初始化阶段。

近期优先事项：

1. 完成 PRD
2. 明确 MVP 技术栈
3. 搭建最小项目骨架
4. 开始实现 Vault Access Layer 与 Agent API

---

如果你也在做“个人知识库 + 远程访问 + AI 可控操作”的方向，欢迎围观这个项目的演化过程。
