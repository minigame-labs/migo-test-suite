# Migo Test Suite

小游戏 API 兼容性测试套件，支持在 `migo / weixin / quickgame` 等运行时执行，并将结果上传到本地 server 做 baseline 沉淀与跨平台对比。

## 核心能力

- 按分类管理 API 用例，支持单测运行与全量运行
- Profile 化执行（`smoke/regression/device_lab/manual/full`）
- 统一结果状态：`passed/failed/skipped/manual_pending`
- 结果上报包含 `status/skipped/manualPending/flaky/attempts/metadata`
- 内置 Python server，支持同机型跨平台 actual 对比
- 静态校验脚本与 CI 门禁（重复 testId / 非法 matcher / 常见拼写错误）

## 目录结构

```text
migo-test-suite/
  game.js
  src/ui.js
  tests/
    config.js
    test-manager.js
    profiles/
    specs/
  server/
    server.py
    request_test_server.py
    ws_test_server.py
  scripts/
    validate-specs.mjs
```

## 快速开始

1) 启动报告收集服务

```bash
python server/server.py --port 8765 --baseline-dir ./baselines
```

2) （可选）启动网络相关测试依赖

```bash
python server/request_test_server.py
python server/ws_test_server.py --port 8767
```

3) 在小游戏运行时加载并执行 `game.js`

4) 如果是真机，使用局域网 IP 注入 endpoint（不要写死在源码）

## 运行时配置

在加载 `game.js` 前注入：

```js
globalThis.__MIGO_TEST_CONFIG__ = {
  profile: 'smoke',
  runManualTests: false,
  autoRun: false,
  autoUpload: false,
  exitOnComplete: false,
  exitDelayMs: 800,
  runId: 'ci-build-12345',
  serverUrl: 'http://192.168.1.100:8765',
  requestEndpoint: 'http://192.168.1.100:8766',
  wsEndpoint: 'ws://192.168.1.100:8767',
  defaultTimeoutMs: 8000,
  defaultRetries: 1,
  maxRetries: 1
};
```

## Profiles

- `smoke`: PR 快速门禁（高优先级自动化）
- `regression`: 回归集（ci + device_lab）
- `device_lab`: 设备实验室执行集
- `manual`: 人工验收（包含 manual 用例）
- `full`: 全量配置（默认基线）

详细说明见：`AUTOMATION_INTEGRATION.md`

## 结果状态语义

- `passed`: 用例通过
- `failed`: 用例失败
- `skipped`: 明确跳过（例如 unsupported 且策略为 skip）
- `manual_pending`: 需要人工确认，当前轮次不判失败

## 报告格式（摘要）

`/report` 上报 payload 包含：

- 顶层：`version/runId/timestamp/platform/deviceId/device/environment/summary/results`
- `results[*]`：`testId/resultKey/name/category/categoryNormalized/status/passed/skipped/manualPending/flaky/actual/expected/error/duration/type/attempts/executionMeta/metadata`

服务端会在 `_summary.json` 中按 `status` 统计 `passed/failed/skipped/manualPending`，并单独给出 `statusCounts` 与 `executed`。

## 新增/修改用例建议

- `id` 全仓唯一（避免跨分类冲突）
- `expect` 优先写明确断言，避免弱断言 `expect: {}`
- 交互或人工观察类用例请标记 manual 并允许 `manual_pending`
- navigate/event 用例使用统一协议，避免全量运行卡住

支持的 matcher：

- `@string @number @boolean @object @function @array @exists @arraybuffer @ArrayBuffer @typedarray`

## CI 门禁

本仓库提供静态校验脚本：

```bash
node scripts/validate-specs.mjs
```

校验项：

- 重复 `testId`
- 非法 matcher token
- 常见拼写错误（例如 `PASSA`）

GitHub Actions 已内置：`.github/workflows/spec-guard.yml`

## 相关文档

- `AUTOMATION_INTEGRATION.md`
- `TEST_SPEC_GUIDELINES.md`
- `server/README.md`

## License

MIT
