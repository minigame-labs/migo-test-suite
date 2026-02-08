
export default [
  // --- Status Bar ---
  {
    name: 'migo.setStatusBarStyle',
    category: 'ui/status-bar',
    tests: [
      {
        id: 'ui-statusbar-001',
        name: '设置状态栏样式',
        description: '验证 setStatusBarStyle 接口',
        type: 'async',
        run: (runtime, callback) => {
          if (typeof runtime.setStatusBarStyle !== 'function') {
            return callback({ _error: 'setStatusBarStyle 不存在' });
          }
          runtime.setStatusBarStyle({
            style: 'white', // white or black
            success: (res) => callback({ success: true, res }),
            fail: (err) => callback({ success: false, err })
          });
        },
        expect: {
          success: true,
          res: {
            errMsg: '@string'
          }
        }
      }
    ]
  }
];
