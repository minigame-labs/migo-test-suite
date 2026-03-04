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
| `migo.updateApp`                 | 🔶  | base/update.js |    |
| `migo.getUpdateManager`          | 🔶  | base/update.js |    |
| `UpdateManager.applyUpdate`      | 🔶  | base/update.js |    |
| `UpdateManager.onCheckForUpdate` | 🔶  | base/update.js |    |
| `UpdateManager.onUpdateReady`    | 🔶  | base/update.js |    |
| `UpdateManager.onUpdateFailed`   | 🔶  | base/update.js |    |

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
| `migo.onUnhandledRejection`      | 🔶  | base/app-event.js | ios only |
| `migo.offUnhandledRejection`     | 🔶  | base/app-event.js | ios only |
| `migo.onError`                   | 🚧 | base/app-event.js |          |
| `migo.offError`                  | 🚧 | base/app-event.js |          |
| `migo.onAudioInterruptionBegin`  | ✅  | base/app-event.js |          |
| `migo.offAudioInterruptionBegin` | ✅  | base/app-event.js |          |
| `migo.onAudioInterruptionEnd`    | ✅  | base/app-event.js |          |
| `migo.offAudioInterruptionEnd`   | ✅  | base/app-event.js |          |

### 性能
| API                      | 状态 | 测试文件                | 备注 |
| ------------------------ | -- | ------------------- | -- |
| `migo.triggerGC`         | ✅ | base/performance.js |    |
| `migo.reportPerformance` | 🔶 | base/performance.js |    |
| `migo.getPerformance`    | ✅ | base/performance.js |    |
| `Performance.now`        | ✅ | base/performance.js |    |

### 分包加载
| API                                          | 状态 | 测试文件               | 备注 |
| -------------------------------------------- | -- | ------------------ | -- |
| `migo.preDownloadSubpackage`                 | 🔶 | base/subpackage.js |    |
| `migo.loadSubpackage`                        | 🔶 | base/subpackage.js |    |
| `LoadSubpackageTask`        | 🔶 | base/subpackage.js |    |
| `PreDownloadSubpackageTask` | 🔶 | base/subpackage.js |    |

### 调试
| API                          | 状态 | 测试文件        | 备注 |
| ---------------------------- | -- | ----------- | -- |
| `migo.setEnableDebug`        | 🔶  | base/debug.js |    |
| `migo.getLogManager`         | 🔶  | base/debug.js |    |
| `migo.getRealtimeLogManager` | 🔶  | base/debug.js |    |
| `migo.console`               | ✅  | base/debug.js |    |
| `LogManager`                 | 🔶  | base/debug.js |    |
| `RealtimeLogManager`         | 🔶  | base/debug.js |    |

### 加密
| API                         | 状态 | 测试文件           | 备注 |
| --------------------------- | -- | -------------- | -- |
| `migo.getUserCryptoManager` | 🔶  | base/crypto.js |    |
| `UserCryptoManager`         | 🔶  | base/crypto.js |    |
| `UserCryptoManager.getLatestUserKey` | 🔶 | base/crypto.js | |
| `UserCryptoManager.getRandomValues` | 🔶 | base/crypto.js | |

---

## 跳转
| API                            | 状态 | 测试文件             | 备注 |
| ------------------------------ | -- | ---------------- | -- |
| `migo.restartMiniProgram`      | ✅  | base/navigate.js |    |
| `migo.navigateToMiniProgram`   | ❌  | base/navigate.js |    |
| `migo.navigateBackMiniProgram` | ❌  | base/navigate.js |    |
| `migo.exitMiniProgram`         | ✅  | base/navigate.js |    |

---

## 转发
| API                            | 状态 | 测试文件           | 备注 |
| ------------------------------ | -- | -------------- | -- |
| `migo.updateShareMenu`         | 🔶  | share/index.js |    |
| `migo.showShareMenu`           | 🔶  | share/index.js |    |
| `migo.hideShareMenu`           | 🔶  | share/index.js |    |
| `migo.showShareImageMenu`      | 🔶  | share/index.js |    |
| `migo.shareAppMessage`         | 🔶  | share/index.js |    |
| `migo.getShareInfo`            | 🔶  | share/index.js |    |
| `migo.setMessageToFriendQuery` | 🔶  | share/index.js |    |
| `migo.onShareAppMessage`       | 🔶  | share/index.js |    |
| `migo.offShareAppMessage`      | 🔶  | share/index.js |    |
| `migo.onShareTimeline`         | 🔶  | share/index.js |    |
| `migo.offShareTimeline`        | 🔶  | share/index.js |    |
| `migo.onShareMessageToFriend`  | 🔶  | share/index.js |    |
| `migo.offShareMessageToFriend` | 🔶  | share/index.js |    |
| `migo.onHandoff`               | 🔶  | share/index.js |    |
| `migo.offHandoff`              | 🔶  | share/index.js |    |
| `migo.onCopyUrl`               | 🔶  | share/index.js |    |
| `migo.offCopyUrl`              | 🔶  | share/index.js |    |
| `migo.onAddToFavorites`        | 🔶  | share/index.js |    |
| `migo.offAddToFavorites`       | 🔶  | share/index.js |    |
| `migo.setHandoffQuery`         | 🔶  | share/index.js |    |
| `migo.checkHandoffEnabled`     | 🔶  | share/index.js |    |
| `migo.authPrivateMessage`      | 🔶  | share/index.js |    |
| `migo.startHandoff`            | 🔶  | share/index.js |    |

---

## 聊天工具
| API | 状态 | 测试文件 | 备注 |
|---|---|---|---|
| `migo.exitChatTool` | 🔶 | chat-tool/index.js | |
| `migo.getChatToolInfo` | 🔶 | chat-tool/index.js | |
| `migo.isChatTool` | 🔶 | chat-tool/index.js | |
| `migo.notifyGroupMembers` | 🔶 | chat-tool/index.js | |
| `migo.openChatTool` | 🔶 | chat-tool/index.js | |
| `migo.selectGroupMembers` | 🔶 | chat-tool/index.js | |
| `migo.shareAppMessageToGroup` | 🔶 | chat-tool/index.js | |
| `migo.shareEmojiToGroup` | 🔶 | chat-tool/index.js | |
| `migo.shareImageToGroup` | 🔶 | chat-tool/index.js | |
| `migo.shareTextToGroup` | 🔶 | chat-tool/index.js | |
| `migo.shareVideoToGroup` | 🔶 | chat-tool/index.js | |

---

## 界面

### 交互
| API                    | 状态 | 测试文件               | 备注 |
| ---------------------- | -- | ------------------ | -- |
| `migo.showToast`       | ✅  | ui/interactions.js |    |
| `migo.hideToast`       | ✅  | ui/interactions.js |    |
| `migo.showModal`       | ✅  | ui/interactions.js |    |
| `migo.showLoading`     | ✅  | ui/interactions.js |  FIXME:如果未调用hideLoading, 游戏应该可点击，支持mask参数  |
| `migo.hideLoading`     | ✅  | ui/interactions.js |    |
| `migo.showActionSheet` | ✅  | ui/interactions.js |    |

