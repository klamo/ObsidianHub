# ObsidianHub 技术架构（草案）

## 1. 总体架构

MVP 建议采用单容器单服务起步，后续按复杂度再拆分。

### 核心模块
1. Web / API Service
2. Vault Access Layer
3. Index / Search Layer
4. Snapshot / Backup Layer

## 2. Web / API Service

负责：
- 登录与初始化
- 管理页
- 文件浏览与基础编辑
- Agent API 暴露
- 系统状态展示

## 3. Vault Access Layer

负责：
- 路径校验
- Markdown / frontmatter 解析
- 原子写入
- 写前备份
- 锁与冲突处理
- note 级操作封装

这是 MVP 最关键的模块之一。

## 4. Index / Search Layer

负责：
- 全文搜索
- tags 提取
- wikilink 解析
- backlinks / 元数据索引（可先做简化版）

## 5. Snapshot / Backup Layer

负责：
- 手动快照
- 定时快照
- 单文件恢复
- 整体 vault 恢复

## 6. 数据挂载建议

- `/data/vault`：实际 vault 数据
- `/data/app`：应用状态、索引、日志、快照元数据

## 7. 后续可扩展方向

- WebDAV / Git / S3 / Rsync 适配
- 更细粒度 agent 权限
- 更完整的搜索索引与结构理解
- 发布与导出能力
