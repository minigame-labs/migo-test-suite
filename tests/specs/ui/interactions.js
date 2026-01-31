/**
 * 界面/交互 API 测试
 * 测试文件：界面/交互.js
 */

export default [
  // 1) migo.showToast
  {
    name: 'migo.showToast',
    category: 'ui/interaction',
    tests: [
      {
        id: 'migo.showToast',
        name: '显示提示框',
        description: '通过 showToast 显示提示框（仅校验接口可用）',
        type: 'sync',
        run: (runtime) => {
          if (typeof runtime.showToast !== 'function') {
            return { _error: 'showToast 不存在' };
          }
          return runtime.showToast({title: 'test toast \n new line'});
        },
        expect: {}
      }
    ]
  },

  // 2) migo.hideToast
  {
    name: 'migo.hideToast',
    category: 'ui/interaction',
    tests: [
      {
        id: 'migo.hideToast',
        name: '隐藏提示框',
        description: '通过 hideToast 隐藏提示框（仅校验接口可用）',
        type: 'sync',
        run: (runtime) => {
          if (typeof runtime.hideToast !== 'function') {
            return { _error: 'hideToast 不存在' };
          }
          return runtime.hideToast({});
        },
        expect: {}
      }
    ]
  },

  // 3) migo.showModal
  {
    name: 'migo.showModal',
    category: 'ui/interaction',
    tests: [
      {
        id: 'migo.showModal',
        name: '显示模态对话框',
        description: '通过 showModal 显示模态对话框（仅校验接口可用）',
        type: 'sync',
        run: (runtime) => {
          if (typeof runtime.showModal !== 'function') {
            return { _error: 'showModal 不存在' };
          }
          return runtime.showModal({title:'modal test \n 123', content:'test content'});
        },
        expect: {}
      }
    ]
  },

  // 4) migo.showLoading
  {
    name: 'migo.showLoading',
    category: 'ui/interaction',
    tests: [
      {
        id: 'migo.showLoading',
        name: '显示加载框',
        description: '通过 showLoading 显示加载框（仅校验接口可用）',
        type: 'sync',
        run: (runtime) => {
          if (typeof runtime.showLoading !== 'function') {
            return { _error: 'showLoading 不存在' };
          }
          return runtime.showLoading({title:'loading...'});
        },
        expect: {}
      }
    ]
  },

  // 5) migo.hideLoading
  {
    name: 'migo.hideLoading',
    category: 'ui/interaction',
    tests: [
      {
        id: 'migo.hideLoading',
        name: '隐藏加载框',
        description: '通过 hideLoading 隐藏加载框（仅校验接口可用）',
        type: 'sync',
        run: (runtime) => {
          if (typeof runtime.hideLoading !== 'function') {
            return { _error: 'hideLoading 不存在' };
          }
          return runtime.hideLoading({});
        },
        expect: {}
      }
    ]
  },

  // 6) migo.showActionSheet
  {
    name: 'migo.showActionSheet',
    category: 'ui/interaction',
    tests: [
      {
        id: 'migo.showActionSheet',
        name: '显示操作菜单',
        description: '通过 showActionSheet 显示操作菜单（仅校验接口可用）',
        type: 'sync',
        run: (runtime) => {
          if (typeof runtime.showActionSheet !== 'function') {
            return { _error: 'showActionSheet 不存在' };
          }
          return runtime.showActionSheet({alertText:"text", itemList:['a','b','c']});
        },
        expect: {}
      }
    ]
  }
];
