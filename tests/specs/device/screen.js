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
      }
    ]
  }
];
