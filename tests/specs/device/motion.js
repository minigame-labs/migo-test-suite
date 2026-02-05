
export default [
  {
    name: 'migo.motion',
    category: 'device',
    tests: [
      // 陀螺仪
      {
        id: 'migo.startGyroscope',
        name: '开始监听陀螺仪数据',
        description: '开始监听陀螺仪数据',
        type: 'async',
        run: (runtime) => new Promise((resolve) => {
          if (typeof runtime.startGyroscope !== 'function') {
            resolve({ _error: 'startGyroscope 不存在' });
            return;
          }
          runtime.startGyroscope({
            interval: 'normal',
            success: () => resolve('PASS'),
            fail: () => resolve('FAIL')
          });
        }),
        expect: 'PASS'
      },
      {
        id: 'migo.onGyroscopeChange',
        name: '监听陀螺仪数据',
        description: '监听陀螺仪数据 (需真机或模拟器支持)',
        type: 'event',
        timeout: 5000,
        run: (runtime, callback) => {
          if (typeof runtime.onGyroscopeChange !== 'function') return callback({ _error: 'API missing' });
          runtime.onGyroscopeChange((res) => callback(res));
          if (runtime.startGyroscope) runtime.startGyroscope({ interval: 'ui' });
        },
        expect: {
          x: '@number',
          y: '@number',
          z: '@number'
        }
      },
      {
        id: 'migo.stopGyroscope',
        name: '停止监听陀螺仪数据',
        description: '停止监听陀螺仪数据',
        type: 'async',
        run: (runtime) => new Promise((resolve) => {
          if (typeof runtime.stopGyroscope !== 'function') {
            resolve({ _error: 'stopGyroscope 不存在' });
            return;
          }
          runtime.stopGyroscope({
            success: () => resolve('PASS'),
            fail: () => resolve('FAIL')
          });
        }),
        expect: 'PASS'
      },
      {
        id: 'migo.offGyroscopeChange',
        name: '取消监听陀螺仪数据',
        description: '验证 offGyroscopeChange 接口存在性',
        type: 'sync',
        run: (runtime) => {
          if (typeof runtime.offGyroscopeChange !== 'function') return { exists: false };
          return { exists: true };
        },
        expect: { exists: true }
      },
      // 设备方向
      {
        id: 'migo.startDeviceMotionListening',
        name: '开始监听设备方向的变化',
        description: '开始监听设备方向的变化',
        type: 'async',
        run: (runtime) => new Promise((resolve) => {
          if (typeof runtime.startDeviceMotionListening !== 'function') {
            resolve({ _error: 'startDeviceMotionListening 不存在' });
            return;
          }
          runtime.startDeviceMotionListening({
            interval: 'normal',
            success: () => resolve('PASS'),
            fail: () => resolve('FAIL')
          });
        }),
        expect: 'PASS'
      },
      {
        id: 'migo.onDeviceMotionChange',
        name: '监听设备方向变化',
        description: '监听设备方向变化 (需真机或模拟器支持)',
        type: 'event',
        timeout: 5000,
        run: (runtime, callback) => {
          if (typeof runtime.onDeviceMotionChange !== 'function') return callback({ _error: 'API missing' });
          runtime.onDeviceMotionChange((res) => callback(res));
          if (runtime.startDeviceMotionListening) runtime.startDeviceMotionListening({ interval: 'ui' });
        },
        expect: {
          alpha: '@number',
          beta: '@number',
          gamma: '@number'
        }
      },
      {
        id: 'migo.stopDeviceMotionListening',
        name: '停止监听设备方向的变化',
        description: '停止监听设备方向的变化',
        type: 'async',
        run: (runtime) => new Promise((resolve) => {
          if (typeof runtime.stopDeviceMotionListening !== 'function') {
            resolve({ _error: 'stopDeviceMotionListening 不存在' });
            return;
          }
          runtime.stopDeviceMotionListening({
            success: () => resolve('PASS'),
            fail: () => resolve('FAIL')
          });
        }),
        expect: 'PASS'
      },
      {
        id: 'migo.offDeviceMotionChange',
        name: '取消监听设备方向变化',
        description: '验证 offDeviceMotionChange 接口存在性',
        type: 'sync',
        run: (runtime) => {
          if (typeof runtime.offDeviceMotionChange !== 'function') return { exists: false };
          return { exists: true };
        },
        expect: { exists: true }
      }
    ]
  }
];
