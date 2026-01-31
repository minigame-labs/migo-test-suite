# API Coverage Tracking

小游戏 API 兼容性追踪表（参考主流小游戏平台 API 规范）。

## 状态说明

| 状态 | 含义 |
|------|------|
| ✅ | 已实现，测试通过 |
| 🔶 | 已实现，待测试 |
| 🚧 | 实现中 |
| ❌ | 未实现 |
| ➖ | 不适用 / 不计划支持 |

---

## 基础 (base)

| API | 状态 | 测试文件 | 备注 |
|-----|------|----------|------|
| `migo.env` | ✅ | base/env.js | |

### 系统
| API                               | 状态 | 测试文件           | 备注 |
| --------------------------------- | -- | -------------- | -- |
| `migo.openSystemBluetoothSetting` | ✅ | base/system.js |    |
| `migo.openAppAuthorizeSetting`    | ✅ | base/system.js |    |
| `migo.getWindowInfo`              | ✅  | base/system.js |    |
| `migo.getSystemSetting`           | ✅ | base/system.js |    |
| `migo.getSystemInfoSync`          | ➖  | base/system.js |  deprecated  |
| `migo.getSystemInfoAsync`         | ➖  | base/system.js |  deprecated  |
| `migo.getSystemInfo`              | ➖  | base/system.js | deprecated |
| `migo.getDeviceInfo`              | ✅  | base/system.js |    |
| `migo.getDeviceBenchmarkInfo`     | ✅  | base/system.js | Mocked Result |
| `migo.getAppBaseInfo`             | ✅ | base/system.js |    |
| `migo.getAppAuthorizeSetting`     | ✅ | base/system.js |    |

### 更新
| API                              | 状态 | 测试文件           | 备注 |
| -------------------------------- | -- | -------------- | -- |
| `migo.updateApp`                 | ➖  |  |    |
| `migo.getUpdateManager`          | ➖  |  |    |
| `UpdateManager.applyUpdate`      | ➖  |  |    |
| `UpdateManager.onCheckForUpdate` | ➖  |  |    |
| `UpdateManager.onUpdateReady`    | ➖  |  |    |
| `UpdateManager.onUpdateFailed`   | ➖  |  |    |

### 生命周期

| API                         | 状态 | 测试文件              | 备注 |
| --------------------------- | -- | ----------------- | -- |
| `migo.onShow`               | ✅ | base/lifecycle.js |    |
| `migo.offShow`              | ✅ | base/lifecycle.js |    |
| `migo.onHide`               | ✅ | base/lifecycle.js |    |
| `migo.offHide`              | ✅ | base/lifecycle.js |    |
| `migo.getLaunchOptionsSync` | ✅ | base/lifecycle.js |    |
| `migo.getEnterOptionsSync`  | ✅ | base/lifecycle.js |    |

### 应用级事件
| API                              | 状态 | 测试文件              | 备注                   |
| -------------------------------- | -- | ----------------- | -------------------- |
| `migo.onUnhandledRejection`      | ➖  | base/app-event.js | ios only |
| `migo.offUnhandledRejection`     | ➖  | base/app-event.js | ios only |
| `migo.onError`                   | 🚧  | base/app-event.js |              |
| `migo.offError`                  | 🚧  | base/app-event.js |            |
| `migo.onAudioInterruptionBegin`  | ✅  | base/app-event.js |            |
| `migo.offAudioInterruptionBegin` | ✅  | base/app-event.js |          |
| `migo.onAudioInterruptionEnd`    | ✅  | base/app-event.js |            |
| `migo.offAudioInterruptionEnd`   | ✅  | base/app-event.js |          |

### 性能
| API                      | 状态 | 测试文件                | 备注 |
| ------------------------ | -- | ------------------- | -- |
| `migo.triggerGC`         | 🔶 | base/performance.js |    |
| `migo.reportPerformance` | 🔶 | base/performance.js |    |
| `migo.getPerformance`    | 🔶 | base/performance.js |    |
| `Performance.now`        | 🔶 | base/performance.js |    |

