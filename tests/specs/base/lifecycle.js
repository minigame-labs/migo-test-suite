/**
 * 生命周期 API 测试
 */

export default [
  // 1) migo.onShow
  {
    name: 'migo.onShow',
    category: 'base',
    tests: [
      {
        id: 'migo.onShow',
        name: '监听切前台',
        description: '注册 onShow 监听函数（仅校验接口可用）',
        type: 'event',
        timeout: 3000,
        run: (runtime) => {
          if (typeof runtime.onShow !== 'function') {
            return { _error: 'onShow 不存在' };
          }
          const listener = () => {};
          runtime.onShow(listener);
          return { registered: true };
        },
        expect: {}
      }
    ]
  },

  // 2) migo.offShow
  {
    name: 'migo.offShow',
    category: 'base',
    tests: [
      {
        id: 'migo.offShow',
        name: '取消监听切前台',
        description: '调用 offShow 取消 onShow 监听（仅校验接口可用）',
        type: 'event',
        timeout: 3000,
        run: (runtime) => {
          if (typeof runtime.onShow !== 'function') {
            return { _error: 'onShow 不存在（offShow 测试依赖）' };
          }
          if (typeof runtime.offShow !== 'function') {
            return { _error: 'offShow 不存在' };
          }

          const listener = () => {};
          runtime.onShow(listener);
          runtime.offShow(listener);
          runtime.offShow(); // 清空全部（如实现支持）

          return { removed: true };
        },
        expect: {}
      }
    ]
  },

  // 3) migo.onHide
  {
    name: 'migo.onHide',
    category: 'base',
    tests: [
      {
        id: 'migo.onHide',
        name: '监听切后台',
        description: '注册 onHide 监听函数（仅校验接口可用）',
        type: 'event',
        timeout: 3000,
        run: (runtime) => {
          if (typeof runtime.onHide !== 'function') {
            return { _error: 'onHide 不存在' };
          }
          const listener = () => {};
          runtime.onHide(listener);
          return { registered: true };
        },
        expect: {}
      }
    ]
  },

  // 4) migo.offHide
  {
    name: 'migo.offHide',
    category: 'base',
    tests: [
      {
        id: 'migo.offHide',
        name: '取消监听切后台',
        description: '调用 offHide 取消 onHide 监听（仅校验接口可用）',
        type: 'event',
        timeout: 3000,
        run: (runtime) => {
          if (typeof runtime.onHide !== 'function') {
            return { _error: 'onHide 不存在（offHide 测试依赖）' };
          }
          if (typeof runtime.offHide !== 'function') {
            return { _error: 'offHide 不存在' };
          }

          const listener = () => {};
          runtime.onHide(listener);
          runtime.offHide(listener);
          runtime.offHide(); // 清空全部（如实现支持）

          return { removed: true };
        },
        expect: {}
      }
    ]
  },

  // 5) migo.getLaunchOptionsSync
  {
    name: 'migo.getLaunchOptionsSync',
    category: 'base',
    tests: [
      {
        id: 'migo.getLaunchOptionsSync',
        name: '获取启动参数',
        description: '通过 getLaunchOptionsSync 获取小游戏启动参数',
        type: 'sync',
        run: (runtime) => {
          if (typeof runtime.getLaunchOptionsSync !== 'function') {
            return { _error: 'getLaunchOptionsSync 不存在' };
          }
          return runtime.getLaunchOptionsSync();
        },
        expect: {}
      }
    ]
  },

  // 6) migo.getEnterOptionsSync
  {
    name: 'migo.getEnterOptionsSync',
    category: 'base',
    tests: [
      {
        id: 'migo.getEnterOptionsSync',
        name: '获取进入参数',
        description: '通过 getEnterOptionsSync 获取小游戏进入前台的参数',
        type: 'sync',
        run: (runtime) => {
          if (typeof runtime.getEnterOptionsSync !== 'function') {
            return { _error: 'getEnterOptionsSync 不存在' };
          }
          return runtime.getEnterOptionsSync();
        },
        expect: {}
      }
    ]
  }
];
