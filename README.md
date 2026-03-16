# ObsidianHub

**中文** | [English](README.en.md)

一个面向个人用户的自托管 Obsidian Server：支持远程访问、同步增强与多 agent 受控编辑。

## 项目定位

ObsidianHub 的目标不是替代 Obsidian，而是为个人 Obsidian vault 增加一层：

- 可远程访问
- 可通过 Web 管理
- 可被 AI / agent 受控操作
- 可回滚、可审计、可恢复

它更像是：

- 个人知识库的 API 化服务器层
- Obsidian 的远程操作系统 / 控制平面
- 面向自动化与 AI 的安全访问入口

## 为什么做

当 Obsidian 的使用场景延伸到下面这些需求时，原生体验会开始吃力：

- 人不在本机，也想安全访问自己的 vault
- 希望通过浏览器查看、搜索、编辑笔记
- 希望多个远程 agent 能安全、受控地读写知识库
- 希望自动化能力更强，但不想让 agent 直接拿文件系统乱改
- 希望所有修改都可追踪、可回滚、可恢复

## 核心能力

### 1. 人类远程访问层
解决“我不在本机，也能安全访问 Obsidian 数据”的问题：

- Web 文件浏览
- Markdown 预览
- 搜索
- 附件访问
- 基础编辑
- 上传 / 下载

### 2. 同步 / 一致性层
解决“多个端、多个进程、多个 agent 同时碰 vault 时，不把数据搞坏”的问题：

- 文件变更检测
- 原子写入
- 修改时间校验
- 简单锁机制
- 冲突副本保留
- 快照与回滚

### 3. Agent 操作层
解决“远程 agent 可以受控地操作 vault，而不是像 SSH 一样乱改文件”的问题：

- agent token
- 路径范围限制
- 只读 / 读写权限
- 操作集限制
- 速率限制
- 操作日志
- 面向 note 的 API

## MVP 范围

### 包含

- 单 vault 挂载
- Web 初始化页
- 管理员账号创建
- Agent API（`list_files` / `read_note` / `write_note` / `append_note` / `search` / `move_note` / `create_note` / `list_tags` / `update_frontmatter`）
- 安全写入机制
- 手动 / 自动快照
- 单文件 / 整体 vault 回滚

### 暂不包含

- 多租户
- 团队共享
- 复杂 RBAC
- 文件级 ACL
- 实时协作编辑
- 在线插件市场
- Notion 风格块编辑器

## Agent 权限模型

这个项目的权限设计重点不是“多人用户组”，而是“多个 agent 身份”。

每个 agent 可以拥有：

- 名称
- token
- 可访问路径范围
- 只读 / 读写权限
- 可执行操作集
- 速率限制
- 操作日志

## 文档

- [产品需求文档（中文）](docs/zh-CN/PRD.md)
- [MVP 定义（中文）](docs/zh-CN/MVP.md)
- [技术架构（中文）](docs/zh-CN/ARCHITECTURE.md)
- [Product Requirements (English)](docs/en/PRD.md)
- [MVP Definition (English)](docs/en/MVP.md)
- [Architecture (English)](docs/en/ARCHITECTURE.md)

## Docker 交付

这个项目非常适合 Docker 交付。

第一版建议优先单容器，后续复杂度上来后再拆分服务。

## 路线图

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
- 部署与发布优化

## 当前状态

当前仓库处于项目初始化阶段，近期优先事项：

1. 完成双语 PRD
2. 明确 MVP 技术栈
3. 搭建最小项目骨架
4. 开始实现 Vault Access Layer 与 Agent API