### 菜单
| API                                    | 状态 | 测试文件         | 备注 |
| -------------------------------------- | -- | ------------ | -- |
| `migo.setMenuStyle`                    | 🔶  | ui/menu.js |    |
| `migo.onOfficialComponentsInfoChange`  | 🔶  | ui/menu.js |    |
| `migo.offOfficialComponentsInfoChange` | 🔶  | ui/menu.js |    |
| `migo.getOfficialComponentsInfo`       | 🔶  | ui/menu.js |    |
| `migo.getMenuButtonBoundingClientRect` | 🔶  | ui/menu.js |    |

### 状态栏
| API                      | 状态 | 测试文件               | 备注 |
| ------------------------ | -- | ------------------ | -- |
| `migo.setStatusBarStyle` | 🔶  | ui/status-bar.js |    |

### 窗口
| API                         | 状态 | 测试文件            | 备注 |
| --------------------------- | -- | --------------- | -- |
| `migo.setWindowSize`        | 🔶  | ui/window.js |    |
| `migo.onWindowStateChange`  | 🔶  | ui/window.js |    |
| `migo.offWindowStateChange` | 🔶  | ui/window.js |    |
| `migo.onWindowResize`       | 🔶  | ui/window.js |    |
| `migo.offWindowResize`      | 🔶  | ui/window.js |    |

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

### TCP
| API                          | 状态 | 测试文件                | 备注 |
| ---------------------------- | -- | ------------------- | -- |
| `migo.createTCPSocket`         | 🔶  | network/tcp.js |    |
| `TCPSocket.bindWifi`         | 🔶  | network/tcp.js |    |
| `TCPSocket.close`            | 🔶  | network/tcp.js |    |
| `TCPSocket.connect`          | 🔶  | network/tcp.js |    |
| `TCPSocket.write`            | 🔶  | network/tcp.js |    |
| `TCPSocket.onBindWifi`       | 🔶  | network/tcp.js |    |
| `TCPSocket.offBindWifi`      | 🔶  | network/tcp.js |    |
| `TCPSocket.onClose`          | 🔶  | network/tcp.js |    |
| `TCPSocket.offClose`         | 🔶  | network/tcp.js |    |
| `TCPSocket.onConnect`        | 🔶  | network/tcp.js |    |
| `TCPSocket.offConnect`       | 🔶  | network/tcp.js |    |
| `TCPSocket.onError`          | 🔶  | network/tcp.js |    |
| `TCPSocket.offError`         | 🔶  | network/tcp.js |    |
| `TCPSocket.onMessage`        | 🔶  | network/tcp.js |    |
| `TCPSocket.offMessage`       | 🔶  | network/tcp.js |    |

### UDP
| API                          | 状态 | 测试文件                | 备注 |
| ---------------------------- | -- | ------------------- | -- |
| `migo.createUDPSocket`         | 🔶  | network/udp.js |    |
| `UDPSocket.bind`             | 🔶  | network/udp.js |    |
| `UDPSocket.close`            | 🔶  | network/udp.js |    |
| `UDPSocket.connect`          | 🔶  | network/udp.js |    |
| `UDPSocket.send`             | 🔶  | network/udp.js |    |
| `UDPSocket.write`            | 🔶  | network/udp.js |    |
| `UDPSocket.setTTL`           | 🔶  | network/udp.js |    |
| `UDPSocket.onClose`          | 🔶  | network/udp.js |    |
| `UDPSocket.offClose`         | 🔶  | network/udp.js |    |
| `UDPSocket.onError`          | 🔶  | network/udp.js |    |
| `UDPSocket.offError`         | 🔶  | network/udp.js |    |
| `UDPSocket.onListening`      | 🔶  | network/udp.js |    |
| `UDPSocket.offListening`     | 🔶  | network/udp.js |    |
| `UDPSocket.onMessage`        | 🔶  | network/udp.js |    |
| `UDPSocket.offMessage`       | 🔶  | network/udp.js |    |

---

## 虚拟支付
| API | 状态 | 测试文件 | 备注 |
|---|---|---|---|
| `migo.requestMidasFriendPayment` | 🔶 | payment/index.js | Deprecated |
| `migo.requestMidasPayment` | 🔶 | payment/index.js | |
| `migo.requestMidasPaymentGameItem` | 🔶 | payment/index.js | |

---

## 数据缓存
| API | 状态 | 测试文件 | 备注 |
|---|---|---|---|
| `migo.getBackgroundFetchData` | 🔶 | storage/index.js | |
| `migo.getBackgroundFetchToken` | 🔶 | storage/index.js | |
| `migo.onBackgroundFetchData` | 🔶 | storage/index.js | |
| `migo.setBackgroundFetchToken` | 🔶 | storage/index.js | |
| `migo.clearStorage` | 🔶 | storage/index.js | |
| `migo.clearStorageSync` | 🔶 | storage/index.js | |
| `migo.createBufferURL` | 🔶 | storage/index.js | |
| `migo.getStorage` | 🔶 | storage/index.js | |
| `migo.getStorageInfo` | 🔶 | storage/index.js | |
| `migo.getStorageInfoSync` | 🔶 | storage/index.js | |
| `migo.getStorageSync` | 🔶 | storage/index.js | |
| `migo.removeStorage` | 🔶 | storage/index.js | |
| `migo.removeStorageSync` | 🔶 | storage/index.js | |
| `migo.revokeBufferURL` | 🔶 | storage/index.js | |
| `migo.setStorage` | 🔶 | storage/index.js | |
| `migo.setStorageSync` | 🔶 | storage/index.js | |

---

### 数据分析
| API | 状态 | 测试文件 | 备注 |
|---|---|---|---|
| `migo.getGameLogManager` | 🔶 | data-analysis/index.js | |
| `GameLogManager.getCommonInfo` | 🔶 | data-analysis/index.js | |
| `GameLogManager.log` | 🔶 | data-analysis/index.js | |
| `GameLogManager.tag` | 🔶 | data-analysis/index.js | |
| `GameLogManager.updateCommonInfo` | 🔶 | data-analysis/index.js | |
| `migo.getMiniReportManager` | 🔶 | data-analysis/index.js | |
| `MiniReportManager.report` | 🔶 | data-analysis/index.js | |
| `migo.getExptInfoSync` | 🔶 | data-analysis/index.js | |
| `migo.getGameExptInfo` | 🔶 | data-analysis/index.js | |
| `migo.reportEvent` | 🔶 | data-analysis/index.js | |
| `migo.reportMonitor` | 🔶 | data-analysis/index.js | |
| `migo.reportScene` | 🔶 | data-analysis/index.js | |
| `migo.reportUserBehaviorBranchAnalytics` | 🔶 | data-analysis/index.js | |

---

## 渲染

