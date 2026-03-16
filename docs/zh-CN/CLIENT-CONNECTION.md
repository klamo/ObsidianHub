# ObsidianHub 客户端连接方案

## 1. 设计目标

ObsidianHub 不只是一个 Web 管理台，也应提供客户端接入路径，使用户可以继续在本地 Obsidian 中工作，并与服务器保持同步。

## 2. MVP 结论

MVP 阶段不以 WebDAV 作为主同步内核，而采用：

- **Git 优先** 的版本策略
- **轻量 Obsidian 插件** 作为客户端入口
- **ObsidianHub Sync API** 作为工作态同步通道

## 3. 为什么不是 WebDAV 优先

WebDAV 更适合作为通用文件访问协议，而不是当前产品哲学下的主实时同步内核。

当前产品需要清晰区分：
- 工作态同步
- 版本态管理
- 快照恢复

WebDAV 更适合后续作为兼容能力，而不是 MVP 主入口。

## 4. MVP 客户端连接方式

### 本地 Obsidian
用户继续在自己的 Obsidian App 中编辑笔记。

### 轻插件
插件负责：
- 配置服务器地址
- 配置 token / 凭据
- 显示连接状态
- 触发 sync
- 显示 Git / 同步状态
- 提示未提交改动或同步异常

### 服务端
ObsidianHub 负责：
- Sync API
- Git checkpoint
- 快照恢复
- agent 受控操作

## 5. 后续兼容方向

后续可选支持：
- Git remote backup
- WebDAV
- 导入 / 导出能力
- 更丰富的插件控制面板

## 6. 产品边界

MVP 阶段不做：
- 完整实时协作系统
- 复杂客户端同步引擎
- 多人同时编辑同一文件的协同系统

MVP 阶段要做到：
- 用户可以继续在 Obsidian 内工作
- 用户可以通过轻插件连接自己的 ObsidianHub 服务
- 多设备可以同步当前工作状态
- Git 负责形成更稳定的历史节点
