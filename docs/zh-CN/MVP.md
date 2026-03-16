# ObsidianHub MVP 定义

## 1. MVP 目标

验证以下价值是否成立：

1. 用户愿意把个人 vault 挂到一个自托管服务上
2. 远程访问 + 基础 Web 管理有真实需求
3. 面向 agent 的受控读写 API 是差异化能力
4. “安全写入 + 快照回滚”能显著提升用户信任

## 2. MVP 必做

### Vault 基础
- 单 vault 挂载
- 数据目录持久化
- 附件目录可访问

### 初始化与管理
- 初始化向导
- 管理员账号创建
- vault 路径设置
- 数据路径设置
- agent token 初始化
- 自动快照开关与保留策略

### Agent API
- `list_files`
- `read_note`
- `write_note`
- `append_note`
- `search`
- `move_note`
- `create_note`
- `list_tags`
- `update_frontmatter`

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
- 实时协同编辑
- 插件市场
- 高级发布系统

## 4. MVP 成功标准

- 可通过 Docker 快速启动
- 用户可完成初始化并绑定 vault
- 用户可通过 Web 远程查看基础内容
- agent 可通过 API 受控读写指定目录
- 发生冲突或误写后可恢复