### 画布
| API | 状态 | 测试文件 | 备注 |
|---|---|---|---|
| `migo.createCanvas` | 🔶 | render/canvas.js | |
| `migo.createPath2D` | 🔶 | render/canvas.js | |
| `Canvas.getContext` | 🔶 | render/canvas.js | |
| `Canvas.toDataURL` | 🔶 | render/canvas.js | |
| `Canvas.toTempFilePath` | 🔶 | render/canvas.js | |
| `Canvas.toTempFilePathSync` | 🔶 | render/canvas.js | |
| `Path2D` | 🔶 | render/canvas.js | |
| `RenderingContext` | 🔶 | render/canvas.js | |
| `WebGLRenderingContext.migoBindCanvasTexture` | 🔶 | render/canvas.js | |

### 鼠标样式
| API | 状态 | 测试文件 | 备注 |
|---|---|---|---|
| `migo.setCursor` | 🔶 | render/cursor.js | |
| `migo.requestPointerLock` | 🔶 | render/cursor.js | |
| `migo.isPointerLocked` | 🔶 | render/cursor.js | |
| `migo.exitPointerLock` | 🔶 | render/cursor.js | |

### 字体
| API | 状态 | 测试文件 | 备注 |
|---|---|---|---|
| `migo.loadFont` | 🔶 | render/font.js | |
| `migo.getTextLineHeight` | 🔶 | render/font.js | |

### 帧率
| API | 状态 | 测试文件 | 备注 |
|---|---|---|---|
| `migo.setPreferredFramesPerSecond` | ✅ | render/frame.js | |
| `requestAnimationFrame` | ✅ | render/frame.js | |
| `cancelAnimationFrame` | ✅ | render/frame.js | |

### 图片
| API | 状态 | 测试文件 | 备注 |
|---|---|---|---|
| `migo.createImage` | 🔶 | render/image.js | |
| `migo.createImageData` | 🔶 | render/image.js | |
| `Image` | 🔶 | render/image.js | |
| `ImageData` | 🔶 | render/image.js | |

---

## 媒体 - 音频 (audio)

| API | 状态 | 测试文件 | 备注 |
|-----|------|----------|------|
| `migo.createInnerAudioContext` | 🔶 | media/audio/inner_audio.js | |
| `InnerAudioContext.play` | 🔶 | media/audio/inner_audio.js | |
| `InnerAudioContext.pause` | 🔶 | media/audio/inner_audio.js | |
| `InnerAudioContext.stop` | 🔶 | media/audio/inner_audio.js | |
| `InnerAudioContext.seek` | 🔶 | media/audio/inner_audio.js | |
| `InnerAudioContext.destroy` | 🔶 | media/audio/inner_audio.js | |
| `InnerAudioContext.src` | 🔶 | media/audio/inner_audio.js | |
| `InnerAudioContext.volume` | 🔶 | media/audio/inner_audio.js | |
| `InnerAudioContext.loop` | 🔶 | media/audio/inner_audio.js | |
| `InnerAudioContext.onPlay` | 🔶 | media/audio/inner_audio.js | |
| `InnerAudioContext.onPause` | 🔶 | media/audio/inner_audio.js | |
| `InnerAudioContext.onStop` | 🔶 | media/audio/inner_audio.js | |
| `InnerAudioContext.onEnded` | 🔶 | media/audio/inner_audio.js | |
| `InnerAudioContext.onError` | 🔶 | media/audio/inner_audio.js | |
| `InnerAudioContext.onTimeUpdate` | 🔶 | media/audio/inner_audio.js | |
| `InnerAudioContext.onCanplay` | 🔶 | media/audio/inner_audio.js | |
| `InnerAudioContext.onWaiting` | 🔶 | media/audio/inner_audio.js | |
| `InnerAudioContext.onSeeking` | 🔶 | media/audio/inner_audio.js | |
| `InnerAudioContext.onSeeked` | 🔶 | media/audio/inner_audio.js | |
| `InnerAudioContext.offPlay` | 🔶 | media/audio/inner_audio.js | |
| `InnerAudioContext.offPause` | 🔶 | media/audio/inner_audio.js | |
| `InnerAudioContext.offStop` | 🔶 | media/audio/inner_audio.js | |
| `InnerAudioContext.offEnded` | 🔶 | media/audio/inner_audio.js | |
| `InnerAudioContext.offError` | 🔶 | media/audio/inner_audio.js | |
| `InnerAudioContext.offTimeUpdate` | 🔶 | media/audio/inner_audio.js | |
| `InnerAudioContext.offCanplay` | 🔶 | media/audio/inner_audio.js | |
| `InnerAudioContext.offWaiting` | 🔶 | media/audio/inner_audio.js | |
| `InnerAudioContext.offSeeking` | 🔶 | media/audio/inner_audio.js | |
| `InnerAudioContext.offSeeked` | 🔶 | media/audio/inner_audio.js | |
| `migo.getAvailableAudioSources` | 🔶 | media/audio/inner_audio.js | |
| `migo.setInnerAudioOption` | 🔶 | media/audio/inner_audio.js | |

### WebAudio

| API | 状态 | 测试文件 | 备注 |
|-----|------|----------|------|
| `migo.createWebAudioContext` | 🔶 | media/audio/web_audio.js | |
| `WebAudioContext.createBuffer` | 🔶 | media/audio/web_audio.js | |
| `WebAudioContext.createBufferSource` | 🔶 | media/audio/web_audio.js | |
| `WebAudioContext.createGain` | 🔶 | media/audio/web_audio.js | |
| `WebAudioContext.createAnalyser` | 🔶 | media/audio/web_audio.js | |
| `WebAudioContext.createBiquadFilter` | 🔶 | media/audio/web_audio.js | |
| `WebAudioContext.createChannelMerger` | 🔶 | media/audio/web_audio.js | |
| `WebAudioContext.createChannelSplitter` | 🔶 | media/audio/web_audio.js | |
| `WebAudioContext.createConstantSource` | 🔶 | media/audio/web_audio.js | |
| `WebAudioContext.createDelay` | 🔶 | media/audio/web_audio.js | |
| `WebAudioContext.createDynamicsCompressor` | 🔶 | media/audio/web_audio.js | |
| `WebAudioContext.createIIRFilter` | 🔶 | media/audio/web_audio.js | |
| `WebAudioContext.createOscillator` | 🔶 | media/audio/web_audio.js | |
| `WebAudioContext.createPanner` | 🔶 | media/audio/web_audio.js | |
| `WebAudioContext.createPeriodicWave` | 🔶 | media/audio/web_audio.js | |
| `WebAudioContext.createScriptProcessor` | 🔶 | media/audio/web_audio.js | |
| `WebAudioContext.createWaveShaper` | 🔶 | media/audio/web_audio.js | |
| `WebAudioContext.decodeAudioData` | 🔶 | media/audio/web_audio.js | |
| `WebAudioContext.resume` | 🔶 | media/audio/web_audio.js | |
| `WebAudioContext.suspend` | 🔶 | media/audio/web_audio.js | |
| `WebAudioContext.close` | 🔶 | media/audio/web_audio.js | |
| `WebAudioContextNode` | 🔶 | media/audio/web_audio.js | |
| `AudioListener` | 🔶 | media/audio/web_audio.js | |
| `AudioBuffer.copyFromChannel` | 🔶 | media/audio/web_audio.js | |
| `AudioBuffer.copyToChannel` | 🔶 | media/audio/web_audio.js | |
| `AudioBuffer.getChannelData` | 🔶 | media/audio/web_audio.js | |
| `AudioParam.value` | 🔶 | media/audio/web_audio.js | |
| `AudioParam.setValueAtTime` | 🔶 | media/audio/web_audio.js | |
| `AudioParam.linearRampToValueAtTime` | 🔶 | media/audio/web_audio.js | |
| `AudioParam.exponentialRampToValueAtTime` | 🔶 | media/audio/web_audio.js | |
| `AudioParam.setTargetAtTime` | 🔶 | media/audio/web_audio.js | |
| `AudioParam.setValueCurveAtTime` | 🔶 | media/audio/web_audio.js | |
| `AudioParam.cancelScheduledValues` | 🔶 | media/audio/web_audio.js | |
| `BufferSourceNode.start` | 🔶 | media/audio/web_audio.js | |
| `BufferSourceNode.stop` | 🔶 | media/audio/web_audio.js | |
| `BufferSourceNode.connect` | 🔶 | media/audio/web_audio.js | |
| `BufferSourceNode.disconnect` | 🔶 | media/audio/web_audio.js | |

