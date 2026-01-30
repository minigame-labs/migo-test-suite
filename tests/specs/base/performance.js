/**
 * 性能相关 API 测试
 */

export default [
  {
    name: 'migo.getPerformance',
    category: 'base',
    tests: [
      {
        id: 'perf-001',
        name: '获取性能对象',
        description: '验证 getPerformance 返回的性能对象',
        type: 'sync',
        run: (runtime) => {
          if (typeof runtime.getPerformance !== 'function') {
            return { _error: 'getPerformance 不存在' };
          }
          const perf = runtime.getPerformance();
          return {
            hasNow: typeof perf.now === 'function',
            hasGetEntries: typeof perf.getEntries === 'function',
            hasGetEntriesByName: typeof perf.getEntriesByName === 'function',
            hasGetEntriesByType: typeof perf.getEntriesByType === 'function',
            hasMark: typeof perf.mark === 'function',
            hasClearMarks: typeof perf.clearMarks === 'function'
          };
        },
        expect: {}
      }
    ]
  },

  {
    name: 'migo.triggerGC',
    category: 'base',
    tests: [
      {
        id: 'gc-001',
        name: 'triggerGC 检测',
        description: '检测 triggerGC 垃圾回收 API 是否存在',
        type: 'sync',
        run: (runtime) => ({
          triggerGC: typeof runtime.triggerGC === 'function'
        }),
        expect: {}
      }
    ]
  }
];
