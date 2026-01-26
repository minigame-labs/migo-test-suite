# Migo Test Suite Server

测试结果收集服务器 - 接收小游戏端上传的测试结果，保存为 baseline 用于跨平台对比。

## 快速启动

```bash
cd server
python server.py
```

服务器默认在 `http://localhost:8765` 启动。

## 命令行参数

```bash
python server.py --port 8765 --baseline-dir ../baselines
```

| 参数 | 说明 | 默认值 |
|------|------|--------|
| `--port`, `-p` | 服务端口 | 8765 |
| `--baseline-dir`, `-d` | Baseline 保存目录 | ../baselines |

## API

### POST /report

上传测试结果，保存为 baseline。

**请求体:**

```json
{
  "version": "1.0.0",
  "timestamp": 1706234567890,
  "platform": "weixin",
  "deviceId": "weixin-xiaomi-redmi_k50",
  "device": {
    "brand": "Xiaomi",
    "model": "Redmi K50",
    "system": "Android 13",
    "SDKVersion": "3.0.0"
  },
  "results": [
    {
      "testId": "env-001",
      "passed": true,
      "actual": { "exists": true, "notNull": true },
      "expected": { "exists": true, "notNull": true },
      "duration": 2,
      "type": "sync"
    },
    {
      "testId": "sysinfo-002",
      "passed": true,
      "actual": {
        "hasBrand": true,
        "hasModel": true,
        "brand": "Xiaomi",
        "model": "Redmi K50"
      },
      "duration": 5,
      "type": "sync"
    }
  ]
}
```

**响应:**

```json
{
  "success": true,
  "saved": 2,
  "platform": "weixin",
  "deviceId": "weixin-xiaomi-redmi_k50",
  "summary": {
    "platform": "weixin",
    "deviceId": "weixin-xiaomi-redmi_k50",
    "totalTests": 2,
    "passed": 2,
    "failed": 0,
    "passRate": "100.0%"
  }
}
```

### GET /baselines

获取所有 baseline 列表。

**响应:**

```json
{
  "baselines": {
    "weixin": ["env-001", "env-002", "sysinfo-001", "sysinfo-002"],
    "migo": ["env-001", "env-002"],
    "quickgame": ["env-001"]
  },
  "total": 7
}
```

### GET /baseline/{test_id}

获取指定测试在所有平台的 baseline。

**响应:**

```json
{
  "testId": "sysinfo-002",
  "baselines": {
    "weixin": {
      "latest": {
        "testId": "sysinfo-002",
        "platform": "weixin",
        "deviceId": "weixin-xiaomi-redmi_k50",
        "actual": {
          "hasBrand": true,
          "hasModel": true,
          "brand": "Xiaomi",
          "model": "Redmi K50"
        },
        "passed": true
      },
      "history": []
    },
    "migo": {
      "latest": { ... },
      "history": []
    }
  }
}
```

### POST /compare

对比当前测试结果与 baseline。

**请求体:**

```json
{
  "platform": "migo",
  "compareWith": "weixin",
  "results": [
    {
      "testId": "env-001",
      "actual": { "exists": true, "notNull": true }
    }
  ]
}
```

**响应:**

```json
{
  "platform": "migo",
  "compareWith": "weixin",
  "summary": {
    "total": 1,
    "matched": 1,
    "mismatched": 0,
    "noBaseline": 0
  },
  "comparisons": [
    {
      "testId": "env-001",
      "current": { "exists": true, "notNull": true },
      "baseline": { "exists": true, "notNull": true },
      "match": true,
      "diff": null
    }
  ]
}
```

## Baseline 文件结构

```
baselines/
├── weixin/
│   ├── _summary_weixin-xiaomi-redmi_k50.json   # 设备汇总
│   ├── env-001.json                             # 单个测试的 baseline
│   ├── env-002.json
│   └── sysinfo-002.json
├── migo/
│   ├── _summary_migo-desktop-linux.json
│   ├── env-001.json
│   └── ...
└── quickgame/
    └── ...
```

每个测试的 baseline 文件格式:

```json
{
  "latest": {
    "testId": "sysinfo-002",
    "platform": "weixin",
    "deviceId": "weixin-xiaomi-redmi_k50",
    "device": {
      "brand": "Xiaomi",
      "model": "Redmi K50",
      "system": "Android 13"
    },
    "timestamp": 1706234567890,
    "actual": {
      "hasBrand": true,
      "hasModel": true,
      "brand": "Xiaomi",
      "model": "Redmi K50"
    },
    "passed": true,
    "duration": 5,
    "type": "sync"
  },
  "history": [
    { ... }  // 历史记录，最多保留 10 条
  ]
}
```

## 典型工作流

1. **收集 baseline**: 在主流小游戏中运行测试，结果自动上传保存为 `ref` baseline

2. **对比测试**: 在 migo 中运行相同测试，可以：
   - 直接上传保存为 `migo` baseline
   - 调用 `/compare` API 与 `weixin` baseline 对比

3. **分析差异**: 查看 `/baseline/{test_id}` 获取同一测试在不同平台的输出差异

## 注意事项

- 服务器仅使用 Python 标准库，无需额外依赖
- 默认监听所有网络接口 (0.0.0.0)，便于真机调试
- 建议在同一局域网内使用，真机需要将 `localhost` 改为电脑 IP
