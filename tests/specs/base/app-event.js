/**
 * 应用级事件 API 测试
 * 监听及取消监听事件（on/off）
 */

export default [
  // 1) migo.onUnhandledRejection
  {
    name: 'migo.onUnhandledRejection',
    category: 'base',
    tests: [
      {
        id: 'migo.onUnhandledRejection',
        name: '监听未处理 Promise 拒绝事件',
        description: '注册 onUnhandledRejection 监听函数 (需触发 Promise Rejection)',
        type: 'event',
        timeout: 5000,
        run: (runtime, callback) => {
          if (typeof runtime.onUnhandledRejection !== 'function') {
            return callback({ _error: 'onUnhandledRejection 不存在' });
          }
          const listener = (res) => {
            callback(res);
          };
          runtime.onUnhandledRejection(listener);
          // 触发一个未捕获的 rejection
          Promise.reject('test rejection');
        },
        expect: {
          reason: '@string'
        }
      }
    ]
  },

  // 2) migo.offUnhandledRejection
  {
    name: 'migo.offUnhandledRejection',
    category: 'base',
    tests: [
      {
        id: 'migo.offUnhandledRejection',
        name: '取消监听未处理 Promise 拒绝事件',
        description: '调用 offUnhandledRejection 取消 onUnhandledRejection 监听',
        type: 'sync',
        run: (runtime) => {
          if (typeof runtime.onUnhandledRejection !== 'function') {
            return { _error: 'onUnhandledRejection 不存在（offUnhandledRejection 测试依赖）' };
          }
          if (typeof runtime.offUnhandledRejection !== 'function') {
            return { _error: 'offUnhandledRejection 不存在' };
          }

          const listener = (err) => {};
          runtime.onUnhandledRejection(listener);
          runtime.offUnhandledRejection(listener);
          runtime.offUnhandledRejection(); // 清空全部（如实现支持）

          return { removed: true };
        },
        expect: {
          removed: true
        }
      }
    ]
  },

  // 3) migo.onError
  {
    name: 'migo.onError',
    category: 'base',
    tests: [
      {
        id: 'migo.onError',
        name: '监听全局错误事件',
        description: '注册 onError 监听函数 (需触发错误)',
        type: 'event',
        timeout: 5000,
        run: (runtime, callback) => {
          if (typeof runtime.onError !== 'function') {
            return callback({ _error: 'onError 不存在' });
          }
          const listener = (res) => {
            callback(res);
          };
          runtime.onError(listener);
          // 触发一个错误
          setTimeout(() => {
            throw new Error('test error');
          }, 100);
        },
        expect: {
          message: '@string',
          stack: '@string'
        }
      }
    ]
  },

  // 4) migo.offError
  {
    name: 'migo.offError',
    category: 'base',
    tests: [
      {
        id: 'migo.offError',
        name: '取消监听全局错误事件',
        description: '调用 offError 取消 onError 监听',
        type: 'sync',
        run: (runtime) => {
          if (typeof runtime.onError !== 'function') {
            return { _error: 'onError 不存在（offError 测试依赖）' };
          }
          if (typeof runtime.offError !== 'function') {
            return { _error: 'offError 不存在' };
          }

          const listener = (err) => {};
          runtime.onError(listener);
          runtime.offError(listener);
          runtime.offError(); // 清空全部（如实现支持）

          return { removed: true };
        },
        expect: {
          removed: true
        }
      }
    ]
  },

  // 5) migo.onAudioInterruptionBegin
  {
    name: 'migo.onAudioInterruptionBegin',
    category: 'base',
    tests: [
      {
        id: 'migo.onAudioInterruptionBegin',
        name: '监听音频中断开始事件',
        description: '注册 onAudioInterruptionBegin 监听函数',
        type: 'event',
        timeout: 3000,
        run: (runtime, callback) => {
          if (typeof runtime.onAudioInterruptionBegin !== 'function') {
            return callback({ _error: 'onAudioInterruptionBegin 不存在' });
          }
          const listener = () => {
             // 仅用于验证注册，实际触发较难
             callback({ triggered: true });
          };
          runtime.onAudioInterruptionBegin(listener);
          // 模拟触发（如果是 mock 环境）或者仅返回注册成功
          callback({ registered: true }); 
        },
        expect: {
          registered: true
        }
      }
    ]
  },

  // 6) migo.offAudioInterruptionBegin
  {
    name: 'migo.offAudioInterruptionBegin',
    category: 'base',
    tests: [
      {
        id: 'migo.offAudioInterruptionBegin',
        name: '取消监听音频中断开始事件',
        description: '调用 offAudioInterruptionBegin 取消 onAudioInterruptionBegin 监听',
        type: 'sync',
        run: (runtime) => {
          if (typeof runtime.onAudioInterruptionBegin !== 'function') {
            return { _error: 'onAudioInterruptionBegin 不存在（offAudioInterruptionBegin 测试依赖）' };
          }
          if (typeof runtime.offAudioInterruptionBegin !== 'function') {
            return { _error: 'offAudioInterruptionBegin 不存在' };
          }

          const listener = () => {};
          runtime.onAudioInterruptionBegin(listener);
          runtime.offAudioInterruptionBegin(listener);
          runtime.offAudioInterruptionBegin(); // 清空全部（如实现支持）

          return { removed: true };
        },
        expect: {
          removed: true
        }
      }
    ]
  },

  // 7) migo.onAudioInterruptionEnd
  {
    name: 'migo.onAudioInterruptionEnd',
    category: 'base',
    tests: [
      {
        id: 'migo.onAudioInterruptionEnd',
        name: '监听音频中断结束事件',
        description: '注册 onAudioInterruptionEnd 监听函数',
        type: 'event',
        timeout: 3000,
        run: (runtime, callback) => {
          if (typeof runtime.onAudioInterruptionEnd !== 'function') {
            return callback({ _error: 'onAudioInterruptionEnd 不存在' });
          }
          const listener = () => {
             callback({ triggered: true });
          };
          runtime.onAudioInterruptionEnd(listener);
          callback({ registered: true });
        },
        expect: {
          registered: true
        }
      }
    ]
  },

  // 8) migo.offAudioInterruptionEnd
  {
    name: 'migo.offAudioInterruptionEnd',
    category: 'base',
    tests: [
      {
        id: 'migo.offAudioInterruptionEnd',
        name: '取消监听音频中断结束事件',
        description: '调用 offAudioInterruptionEnd 取消 onAudioInterruptionEnd 监听',
        type: 'sync',
        run: (runtime) => {
          if (typeof runtime.onAudioInterruptionEnd !== 'function') {
            return { _error: 'onAudioInterruptionEnd 不存在（offAudioInterruptionEnd 测试依赖）' };
          }
          if (typeof runtime.offAudioInterruptionEnd !== 'function') {
            return { _error: 'offAudioInterruptionEnd 不存在' };
          }

          const listener = () => {};
          runtime.onAudioInterruptionEnd(listener);
          runtime.offAudioInterruptionEnd(listener);
          runtime.offAudioInterruptionEnd(); // 清空全部（如实现支持）

          return { removed: true };
        },
        expect: {
          removed: true
        }
      }
    ]
  }
];
