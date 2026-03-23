/**
 * 基础 - 性能上报 & 更新微信 API 测试
 * 覆盖: reportPerformance, updateWeChatApp
 */

import {
  runOptionApiContract
} from '../_shared/runtime-helpers.js';

export default [
  {
    name: 'migo.reportPerformance',
    category: 'base/performance',
    tests: [
      {
        id: 'base-reportPerformance-exists',
        name: 'reportPerformance API 存在',
        description: '验证 reportPerformance 函数存在',
        type: 'sync',
        run: (runtime) => ({ exists: typeof runtime.reportPerformance === 'function' }),
        expect: { exists: true }
      },
      {
        id: 'base-reportPerformance-basic',
        name: 'reportPerformance 基本调用',
        description: '传入 id 和 value 参数调用不抛错',
        type: 'sync',
        run: (runtime) => {
          if (typeof runtime.reportPerformance !== 'function') {
            return { _error: 'reportPerformance 不存在' };
          }
          let threw = false;
          try {
            runtime.reportPerformance(1001, 123);
          } catch (e) {
            threw = true;
          }
          return { threw };
        },
        expect: { threw: false }
      },
      {
        id: 'base-reportPerformance-dimensions-string',
        name: 'reportPerformance 带 string dimensions',
        description: '传入 dimensions 为字符串',
        type: 'sync',
        run: (runtime) => {
          if (typeof runtime.reportPerformance !== 'function') {
            return { _error: 'reportPerformance 不存在' };
          }
          let threw = false;
          try {
            runtime.reportPerformance(1001, 200, 'page-load');
          } catch (e) {
            threw = true;
          }
          return { threw };
        },
        expect: { threw: false }
      },
      {
        id: 'base-reportPerformance-dimensions-array',
        name: 'reportPerformance 带 array dimensions',
        description: '传入 dimensions 为数组',
        type: 'sync',
        run: (runtime) => {
          if (typeof runtime.reportPerformance !== 'function') {
            return { _error: 'reportPerformance 不存在' };
          }
          let threw = false;
          try {
            runtime.reportPerformance(1001, 300, ['dim1', 'dim2']);
          } catch (e) {
            threw = true;
          }
          return { threw };
        },
        expect: { threw: false }
      }
    ]
  },
  {
    name: 'migo.updateWeChatApp',
    category: 'base/update',
    tests: [
      {
        id: 'base-updateWeChatApp-exists',
        name: 'updateWeChatApp API 存在',
        description: '验证 updateWeChatApp 函数存在',
        type: 'sync',
        run: (runtime) => ({ exists: typeof runtime.updateWeChatApp === 'function' }),
        expect: { exists: true }
      },
      {
        id: 'base-updateWeChatApp-contract',
        name: 'updateWeChatApp 回调契约',
        description: '验证 success/fail/complete 回调',
        type: 'async',
        run: (runtime) => runOptionApiContract(runtime, 'updateWeChatApp'),
        expect: {
          apiExists: true,
          threw: false,
          completeCalled: true,
          completeAfterOutcome: true,
          multipleOutcomeCallbacks: false
        },
        allowVariance: ['successCalled', 'failCalled']
      }
    ]
  }
];
