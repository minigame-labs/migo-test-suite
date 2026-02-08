/**
 * 更新管理 API 测试
 */

export default [
  {
    name: 'migo.updateApp',
    category: 'base',
    tests: [
      {
        id: 'update-002',
        name: '强制更新小程序',
        description: '验证 updateApp 接口是否存在',
        type: 'sync',
        run: (runtime) => {
           if (typeof runtime.updateApp !== 'function') {
             return { _error: 'updateApp 不存在' };
           }
           return { exists: true };
        },
        expect: {
          exists: true
        }
      }
    ]
  },
  {
    name: 'migo.getUpdateManager',
    category: 'base',
    tests: [
      {
        id: 'update-001',
        name: '获取更新管理器',
        description: '验证 getUpdateManager 返回的更新管理器对象',
        type: 'sync',
        run: (runtime) => {
          if (typeof runtime.getUpdateManager !== 'function') {
            return { _error: 'getUpdateManager 不存在' };
          }
          const manager = runtime.getUpdateManager();
          return {
            hasOnCheckForUpdate: typeof manager.onCheckForUpdate === 'function',
            hasOnUpdateReady: typeof manager.onUpdateReady === 'function',
            hasOnUpdateFailed: typeof manager.onUpdateFailed === 'function',
            hasApplyUpdate: typeof manager.applyUpdate === 'function'
          };
        },
        expect: {
          hasOnCheckForUpdate: true,
          hasOnUpdateReady: true,
          hasOnUpdateFailed: true,
          hasApplyUpdate: true
        }
      }
    ]
  }
];
