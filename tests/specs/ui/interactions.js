
/**
 * 界面/交互 API 测试
 * 测试文件：tests/specs/ui/interactions.js
 */

export default [
  // 1) migo.showToast
  {
    name: 'migo.showToast',
    category: 'ui/interaction',
    tests: [
      {
        id: 'ui-interaction-001',
        name: '显示提示框',
        description: '通过 showToast 显示提示框',
        type: 'async',
        run: (runtime, callback) => {
          if (typeof runtime.showToast !== 'function') {
            return callback({ _error: 'showToast 不存在' });
          }
          runtime.showToast({
            title: 'test toast',
            icon: 'success',
            duration: 1500,
            mask: false,
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

  // 2) migo.hideToast
  {
    name: 'migo.hideToast',
    category: 'ui/interaction',
    tests: [
      {
        id: 'ui-interaction-002',
        name: '隐藏提示框',
        description: '通过 hideToast 隐藏提示框',
        type: 'async',
        run: (runtime, callback) => {
          if (typeof runtime.hideToast !== 'function') {
            return callback({ _error: 'hideToast 不存在' });
          }
          // Show first then hide
          if (runtime.showToast) runtime.showToast({ title: 'hiding...' });
          
          runtime.hideToast({
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

  // 3) migo.showModal
  {
    name: 'migo.showModal',
    category: 'ui/interaction',
    tests: [
      {
        id: 'ui-interaction-003',
        name: '显示模态对话框',
        description: '通过 showModal 显示模态对话框',
        type: 'async',
        run: (runtime, callback) => {
          if (typeof runtime.showModal !== 'function') {
            return callback({ _error: 'showModal 不存在' });
          }
          // Note: In automated testing, modals might block execution if they require user interaction.
          // However, for API existence and parameter validation, we call it.
          // Ideally, the test runtime mocks this or we accept it pops up.
          // We can use a short timeout or just assume it returns success immediately in some mock envs.
          // If it blocks waiting for user, this test might timeout.
          // For now, we assume it's testable or mocked.
          runtime.showModal({
            title: 'Test Modal',
            content: 'Test Content',
            showCancel: true,
            cancelText: 'Cancel',
            confirmText: 'OK',
            success: (res) => callback({ success: true, res }),
            fail: (err) => callback({ success: false, err })
          });
          
          // If it blocks, we might need to manually trigger success in a real env, 
          // but for API coverage we assume the runtime handles it or we just check invocation.
        },
        expect: {
          success: true,
          res: {
            errMsg: '@string',
            cancel: '@boolean',
            confirm: '@boolean',
            content: '@string' // editable is false by default, but content might be present or null
          }
        }
      }
    ]
  },

  // 4) migo.showLoading
  {
    name: 'migo.showLoading',
    category: 'ui/interaction',
    tests: [
      {
        id: 'ui-interaction-004',
        name: '显示加载框',
        description: '通过 showLoading 显示加载框',
        type: 'async',
        run: (runtime, callback) => {
          if (typeof runtime.showLoading !== 'function') {
            return callback({ _error: 'showLoading 不存在' });
          }
          runtime.showLoading({
            title: 'loading...',
            mask: true,
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

  // 5) migo.hideLoading
  {
    name: 'migo.hideLoading',
    category: 'ui/interaction',
    tests: [
      {
        id: 'ui-interaction-005',
        name: '隐藏加载框',
        description: '通过 hideLoading 隐藏加载框',
        type: 'async',
        run: (runtime, callback) => {
          if (typeof runtime.hideLoading !== 'function') {
            return callback({ _error: 'hideLoading 不存在' });
          }
          if (runtime.showLoading) runtime.showLoading({ title: 'hiding...' });
          
          runtime.hideLoading({
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

  // 6) migo.showActionSheet
  {
    name: 'migo.showActionSheet',
    category: 'ui/interaction',
    tests: [
      {
        id: 'ui-interaction-006',
        name: '显示操作菜单',
        description: '通过 showActionSheet 显示操作菜单',
        type: 'async',
        run: (runtime, callback) => {
          if (typeof runtime.showActionSheet !== 'function') {
            return callback({ _error: 'showActionSheet 不存在' });
          }
          runtime.showActionSheet({
            alertText: "Choose item", 
            itemList: ['Item A', 'Item B'],
            itemColor: '#000000',
            success: (res) => callback({ success: true, res }),
            fail: (err) => callback({ success: false, err })
          });
        },
        expect: {
          success: true,
          res: {
            errMsg: '@string',
            tapIndex: '@number'
          }
        }
      }
    ]
  }
];
