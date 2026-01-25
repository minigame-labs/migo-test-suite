# Migo Test Suite

小游戏 API 兼容性测试套件。

## 目录结构

```
migo-test-suite/
├── tests/
│   ├── specs/           # 测试用例
│   │   ├── base/        # 基础 API (migo.env, migo.getSystemInfo, ...)
│   │   ├── canvas/      # Canvas API
│   │   ├── audio/       # 音频 API
│   │   ├── network/     # 网络 API
│   │   ├── file/        # 文件系统 API
│   │   └── device/      # 设备 API
│   ├── runner.js        # 测试运行器
│   └── index.js         # 测试入口
├── baselines/           # 参考平台基准数据 (JSON)
├── reports/             # Migo 测试报告 (JSON, gitignore)
└── apps/                # 测试应用
```

## 测试状态

详见 [API_COVERAGE.md](./API_COVERAGE.md)

## 运行测试

1. 构建测试 App
2. 安装到设备运行
3. 查看测试报告

## 添加新测试

参考 `tests/specs/` 下的示例文件。
