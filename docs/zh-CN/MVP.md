# ObsidianHub MVP 定义

## 1. MVP 目标

验证以下价值是否成立：

1. 用户愿意把个人 vault 挂到一个自托管服务上
2. 远程访问 + 基础 Web 管理有真实需求
3. 用户愿意继续在本地 Obsidian 中工作，并通过轻插件连接自己的服务端
4. 面向 agent 的受控读写 API 是差异化能力
5. “实时工作态同步 + Git checkpoint + 快照回滚”能同时提升体验与信任

## 2. MVP 必做

### Vault 基础
- 单 vault 挂载
- 数据目录持久化
- 附件目录可访问

### 初始化与管理
- 初始化向导
- 管理员账号创建
- 固定挂载路径约定（如 `/data/vault`、`/data/app`）
- agent token 初始化
- 自动快照开关与保留策略

### Agent API
- `list_files`
- `read_note`
- `create_note`
- `update_note_body`
- `update_frontmatter`
- `rename_note`
- `archive_note`
- `append_note`
- `search`
- `list_tags`

### 实时工作态同步
- Sync API
- 本地改动上传
- 远端最新状态拉取
- 基础同步状态展示
- 基础冲突提示

### 轻量 Obsidian 插件原型
- 服务端地址配置
- token / 凭据配置
- 连接测试
- 手动 sync 操作
- Git / 同步状态展示
- 未提交改动提示

### Git 版本层
- 本地 Git 仓库识别或初始化（可选启用）
- 手动创建版本
- checkpoint commit 能力
- 最近提交查看

### 安全写入
- 原子写入
- 写前备份
- 修改时间校验
- 简单锁
- 冲突副本保留

### 快照 / 回滚
- 手动创建快照
- 自动定时快照
- 单文件回滚
- 整体 vault 回滚

## 3. MVP 不做

- 多 vault
- 多租户
- 团队共享
- 复杂 RBAC / ACL
- 重型实时协同编辑
- CRDT / OT
- 插件市场
- 高级发布系统
- 复杂多分支协作工作流
- 复杂 merge UI

## 4. MVP 成功标准

- 可通过 Docker 快速启动
- 用户可完成初始化并绑定 vault
- 用户可继续在 Obsidian 内工作并连接自己的服务端
- 多设备可同步当前工作状态
- Git 可保留更稳定的版本节点，而不是每次保存都提交
- agent 可通过 API 受控读写指定目录
- 发生冲突或误写后可恢复
