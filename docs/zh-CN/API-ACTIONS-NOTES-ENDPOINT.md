# `/api/actions/notes` API 合同（Phase 3 稳定化最小版）

> 状态：Phase 3 稳定化（第一版）

本文档描述 `apps/web` 中 `POST /api/actions/notes` 的当前稳定合同，用于后续在不破坏既有调用方的前提下逐步扩展。

## 1. 路由与方法

- 路径：`/api/actions/notes`
- 方法：`POST`
- Body：JSON（统一 note action envelope）

## 2. 请求格式

请求体会透传到 `@obsidianhub/actions` 的 `validateNoteAction`。

最小示例（`create_note`）：

```json
{
  "action": "create_note",
  "requestId": "req_123",
  "payload": {
    "path": "notes/example.md",
    "body": "hello\n"
  }
}
```

## 3. 成功响应（200）

```json
{
  "ok": true,
  "requestId": "req_123",
  "action": "create_note",
  "result": {
    "path": "notes/example.md",
    "created": true,
    "mtimeMs": 1742720000000,
    "bytesWritten": 6
  },
  "meta": {
    "executor": "server-vault-executor"
  }
}
```

## 4. 失败响应

统一失败结构：

```json
{
  "ok": false,
  "requestId": "req_123",
  "action": "create_note",
  "error": {
    "code": "CONFLICT",
    "message": "...",
    "details": {}
  }
}
```

### 状态码映射（当前实现）

- `400`：`VALIDATION_ERROR`
- `403`：`PATH_ACCESS_ERROR`
- `404`：`NOT_FOUND`
- `409`：`CONFLICT`
- `500`：其它未识别错误

## 5. 当前稳定性约束（Phase 3）

本阶段把以下内容视为稳定合同：

1. 路由入口与方法不变：`POST /api/actions/notes`
2. 成功 envelope：`ok/requestId/action/result/meta`
3. 失败 envelope：`ok/requestId/action/error{code,message,details}`
4. 基础错误码到 HTTP 状态码映射（见上）

后续扩展可增加：
- 新 action 类型
- `result/meta/error.details` 字段内容

但不应破坏以上 envelope 的顶层结构。
