
export default [
  {
    name: 'migo.restartMiniProgram',
    category: 'base',
    tests: [
      {
        id: 'navigate-001',
        name: '重启小游戏',
        description: '调用 restartMiniProgram 接口 (请观察是否重启)',
        type: 'sync',
        run: (runtime) => {
          if (typeof runtime.restartMiniProgram !== 'function') {
            return { _error: 'restartMiniProgram 不存在' };
          }
          
          // 实际调用
          console.log('即将调用 restartMiniProgram...');
          try {
            runtime.restartMiniProgram({
              success: (res) => console.log('restartMiniProgram success:', res),
              fail: (err) => console.error('restartMiniProgram fail:', err),
              complete: (res) => console.log('restartMiniProgram complete:', res)
            });
          } catch (e) {
            console.error('restartMiniProgram error:', e);
          }
          
          return {
             called: true
          };
        },
        expect: {
          called: true
        }
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
        description: '验证 navigateToMiniProgram 接口',
        type: 'async',
        run: (runtime, callback) => {
          if (typeof runtime.navigateToMiniProgram !== 'function') {
            return callback({ _error: 'navigateToMiniProgram 不存在' });
          }
          
          runtime.navigateToMiniProgram({
            appId: 'wx1234567890abcdef', // 使用假 appId
            path: 'pages/index/index',
            extraData: { foo: 'bar' },
            envVersion: 'develop',
            success: (res) => callback({ success: true, res }),
            fail: (err) => callback({ success: false, err: err ? (err.errMsg || JSON.stringify(err)) : 'unknown error' })
          });
        },
        expect: {
          success: '@boolean',
          res: '@object',
          err: '@string'
        },
        allowVariance: ['res', 'err'] // 允许 success 或 fail
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
        description: '验证 navigateBackMiniProgram 接口',
        type: 'async',
        run: (runtime, callback) => {
          if (typeof runtime.navigateBackMiniProgram !== 'function') {
            return callback({ _error: 'navigateBackMiniProgram 不存在' });
          }
          
          runtime.navigateBackMiniProgram({
            extraData: { foo: 'bar' },
            success: (res) => callback({ success: true, res }),
            fail: (err) => callback({ success: false, err: err ? (err.errMsg || JSON.stringify(err)) : 'unknown error' })
          });
        },
        expect: {
           success: '@boolean',
           res: '@object',
           err: '@string'
        },
        allowVariance: ['res', 'err']
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
        description: '调用 exitMiniProgram 接口 (请观察是否退出)',
        type: 'sync',
        run: (runtime) => {
          if (typeof runtime.exitMiniProgram !== 'function') {
            return { _error: 'exitMiniProgram 不存在' };
          }
          
          // 实际调用
          console.log('即将调用 exitMiniProgram...');
          try {
             runtime.exitMiniProgram({
               success: (res) => console.log('exitMiniProgram success:', res),
               fail: (err) => console.error('exitMiniProgram fail:', err),
               complete: (res) => console.log('exitMiniProgram complete:', res)
             });
          } catch(e) {
             console.error('exitMiniProgram error:', e);
          }
          
          return { called: true };
        },
        expect: {
          called: true
        }
      }
    ]
  }
];