### 分包加载
| API                                          | 状态 | 测试文件               | 备注 |
| -------------------------------------------- | -- | ------------------ | -- |
| `migo.preDownloadSubpackage`                 | ❌  | base/subpackage.js |    |
| `migo.loadSubpackage`                        | ❌  | base/subpackage.js |    |
| `LoadSubpackageTask`        | ❌  | base/subpackage.js |    |
| `PreDownloadSubpackageTask` | ❌  | base/subpackage.js |    |

### 调试
| API                          | 状态 | 测试文件        | 备注 |
| ---------------------------- | -- | ----------- | -- |
| `migo.setEnableDebug`        | ❌  | base/log.js |    |
| `migo.getLogManager`         | ❌  | base/log.js |    |
| `migo.getRealtimeLogManager` | ❌  | base/log.js |    |
| `migo.console`               | ❌  | base/log.js |    |
| `LogManager`                 | ❌  | base/log.js |    |
| `RealtimeLogManager`         | ❌  | base/log.js |    |


### 加密
| API                         | 状态 | 测试文件           | 备注 |
| --------------------------- | -- | -------------- | -- |
| `migo.getUserCryptoManager` | ❌  | base/crypto.js |    |
| `UserCryptoManager`         | ❌  | base/crypto.js |    |

---

## 网络 (network)

| API | 状态 | 测试文件 | 备注 |
|-----|------|----------|------|
| `migo.request` | 🚧 | request.test.js | |
| `RequestTask.abort` | ❌ | | |
| `migo.downloadFile` | ❌ | | |
| `migo.uploadFile` | ❌ | | |
| `migo.connectSocket` | ❌ | | |

---

## 媒体 - 音频 (audio)

| API | 状态 | 测试文件 | 备注 |
|-----|------|----------|------|
| `migo.createInnerAudioContext` | 🔶 | audio.test.js | |
| `InnerAudioContext.play` | 🔶 | | |
| `InnerAudioContext.pause` | 🔶 | | |
| `InnerAudioContext.stop` | 🔶 | | |
| `InnerAudioContext.seek` | 🔶 | | |
| `InnerAudioContext.destroy` | 🔶 | | |
| `InnerAudioContext.src` | 🔶 | | |
| `InnerAudioContext.volume` | 🔶 | | |
| `InnerAudioContext.loop` | 🔶 | | |
| `InnerAudioContext.onPlay` | 🔶 | | |
| `InnerAudioContext.onPause` | 🔶 | | |
| `InnerAudioContext.onStop` | 🔶 | | |
| `InnerAudioContext.onEnded` | 🔶 | | |
| `InnerAudioContext.onError` | 🔶 | | |
| `InnerAudioContext.onTimeUpdate` | 🔶 | | |
| `InnerAudioContext.onCanplay` | 🔶 | | |

### WebAudio

| API | 状态 | 测试文件 | 备注 |
|-----|------|----------|------|
| `migo.createWebAudioContext` | 🔶 | | |
| `WebAudioContext.createBufferSource` | 🔶 | | |
| `WebAudioContext.createGain` | 🔶 | | |
| `WebAudioContext.decodeAudioData` | 🔶 | | |
| `WebAudioContext.resume` | 🚧 | | TODO |
| `WebAudioContext.suspend` | 🚧 | | TODO |

---

## 画布 (canvas)

| API | 状态 | 测试文件 | 备注 |
|-----|------|----------|------|
| `migo.createCanvas` | 🔶 | canvas.test.js | |
| `Canvas.getContext('2d')` | 🔶 | | |
| `Canvas.getContext('webgl')` | 🔶 | | |
| `Canvas.width/height` | 🔶 | | |
| `Canvas.toDataURL` | ❌ | | |

### Canvas2D Context

