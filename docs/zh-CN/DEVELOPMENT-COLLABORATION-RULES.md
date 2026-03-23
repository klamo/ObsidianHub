# ObsidianHub 开发协作规则（v1）

## 1. 目的

本文档定义 ObsidianHub 在当前阶段的默认协作规则，用来统一 Moss 与 case 的分工、仓库工作方式、任务包格式、验收方式，以及阶段进度口径。

它不是用来替代：
- 产品文档
- 技术架构文档
- 开发路线图

它的作用是：
- 让主控与执行层按同一套默认规则协作
- 减少任务边界漂移
- 保证提交结果可见、可审、可回滚
- 避免进度判断口径不一致

---

## 2. 默认角色分工

### Moss 的职责

Moss 默认负责：
- 需求理解
- 范围收口
- 任务拆解
- 验收标准定义
- 代码与结果审查
- 决定是否进入 `main`
- 更新项目文档与阶段判断

### case 的职责

case 默认负责：
- 在明确任务包下执行实现
- 在自己可访问的目录中完成 clone / fetch / branch / edit / commit / push
- 按任务要求完成最小验证
- 回报结果、阻塞、分支、提交信息

结论：

> Moss 是主控与审阅层，case 是执行层。默认不把产品边界判断外包给 case。

---

## 3. 仓库与工作目录规则

### 默认规则

- case 不直接使用 `/root/...` 下的本地仓库
- case 默认在自己账号可访问的目录中自行 clone 仓库
- 不将 root 侧本地仓库路径直接当作 case 的执行路径

### 仓库地址规则

给 case 下发仓库任务时，默认优先使用 **SSH remote**。

示例：

```bash
git@github.com:klamo/ObsidianHub.git
```

原因：
- 已确认 case 当前可用的是 GitHub SSH 认证
- 不应默认依赖 HTTPS 用户名 / 密码 / token 交互

---

## 4. 分支策略

### 默认禁止事项

- case 默认不要直接 push 到 `main`

### 默认工作方式

- case 为每个任务创建自己的远端工作分支
- 分支名应表达任务意图，例如：
  - `case/phase3-route-tests`
  - `case/docs-progress-board-tune`
  - `case/actions-response-formatting`

### 默认审查流程

- case push 到远端工作分支
- Moss 基于远端真实 diff 审查
- 审查后再决定：
  - merge
  - cherry-pick
  - 要求返工
  - 或由 Moss 自己接手收尾

结论：

> 没有远端可审结果，不算真正完成交付。

---

## 5. 任务包规则

以后给 case 的任务，默认应包含以下字段：

### 必填字段

- Repo
- Base branch
- Work branch
- Goal
- Scope
- Constraints
- Verify
- Report back

### 字段含义

#### Goal
这次任务想打通什么，为什么做。

#### Scope
允许修改哪些文件、目录、模块。

#### Constraints
这次明确不能碰什么，以及分支、提交、push 规则。

#### Verify
至少需要完成哪些验证，才可视为任务完成。

#### Report back
回来时必须交代什么，例如：
- 改了什么
- 分支名
- commit hash
- push 是否成功
- 当前 blocker 是什么

---

## 6. 范围控制规则

### 默认原则

- 只做任务包中明确允许的范围
- 不顺手改无关内容
- 不做未请求的大扫除
- 不做未请求的重构
- 不把“顺便更好”当作自动扩 scope 的理由

### 如果发现更大问题

case 应默认：
- 保持当前范围不扩大
- 报告问题与影响
- 提出建议
- 等待新的任务包，而不是自己扩写

---

## 7. 验收与可见性规则

### 不推荐的方式

- case 只在本地 commit，然后口头回报

原因：
- 结果不可见
- diff 不透明
- 审查效率低
- 远端状态不一致

### 默认采用的方式

- case push 到远端工作分支
- Moss 基于远端真实结果审查

这意味着：

> 可见的远端分支结果，是默认交付物；不是附属品。

---

## 8. 进度与完成度口径规则

这是默认必须遵守的规则之一。

### 默认口径

阶段完成度百分比，默认按：

**整阶段能力完整度** 来估算。

而不是按：
- 主阻塞是否刚刚解除
- 第一刀是否刚刚打通
- 最小闭环是否刚刚成立

### 允许单独表达的内容

可以单独写：
- 关键阻塞已跨过
- 第一刀已落地
- 最小闭环已成立
- 可以进入后续能力补齐

但以上表述：

**不自动等于阶段完成度已经达到 70%–80%。**

### 简单判断法

如果仍然缺少以下内容中的多项：
- 多条核心路径
- 响应 / 错误收口
- 扩展性收口
- 最小测试体系
- API 稳定性验证
- 与后续层的稳定衔接

那么通常不应把该阶段完成度直接写到 `70%+`。

### 文档写法建议

- 客观事实更新可较快同步
- 百分比、里程碑性质、阶段结论应更克制
- case 可以更新事实
- Moss 负责对完成度和阶段判断做最终收口

---

## 9. 默认提交规则

### commit / push 规则

- 默认一任务一分支
- 默认保持提交粒度清楚
- 默认不要把无关改动混入同一提交
- 默认在 commit message trailer 中加入：

```text
Co-authored-by: Klamo <mr.klamo@gmail.com>
```

如任务包明确给出 commit message，应按任务包执行。

---

## 10. 给 case 发任务时的默认提示语

以后给 case 下发 ObsidianHub 任务时，默认应在任务包开头加入一句：

> Before starting, read and follow `docs/zh-CN/DEVELOPMENT-COLLABORATION-RULES.md` (or the repository collaboration rules doc). Treat it as the default project protocol unless this task explicitly overrides a detail.

作用：
- 不必每次全文复述规则
- 但要明确提醒它按项目默认协议执行

---

## 11. 当前推荐工作流

ObsidianHub 当前默认协作流程如下：

1. Klamo 提出目标或问题
2. Moss 做任务收口
3. Moss 判断是自己做，还是交给 case
4. 若交给 case，则生成结构化任务包
5. case 自己 clone / update 本地 clone
6. case 建工作分支并施工
7. case commit + push 到远端工作分支
8. Moss 拉取并审查 diff
9. Moss 决定：
   - 合入 `main`
   - 要求返工
   - 或自己接手收尾

---

## 12. 当前默认结论

对于 ObsidianHub，当前默认协作方式是：

> Moss 负责主控、收口、拆解、审阅与阶段判断；case 负责在明确任务包下进行可见、可审的远端分支交付。

这套规则的目标不是增加流程，而是减少模糊默认值，提升协作稳定性。\n