### MediaAudioPlayer

| API | 状态 | 测试文件 | 备注 |
|-----|------|----------|------|
| `migo.createMediaAudioPlayer` | 🔶 | media/audio/media_player.js | |
| `MediaAudioPlayer.start` | 🔶 | media/audio/media_player.js | |
| `MediaAudioPlayer.stop` | 🔶 | media/audio/media_player.js | |
| `MediaAudioPlayer.destroy` | 🔶 | media/audio/media_player.js | |
| `MediaAudioPlayer.addAudioSource` | 🔶 | media/audio/media_player.js | |
| `MediaAudioPlayer.removeAudioSource` | 🔶 | media/audio/media_player.js | |

## 媒体 - 相机 (camera)

| API | 状态 | 测试文件 | 备注 |
|-----|------|----------|------|
| `migo.createCamera` | 🔶 | media/camera/camera.js | |
| `Camera.takePhoto` | 🔶 | media/camera/camera.js | |
| `Camera.startRecord` | 🔶 | media/camera/camera.js | |
| `Camera.stopRecord` | 🔶 | media/camera/camera.js | |
| `Camera.onCameraFrame` | 🔶 | media/camera/camera.js | |
| `Camera.setZoom` | 🔶 | media/camera/camera.js | |
| `Camera.closeFrameChange` | 🔶 | media/camera/camera.js | |
| `Camera.listenFrameChange` | 🔶 | media/camera/camera.js | |
| `Camera.onAuthCancel` | 🔶 | media/camera/camera.js | |
| `Camera.onStop` | 🔶 | media/camera/camera.js | |
| `Camera.destroy` | 🔶 | media/camera/camera.js | |

## 媒体 - 图片 (image)

| API | 状态 | 测试文件 | 备注 |
|-----|------|----------|------|
| `migo.chooseImage` | 🔶 | media/image/image.js | |
| `migo.previewImage` | 🔶 | media/image/image.js | |
| `migo.saveImageToPhotosAlbum` | 🔶 | media/image/image.js | |
| `migo.compressImage` | 🔶 | media/image/image.js | |
| `migo.chooseMessageFile` | 🔶 | media/image/image.js | |
| `migo.previewMedia` | 🔶 | media/image/image.js | |

## 媒体 - 录音 (recorder)

| API | 状态 | 测试文件 | 备注 |
|-----|------|----------|------|
| `migo.getRecorderManager` | ✅ | media/recorder/recorder.js | |
| `RecorderManager.start` | ✅ | media/recorder/recorder.js | |
| `RecorderManager.pause` | ✅ | media/recorder/recorder.js | |
| `RecorderManager.resume` | ✅ | media/recorder/recorder.js | |
| `RecorderManager.stop` | ✅ | media/recorder/recorder.js | |
| `RecorderManager.onStart` | ✅ | media/recorder/recorder.js | |
| `RecorderManager.onPause` | ✅ | media/recorder/recorder.js | |
| `RecorderManager.onResume` | ✅ | media/recorder/recorder.js | |
| `RecorderManager.onStop` | ✅ | media/recorder/recorder.js | |
| `RecorderManager.onFrameRecorded` | ✅ | media/recorder/recorder.js | |
| `RecorderManager.onError` | ✅ | media/recorder/recorder.js | |
| `RecorderManager.onInterruptionBegin` | 🔶 | media/recorder/recorder.js | |
| `RecorderManager.onInterruptionEnd` | 🔶 | media/recorder/recorder.js | |

## 媒体 - 视频解码器 (video-decoder)

| API | 状态 | 测试文件 | 备注 |
|-----|------|----------|------|
| `migo.createVideoDecoder` | 🔶 | media/video_decoder/video_decoder.js | |
| `VideoDecoder.start` | 🔶 | media/video_decoder/video_decoder.js | |
| `VideoDecoder.stop` | 🔶 | media/video_decoder/video_decoder.js | |
| `VideoDecoder.seek` | 🔶 | media/video_decoder/video_decoder.js | |
| `VideoDecoder.remove` | 🔶 | media/video_decoder/video_decoder.js | |
| `VideoDecoder.getFrameData` | 🔶 | media/video_decoder/video_decoder.js | |
| `VideoDecoder.on` | 🔶 | media/video_decoder/video_decoder.js | |
| `VideoDecoder.off` | 🔶 | media/video_decoder/video_decoder.js | |

## 媒体 - 视频 (video)

| API | 状态 | 测试文件 | 备注 |
|-----|------|----------|------|
| `migo.createVideo` | 🔶 | media/video/video.js | |
| `migo.chooseMedia` | 🔶 | media/video/video.js | |
| `Video.play` | 🔶 | media/video/video.js | |
| `Video.pause` | 🔶 | media/video/video.js | |
| `Video.stop` | 🔶 | media/video/video.js | |
| `Video.seek` | 🔶 | media/video/video.js | |
| `Video.requestFullScreen` | 🔶 | media/video/video.js | |
| `Video.exitFullScreen` | 🔶 | media/video/video.js | |
| `Video.destroy` | 🔶 | media/video/video.js | |
| `Video.onPlay` | 🔶 | media/video/video.js | |
| `Video.offPlay` | 🔶 | media/video/video.js | |
| `Video.onPause` | 🔶 | media/video/video.js | |
| `Video.offPause` | 🔶 | media/video/video.js | |
| `Video.onEnded` | 🔶 | media/video/video.js | |
| `Video.offEnded` | 🔶 | media/video/video.js | |
| `Video.onError` | 🔶 | media/video/video.js | |
| `Video.offError` | 🔶 | media/video/video.js | |
| `Video.onTimeUpdate` | 🔶 | media/video/video.js | |
| `Video.offTimeUpdate` | 🔶 | media/video/video.js | |
| `Video.onWaiting` | 🔶 | media/video/video.js | |
| `Video.offWaiting` | 🔶 | media/video/video.js | |
| `Video.onProgress` | 🔶 | media/video/video.js | |
| `Video.offProgress` | 🔶 | media/video/video.js | |

