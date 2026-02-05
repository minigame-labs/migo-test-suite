export default [
  {
    name: 'migo.setScreenBrightness',
    category: 'device',
    tests: [
      {
        id: 'migo.setScreenBrightness',
        name: '设置屏幕亮度',
        description: '设置屏幕亮度为 0.5',
        type: 'async',
        run: (runtime) => new Promise((resolve) => {
          if (typeof runtime.setScreenBrightness !== 'function') {
            resolve({ _error: 'setScreenBrightness 不存在' });
            return;
          }
          runtime.setScreenBrightness({
            value: 0.5,
            success: () => resolve('PASS'),
            fail: () => resolve('FAIL')
          });
        }),
        expect: 'PASS'
      }
    ]
  },
  {
    name: 'migo.getScreenBrightness',
    category: 'device',
    tests: [
      {
        id: 'migo.getScreenBrightness',
        name: '获取屏幕亮度',
        description: '获取当前屏幕亮度，返回值应在 0-1 之间',
        type: 'async',
        run: (runtime) => new Promise((resolve) => {
          if (typeof runtime.getScreenBrightness !== 'function') {
            resolve({ _error: 'getScreenBrightness 不存在' });
            return;
          }
          runtime.getScreenBrightness({
            success: (res) => {
              const val = Number(res.value);
              if (Number.isFinite(val) && val >= 0 && val <= 1) {
                resolve('PASS');
              } else {
                resolve('FAIL');
              }
            },
            fail: () => resolve('FAIL')
          });
        }),
        expect: 'PASS'
      }
    ]
  },
  {
    name: 'migo.setKeepScreenOn',
    category: 'device',
    tests: [
      {
        id: 'migo.setKeepScreenOn',
        name: '设置屏幕常亮',
        description: '开启屏幕常亮',
        type: 'async',
        run: (runtime) => new Promise((resolve) => {
          if (typeof runtime.setKeepScreenOn !== 'function') {
            resolve({ _error: 'setKeepScreenOn 不存在' });
            return;
          }
          runtime.setKeepScreenOn({
            keepScreenOn: true,
            success: () => resolve('PASS'),
            fail: () => resolve('FAIL')
          });
        }),
        expect: 'PASS'
      },
      {
        id: 'migo.setVisualEffectOnCapture',
        name: '设置截屏时的视觉效果',
        description: '设置截屏时的视觉效果',
        type: 'async',
        run: (runtime) => new Promise((resolve) => {
          if (typeof runtime.setVisualEffectOnCapture !== 'function') {
            resolve({ _error: 'setVisualEffectOnCapture 不存在' });
            return;
          }
          runtime.setVisualEffectOnCapture({
            visualEffect: 'none',
            success: () => resolve('PASS'),
            fail: () => resolve('FAIL')
          });
        }),
        expect: 'PASS'
      },
      {
        id: 'migo.getScreenRecordingState',
        name: '获取屏幕录制状态',
        description: '获取屏幕录制状态',
        type: 'async',
        run: (runtime) => new Promise((resolve) => {
          if (typeof runtime.getScreenRecordingState !== 'function') {
            resolve({ _error: 'getScreenRecordingState 不存在' });
            return;
          }
          runtime.getScreenRecordingState({
            success: (res) => resolve(typeof res.state === 'string' ? 'PASS' : 'FAIL'),
            fail: () => resolve('FAIL')
          });
        }),
        expect: 'PASS'
      },
      {
        id: 'migo.onScreenRecordingStateChanged',
        name: '监听屏幕录制状态变化',
        description: '验证 onScreenRecordingStateChanged 接口存在性',
        type: 'sync',
        run: (runtime) => {
          if (typeof runtime.onScreenRecordingStateChanged !== 'function') return { exists: false };
          runtime.onScreenRecordingStateChanged(() => {});
          return { exists: true };
        },
        expect: { exists: true }
      },
      {
        id: 'migo.offScreenRecordingStateChanged',
        name: '取消监听屏幕录制状态变化',
        description: '验证 offScreenRecordingStateChanged 接口存在性',
        type: 'sync',
        run: (runtime) => {
          if (typeof runtime.offScreenRecordingStateChanged !== 'function') return { exists: false };
          return { exists: true };
        },
        expect: { exists: true }
      },
      {
        id: 'migo.onUserCaptureScreen',
        name: '监听用户截屏事件',
        description: '验证 onUserCaptureScreen 接口存在性',
        type: 'sync',
        run: (runtime) => {
          if (typeof runtime.onUserCaptureScreen !== 'function') return { exists: false };
          runtime.onUserCaptureScreen(() => {});
          return { exists: true };
        },
        expect: { exists: true }
      },
      {
        id: 'migo.offUserCaptureScreen',
        name: '取消监听用户截屏事件',
        description: '验证 offUserCaptureScreen 接口存在性',
        type: 'sync',
        run: (runtime) => {
          if (typeof runtime.offUserCaptureScreen !== 'function') return { exists: false };
          return { exists: true };
        },
        expect: { exists: true }
      }
    ]
  },
  {
    name: 'migo.screenOrientation',
    category: 'device',
    tests: [
      {
        id: 'migo.setDeviceOrientation',
        name: '设置屏幕方向',
        description: '设置屏幕方向',
        type: 'async',
        run: (runtime) => new Promise((resolve) => {
          if (typeof runtime.setDeviceOrientation !== 'function') {
            resolve({ _error: 'setDeviceOrientation 不存在' });
            return;
          }
          runtime.setDeviceOrientation({
            value: 'portrait',
            success: () => resolve('PASS'),
            fail: () => resolve('FAIL')
          });
        }),
        expect: 'PASS'
      },
      {
        id: 'migo.onDeviceOrientationChange',
        name: '监听屏幕旋转',
        description: '验证 onDeviceOrientationChange 接口存在性',
        type: 'sync',
        run: (runtime) => {
          if (typeof runtime.onDeviceOrientationChange !== 'function') return { exists: false };
          runtime.onDeviceOrientationChange(() => {});
          return { exists: true };
        },
        expect: { exists: true }
      },
      {
        id: 'migo.offDeviceOrientationChange',
        name: '取消监听屏幕旋转',
        description: '验证 offDeviceOrientationChange 接口存在性',
        type: 'sync',
        run: (runtime) => {
          if (typeof runtime.offDeviceOrientationChange !== 'function') return { exists: false };
          runtime.offDeviceOrientationChange(() => {});
          return { exists: true };
        },
        expect: { exists: true }
      }
    ]
  }
];
