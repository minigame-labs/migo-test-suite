/**
 * 性能 API 测试用例
 */

export default [
  {
    name: 'Performance',
    category: 'performance',
    tests: [
      {
        id: 'perf-001',
        name: 'Date.now 存在',
        description: '验证高精度时间 API',
        type: 'sync',
        run: (runtime) => ({
          exists: typeof performance !== 'undefined' && typeof Date.now === 'function'
        }),
        expect: {
          exists: true
        }
      },
      {
        id: 'perf-002',
        name: 'Date.now 返回数字',
        description: '验证返回值类型',
        type: 'sync',
        run: (runtime) => {
          if (typeof performance === 'undefined' || typeof Date.now !== 'function') {
            return { apiNotFound: true };
          }
          const now = Date.now();
          return {
            isNumber: typeof now === 'number',
            isPositive: now > 0
          };
        },
        expect: {
          isNumber: true,
          isPositive: true
        }
      },
      {
        id: 'perf-003',
        name: 'Date.now 精度',
        description: '验证时间精度（应小于 1ms）',
        type: 'sync',
        run: (runtime) => {
          if (typeof performance === 'undefined' || typeof Date.now !== 'function') {
            return { apiNotFound: true };
          }
          const t1 = Date.now();
          const t2 = Date.now();
          const diff = t2 - t1;
          return {
            t1: t1,
            t2: t2,
            diff: diff,
            increasing: t2 >= t1,
            highPrecision: diff < 1 // 通常差异应该很小
          };
        },
        expect: {
          increasing: true,
          highPrecision: true
        },
        allowVariance: ['t1', 't2', 'diff']
      },
      {
        id: 'perf-004',
        name: 'getPerformance 存在',
        description: '验证获取性能管理器 API',
        type: 'sync',
        run: (runtime) => ({
          exists: typeof runtime.getPerformance === 'function'
        }),
        expect: {
          exists: true
        }
      },
      {
        id: 'perf-005',
        name: 'triggerGC 存在',
        description: '验证手动触发 GC API',
        type: 'sync',
        run: (runtime) => ({
          exists: typeof runtime.triggerGC === 'function'
        }),
        expect: {
          exists: true
        }
      }
    ]
  }
];
