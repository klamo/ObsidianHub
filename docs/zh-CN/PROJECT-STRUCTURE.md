# ObsidianHub 项目骨架设计

## 1. 目标

本文件定义 ObsidianHub 在 MVP 阶段的工程骨架，用于统一：

- 仓库目录结构
- 模块边界
- 服务端与插件的职责分离
- 后续交给 Codex / coding agent 的施工边界

当前阶段目标不是一次性把所有代码写完，而是先把骨架搭正。

## 2. 仓库形态

建议采用 **monorepo**。

原因：
- Web 管理台、服务端 API、轻量插件之间需要共享类型与协议
- Git / Sync / Vault 相关模型会在多个入口复用
- 后续由多个 agent / Codex 协作时，边界更清晰

## 3. 顶层目录建议

```text
apps/
  web/                 # Next.js 主应用（管理台 + API）

plugins/
  obsidian/            # 轻量 Obsidian 插件

packages/
  core/                # 共享领域模型、类型、常量
  vault/               # Vault Access Layer 核心库
  sync/                # Sync 协议与工作态同步逻辑
  git/                 # Git 版本层能力封装
  search/              # 搜索与索引相关核心逻辑
  config/              # 配置加载、schema、系统初始化逻辑

infra/
  docker/              # Docker 相关文件与说明

scripts/               # 本地开发/检查/辅助脚本

docs/
  zh-CN/
  en/
```

## 4. apps/web

负责：
- Web 管理台 UI
- 初始化向导
- 登录 / 管理员认证
- API route handlers
- 系统状态展示
- 快照管理入口
- agent 管理入口

### 建议子结构

```text
apps/web/src/
  app/                 # Next.js app router
  components/          # UI 组件
  server/              # 服务端组合层（调用 packages/*）
  lib/                 # Web 端工具函数
```

### 说明

`apps/web` 不应该独占所有核心逻辑。核心能力应尽量下沉到 `packages/*`，避免未来插件端或其他入口无法复用。

## 5. plugins/obsidian

负责：
- 服务器地址 / token 配置
- 连接测试
- 基础 sync 触发
- 同步状态展示
- Git / 未提交改动提示
- 基础命令与状态面板

### 明确不负责
- 重型同步引擎
- CRDT / OT
- 复杂 merge UI
- 重型本地数据库

### 设计原则

插件是 **客户端入口层 / 控制层**，不是全部业务逻辑的承载者。

## 6. packages/core

负责：
- 共享 types
- 共享 schemas
- 通用错误类型
- 共享常量
- 协议级接口定义

建议最早建立，作为各模块对齐的中心。

## 7. packages/vault

负责：
- 路径校验
- 路径规范化
- frontmatter / markdown 读写
- 原子写入
- 写前备份
- 简单锁
- 冲突副本
- note 级操作封装

这是 MVP 最关键模块之一，应优先设计与实现。

## 8. packages/sync

负责：
- Sync API 的请求/响应模型
- 工作态同步逻辑
- 同步状态表示
- 基础冲突信息
- debounce / checkpoint 相关策略接口（服务端侧）

它只负责“工作态同步”，不直接等同于 Git 版本层。

## 9. packages/git

负责：
- Git repo 识别 / 初始化
- working tree 状态读取
- checkpoint commit
- 最近提交读取
- diff / 历史辅助
- 后续远程 Git 备份扩展点

它负责“版本历史层”，不是每次保存都要调用。

## 10. packages/search

负责：
- 全文基础搜索
- tags / wikilinks / frontmatter 简化检索
- 索引构建与刷新

MVP 阶段应保持轻量，不引入重型搜索服务。

## 11. packages/config

负责：
- 环境变量 schema
- 系统初始化配置
- 挂载路径约束
- 默认目录约定
- 应用级配置读写

## 12. infra/docker

负责：
- Dockerfile
- docker-compose 示例（如需要）
- 挂载路径说明
- 部署说明

MVP 阶段优先单容器。

## 13. 施工优先级建议

### Phase A：骨架与共享模型
1. monorepo 基础配置
2. `packages/core`
3. `apps/web` 基础应用
4. `plugins/obsidian` 基础插件骨架

### Phase B：最关键能力
5. `packages/vault`
6. `packages/sync`
7. `packages/git`

### Phase C：支撑能力
8. `packages/config`
9. `packages/search`
10. `infra/docker`

## 14. 对 Codex / coding agent 的边界意义

这份结构的价值在于：
- 未来可把不同模块派给不同 agent
- 避免 web/plugin/server 逻辑混写
- 让 vault / sync / git 三个核心哲学分别有清晰落点

## 15. 当前建议结论

ObsidianHub 的工程骨架应以以下三条主线建立：

1. **Vault 是数据核心**
2. **Sync 是工作态核心**
3. **Git 是版本层核心**

Web 与插件只是进入系统的不同入口，而不是系统本体。 
