export default [
  {
    name: 'Screen Brightness',
    category: 'device',
    tests: [
      {
        id: 'migo.setScreenBrightness',
        name: 'Set brightness to 0.5',
        description: 'Set screen brightness to 0.5',
        type: 'async',
        run: (runtime) => new Promise((resolve) => {
          if (typeof runtime.setScreenBrightness !== 'function') {
            resolve({ _error: 'setScreenBrightness not found' });
            return;
          }
          runtime.setScreenBrightness({
            value: 0.5,
            success: (res) => resolve('PASS'),
            fail: (err) => resolve(`FAIL: ${JSON.stringify(err)}`)
          });
        }),
        expect: 'PASS'
      },
      {
        id: 'migo.setScreenBrightness_min',
        name: 'Set brightness to 0',
        description: 'Set screen brightness to 0',
        type: 'async',
        run: (runtime) => new Promise((resolve) => {
          runtime.setScreenBrightness({
            value: 0,
            success: (res) => resolve('PASS'),
            fail: (err) => resolve(`FAIL: ${JSON.stringify(err)}`)
          });
        }),
        expect: 'PASS'
      },
      {
        id: 'migo.setScreenBrightness_max',
        name: 'Set brightness to 1',
        description: 'Set screen brightness to 1',
        type: 'async',
        run: (runtime) => new Promise((resolve) => {
          runtime.setScreenBrightness({
            value: 1,
            success: (res) => resolve('PASS'),
            fail: (err) => resolve(`FAIL: ${JSON.stringify(err)}`)
          });
        }),
        expect: 'PASS'
      },
      {
        id: 'migo.getScreenBrightness',
        name: 'Get brightness',
        description: 'Get current screen brightness, should be 0-1',
        type: 'async',
        run: (runtime) => new Promise((resolve) => {
          if (typeof runtime.getScreenBrightness !== 'function') {
            resolve({ _error: 'getScreenBrightness not found' });
            return;
          }
          runtime.getScreenBrightness({
            success: (res) => {
              // Ensure value is number 0-1
              if (typeof res.value === 'number' && res.value >= 0 && res.value <= 1) {
                resolve('PASS');
              } else {
                resolve(`FAIL: value is ${res.value}`);
              }
            },
            fail: (err) => resolve(`FAIL: ${JSON.stringify(err)}`)
          });
        }),
        expect: 'PASS'
      }
    ]
  },
  {
    name: 'Keep Screen On',
    category: 'device',
    tests: [
      {
        id: 'migo.setKeepScreenOn',
        name: 'Enable keep screen on',
        description: 'Set keepScreenOn to true',
        type: 'async',
        run: (runtime) => new Promise((resolve) => {
          if (typeof runtime.setKeepScreenOn !== 'function') {
            resolve({ _error: 'setKeepScreenOn not found' });
            return;
          }
          runtime.setKeepScreenOn({
            keepScreenOn: true,
            success: (res) => resolve('PASS'),
            fail: (err) => resolve(`FAIL: ${JSON.stringify(err)}`)
          });
        }),
        expect: 'PASS'
      },
      {
        id: 'migo.setKeepScreenOn_false',
        name: 'Disable keep screen on',
        description: 'Set keepScreenOn to false',
        type: 'async',
        run: (runtime) => new Promise((resolve) => {
          runtime.setKeepScreenOn({
            keepScreenOn: false,
            success: (res) => resolve('PASS'),
            fail: (err) => resolve(`FAIL: ${JSON.stringify(err)}`)
          });
        }),
        expect: 'PASS'
      }
    ]
  },
  {
    name: 'Screen Recording & Capture',
    category: 'device',
    tests: [
      {
        id: 'migo.getScreenRecordingState',
        name: 'Get recording state',
        description: 'Get screen recording state, should be "on" or "off"',
        type: 'async',
        run: (runtime) => new Promise((resolve) => {
          if (typeof runtime.getScreenRecordingState !== 'function') {
            resolve({ _error: 'getScreenRecordingState not found' });
            return;
          }
          runtime.getScreenRecordingState({
            success: (res) => {
              if (res.state === 'on' || res.state === 'off') {
                resolve('PASS');
              } else {
                resolve(`FAIL: state is ${res.state}`);
              }
            },
            fail: (err) => resolve(`FAIL: ${JSON.stringify(err)}`)
          });
        }),
        expect: 'PASS'
      },
      {
        id: 'migo.onScreenRecordingStateChanged',
        name: 'Listen to recording state change',
        description: 'Register a listener for recording state changes',
        type: 'sync',
        run: (runtime) => {
          if (typeof runtime.onScreenRecordingStateChanged !== 'function') return 'FAIL: not found';
          const handler = (res) => { console.log('Recording state:', res.state); };
          try {
            runtime.onScreenRecordingStateChanged(handler);
            // Clean up
            if (typeof runtime.offScreenRecordingStateChanged === 'function') {
              runtime.offScreenRecordingStateChanged(handler);
            }
            return 'PASS';
          } catch (e) {
            return `FAIL: ${e.message}`;
          }
        },
        expect: 'PASS'
      },
      {
        id: 'migo.offScreenRecordingStateChanged',
        name: 'Unregister recording state listener',
        description: 'Unregister a listener',
        type: 'sync',
        run: (runtime) => {
          if (typeof runtime.offScreenRecordingStateChanged !== 'function') return 'FAIL: not found';
          const handler = (res) => {};
          try {
            runtime.onScreenRecordingStateChanged(handler);
            runtime.offScreenRecordingStateChanged(handler);
            return 'PASS';
          } catch (e) {
            return `FAIL: ${e.message}`;
          }
        },
        expect: 'PASS'
      },
      {
        id: 'migo.onUserCaptureScreen',
        name: 'Listen to user capture screen',
        description: '请手动触发截屏，验证监听回调',
        type: 'async',
        run: (runtime) => new Promise((resolve) => {
          if (typeof runtime.onUserCaptureScreen !== 'function') {
            resolve({ _error: 'onUserCaptureScreen not found' });
            return;
          }
          const handler = (res) => {
            console.log('User captured screen', res);
            if (typeof runtime.offUserCaptureScreen === 'function') {
              runtime.offUserCaptureScreen(handler);
            }
            resolve('PASS');
          };
          try {
            runtime.onUserCaptureScreen(handler);
            console.log('Waiting for user to capture screen...');
          } catch (e) {
            resolve(`FAIL: ${e.message}`);
          }
        }),
        expect: 'PASS'
      },
      {
        id: 'migo.offUserCaptureScreen',
        name: 'Unregister capture screen listener',
        description: 'Unregister a listener',
        type: 'sync',
        run: (runtime) => {
          if (typeof runtime.offUserCaptureScreen !== 'function') return 'FAIL: not found';
          const handler = (res) => {};
          try {
            runtime.onUserCaptureScreen(handler);
            runtime.offUserCaptureScreen(handler);
            return 'PASS';
          } catch (e) {
            return `FAIL: ${e.message}`;
          }
        },
        expect: 'PASS'
      },
      {
        id: 'migo.setVisualEffectOnCapture',
        name: 'Set visual effect to none',
        description: 'Set visualEffectOnCapture to none',
        type: 'async',
        run: (runtime) => new Promise((resolve) => {
          if (typeof runtime.setVisualEffectOnCapture !== 'function') {
            resolve({ _error: 'setVisualEffectOnCapture not found' });
            return;
          }
          runtime.setVisualEffectOnCapture({
            visualEffect: 'none',
            success: (res) => resolve('PASS'),
            fail: (err) => resolve(`FAIL: ${JSON.stringify(err)}`)
          });
        }),
        expect: 'PASS'
      },
      {
        id: 'migo.setVisualEffectOnCapture_hidden',
        name: 'Set visual effect to hidden',
        description: 'Set visualEffectOnCapture to hidden',
        type: 'async',
        run: (runtime) => new Promise((resolve) => {
          if (typeof runtime.setVisualEffectOnCapture !== 'function') {
            resolve({ _error: 'setVisualEffectOnCapture not found' });
            return;
          }
          runtime.setVisualEffectOnCapture({
            visualEffect: 'hidden',
            success: (res) => resolve('PASS'),
            fail: (err) => resolve(`FAIL: ${JSON.stringify(err)}`)
          });
        }),
        expect: 'PASS'
      }
    ]
  },
];