## 媒体 - 实时语音 (voip)

| API | 状态 | 测试文件 | 备注 |
|-----|------|----------|------|
| `migo.joinVoIPChat` | 🔶 | media/voip/voip.js | |
| `migo.exitVoIPChat` | 🔶 | media/voip/voip.js | |
| `migo.updateVoIPChatMuteConfig` | 🔶 | media/voip/voip.js | |
| `migo.onVoIPChatStateChanged` | 🔶 | media/voip/voip.js | |
| `migo.offVoIPChatStateChanged` | 🔶 | media/voip/voip.js | |
| `migo.onVoIPChatInterrupted` | 🔶 | media/voip/voip.js | |
| `migo.offVoIPChatInterrupted` | 🔶 | media/voip/voip.js | |
| `migo.onVoIPChatMembersChanged` | 🔶 | media/voip/voip.js | |
| `migo.offVoIPChatMembersChanged` | 🔶 | media/voip/voip.js | |
| `migo.onVoIPChatSpeakersChanged` | 🔶 | media/voip/voip.js | |
| `migo.offVoIPChatSpeakersChanged` | 🔶 | media/voip/voip.js | |

---
## 位置

| API | 状态 | 测试文件 | 备注 |
|---|---|---|---|
| `migo.getFuzzyLocation` | 🔶 | device/location.js | |
| `migo.getLocation` | 🔶 | device/location.js | |

---
## 文件

| API | 状态 | 测试文件 | 备注 |
|---|---|---|---|
| `migo.getFileSystemManager` | 🔶 | file/basic.js | |
| `migo.saveFileToDisk` | 🔶 | file/management.js | PC特有 |
| `FileSystemManager.access` | 🔶 | file/basic.js | |
| `FileSystemManager.accessSync` | 🔶 | file/basic.js | |
| `FileSystemManager.appendFile` | 🔶 | file/read_write_path.js | |
| `FileSystemManager.appendFileSync` | 🔶 | file/read_write_path.js | |
| `FileSystemManager.close` | 🔶 | file/read_write_fd.js | |
| `FileSystemManager.closeSync` | 🔶 | file/read_write_fd.js | |
| `FileSystemManager.copyFile` | 🔶 | file/read_write_path.js | |
| `FileSystemManager.copyFileSync` | 🔶 | file/read_write_path.js | |
| `FileSystemManager.fstat` | 🔶 | file/stat.js | |
| `FileSystemManager.fstatSync` | 🔶 | file/stat.js | |
| `FileSystemManager.ftruncate` | 🔶 | file/management.js | |
| `FileSystemManager.ftruncateSync` | 🔶 | file/management.js | |
| `FileSystemManager.getFileInfo` | 🔶 | file/stat.js | |
| `FileSystemManager.getSavedFileList` | 🔶 | file/management.js | |
| `FileSystemManager.mkdir` | 🔶 | file/directory.js | |
| `FileSystemManager.mkdirSync` | 🔶 | file/directory.js | |
| `FileSystemManager.open` | 🔶 | file/read_write_fd.js | |
| `FileSystemManager.openSync` | 🔶 | file/read_write_fd.js | |
| `FileSystemManager.read` | 🔶 | file/read_write_fd.js | |
| `FileSystemManager.readSync` | 🔶 | file/read_write_fd.js | |
| `FileSystemManager.readCompressedFile` | 🔶 | file/compressed.js | |
| `FileSystemManager.readCompressedFileSync` | 🔶 | file/compressed.js | |
| `FileSystemManager.readFile` | 🔶 | file/read_write_path.js | |
| `FileSystemManager.readFileSync` | 🔶 | file/read_write_path.js | |
| `FileSystemManager.readZipEntry` | 🔶 | file/compressed.js | |
| `FileSystemManager.readdir` | 🔶 | file/directory.js | |
| `FileSystemManager.readdirSync` | 🔶 | file/directory.js | |
| `FileSystemManager.removeSavedFile` | 🔶 | file/management.js | |
| `FileSystemManager.rename` | 🔶 | file/management.js | |
| `FileSystemManager.renameSync` | 🔶 | file/management.js | |
| `FileSystemManager.rmdir` | 🔶 | file/directory.js | |
| `FileSystemManager.rmdirSync` | 🔶 | file/directory.js | |
| `FileSystemManager.saveFile` | 🔶 | file/management.js | |
| `FileSystemManager.saveFileSync` | 🔶 | file/management.js | |
| `FileSystemManager.stat` | 🔶 | file/stat.js | |
| `FileSystemManager.statSync` | 🔶 | file/stat.js | |
| `FileSystemManager.truncate` | 🔶 | file/management.js | |
| `FileSystemManager.truncateSync` | 🔶 | file/management.js | |
| `FileSystemManager.unlink` | 🔶 | file/management.js | |
| `FileSystemManager.unlinkSync` | 🔶 | file/management.js | |
| `FileSystemManager.unzip` | 🔶 | file/compressed.js | |
| `FileSystemManager.write` | 🔶 | file/read_write_fd.js | |
| `FileSystemManager.writeSync` | 🔶 | file/read_write_fd.js | |
| `FileSystemManager.writeFile` | 🔶 | file/read_write_path.js | |
| `FileSystemManager.writeFileSync` | 🔶 | file/read_write_path.js | |
| `FileStats` | 🔶 | file/stat.js | 返回对象 |
| `Stats` | 🔶 | file/stat.js | 返回对象 |
| `Stats.isDirectory` | 🔶 | file/stat.js | |
| `Stats.isFile` | 🔶 | file/stat.js | |
| `ReadResult` | 🔶 | file/read_write_fd.js | 返回对象 |
| `WriteResult` | 🔶 | file/read_write_fd.js | 返回对象 |

---

## 开放接口
TODO

---

## 设备

### 触摸

| API | 状态 | 测试文件 | 备注 |
|---|---|---|---|
| `migo.onTouchStart` | ✅ | device/touch.js | |
| `migo.onTouchMove` | ✅ | device/touch.js | |
| `migo.onTouchEnd` | ✅ | device/touch.js | |
| `migo.onTouchCancel` | ✅ | device/touch.js | |
| `migo.offTouchStart` | ✅ | device/touch.js | |
| `migo.offTouchMove` | ✅ | device/touch.js | |
| `migo.offTouchEnd` | ✅ | device/touch.js | |
| `migo.offTouchCancel` | ✅ | device/touch.js | |

### 电量
| API | 状态 | 测试文件 | 备注 |
|---|---|---|---|
| `migo.getBatteryInfoSync` | ✅ | device/battery.js | |
| `migo.getBatteryInfo` | ✅ | device/battery.js | |

### 剪贴板
| API | 状态 | 测试文件 | 备注 |
|---|---|---|---|
| `migo.setClipboardData` | ✅ | device/clipboard.js | |
| `migo.getClipboardData` | ✅ | device/clipboard.js | |

