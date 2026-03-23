# `/api/actions/notes` API 契约（Phase 3 稳定化最小版）

> 状态：Phase 3 稳定化中的最小可扩展契约。

## Endpoint

- **Method**: `POST`
- **Path**: `/api/actions/notes`
- **Content-Type**: `application/json`

## 请求体

请求体会交给 `@obsidianhub/actions` 的 `validateNoteAction` 进行校验，当前支持的 `action` 由该包定义（例如 `create_note`、`read_note` 等）。

最小示例：

```json
{
  "action": "create_note",
  "requestId": "req_123",
  "payload": {
    "path": "notes/example.md",
    "body": "Body\n"
  }
}
```

## 成功响应

- **Status**: `200`
- **Body**:

```json
{
  "ok": true,
  "requestId": "req_123",
  "action": "create_note",
  "result": {},
  "meta": {
    "executor": "server-vault-executor"
  }
}
```

> `result` 的结构随 action 不同而变化。

## 错误响应（统一外层结构）

### 1) 非法 JSON

- **Status**: `400`
- **Code**: `INVALID_JSON`

```json
{
  "ok": false,
  "error": {
    "code": "INVALID_JSON",
    "message": "Request body must be valid JSON."
  }
}
```

### 2) 参数校验失败

- **Status**: `400`
- **Code**: `VALIDATION_ERROR`

```json
{
  "ok": false,
  "action": "create_note",
  "requestId": "req_123",
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "...",
    "details": {}
  }
}
```

### 3) 业务执行错误

`executeNoteActionRequest` 会按错误码映射状态码：

- `VALIDATION_ERROR` -> `400`
- `NOT_FOUND` -> `404`
- `CONFLICT` -> `409`
- `PATH_ACCESS_ERROR` -> `403`
- 其他未识别错误 -> `500`

统一错误体：

```json
{
  "ok": false,
  "action": "...",
  "requestId": "...",
  "error": {
    "code": "...",
    "message": "...",
    "details": {}
  }
}
```

## 备注

- 当前文档只覆盖 Phase 3 稳定化所需的最小契约，不扩展到 search/sync/plugin 相关能力。
