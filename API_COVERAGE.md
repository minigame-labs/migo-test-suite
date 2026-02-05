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
| `migo.onError`                   | 🚧  | base/app-event.js |          |
| `migo.offError`                  | 🚧  | base/app-event.js |          |
| `migo.onAudioInterruptionBegin`  | ✅  | base/app-event.js |          |
| `migo.offAudioInterruptionBegin` | ✅  | base/app-event.js |          |
| `migo.onAudioInterruptionEnd`    | ✅  | base/app-event.js |          |
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

## 跳转
| API                            | 状态 | 测试文件             | 备注 |
| ------------------------------ | -- | ---------------- | -- |
| `migo.restartMiniProgram`      | ❌  | base/navigate.js |    |
| `migo.navigateToMiniProgram`   | ❌  | base/navigate.js |    |
| `migo.navigateBackMiniProgram` | ❌  | base/navigate.js |    |
| `migo.exitMiniProgram`         | ❌  | base/navigate.js |    |

---
## 转发
| API                            | 状态 | 测试文件           | 备注 |
| ------------------------------ | -- | -------------- | -- |
| `migo.updateShareMenu`         | ❌  | share/index.js |    |
| `migo.showShareMenu`           | ❌  | share/index.js |    |
| `migo.hideShareMenu`           | ❌  | share/index.js |    |
| `migo.showShareImageMenu`      | ❌  | share/index.js |    |
| `migo.shareAppMessage`         | ❌  | share/index.js |    |
| `migo.getShareInfo`            | ❌  | share/index.js |    |
| `migo.setMessageToFriendQuery` | ❌  | share/index.js |    |
| `migo.onShareAppMessage`       | ❌  | share/index.js |    |
| `migo.offShareAppMessage`      | ❌  | share/index.js |    |
| `migo.onShareTimeline`         | ❌  | share/index.js |    |
| `migo.offShareTimeline`        | ❌  | share/index.js |    |
| `migo.onShareMessageToFriend`  | ❌  | share/index.js |    |
| `migo.offShareMessageToFriend` | ❌  | share/index.js |    |
| `migo.onHandoff`               | ❌  | share/index.js |    |
| `migo.offHandoff`              | ❌  | share/index.js |    |
| `migo.onCopyUrl`               | ❌  | share/index.js |    |
| `migo.offCopyUrl`              | ❌  | share/index.js |    |
| `migo.onAddToFavorites`        | ❌  | share/index.js |    |
| `migo.offAddToFavorites`       | ❌  | share/index.js |    |
| `migo.setHandoffQuery`         | ❌  | share/index.js |    |
| `migo.checkHandoffEnabled`     | ❌  | share/index.js |    |
| `migo.authPrivateMessage`      | ❌  | share/index.js |    |

---

## 界面

### 交互
| API                    | 状态 | 测试文件               | 备注 |
| ---------------------- | -- | ------------------ | -- |
| `migo.showToast`       | ✅  | ui/interactions.js |    |
| `migo.hideToast`       | ✅  | ui/interactions.js |    |
| `migo.showModal`       | ✅  | ui/interactions.js |    |
| `migo.showLoading`     | ✅  | ui/interactions.js |    |
| `migo.hideLoading`     | ✅  | ui/interactions.js |    |
| `migo.showActionSheet` | ✅  | ui/interactions.js |    |

### 菜单
| API                                    | 状态 | 测试文件         | 备注 |
| -------------------------------------- | -- | ------------ | -- |
| `migo.setMenuStyle`                    | ❌  | base/menu.js |    |
| `migo.onOfficialComponentsInfoChange`  | ❌  | base/menu.js |    |
| `migo.offOfficialComponentsInfoChange` | ❌  | base/menu.js |    |
| `migo.getOfficialComponentsInfo`       | ❌  | base/menu.js |    |
| `migo.getMenuButtonBoundingClientRect` | ❌  | base/menu.js |    |

### 状态栏
| API                      | 状态 | 测试文件               | 备注 |
| ------------------------ | -- | ------------------ | -- |
| `migo.setStatusBarStyle` | ❌  | base/status-bar.js |    |

### 窗口
| API                         | 状态 | 测试文件            | 备注 |
| --------------------------- | -- | --------------- | -- |
| `migo.setWindowSize`        | ❌  | base/window\.js |    |
| `migo.onWindowStateChange`  | ❌  | base/window\.js |    |
| `migo.offWindowStateChange` | ❌  | base/window\.js |    |
| `migo.onWindowResize`       | ❌  | base/window\.js |    |
| `migo.offWindowResize`      | ❌  | base/window\.js |    |

## 网络
### Request