| API | 状态 | 测试文件 | 备注 |
|-----|------|----------|------|
| `fillRect` | 🔶 | | |
| `strokeRect` | 🔶 | | |
| `clearRect` | 🔶 | | |
| `beginPath` | 🔶 | | |
| `moveTo` | 🔶 | | |
| `lineTo` | 🔶 | | |
| `arc` | 🔶 | | |
| `fill` | 🔶 | | |
| `stroke` | 🔶 | | |
| `fillText` | 🔶 | | |
| `strokeText` | 🔶 | | |
| `drawImage` | 🔶 | | |
| `save/restore` | 🔶 | | |
| `createLinearGradient` | ❌ | | TODO |
| `createRadialGradient` | ❌ | | TODO |
| `createPattern` | ❌ | | TODO |

### WebGL Context

| API | 状态 | 测试文件 | 备注 |
|-----|------|----------|------|
| `createProgram` | 🔶 | | |
| `useProgram` | 🔶 | | |
| `createShader` | 🔶 | | |
| `compileShader` | 🔶 | | |
| `createBuffer` | 🔶 | | |
| `bindBuffer` | 🔶 | | |
| `bufferData` | 🔶 | | |
| `drawArrays` | 🔶 | | |
| `drawElements` | 🔶 | | |
| `createTexture` | ❌ | | |
| `bindTexture` | ❌ | | |
| `texImage2D` | ❌ | | |

---

## 文件 (file)

| API | 状态 | 测试文件 | 备注 |
|-----|------|----------|------|
| `migo.getFileSystemManager` | 🔶 | file.test.js | |
| `access` / `accessSync` | 🔶 | | |
| `readFile` / `readFileSync` | 🔶 | | |
| `writeFile` / `writeFileSync` | 🔶 | | |
| `mkdir` / `mkdirSync` | 🔶 | | |
| `readdir` / `readdirSync` | 🔶 | | |
| `unlink` / `unlinkSync` | 🔶 | | |
| `rmdir` / `rmdirSync` | 🔶 | | |
| `rename` / `renameSync` | 🔶 | | |
| `stat` / `statSync` | 🔶 | | |
| `copyFile` | ❌ | | |
| `appendFile` | ❌ | | |

---

## 输入 (input)

| API | 状态 | 测试文件 | 备注 |
|-----|------|----------|------|
| `migo.onTouchStart` | 🔶 | | |
| `migo.onTouchMove` | 🔶 | | |
| `migo.onTouchEnd` | 🔶 | | |
| `migo.onTouchCancel` | 🔶 | | |
| `migo.offTouchStart` | ❌ | | |
| `migo.offTouchMove` | ❌ | | |
| `migo.offTouchEnd` | ❌ | | |
| `migo.offTouchCancel` | ❌ | | |

---

## 定时器 (timer)

| API | 状态 | 测试文件 | 备注 |
|-----|------|----------|------|
| `setTimeout` | 🔶 | | |
| `clearTimeout` | 🔶 | | |
| `setInterval` | 🔶 | | |
| `clearInterval` | 🔶 | | |
| `requestAnimationFrame` | 🔶 | | |
| `cancelAnimationFrame` | 🔶 | | |

---

## 性能 (performance)

| API | 状态 | 测试文件 | 备注 |
|-----|------|----------|------|
| `Date.now` | 🔶 | | |
| `migo.getPerformance` | ❌ | | |
| `migo.triggerGC` | ❌ | | |

---

## 统计摘要

| 类别 | 总数 | 🔶 部分通过 | 🚧 进行中 | ❌ 未实现 |
|------|------|-------------|-----------|-----------|
| 基础 | 12 | 0 | 6 | 6 |
| 网络 | 5 | 0 | 1 | 4 |
| 音频 | 22 | 18 | 2 | 2 |
| 画布 | 25 | 18 | 0 | 7 |
| 文件 | 12 | 10 | 0 | 2 |
| 输入 | 8 | 4 | 0 | 4 |
| 定时器 | 6 | 6 | 0 | 0 |
| 性能 | 3 | 1 | 0 | 2 |
| **总计** | **93** | **57** | **9** | **27** |

**兼容率**: 57 / 93 = **61.3%**

---

## 更新日志

| 日期 | 变更 |
|------|------|
| 2026-01-25 | 初始化 API 覆盖率追踪表 |
