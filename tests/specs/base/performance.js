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
          };
        },
        expect: {
          hasNow: true,
        }
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
        run: (runtime) => {
          const hasTriggerGC = typeof runtime.triggerGC === 'function';
          let before = null;
          let after = null;

          if (typeof runtime.getHeapStatistics === 'function') {
            before = runtime.getHeapStatistics();
          }

          if (hasTriggerGC) {
            runtime.triggerGC();
          }

          if (typeof runtime.getHeapStatistics === 'function') {
            after = runtime.getHeapStatistics();
          }

          return {
            triggerGC: hasTriggerGC,
            before,
            after
          };
        },
        expect: {
          triggerGC: true,
          before: {
            totalHeapSize: '@number',
            usedHeapSize: '@number',
            heapSizeLimit: '@number',
            totalPhysicalSize: '@number',
            mallocedMemory: '@number',
            externalMemory: '@number'
          },
          after: {
            totalHeapSize: '@number',
            usedHeapSize: '@number',
            heapSizeLimit: '@number',
            totalPhysicalSize: '@number',
            mallocedMemory: '@number',
            externalMemory: '@number'
          }
        }
      }
    ]
  },
];
