
export default [
  {
    name: 'migo.mouse',
    category: 'device',
    tests: [
      {
        id: 'migo.onMouseDown',
        name: '监听鼠标按下',
        description: '验证 onMouseDown 回调结构 (需点击鼠标)',
        type: 'event',
        timeout: 5000,
        run: (runtime, callback) => {
          if (typeof runtime.onMouseDown !== 'function') return callback({ _error: 'API missing' });
          runtime.onMouseDown((res) => callback(res));
        },
        expect: {
          x: '@number',
          y: '@number'
        }
      },
      {
        id: 'migo.offMouseDown',
        name: '取消监听鼠标按下',
        description: '验证 offMouseDown 接口存在性',
        type: 'sync',
        run: (runtime) => {
          if (typeof runtime.offMouseDown !== 'function') return { exists: false };
          return { exists: true };
        },
        expect: { exists: true }
      },
      {
        id: 'migo.onMouseUp',
        name: '监听鼠标抬起',
        description: '验证 onMouseUp 回调结构 (需点击鼠标)',
        type: 'event',
        timeout: 5000,
        run: (runtime, callback) => {
          if (typeof runtime.onMouseUp !== 'function') return callback({ _error: 'API missing' });
          runtime.onMouseUp((res) => callback(res));
        },
        expect: {
          x: '@number',
          y: '@number'
        }
      },
      {
        id: 'migo.offMouseUp',
        name: '取消监听鼠标抬起',
        description: '验证 offMouseUp 接口存在性',
        type: 'sync',
        run: (runtime) => {
          if (typeof runtime.offMouseUp !== 'function') return { exists: false };
          return { exists: true };
        },
        expect: { exists: true }
      },
      {
        id: 'migo.onMouseMove',
        name: '监听鼠标移动',
        description: '验证 onMouseMove 回调结构 (需移动鼠标)',
        type: 'event',
        timeout: 5000,
        run: (runtime, callback) => {
          if (typeof runtime.onMouseMove !== 'function') return callback({ _error: 'API missing' });
          runtime.onMouseMove((res) => callback(res));
        },
        expect: {
          x: '@number',
          y: '@number'
        }
      },
      {
        id: 'migo.offMouseMove',
        name: '取消监听鼠标移动',
        description: '验证 offMouseMove 接口存在性',
        type: 'sync',
        run: (runtime) => {
          if (typeof runtime.offMouseMove !== 'function') return { exists: false };
          return { exists: true };
        },
        expect: { exists: true }
      },
      {
        id: 'migo.onWheel',
        name: '监听滚轮',
        description: '验证 onWheel 回调结构 (需滚动滚轮)',
        type: 'event',
        timeout: 5000,
        run: (runtime, callback) => {
          if (typeof runtime.onWheel !== 'function') return callback({ _error: 'API missing' });
          runtime.onWheel((res) => callback(res));
        },
        expect: {
          deltaX: '@number',
          deltaY: '@number',
          deltaZ: '@number'
        }
      },
      {
        id: 'migo.offWheel',
        name: '取消监听滚轮',
        description: '验证 offWheel 接口存在性',
        type: 'sync',
        run: (runtime) => {
          if (typeof runtime.offWheel !== 'function') return { exists: false };
          return { exists: true };
        },
        expect: { exists: true }
      }
    ]
  }
];
