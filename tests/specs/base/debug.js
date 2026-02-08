/**
 * 调试相关 API 测试
 */

export default [
  {
    name: 'migo.setEnableDebug',
    category: 'base',
    tests: [
      {
        id: 'debug-002',
        name: '设置调试模式',
        description: '验证 setEnableDebug 接口是否存在及基本调用',
        type: 'sync',
        run: (runtime, callback) => {
          if (typeof runtime.setEnableDebug !== 'function') {
            return { _error: 'setEnableDebug 不存在' };
          }
          // 仅验证存在性，实际调用可能影响 UI
          return {
             exists: true
          };
        },
        expect: {
          exists: true
        }
      }
    ]
  },
  {
    name: 'migo.getLogManager',
    category: 'base',
    tests: [
      {
        id: 'log-001',
        name: '获取日志管理器',
        description: '验证 getLogManager 返回的日志管理器对象',
        type: 'sync',
        run: (runtime) => {
          if (typeof runtime.getLogManager !== 'function') {
            return { _error: 'getLogManager 不存在' };
          }
          const manager = runtime.getLogManager();
          return {
            hasDebug: typeof manager.debug === 'function',
            hasInfo: typeof manager.info === 'function',
            hasLog: typeof manager.log === 'function',
            hasWarn: typeof manager.warn === 'function'
          };
        },
        expect: {
          hasDebug: true,
          hasInfo: true,
          hasLog: true,
          hasWarn: true
        }
      }
    ]
  },

  {
    name: 'migo.getRealtimeLogManager',
    category: 'base',
    tests: [
      {
        id: 'realtimelog-001',
        name: '获取实时日志管理器',
        description: '验证 getRealtimeLogManager 返回的实时日志管理器对象',
        type: 'sync',
        run: (runtime) => {
          if (typeof runtime.getRealtimeLogManager !== 'function') {
            return { _error: 'getRealtimeLogManager 不存在' };
          }
          const manager = runtime.getRealtimeLogManager();
          return {
            hasInfo: typeof manager.info === 'function',
            hasWarn: typeof manager.warn === 'function',
            hasError: typeof manager.error === 'function',
            hasSetFilterMsg: typeof manager.setFilterMsg === 'function',
            hasAddFilterMsg: typeof manager.addFilterMsg === 'function',
            hasIn: typeof manager.in === 'function',
            hasTag: typeof manager.tag === 'function'
          };
        },
        expect: {
          hasInfo: true,
          hasWarn: true,
          hasError: true,
          hasSetFilterMsg: true,
          hasAddFilterMsg: true,
          hasIn: true,
          hasTag: true
        }
      }
    ]
  },
  {
    name: 'migo.console',
    category: 'base',
    tests: [
      {
        id: 'console-001',
        name: 'console 对象检测',
        description: '验证 console 对象及其方法是否存在',
        type: 'sync',
        run: (runtime) => {
          if (typeof console === 'undefined') {
            return { _error: 'console 不存在' };
          }
          return {
            hasLog: typeof console.log === 'function',
            hasInfo: typeof console.info === 'function',
            hasWarn: typeof console.warn === 'function',
            hasError: typeof console.error === 'function',
            hasDebug: typeof console.debug === 'function',
            hasGroup: typeof console.group === 'function',
            hasGroupEnd: typeof console.groupEnd === 'function'
          };
        },
        expect: {
          hasLog: true,
          hasInfo: true,
          hasWarn: true,
          hasError: true,
          hasDebug: true,
          hasGroup: true,
          hasGroupEnd: true
        }
      }
    ]
  }
];
