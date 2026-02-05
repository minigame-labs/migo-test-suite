export default [
  {
    name: 'migo.vibrateShort',
    category: 'device',
    tests: [
      {
        id: 'migo.vibrateShort',
        name: '短振动',
        description: '触发短振动',
        type: 'async',
        run: (runtime) => new Promise((resolve) => {
          if (typeof runtime.vibrateShort !== 'function') {
            resolve({ _error: 'vibrateShort 不存在' });
            return;
          }
          runtime.vibrateShort({
            type: 'medium', // 尝试传入 type，虽然基础版本可能忽略
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
        description: '触发长振动',
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
