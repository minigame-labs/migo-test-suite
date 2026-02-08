
export default [
  // --- GameLogManager ---
  {
    name: 'migo.getGameLogManager',
    category: 'data-analysis',
    tests: [
      {
        id: 'analysis-001',
        name: '获取游戏日志管理器',
        description: '验证 getGameLogManager 接口',
        type: 'sync',
        run: (runtime) => {
          if (typeof runtime.getGameLogManager !== 'function') {
            return { _error: 'getGameLogManager 不存在' };
          }
          try {
            const manager = runtime.getGameLogManager({
              commonInfo: { env: 'test' },
              debug: true
            });
            return { success: true, hasManager: !!manager };
          } catch (e) {
            return { success: false, error: e.message };
          }
        },
        expect: {
          success: true,
          hasManager: true
        }
      }
    ]
  },
  {
    name: 'GameLogManager.getCommonInfo',
    category: 'data-analysis',
    tests: [
      {
        id: 'analysis-002',
        name: '获取公共信息',
        description: '验证 GameLogManager.getCommonInfo 接口',
        type: 'sync',
        run: (runtime) => {
          if (typeof runtime.getGameLogManager !== 'function') return { _error: 'getGameLogManager 不存在' };
          const manager = runtime.getGameLogManager({ commonInfo: { version: '1.0.0' } });
          if (!manager || typeof manager.getCommonInfo !== 'function') {
            return { _error: 'GameLogManager.getCommonInfo 不存在' };
          }
          try {
            const info = manager.getCommonInfo();
            return { success: true, info };
          } catch (e) {
            return { success: false, error: e.message };
          }
        },
        expect: {
          success: true,
          info: {
            version: '1.0.0'
          }
        }
      }
    ]
  },
  {
    name: 'GameLogManager.updateCommonInfo',
    category: 'data-analysis',
    tests: [
      {
        id: 'analysis-003',
        name: '更新公共信息',
        description: '验证 GameLogManager.updateCommonInfo 接口',
        type: 'sync',
        run: (runtime) => {
          if (typeof runtime.getGameLogManager !== 'function') return { _error: 'getGameLogManager 不存在' };
          const manager = runtime.getGameLogManager({ commonInfo: { a: 1 } });
          if (!manager || typeof manager.updateCommonInfo !== 'function') {
            return { _error: 'GameLogManager.updateCommonInfo 不存在' };
          }
          try {
            manager.updateCommonInfo({ b: 2 });
            const info = manager.getCommonInfo();
            return { success: true, info };
          } catch (e) {
            return { success: false, error: e.message };
          }
        },
        expect: {
          success: true,
          info: {
            a: 1,
            b: 2
          }
        }
      }
    ]
  },
  {
    name: 'GameLogManager.log',
    category: 'data-analysis',
    tests: [
      {
        id: 'analysis-004',
        name: '上报日志',
        description: '验证 GameLogManager.log 接口',
        type: 'async', // log might be async callback based
        run: (runtime, callback) => {
          if (typeof runtime.getGameLogManager !== 'function') return callback({ _error: 'getGameLogManager 不存在' });
          const manager = runtime.getGameLogManager();
          if (!manager || typeof manager.log !== 'function') {
            return callback({ _error: 'GameLogManager.log 不存在' });
          }
          
          // log usually doesn't return anything or strictly require callbacks in all implementations, 
          // but docs say it supports success/fail.
          // If callbacks are not supported, we might just call it and assume success if no error thrown.
          try {
            manager.log({
              level: 'info',
              key: 'test_log',
              value: 'test_content',
              success: () => callback({ success: true }),
              fail: (err) => callback({ success: false, err })
            });
            // Fallback timeout if callbacks are not invoked
            setTimeout(() => {
                // If implementation is sync or doesn't invoke callback, we might assume it worked 
                // but usually tests should rely on callback. 
                // We'll leave it to timeout if callback isn't called.
            }, 2000);
          } catch (e) {
            callback({ success: false, error: e.message });
          }
        },
        expect: {
          success: true
        }
      }
    ]
  },
  {
    name: 'GameLogManager.tag',
    category: 'data-analysis',
    tests: [
      {
        id: 'analysis-005',
        name: '获取标签日志记录器',
        description: '验证 GameLogManager.tag 接口',
        type: 'sync',
        run: (runtime) => {
          if (typeof runtime.getGameLogManager !== 'function') return { _error: 'getGameLogManager 不存在' };
          const manager = runtime.getGameLogManager();
          if (!manager || typeof manager.tag !== 'function') {
            return { _error: 'GameLogManager.tag 不存在' };
          }
          try {
            const logger = manager.tag('test_tag');
            const hasMethods = typeof logger.info === 'function' && 
                               typeof logger.warn === 'function' && 
                               typeof logger.error === 'function' && 
                               typeof logger.debug === 'function';
            return { success: true, hasMethods };
          } catch (e) {
            return { success: false, error: e.message };
          }
        },
        expect: {
          success: true,
          hasMethods: true
        }
      }
    ]
  },
  // --- MiniReportManager ---
  {
    name: 'migo.getMiniReportManager',
    category: 'data-analysis',
    tests: [
      {
        id: 'analysis-006',
        name: '获取小游戏数据上报管理器',
        description: '验证 getMiniReportManager 接口',
        type: 'sync',
        run: (runtime) => {
          if (typeof runtime.getMiniReportManager !== 'function') {
            return { _error: 'getMiniReportManager 不存在' };
          }
          try {
            const manager = runtime.getMiniReportManager();
            return { success: true, hasManager: !!manager };
          } catch (e) {
            return { success: false, error: e.message };
          }
        },
        expect: {
          success: true,
          hasManager: true
        }
      }
    ]
  },
  {
    name: 'MiniReportManager.report',
    category: 'data-analysis',
    tests: [
      {
        id: 'analysis-007',
        name: '上报关卡数据',
        description: '验证 MiniReportManager.report 接口',
        type: 'async',
        run: (runtime, callback) => {
          if (typeof runtime.getMiniReportManager !== 'function') return callback({ _error: 'getMiniReportManager 不存在' });
          const manager = runtime.getMiniReportManager();
          if (!manager || typeof manager.report !== 'function') {
            return callback({ _error: 'MiniReportManager.report 不存在' });
          }
          manager.report({
            eventID: 'test_event',
            success: () => callback({ success: true }),
            fail: (err) => callback({ success: false, err })
          });
        },
        expect: {
          success: true
        }
      }
    ]
  },
  // --- Other Analysis APIs ---
  {
    name: 'migo.getExptInfoSync',
    category: 'data-analysis',
    tests: [
      {
        id: 'analysis-008',
        name: '同步获取实验参数',
        description: '验证 getExptInfoSync 接口',
        type: 'sync',
        run: (runtime) => {
          if (typeof runtime.getExptInfoSync !== 'function') {
            return { _error: 'getExptInfoSync 不存在' };
          }
          try {
            const res = runtime.getExptInfoSync(['color']);
            return { success: true, isObject: typeof res === 'object' };
          } catch (e) {
            return { success: false, error: e.message };
          }
        },
        expect: {
          success: true,
          isObject: true
        }
      }
    ]
  },
  {
    name: 'migo.getGameExptInfo',
    category: 'data-analysis',
    tests: [
      {
        id: 'analysis-009',
        name: '异步获取实验参数',
        description: '验证 getGameExptInfo 接口',
        type: 'async',
        run: (runtime, callback) => {
          if (typeof runtime.getGameExptInfo !== 'function') {
            return callback({ _error: 'getGameExptInfo 不存在' });
          }
          runtime.getGameExptInfo({
            keyList: ['color'],
            success: (res) => callback({ success: true, res }),
            fail: (err) => callback({ success: false, err })
          });
        },
        expect: {
          success: true,
          res: {
            list: '@array'
            // items in list have expt_id, param_name, param_value
          }
        }
      }
    ]
  },
  {
    name: 'migo.reportEvent',
    category: 'data-analysis',
    tests: [
      {
        id: 'analysis-010',
        name: '上报自定义事件',
        description: '验证 reportEvent 接口',
        type: 'sync', // Usually sync return, or just void
        run: (runtime) => {
          if (typeof runtime.reportEvent !== 'function') {
            return { _error: 'reportEvent 不存在' };
          }
          try {
            runtime.reportEvent('test_event', { test_key: 'test_value' });
            return { success: true };
          } catch (e) {
            return { success: false, error: e.message };
          }
        },
        expect: {
          success: true
        }
      }
    ]
  },
  {
    name: 'migo.reportMonitor',
    category: 'data-analysis',
    tests: [
      {
        id: 'analysis-011',
        name: '上报性能监控',
        description: '验证 reportMonitor 接口',
        type: 'sync',
        run: (runtime) => {
          if (typeof runtime.reportMonitor !== 'function') {
            return { _error: 'reportMonitor 不存在' };
          }
          try {
            runtime.reportMonitor('test_monitor_id', 1);
            return { success: true };
          } catch (e) {
            return { success: false, error: e.message };
          }
        },
        expect: {
          success: true
        }
      }
    ]
  },
  {
    name: 'migo.reportScene',
    category: 'data-analysis',
    tests: [
      {
        id: 'analysis-012',
        name: '上报场景',
        description: '验证 reportScene 接口',
        type: 'sync',
        run: (runtime) => {
          if (typeof runtime.reportScene !== 'function') {
            return { _error: 'reportScene 不存在' };
          }
          try {
            // Check params from docs if available, assuming standard (sceneId, etc)
            // If checking existence is enough for now.
            runtime.reportScene({ sceneId: 1001 });
            return { success: true };
          } catch (e) {
            return { success: false, error: e.message };
          }
        },
        expect: {
          success: true
        }
      }
    ]
  },
  {
    name: 'migo.reportUserBehaviorBranchAnalytics',
    category: 'data-analysis',
    tests: [
      {
        id: 'analysis-013',
        name: '上报用户行为分支',
        description: '验证 reportUserBehaviorBranchAnalytics 接口',
        type: 'sync',
        run: (runtime) => {
          if (typeof runtime.reportUserBehaviorBranchAnalytics !== 'function') {
            return { _error: 'reportUserBehaviorBranchAnalytics 不存在' };
          }
          try {
            runtime.reportUserBehaviorBranchAnalytics({
              branchId: 'test_branch',
              eventType: 1
            });
            return { success: true };
          } catch (e) {
            return { success: false, error: e.message };
          }
        },
        expect: {
          success: true
        }
      }
    ]
  }
];
