export default [
  {
    name: 'migo.vibrateShort',
    category: 'device',
    tests: [
      {
        id: 'migo.vibrateShort-medium',
        name: '短振动 type=medium',
        description: '触发中等强度短振动',
        type: 'async',
        run: (runtime) => new Promise((resolve) => {
          if (typeof runtime.vibrateShort !== 'function') {
            resolve({ _error: 'vibrateShort 不存在' });
            return;
          }
          runtime.vibrateShort({
            type: 'medium',
            success: () => resolve('PASS'),
            fail: () => resolve('FAIL')
          });
        }),
        expect: 'PASS'
      },
      {
        id: 'migo.vibrateShort-heavy',
        name: '短振动 type=heavy',
        description: '触发重度短振动',
        type: 'async',
        run: (runtime) => new Promise((resolve) => {
          if (typeof runtime.vibrateShort !== 'function') {
            resolve({ _error: 'vibrateShort 不存在' });
            return;
          }
          runtime.vibrateShort({
            type: 'heavy',
            success: () => resolve('PASS'),
            fail: () => resolve('FAIL')
          });
        }),
        expect: 'PASS'
      },
      {
        id: 'migo.vibrateShort-light',
        name: '短振动 type=light',
        description: '触发轻度短振动',
        type: 'async',
        run: (runtime) => new Promise((resolve) => {
          if (typeof runtime.vibrateShort !== 'function') {
            resolve({ _error: 'vibrateShort 不存在' });
            return;
          }
          runtime.vibrateShort({
            type: 'light',
            success: () => resolve('PASS'),
            fail: () => resolve('FAIL')
          });
        }),
        expect: 'PASS'
      }
    ]
  },
  {
    name: 'migo.vibrateLong',
    category: 'device',
    tests: [
      {
        id: 'migo.vibrateLong',
        name: '长振动',
        description: '触发长振动（约 400ms）',
        type: 'async',
        run: (runtime) => new Promise((resolve) => {
          if (typeof runtime.vibrateLong !== 'function') {
            resolve({ _error: 'vibrateLong 不存在' });
            return;
          }
          runtime.vibrateLong({
            success: () => resolve('PASS'),
            fail: () => resolve('FAIL')
          });
        }),
        expect: 'PASS'
      }
    ]
  }
];