### 屏幕
| API | 状态 | 测试文件 | 备注 |
|---|---|---|---|
| `migo.setScreenBrightness` | ✅ | device/screen.js | |
| `migo.getScreenBrightness` | ✅ | device/screen.js | |
| `migo.setKeepScreenOn` | ✅ | device/screen.js | |
| `migo.setVisualEffectOnCapture` | 🔶 | device/screen.js | |
| `migo.getScreenRecordingState` | ➖ | device/screen.js |IOS only |
| `migo.onScreenRecordingStateChanged` | ➖ | device/screen.js |IOS only |
| `migo.offScreenRecordingStateChanged` | ➖ | device/screen.js |IOS only |
| `migo.onUserCaptureScreen` | ✅ | device/screen.js | |
| `migo.offUserCaptureScreen` | ✅ | device/screen.js | |

### 振动
| API | 状态 | 测试文件 | 备注 |
|---|---|---|---|
| `migo.vibrateShort` | ✅ | device/vibration.js | |
| `migo.vibrateLong` | ✅ | device/vibration.js | |

### 网络 (Device)
| API | 状态 | 测试文件 | 备注 |
|---|---|---|---|
| `migo.getNetworkType` | ✅ | device/network.js | |
| `migo.onNetworkStatusChange` | ✅ | device/network.js | |
| `migo.offNetworkStatusChange` | ✅ | device/network.js | |
| `migo.getLocalIPAddress` | ✅ | device/network.js | |
| `migo.onNetworkWeakChange` | ✅ | device/network.js | |
| `migo.offNetworkWeakChange` | ✅ | device/network.js | |

### 传感器
| API | 状态 | 测试文件 | 备注 |
|---|---|---|---|
| `migo.startAccelerometer` | ✅ | device/sensor.js | |
| `migo.stopAccelerometer` | ✅ | device/sensor.js | |
| `migo.onAccelerometerChange` | ✅ | device/sensor.js | |
| `migo.offAccelerometerChange` | ✅ | device/sensor.js | |
| `migo.startCompass` | ✅ | device/sensor.js | |
| `migo.stopCompass` | ✅ | device/sensor.js | |
| `migo.onCompassChange` | ✅ | device/sensor.js | |
| `migo.offCompassChange` | ✅ | device/sensor.js | |

### 键盘 (Keyboard)
| API | 状态 | 测试文件 | 备注 |
|---|---|---|---|
| `migo.showKeyboard` | 🔶 | device/keyboard.js | |
| `migo.hideKeyboard` | 🔶 | device/keyboard.js | |
| `migo.onKeyboardInput` | 🔶 | device/keyboard.js | |
| `migo.offKeyboardInput` | 🔶 | device/keyboard.js | |
| `migo.onKeyboardConfirm` | 🔶 | device/keyboard.js | |
| `migo.offKeyboardConfirm` | 🔶 | device/keyboard.js | |
| `migo.onKeyboardComplete` | 🔶 | device/keyboard.js | |
| `migo.offKeyboardComplete` | 🔶 | device/keyboard.js | |
| `migo.updateKeyboard` | 🔶 | device/keyboard.js | |
| `migo.onKeyDown` | 🔶 | device/keyboard.js | |
| `migo.offKeyDown` | 🔶 | device/keyboard.js | |
| `migo.onKeyUp` | 🔶 | device/keyboard.js | |
| `migo.offKeyUp` | 🔶 | device/keyboard.js | |
| `migo.onKeyboardHeightChange` | 🔶 | device/keyboard.js | |
| `migo.offKeyboardHeightChange` | 🔶 | device/keyboard.js | |

### 蓝牙 (Bluetooth)
| API | 状态 | 测试文件 | 备注 |
|---|---|---|---|
| `migo.openBluetoothAdapter` | 🔶 | device/bluetooth.js | |
| `migo.closeBluetoothAdapter` | 🔶 | device/bluetooth.js | |
| `migo.getBluetoothAdapterState` | 🔶 | device/bluetooth.js | |
| `migo.onBluetoothAdapterStateChange` | 🔶 | device/bluetooth.js | |
| `migo.offBluetoothAdapterStateChange` | 🔶 | device/bluetooth.js | |
| `migo.startBluetoothDevicesDiscovery` | 🔶 | device/bluetooth.js | |
| `migo.stopBluetoothDevicesDiscovery` | 🔶 | device/bluetooth.js | |
| `migo.getBluetoothDevices` | 🔶 | device/bluetooth.js | |
| `migo.getConnectedBluetoothDevices` | 🔶 | device/bluetooth.js | |
| `migo.isBluetoothDevicePaired` | 🔶 | device/bluetooth.js | |
| `migo.makeBluetoothPair` | 🔶 | device/bluetooth.js | |
| `migo.onBluetoothDeviceFound` | 🔶 | device/bluetooth.js | |
| `migo.offBluetoothDeviceFound` | 🔶 | device/bluetooth.js | |
| `migo.startBeaconDiscovery` | 🔶 | device/bluetooth.js | |
| `migo.stopBeaconDiscovery` | 🔶 | device/bluetooth.js | |
| `migo.getBeacons` | 🔶 | device/bluetooth.js | |
| `migo.onBeaconUpdate` | 🔶 | device/bluetooth.js | |
| `migo.offBeaconUpdate` | 🔶 | device/bluetooth.js | |
| `migo.onBeaconServiceChange` | 🔶 | device/bluetooth.js | |
| `migo.offBeaconServiceChange` | 🔶 | device/bluetooth.js | |
| `migo.createBLEConnection` | 🔶 | device/bluetooth.js | |
| `migo.closeBLEConnection` | 🔶 | device/bluetooth.js | |
| `migo.getBLEDeviceCharacteristics` | 🔶 | device/bluetooth.js | |
| `migo.getBLEDeviceRSSI` | 🔶 | device/bluetooth.js | |
| `migo.getBLEDeviceServices` | 🔶 | device/bluetooth.js | |
| `migo.getBLEMTU` | 🔶 | device/bluetooth.js | |
| `migo.notifyBLECharacteristicValueChange` | 🔶 | device/bluetooth.js | |
| `migo.readBLECharacteristicValue` | 🔶 | device/bluetooth.js | |
| `migo.writeBLECharacteristicValue` | 🔶 | device/bluetooth.js | |
| `migo.setBLEMTU` | 🔶 | device/bluetooth.js | |
| `migo.onBLECharacteristicValueChange` | 🔶 | device/bluetooth.js | |
| `migo.offBLECharacteristicValueChange` | 🔶 | device/bluetooth.js | |
| `migo.onBLEConnectionStateChange` | 🔶 | device/bluetooth.js | |
| `migo.offBLEConnectionStateChange` | 🔶 | device/bluetooth.js | |
| `migo.onBLEMTUChange` | 🔶 | device/bluetooth.js | |
| `migo.offBLEMTUChange` | 🔶 | device/bluetooth.js | |
| `migo.createBLEPeripheralServer` | 🔶 | device/bluetooth.js | |
| `migo.onBLEPeripheralConnectionStateChanged` | 🔶 | device/bluetooth.js | |
| `migo.offBLEPeripheralConnectionStateChanged` | 🔶 | device/bluetooth.js | |

