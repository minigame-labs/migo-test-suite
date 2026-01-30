/**
 * 调试相关 API 测试
 */

export default [
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
        expect: {}
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
            hasAddFilterMsg: typeof manager.addFilterMsg === 'function'
          };
        },
        expect: {}
      }
    ]
  }
];
