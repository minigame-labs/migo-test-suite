
export default [
  // 加速计
  {
    name: 'migo.accelerometer',
    category: 'device',
    tests: [
      {
        id: 'migo.startAccelerometer',
        name: '启动加速计',
        description: '启动加速计监听',
        type: 'async',
        run: (runtime) => new Promise((resolve) => {
          if (typeof runtime.startAccelerometer !== 'function') {
            resolve({ _error: 'startAccelerometer 不存在' });
            return;
          }
          runtime.startAccelerometer({
            interval: 'normal',
            success: () => resolve('PASS'),
            fail: () => resolve('FAIL')
          });
        }),
        expect: 'PASS'
      },
      {
        id: 'migo.onAccelerometerChange',
        name: '监听加速计数据',
        description: '监听加速计数据变化 (需真机晃动或模拟器支持)',
        type: 'event',
        timeout: 5000,
        run: (runtime, callback) => {
          if (typeof runtime.onAccelerometerChange !== 'function') return callback({ _error: 'API missing' });
          runtime.onAccelerometerChange((res) => callback(res));
          // 确保已启动
          if (runtime.startAccelerometer) runtime.startAccelerometer({ interval: 'ui' });
        },
        expect: {
          x: '@number',
          y: '@number',
          z: '@number'
        }
      },
      {
        id: 'migo.stopAccelerometer',
        name: '停止加速计',
        description: '停止加速计监听',
        type: 'async',
        run: (runtime) => new Promise((resolve) => {
          if (typeof runtime.stopAccelerometer !== 'function') {
            resolve({ _error: 'stopAccelerometer 不存在' });
            return;
          }
          runtime.stopAccelerometer({
            success: () => resolve('PASS'),
            fail: () => resolve('FAIL')
          });
        }),
        expect: 'PASS'
      },
      {
        id: 'migo.offAccelerometerChange',
        name: '取消监听加速计数据',
        description: '验证接口存在性',
        type: 'sync',
        run: (runtime) => {
          if (typeof runtime.offAccelerometerChange !== 'function') return { exists: false };
          return { exists: true };
        },
        expect: { exists: true }
      }
    ]
  },
  // 罗盘
  {
    name: 'migo.compass',
    category: 'device',
    tests: [
      {
        id: 'migo.startCompass',
        name: '启动罗盘',
        description: '启动罗盘监听',
        type: 'async',
        run: (runtime) => new Promise((resolve) => {
          if (typeof runtime.startCompass !== 'function') {
            resolve({ _error: 'startCompass 不存在' });
            return;
          }
          runtime.startCompass({
            success: () => resolve('PASS'),
            fail: () => resolve('FAIL')
          });
        }),
        expect: 'PASS'
      },
      {
        id: 'migo.onCompassChange',
        name: '监听罗盘数据',
        description: '监听罗盘方向变化',
        type: 'event',
        timeout: 5000,
        run: (runtime, callback) => {
          if (typeof runtime.onCompassChange !== 'function') return callback({ _error: 'API missing' });
          runtime.onCompassChange((res) => callback(res));
          if (runtime.startCompass) runtime.startCompass({});
        },
        expect: {
          direction: '@number'
        }
      },
      {
        id: 'migo.stopCompass',
        name: '停止罗盘',
        description: '停止罗盘监听',
        type: 'async',
        run: (runtime) => new Promise((resolve) => {
          if (typeof runtime.stopCompass !== 'function') {
            resolve({ _error: 'stopCompass 不存在' });
            return;
          }
          runtime.stopCompass({
            success: () => resolve('PASS'),
            fail: () => resolve('FAIL')
          });
        }),
        expect: 'PASS'
      },
      {
        id: 'migo.offCompassChange',
        name: '取消监听罗盘数据',
        description: '验证接口存在性',
        type: 'sync',
        run: (runtime) => {
          if (typeof runtime.offCompassChange !== 'function') return { exists: false };
          return { exists: true };
        },
        expect: { exists: true }
      }
    ]
  }
];
