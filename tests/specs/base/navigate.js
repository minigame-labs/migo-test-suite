export default [
  {
    name: 'migo.restartMiniProgram',
    category: 'base',
    tests: [
      {
        id: 'navigate-001',
        name: '重启小游戏',
        description: '调用 restartMiniProgram 接口（默认 dryRun，不执行真实重启）',
        type: 'navigate',
        run: (runtime, nav = {}) => {
          if (typeof runtime.restartMiniProgram !== 'function') {
            return { _error: 'restartMiniProgram 不存在' };
          }

          if (nav.dryRun) {
            return { apiExists: true, executed: false };
          }

          runtime.restartMiniProgram({
            success: (res) => nav.onSuccess && nav.onSuccess({ apiExists: true, executed: true, success: true, res }),
            fail: (err) => nav.onFail && nav.onFail(err)
          });

          return undefined;
        },
        expect: {
          apiExists: true
        },
        allowVariance: ['executed', 'success', 'res']
      }
    ]
  },
  {
    name: 'migo.navigateToMiniProgram',
    category: 'base',
    tests: [
      {
        id: 'navigate-002',
        name: '跳转到其他小游戏',
        description: '验证 navigateToMiniProgram 接口（默认 dryRun）',
        type: 'navigate',
        run: (runtime, nav = {}) => {
          if (typeof runtime.navigateToMiniProgram !== 'function') {
            return { _error: 'navigateToMiniProgram 不存在' };
          }

          if (nav.dryRun) {
            return { apiExists: true, executed: false };
          }

          runtime.navigateToMiniProgram({
            appId: 'wx1234567890abcdef',
            path: 'pages/index/index',
            extraData: { foo: 'bar' },
            envVersion: 'develop',
            success: (res) => nav.onSuccess && nav.onSuccess({ apiExists: true, executed: true, success: true, res }),
            fail: (err) => nav.onFail && nav.onFail(err)
          });

          return undefined;
        },
        expect: {
          apiExists: true
        },
        allowVariance: ['executed', 'success', 'res']
      }
    ]
  },
  {
    name: 'migo.navigateBackMiniProgram',
    category: 'base',
    tests: [
      {
        id: 'navigate-003',
        name: '返回上一个小程序',
        description: '验证 navigateBackMiniProgram 接口（默认 dryRun）',
        type: 'navigate',
        run: (runtime, nav = {}) => {
          if (typeof runtime.navigateBackMiniProgram !== 'function') {
            return { _error: 'navigateBackMiniProgram 不存在' };
          }

          if (nav.dryRun) {
            return { apiExists: true, executed: false };
          }

          runtime.navigateBackMiniProgram({
            extraData: { foo: 'bar' },
            success: (res) => nav.onSuccess && nav.onSuccess({ apiExists: true, executed: true, success: true, res }),
            fail: (err) => nav.onFail && nav.onFail(err)
          });

          return undefined;
        },
        expect: {
          apiExists: true
        },
        allowVariance: ['executed', 'success', 'res']
      }
    ]
  },
  {
    name: 'migo.exitMiniProgram',
    category: 'base',
    tests: [
      {
        id: 'navigate-004',
        name: '退出小游戏',
        description: '调用 exitMiniProgram 接口（默认 dryRun，不执行真实退出）',
        type: 'navigate',
        run: (runtime, nav = {}) => {
          if (typeof runtime.exitMiniProgram !== 'function') {
            return { _error: 'exitMiniProgram 不存在' };
          }

          if (nav.dryRun) {
            return { apiExists: true, executed: false };
          }

          runtime.exitMiniProgram({
            success: (res) => nav.onSuccess && nav.onSuccess({ apiExists: true, executed: true, success: true, res }),
            fail: (err) => nav.onFail && nav.onFail(err)
          });

          return undefined;
        },
        expect: {
          apiExists: true
        },
        allowVariance: ['executed', 'success', 'res']
      }
    ]
  }
];