### 游戏手柄 (Gamepad)
| API | 状态 | 测试文件 | 备注 |
|---|---|---|---|
| `migo.onGamepadConnected` | 🔶 | device/gamepad.js | |
| `migo.offGamepadConnected` | 🔶 | device/gamepad.js | |
| `migo.onGamepadDisconnected` | 🔶 | device/gamepad.js | |
| `migo.offGamepadDisconnected` | 🔶 | device/gamepad.js | |
| `migo.getGamepads` | 🔶 | device/gamepad.js | |

### 动作与方向 (Motion)
| API | 状态 | 测试文件 | 备注 |
|---|---|---|---|
| `migo.startGyroscope` | ✅ | device/motion.js | |
| `migo.stopGyroscope` | ✅ | device/motion.js | |
| `migo.onGyroscopeChange` | ✅ | device/motion.js | |
| `migo.offGyroscopeChange` | ✅ | device/motion.js | |
| `migo.startDeviceMotionListening` | ✅ | device/motion.js | |
| `migo.stopDeviceMotionListening` | ✅ | device/motion.js | |
| `migo.onDeviceMotionChange` | ✅ | device/motion.js | |
| `migo.offDeviceMotionChange` | ✅ | device/motion.js | |

### 鼠标与滚轮 (Mouse)
| API | 状态 | 测试文件 | 备注 |
|---|---|---|---|
| `migo.onMouseDown` | 🔶 | device/mouse.js | |
| `migo.offMouseDown` | 🔶 | device/mouse.js | |
| `migo.onMouseUp` | 🔶 | device/mouse.js | |
| `migo.offMouseUp` | 🔶 | device/mouse.js | |
| `migo.onMouseMove` | 🔶 | device/mouse.js | |
| `migo.offMouseMove` | 🔶 | device/mouse.js | |
| `migo.onWheel` | 🔶 | device/mouse.js | |
| `migo.offWheel` | 🔶 | device/mouse.js | |

### 其他 (Others)
| API | 状态 | 测试文件 | 备注 |
|---|---|---|---|
| `migo.scanCode` | 🔶 | device/others.js | |
| `migo.onMemoryWarning` | 🔶 | device/others.js | |
| `migo.offMemoryWarning` | 🔶 | device/others.js | |
---

## AI
TODO

---

## Worker

| API | 状态 | 测试文件 | 备注 |
|---|---|---|---|
| `migo.createWorker` | ✅ | worker/worker.js | |
| `Worker` | ✅ | worker/worker.js | 返回对象 |
| `Worker.getCameraFrameData` | ✅ | worker/worker.js | Worker内方法 |
| `Worker.onError` | ✅ | worker/worker.js | |
| `Worker.onMessage` | ✅ | worker/worker.js | |
| `Worker.onProcessKilled` | ✅ | worker/worker.js | |
| `Worker.postMessage` | ✅ | worker/worker.js | |
| `Worker.terminate` | ✅ | worker/worker.js | |
| `Worker.testOnProcessKilled` | ✅ | worker/worker.js | Worker内方法 |

---

## 游戏对局回放

| API | 状态 | 测试文件 | 备注 |
|---|---|---|---|
| `migo.createGameRecorderShareButton` | 🔶 | | |
| `migo.getGameRecorder` | 🔶 | | |
| `migo.operateGameRecorderVideo` | 🔶 | | |
| `GameRecorder` | 🔶 | | 返回对象 |
| `GameRecorder.abort` | 🔶 | | |
| `GameRecorder.isAtempoSupported` | 🔶 | | |
| `GameRecorder.isFrameSupported` | 🔶 | | |
| `GameRecorder.isSoundSupported` | 🔶 | | |
| `GameRecorder.isVolumeSupported` | 🔶 | | |
| `GameRecorder.off` | 🔶 | | |
| `GameRecorder.on` | 🔶 | | |
| `GameRecorder.pause` | 🔶 | | |
| `GameRecorder.resume` | 🔶 | | |
| `GameRecorder.start` | 🔶 | | |
| `GameRecorder.stop` | 🔶 | | |
| `GameRecorderShareButton` | 🔶 | | 返回对象 |
| `GameRecorderShareButton.hide` | 🔶 | | |
| `GameRecorderShareButton.offTap` | 🔶 | | |
| `GameRecorderShareButton.onTap` | 🔶 | | |
| `GameRecorderShareButton.show` | 🔶 | | |

---
## 游戏服务

| API | 状态 | 测试文件 | 备注 |
|---|---|---|---|
| `migo.getGameServerManager` | 🔶 | | |
| `GameServerManager` | 🔶 | | 返回对象 |
| `GameServerManager.broadcastInRoom` | 🔶 | | |
| `GameServerManager.cancelMatch` | 🔶 | | |
| `GameServerManager.changeSeat` | 🔶 | | |
| `GameServerManager.createRoom` | 🔶 | | |
| `GameServerManager.endGame` | 🔶 | | |
| `GameServerManager.endStateService` | 🔶 | | |
| `GameServerManager.getFriendsStateData` | 🔶 | | |
| `GameServerManager.getLastRoomInfo` | 🔶 | | |
| `GameServerManager.getLostFrames` | 🔶 | | |
| `GameServerManager.getRoomInfo` | 🔶 | | |
| `GameServerManager.inviteFriend` | 🔶 | | |
| `GameServerManager.joinRoom` | 🔶 | | |
| `GameServerManager.kickoutMember` | 🔶 | | |
| `GameServerManager.login` | 🔶 | | |
| `GameServerManager.logout` | 🔶 | | |
| `GameServerManager.memberLeaveRoom` | 🔶 | | |
| `GameServerManager.offBeKickedOut` | 🔶 | | |
| `GameServerManager.offBroadcast` | 🔶 | | |
| `GameServerManager.offDisconnect` | 🔶 | | |
| `GameServerManager.offGameEnd` | 🔶 | | |
| `GameServerManager.offGameStart` | 🔶 | | |
| `GameServerManager.offInvite` | 🔶 | | |
| `GameServerManager.offLockStepError` | 🔶 | | |
| `GameServerManager.offLogout` | 🔶 | | |
| `GameServerManager.offMatch` | 🔶 | | |
| `GameServerManager.offRoomInfoChange` | 🔶 | | |
| `GameServerManager.offStateUpdate` | 🔶 | | |
| `GameServerManager.offSyncFrame` | 🔶 | | |
| `GameServerManager.onBeKickedOut` | 🔶 | | |
| `GameServerManager.onBroadcast` | 🔶 | | |
| `GameServerManager.onDisconnect` | 🔶 | | |
| `GameServerManager.onGameEnd` | 🔶 | | |
| `GameServerManager.onGameStart` | 🔶 | | |
| `GameServerManager.onInvite` | 🔶 | | |
| `GameServerManager.onLockStepError` | 🔶 | | |
| `GameServerManager.onLogout` | 🔶 | | |
| `GameServerManager.onMatch` | 🔶 | | |
| `GameServerManager.onRoomInfoChange` | 🔶 | | |
| `GameServerManager.onStateUpdate` | 🔶 | | |
| `GameServerManager.onSyncFrame` | 🔶 | | |
| `GameServerManager.ownerLeaveRoom` | 🔶 | | |
| `GameServerManager.reconnect` | 🔶 | | |
| `GameServerManager.restart` | 🔶 | | |
| `GameServerManager.setInviteData` | 🔶 | | |
| `GameServerManager.setState` | 🔶 | | |
| `GameServerManager.startGame` | 🔶 | | |
| `GameServerManager.startMatch` | 🔶 | | |
| `GameServerManager.startStateService` | 🔶 | | |
| `GameServerManager.updateReadyStatus` | 🔶 | | |
| `GameServerManager.uploadFrame` | 🔶 | | |
| `ReconnectSuccessRes` | 🔶 | | 返回对象 |

