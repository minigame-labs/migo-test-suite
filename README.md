# Migo Test Suite

小游戏 API 兼容性测试套件 - 支持在 migo和其他主流平台运行。

## 目录结构

```
migo-test-suite/
├── game.js                 # 小游戏入口（Canvas 2D 渲染）
├── game.json               # 游戏配置
├── src/
│   └── ui.js               # Canvas 2D UI 渲染模块
├── tests/
│   ├── test-manager.js     # 测试运行管理器
│   └── specs/              # 测试用例定义
│       ├── index.js        # 测试索引
│       ├── base.js         # 基础 API (env, systemInfo, canIUse...)
│       ├── canvas.js       # Canvas 2D/WebGL
│       ├── audio.js        # 音频 API
│       ├── file.js         # 文件系统 API
│       ├── network.js      # 网络请求 API
│       ├── timer.js        # 定时器 API
│       └── input.js        # 输入事件 API
├── baselines/              # 各平台 baseline 数据（由 server 自动生成）
├── reports/                # 测试报告输出 (gitignore)
└── server/
    ├── server.py           # Python 测试结果收集服务器
    └── README.md           # 服务器 API 文档
```

## 快速开始

### 1. 启动测试结果收集服务器

```bash
cd server
python server.py
```

服务器默认在 `http://localhost:8765` 启动，用于接收测试结果并保存为 baseline。

### 2. 运行测试

#### Migo Runtime

将项目部署到 Migo 运行环境，执行 `game.js`。

### 3. 真机调试

修改 `game.js` 顶部的服务器地址为电脑局域网 IP：

```javascript
const SERVER_URL = 'http://192.168.1.100:8765';
```

## 功能特性

- 📋 **分类展示** - 按 API 分类展示所有测试用例
- ▶️ **单独运行** - 选中测试后点击按钮执行
- 🚀 **批量运行** - 一键运行所有测试
- 📊 **实时状态** - 显示通过/失败状态和通过率
- 💾 **导出报告** - 导出标准 JSON 格式测试报告

## 测试类型

| 类型 | 图标 | 说明 |
|------|------|------|
| sync | ⚡ | 同步 API，立即返回结果 |
| async | ⏳ | 异步 API，通过回调返回结果 |
| render | 🎨 | 渲染类 API，验证 Canvas 绑制结果 |
| audio | 🔊 | 音频类 API，验证音频播放功能 |
| navigate | 🔗 | 跳转类 API，只验证 API 存在性 |
| event | 📡 | 事件类 API，验证事件监听机制 |

## 测试状态

详见 [API_COVERAGE.md](./API_COVERAGE.md)

## 添加新测试

在 `tests/specs/` 目录下创建或修改测试文件：

```javascript
export default [
  {
    name: 'API 名称',
    category: 'base',  // 分类: base, canvas, audio, file, network, timer, input
    tests: [
      {
        id: 'unique-id',
        name: '测试名称',
        description: '测试描述',
        type: 'sync',  // sync | async | render | audio | navigate | event
        run: (runtime) => {
          // 执行测试逻辑，返回实际结果
          return { result: true };
        },
        expect: {
          result: true
        },
        allowVariance: []  // 可选：允许差异的字段
      }
    ]
  }
];
```

### 期望值特殊语法

| 语法 | 说明 |
|------|------|
| `'*'` | 通配符，任何值都通过 |
| `'@string'` | 类型检查：字符串 |
| `'@number'` | 类型检查：数字 |
| `'@boolean'` | 类型检查：布尔值 |
| `'@object'` | 类型检查：对象 |
| `'@array'` | 类型检查：数组 |
| `'@function'` | 类型检查：函数 |
| `'@exists'` | 存在性检查：不为 undefined |
| `{ min: 0, max: 100 }` | 范围检查 |

## 导出报告格式

```json
{
  "version": "1.0.0",
  "timestamp": 1706234567890,
  "platform": "migo",
  "device": {
    "brand": "Google",
    "model": "Pixel 6",
    "system": "Android 13",
    "SDKVersion": "1.0.0"
  },
  "summary": {
    "total": 50,
    "passed": 45,
    "failed": 5,
    "passRate": "90.0%"
  },
  "results": [
    {
      "testId": "env-001",
      "passed": true,
      "actual": { "exists": true },
      "expected": { "exists": true },
      "error": null,
      "duration": 2,
      "type": "sync"
    }
  ]
}
```

## License

MIT
