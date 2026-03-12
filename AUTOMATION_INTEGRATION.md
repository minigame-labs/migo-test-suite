# migo-test-suite 自动化集成说明

## 1. 已实现能力

本次已完成以下优化：

- Profile 机制：`smoke/regression/device_lab/manual/full`
- 批量执行支持全部测试类型：`sync/async/render/audio/event/navigate`
- 统一结果状态：`passed/failed/skipped/manual_pending`
- 自动化链路：`autoRun -> autoUpload -> exitOnComplete`
- 不支持能力统一语义：`PASS: not supported` / `_error` 会进入 `skipped`（或按策略 fail）
- 深比较 matcher：支持嵌套对象、数组、`@type`、`min/max`、路径级 `allowVariance`
- 重试与 flaky 统计：结果包含 `attempts` 与 `flaky`
- 渲染自动特征：结果携带 `_renderFingerprint`
- 音频自动特征：`executionMeta.audioTelemetry`
- 分类标准化：`categoryNormalized`
- 网络 endpoint 参数化：不再写死内网 IP
- 结果唯一键：`resultKey`（`category::testId`）
- 报告批次标识：`runId`

## 2. 目录

- `tests/config.js`
- `tests/profiles/index.js`
- `tests/profiles/smoke.json`
- `tests/profiles/regression.json`
- `tests/profiles/device_lab.json`
- `tests/profiles/manual.json`

## 3. 运行时配置注入

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
  tcpEndpoint: 'tcp://192.168.1.100:8768',
  udpEndpoint: 'udp://192.168.1.100:8769',
  wsEndpoint: 'ws://192.168.1.100:8767',
  defaultTimeoutMs: 8000,
  defaultRetries: 1,
  maxRetries: 1,
  endpoints: {
    report: 'http://192.168.1.100:8765',
    http: 'http://192.168.1.100:8766',
    tcp: 'tcp://192.168.1.100:8768',
    udp: 'udp://192.168.1.100:8769',
    ws: 'ws://192.168.1.100:8767'
  }
};
```

可选：如果运行时支持 `getExtConfigSync`，也可通过 ext config 提供同名字段。

## 4. Profile 选择建议

- `smoke`: PR 主线门禁（仅高优先级自动化）
- `regression`: 夜间回归
- `device_lab`: 设备实验室（包含 event/navigate/audio 等）
- `manual`: 人工验收（允许 manual 测试）

## 5. 报告关键字段

`/report` 上报结果新增：

- `status`
- `resultKey`
- `skipped`
- `manualPending`
- `flaky`
- `attempts`
- `executionMeta`
- `metadata`（automation/severity/requires/unsupportedPolicy）
- `categoryNormalized`
- `runId`
- `summary.byAutomation`
- `summary.bySeverity`

## 6. 当前默认行为

- 默认 profile：`smoke`
- 默认 endpoint：
  - report: `http://10.246.1.239:8765`
  - http: `http://10.246.1.239:8766`
  - tcp: `tcp://10.246.1.239:8768`
  - udp: `udp://10.246.1.239:8769`
  - ws: `ws://10.246.1.239:8767`

## 7. 注意事项

- 全部 spec 已在索引启用，真正执行范围由 profile 决定。
- `manual`/交互类测试在非 manual profile 下会被过滤或记为 `manual_pending`。
- 若需要把某测试强制为 P0 或强制 fail-on-unsupported，建议在 test 上显式添加：
  - `severity: 'P0'`
  - `unsupportedPolicy: 'fail'`
- 建议在 CI 增加静态门禁：`node scripts/validate-specs.mjs`（仓库内置 `spec-guard` workflow）。