| API | 状态 | 测试文件 | 备注 |
|-----|------|----------|------|
| `migo.request` | ✅ | network/request.js |  |
| `Option.url` | ✅ | network/request.js | |
| `Option.data` | ✅ | network/request.js | String/Object/ArrayBuffer |
| `Option.header` | ✅ | network/request.js | |
| `Option.timeout` | ✅ | network/request.js | |
| `Option.method` | ✅ | network/request.js | GET/POST/PUT/DELETE/OPTIONS/HEAD/TRACE |
| `Option.dataType` | ✅ | network/request.js | json/text |
| `Option.responseType` | ✅ | network/request.js | text/arraybuffer |
| `Option.enableHttp2` | ✅ | network/request.js |  |
| `Option.enableQuic` | ➖ | network/request.js | Excluded |
| `Option.enableCache` | ✅ | network/request.js |  |
| `Option.enableHttpDNS` | ➖ | network/request.js | Excluded |
| `Option.enableChunked` | ✅ | network/request.js |  |
| `Option.forceCellularNetwork` | ❌ | network/request.js | |
| `Option.enableProfile` | ❌ | network/request.js |  |
| `Option.success` | ✅ | network/request.js | |
| `Option.fail` | ✅ | network/request.js | |
| `Option.complete` | ✅ | network/request.js |  |
| `RequestTask.abort` | ✅ | network/request.js | |
| `RequestTask.onHeadersReceived` | ✅ | network/request.js | |
| `RequestTask.offHeadersReceived` | ✅ | network/request.js | |
| `RequestTask.onChunkReceived` | ✅ | network/request.js |  HTTP/1.1 only |
| `RequestTask.offChunkReceived` | ✅ | network/request.js | |

### 上传

| API | 状态 | 测试文件 | 备注 |
|-----|------|----------|------|
| `migo.uploadFile` | ✅ | network/upload.js | |
| `Option.url` | ✅ | network/upload.js | |
| `Option.filePath` | ✅ | network/upload.js | |
| `Option.name` | ✅ | network/upload.js | |
| `Option.header` | ✅ | network/upload.js | |
| `Option.formData` | ✅ | network/upload.js | |
| `Option.enableHttp2` | ✅ | network/upload.js | |
| `Option.enableQuic` | ➖ | network/upload.js | Excluded |
| `Option.enableProfile` | ❌ | network/upload.js |  |
| `Option.timeout` | ✅ | network/upload.js | |
| `Option.success` | ✅ | network/upload.js | |
| `Option.fail` | ✅ | network/upload.js | |
| `Option.complete` | ✅ | network/upload.js | |
| `UploadTask.abort` | ✅ | network/upload.js | |
| `UploadTask.onHeadersReceived` | ✅ | network/upload.js | |
| `UploadTask.offHeadersReceived` | ✅ | network/upload.js | |
| `UploadTask.onProgressUpdate` | ✅ | network/upload.js | |
| `UploadTask.offProgressUpdate` | ✅ | network/upload.js | |

### 下载

| API | 状态 | 测试文件 | 备注 |
|-----|------|----------|------|
| `migo.downloadFile` | ✅ | network/download.js | |
| `Option.url` | ✅ | network/download.js | |
| `Option.header` | ✅ | network/download.js | |
| `Option.timeout` | ✅ | network/download.js | |
| `Option.filePath` | ✅ | network/download.js | |
| `Option.enableHttp2` | ✅ | network/download.js |  |
| `Option.enableQuic` | ➖ | network/download.js | Excluded |
| `Option.enableProfile` | ❌ | network/download.js |  |
| `Option.success` | ✅ | network/download.js | |
| `Option.fail` | ✅ | network/download.js | |
| `Option.complete` | ✅ | network/download.js | |
| `DownloadTask.abort` | ✅ | network/download.js | |
| `DownloadTask.onHeadersReceived` | ✅ | network/download.js | |
| `DownloadTask.offHeadersReceived` | ✅ | network/download.js | |
| `DownloadTask.onProgressUpdate` | ✅ | network/download.js | |
| `DownloadTask.offProgressUpdate` | ✅ | network/download.js | |

### WebSocket

| API | 状态 | 测试文件 | 备注 |
|-----|------|----------|------|
| `migo.connectSocket` | ✅ | network/websocket.js | |
| `migo.closeSocket` | ✅ | network/websocket.js | |
| `migo.onSocketOpen` | ✅ | network/websocket.js | |
| `migo.onSocketMessage` | ✅ | network/websocket.js | |
| `migo.onSocketError` | ✅ | network/websocket.js | |
| `migo.onSocketClose` | ✅ | network/websocket.js | |
| `migo.sendSocketMessage` | ✅ | network/websocket.js | |
| `SocketTask.send` | ✅ | network/websocket.js | |
| `SocketTask.close` | ✅ | network/websocket.js | |
| `SocketTask.onOpen` | ✅ | network/websocket.js | |
| `SocketTask.onMessage` | ✅ | network/websocket.js | |
| `SocketTask.onError` | ✅ | network/websocket.js | |
| `SocketTask.onClose` | ✅ | network/websocket.js | |

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
## 设备

### 电量
| `migo.getBatteryInfoSync`         | ✅ | base/battery.js |    |
| `migo.getBatteryInfo`             | ✅ | base/battery.js |    |

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