---

## 第三方平台

| API | 状态 | 测试文件 | 备注 |
|---|---|---|---|
| `migo.getExtConfig` | 🔶 | ext/index.js | |
| `migo.getExtConfigSync` | 🔶 | ext/index.js | |

---
## 广告

| API | 状态 | 测试文件 | 备注 |
|---|---|---|---|
| `migo.createBannerAd` | 🔶 | ad/banner.js | |
| `BannerAd` | 🔶 | ad/banner.js | 返回对象 |
| `BannerAd.destroy` | 🔶 | ad/banner.js | |
| `BannerAd.hide` | 🔶 | ad/banner.js | |
| `BannerAd.offError` | 🔶 | ad/banner.js | |
| `BannerAd.offLoad` | 🔶 | ad/banner.js | |
| `BannerAd.offResize` | 🔶 | ad/banner.js | |
| `BannerAd.onError` | 🔶 | ad/banner.js | |
| `BannerAd.onLoad` | 🔶 | ad/banner.js | |
| `BannerAd.onResize` | 🔶 | ad/banner.js | |
| `BannerAd.show` | 🔶 | ad/banner.js | |
| `migo.createCustomAd` | 🔶 | ad/custom.js | |
| `CustomAd` | 🔶 | ad/custom.js | 返回对象 |
| `CustomAd.destroy` | 🔶 | ad/custom.js | |
| `CustomAd.hide` | 🔶 | ad/custom.js | |
| `CustomAd.isShow` | 🔶 | ad/custom.js | |
| `CustomAd.offClose` | 🔶 | ad/custom.js | |
| `CustomAd.offError` | 🔶 | ad/custom.js | |
| `CustomAd.offHide` | 🔶 | ad/custom.js | |
| `CustomAd.offLoad` | 🔶 | ad/custom.js | |
| `CustomAd.offResize` | 🔶 | ad/custom.js | |
| `CustomAd.onClose` | 🔶 | ad/custom.js | |
| `CustomAd.onError` | 🔶 | ad/custom.js | |
| `CustomAd.onHide` | 🔶 | ad/custom.js | |
| `CustomAd.onLoad` | 🔶 | ad/custom.js | |
| `CustomAd.onResize` | 🔶 | ad/custom.js | |
| `CustomAd.show` | 🔶 | ad/custom.js | |
| `migo.createGridAd` | 🔶 | ad/grid.js | |
| `GridAd` | 🔶 | ad/grid.js | 返回对象 |
| `GridAd.destroy` | 🔶 | ad/grid.js | |
| `GridAd.hide` | 🔶 | ad/grid.js | |
| `GridAd.offError` | 🔶 | ad/grid.js | |
| `GridAd.offLoad` | 🔶 | ad/grid.js | |
| `GridAd.offResize` | 🔶 | ad/grid.js | |
| `GridAd.onError` | 🔶 | ad/grid.js | |
| `GridAd.onLoad` | 🔶 | ad/grid.js | |
| `GridAd.onResize` | 🔶 | ad/grid.js | |
| `GridAd.show` | 🔶 | ad/grid.js | |
| `migo.createInterstitialAd` | 🔶 | ad/interstitial.js | |
| `InterstitialAd` | 🔶 | ad/interstitial.js | 返回对象 |
| `InterstitialAd.destroy` | 🔶 | ad/interstitial.js | |
| `InterstitialAd.load` | 🔶 | ad/interstitial.js | |
| `InterstitialAd.offClose` | 🔶 | ad/interstitial.js | |
| `InterstitialAd.offError` | 🔶 | ad/interstitial.js | |
| `InterstitialAd.offLoad` | 🔶 | ad/interstitial.js | |
| `InterstitialAd.onClose` | 🔶 | ad/interstitial.js | |
| `InterstitialAd.onError` | 🔶 | ad/interstitial.js | |
| `InterstitialAd.onLoad` | 🔶 | ad/interstitial.js | |
| `InterstitialAd.show` | 🔶 | ad/interstitial.js | |
| `migo.createRewardedVideoAd` | 🔶 | ad/rewarded_video.js | |
| `RewardedVideoAd` | 🔶 | ad/rewarded_video.js | 返回对象 |
| `RewardedVideoAd.load` | 🔶 | ad/rewarded_video.js | |
| `RewardedVideoAd.offClose` | 🔶 | ad/rewarded_video.js | |
| `RewardedVideoAd.offError` | 🔶 | ad/rewarded_video.js | |
| `RewardedVideoAd.offLoad` | 🔶 | ad/rewarded_video.js | |
| `RewardedVideoAd.onClose` | 🔶 | ad/rewarded_video.js | |
| `RewardedVideoAd.onError` | 🔶 | ad/rewarded_video.js | |
| `RewardedVideoAd.onLoad` | 🔶 | ad/rewarded_video.js | |
| `RewardedVideoAd.show` | 🔶 | ad/rewarded_video.js | |
| `migo.getDirectAdStatusSync` | 🔶 | ad/others.js | |
| `migo.getShowSplashAdStatus` | 🔶 | ad/others.js | |
| `migo.onDirectAdStatusChange` | 🔶 | ad/others.js | |
| `migo.offDirectAdStatusChange` | 🔶 | ad/others.js | |


---
## 工具

| API | 状态 | 测试文件 | 备注 |
|---|---|---|---|
| `migo.decode` | ✅ | util/index.js | |
| `migo.encode` | ✅ | util/index.js | |

---

## 统计摘要

| 类别 | 总数 | ✅ 已通过 | 🔶 待测试 | 🚧 进行中 | ❌ 未实现 |
|------|------|-----------|-----------|-----------|-----------|
| 基础 | 12 | 0 | 0 | 6 | 6 |
| 网络 | 5 | 0 | 0 | 1 | 4 |
| 音频 | 22 | 0 | 18 | 2 | 2 |
| 画布 | 25 | 0 | 18 | 0 | 7 |
| 文件 | 12 | 0 | 10 | 0 | 2 |
| 设备 | 110 | 4 | 106 | 0 | 0 |
| 输入 | 8 | 0 | 8 | 0 | 0 |
| 定时器 | 6 | 0 | 6 | 0 | 0 |
| 性能 | 3 | 0 | 1 | 0 | 2 |
| **总计** | **203** | **4** | **167** | **9** | **23** |

**兼容率**: (4 + 167) / 203 = **84.2%**

---

## 更新日志

| 日期 | 变更 |
|------|------|
| 2026-01-25 | 初始化 API 覆盖率追踪表 |
