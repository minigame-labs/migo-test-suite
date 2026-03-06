# Migo Test Suite Server

测试结果收集服务，负责接收小游戏端上报的测试结果并落盘为 baseline，支持同机型跨平台对比（`migo / weixin / quickgame ...`）。

对比值策略：优先使用 `latest.actual.raw`（若存在），否则使用 `latest.actual`。

## 快速启动

```bash
cd server
python server.py --port 8765 --baseline-dir ../baselines
```

默认地址：`http://localhost:8765`

## API 概览

- `POST /report` 上传测试结果并写入 baseline
- `POST /log` 接收端上远程日志
- `GET /catalog` 返回平台/设备/分类/用例索引
- `GET /case` 同平台不同设备对比同一 case
- `GET /xcase` 同机型跨平台对比同一 case
- `GET /summaries` 返回所有设备 `_summary.json`
- `GET /health` 健康检查
- `GET /` 内置 Web UI（同机型跨平台 actual 对比）

## POST /report

请求体（示例）：

```json
{
  "version": "1.1.0",
  "runId": "run-1700000000000",
  "timestamp": 1706234567890,
  "platform": "weixin",
  "deviceId": "weixin-xiaomi-redmi_k50",
  "device": {
    "brand": "Xiaomi",
    "model": "Redmi K50",
    "system": "Android 13",
    "SDKVersion": "3.0.0"
  },
  "summary": {
    "total": 2,
    "passed": 1,
    "failed": 0,
    "skipped": 1,
    "manualPending": 0,
    "flaky": 0,
    "passRate": "100.0%"
  },
  "results": [
    {
      "testId": "env-001",
      "resultKey": "base::env-001",
      "name": "环境能力检查",
      "category": "base",
      "categoryNormalized": "base",
      "status": "passed",
      "passed": true,
      "skipped": false,
      "manualPending": false,
      "flaky": false,
      "actual": { "exists": true },
      "expected": { "exists": true },
      "error": null,
      "duration": 2,
      "type": "sync",
      "attempts": [],
      "executionMeta": null,
      "metadata": {
        "automation": "auto",
        "severity": "p1"
      }
    }
  ]
}
```

响应（示例）：

```json
{
  "success": true,
  "saved": 1,
  "platform": "weixin",
  "deviceId": "weixin-xiaomi-redmi_k50",
  "summary": {
    "platform": "weixin",
    "deviceId": "weixin-xiaomi-redmi_k50",
    "runId": "run-1700000000000",
    "totalTests": 1,
    "passed": 1,
    "failed": 0,
    "skipped": 0,
    "manualPending": 0,
    "unknown": 0,
    "flaky": 0,
    "executed": 1,
    "statusCounts": {
      "passed": 1,
      "failed": 0,
      "skipped": 0,
      "manual_pending": 0,
      "unknown": 0
    },
    "passRate": "100.0%"
  }
}
```

## 查询接口

### GET /catalog

返回平台、设备、分类、用例索引（包含 `deviceKeys` 与 `testsAll`）。

### GET /case

同平台下不同 `deviceId` 对比同一个用例：

`/case?platform=weixin&category=base&testId=env-001`

### GET /xcase

同机型跨平台对比同一个用例：

`/xcase?deviceKey=xiaomi-redmi_k50&category=base&testId=env-001&basePlatform=migo`

可选：`platforms=migo,weixin,quickgame`

返回的每个平台项中会包含：

- `actual`: 原始落盘内容（完整）
- `compareActual`: 对比使用的内容（优先 `actual.raw`）
- `compareActualSource`: `actual.raw` 或 `actual`

### GET /summaries

读取所有设备最新 `_summary.json`，按时间倒序。

## 落盘结构

```text
baselines/
  {platform}/
    {deviceId}/
      _summary.json
      {category}/
        {testId}.json
```

每个 case 文件格式：

```json
{
  "latest": {
    "testId": "env-001",
    "resultKey": "base::env-001",
    "runId": "run-1700000000000",
    "category": "base",
    "status": "passed",
    "passed": true,
    "skipped": false,
    "manualPending": false,
    "flaky": false,
    "actual": {},
    "expected": {},
    "metadata": {},
    "attempts": []
  },
  "history": []
}
```

## 说明

- 仅使用 Python 标准库，无第三方依赖。
- 默认监听 `0.0.0.0`，真机调试请将小游戏端 `localhost` 改为电脑局域网 IP。
