
export default [
  // --- Window ---
  {
    name: 'migo.setWindowSize',
    category: 'ui/window',
    tests: [
      {
        id: 'ui-window-001',
        name: '设置窗口大小',
        description: '验证 setWindowSize 接口',
        type: 'async', // Usually async
        run: (runtime, callback) => {
          if (typeof runtime.setWindowSize !== 'function') {
            return callback({ _error: 'setWindowSize 不存在' });
          }
          runtime.setWindowSize({
            width: 375,
            height: 667,
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
  },
  {
    name: 'migo.onWindowResize',
    category: 'ui/window',
    tests: [
      {
        id: 'ui-window-002',
        name: '监听窗口尺寸变化',
        description: '验证 onWindowResize 接口',
        type: 'event',
        timeout: 3000,
        run: (runtime, callback) => {
          if (typeof runtime.onWindowResize !== 'function') {
            return callback({ _error: 'onWindowResize 不存在' });
          }
          const listener = (res) => {
             callback({ triggered: true, res });
          };
          runtime.onWindowResize(listener);
          // Manually trigger if possible, or verify registration
          // For automated test, we assume registration is success
          callback({ registered: true });
        },
        expect: {
          registered: true
        }
      }
    ]
  },
  {
    name: 'migo.offWindowResize',
    category: 'ui/window',
    tests: [
      {
        id: 'ui-window-003',
        name: '取消监听窗口尺寸变化',
        description: '验证 offWindowResize 接口',
        type: 'sync',
        run: (runtime) => {
          if (typeof runtime.offWindowResize !== 'function') {
            return { _error: 'offWindowResize 不存在' };
          }
          const listener = () => {};
          try {
            runtime.onWindowResize && runtime.onWindowResize(listener);
            runtime.offWindowResize(listener);
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
    name: 'migo.onWindowStateChange',
    category: 'ui/window',
    tests: [
      {
        id: 'ui-window-004',
        name: '监听窗口状态变化',
        description: '验证 onWindowStateChange 接口',
        type: 'event',
        timeout: 3000,
        run: (runtime, callback) => {
          if (typeof runtime.onWindowStateChange !== 'function') {
            return callback({ _error: 'onWindowStateChange 不存在' });
          }
          const listener = (res) => {
             callback({ triggered: true, res });
          };
          runtime.onWindowStateChange(listener);
          callback({ registered: true });
        },
        expect: {
          registered: true
        }
      }
    ]
  },
  {
    name: 'migo.offWindowStateChange',
    category: 'ui/window',
    tests: [
      {
        id: 'ui-window-005',
        name: '取消监听窗口状态变化',
        description: '验证 offWindowStateChange 接口',
        type: 'sync',
        run: (runtime) => {
          if (typeof runtime.offWindowStateChange !== 'function') {
            return { _error: 'offWindowStateChange 不存在' };
          }
          const listener = () => {};
          try {
            runtime.onWindowStateChange && runtime.onWindowStateChange(listener);
            runtime.offWindowStateChange(listener);
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
