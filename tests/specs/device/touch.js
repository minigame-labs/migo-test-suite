
export default [
  {
    name: 'migo.onTouchStart',
    category: 'device',
    tests: [
      {
        id: 'migo.onTouchStart',
        name: '监听触摸开始',
        description: '验证 onTouchStart 回调数据结构 (需人工触摸)',
        type: 'event',
        timeout: 5000,
        run: (runtime, callback) => {
          if (typeof runtime.onTouchStart !== 'function') return callback({ _error: 'API missing' });
          runtime.onTouchStart((res) => {
            callback(res);
          });
        },
        expect: {
          touches: '@array',
          changedTouches: '@array',
          timeStamp: '@number'
        }
      }
    ]
  },
  {
    name: 'migo.offTouchStart',
    category: 'device',
    tests: [
      {
        id: 'migo.offTouchStart',
        name: '取消监听触摸开始',
        description: '验证 offTouchStart 接口存在性',
        type: 'sync',
        run: (runtime) => {
          if (typeof runtime.offTouchStart !== 'function') return { exists: false };
          return { exists: true };
        },
        expect: { exists: true }
      }
    ]
  },
  {
    name: 'migo.onTouchMove',
    category: 'device',
    tests: [
      {
        id: 'migo.onTouchMove',
        name: '监听触摸移动',
        description: '验证 onTouchMove 回调数据结构 (需人工触摸移动)',
        type: 'event',
        timeout: 5000,
        run: (runtime, callback) => {
          if (typeof runtime.onTouchMove !== 'function') return callback({ _error: 'API missing' });
          runtime.onTouchMove((res) => {
            callback(res);
          });
        },
        expect: {
          touches: '@array',
          changedTouches: '@array',
          timeStamp: '@number'
        }
      }
    ]
  },
  {
    name: 'migo.offTouchMove',
    category: 'device',
    tests: [
      {
        id: 'migo.offTouchMove',
        name: '取消监听触摸移动',
        description: '验证 offTouchMove 接口存在性',
        type: 'sync',
        run: (runtime) => {
          if (typeof runtime.offTouchMove !== 'function') return { exists: false };
          return { exists: true };
        },
        expect: { exists: true }
      }
    ]
  },
  {
    name: 'migo.onTouchEnd',
    category: 'device',
    tests: [
      {
        id: 'migo.onTouchEnd',
        name: '监听触摸结束',
        description: '验证 onTouchEnd 回调数据结构 (需人工触摸结束)',
        type: 'event',
        timeout: 5000,
        run: (runtime, callback) => {
          if (typeof runtime.onTouchEnd !== 'function') return callback({ _error: 'API missing' });
          runtime.onTouchEnd((res) => {
            callback(res);
          });
        },
        expect: {
          touches: '@array',
          changedTouches: '@array',
          timeStamp: '@number'
        }
      }
    ]
  },
  {
    name: 'migo.offTouchEnd',
    category: 'device',
    tests: [
      {
        id: 'migo.offTouchEnd',
        name: '取消监听触摸结束',
        description: '验证 offTouchEnd 接口存在性',
        type: 'sync',
        run: (runtime) => {
          if (typeof runtime.offTouchEnd !== 'function') return { exists: false };
          return { exists: true };
        },
        expect: { exists: true }
      }
    ]
  },
  {
    name: 'migo.onTouchCancel',
    category: 'device',
    tests: [
      {
        id: 'migo.onTouchCancel',
        name: '监听触摸取消',
        description: '验证 onTouchCancel 回调数据结构 (需触发系统级取消，如来电)',
        type: 'event',
        timeout: 5000,
        run: (runtime, callback) => {
          if (typeof runtime.onTouchCancel !== 'function') return callback({ _error: 'API missing' });
          runtime.onTouchCancel((res) => {
            callback(res);
          });
        },
        expect: {
          touches: '@array',
          changedTouches: '@array',
          timeStamp: '@number'
        }
      }
    ]
  },
  {
    name: 'migo.offTouchCancel',
    category: 'device',
    tests: [
      {
        id: 'migo.offTouchCancel',
        name: '取消监听触摸取消',
        description: '验证 offTouchCancel 接口存在性',
        type: 'sync',
        run: (runtime) => {
          if (typeof runtime.offTouchCancel !== 'function') return { exists: false };
          return { exists: true };
        },
        expect: { exists: true }
      }
    ]
  }
];
