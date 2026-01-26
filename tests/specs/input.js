/**
 * 输入事件 API 测试用例
 */

export default [
  {
    name: 'Touch Events',
    category: 'input',
    tests: [
      {
        id: 'touch-001',
        name: 'onTouchStart 存在',
        description: '验证触摸开始事件监听',
        type: 'sync',
        run: (runtime) => ({
          exists: typeof runtime.onTouchStart === 'function'
        }),
        expect: {
          exists: true
        }
      },
      {
        id: 'touch-002',
        name: 'onTouchMove 存在',
        description: '验证触摸移动事件监听',
        type: 'sync',
        run: (runtime) => ({
          exists: typeof runtime.onTouchMove === 'function'
        }),
        expect: {
          exists: true
        }
      },
      {
        id: 'touch-003',
        name: 'onTouchEnd 存在',
        description: '验证触摸结束事件监听',
        type: 'sync',
        run: (runtime) => ({
          exists: typeof runtime.onTouchEnd === 'function'
        }),
        expect: {
          exists: true
        }
      },
      {
        id: 'touch-004',
        name: 'onTouchCancel 存在',
        description: '验证触摸取消事件监听',
        type: 'sync',
        run: (runtime) => ({
          exists: typeof runtime.onTouchCancel === 'function'
        }),
        expect: {
          exists: true
        }
      },
      {
        id: 'touch-005',
        name: 'offTouchStart 存在',
        description: '验证取消触摸开始事件监听',
        type: 'sync',
        run: (runtime) => ({
          exists: typeof runtime.offTouchStart === 'function'
        }),
        expect: {
          exists: true
        }
      },
      {
        id: 'touch-006',
        name: 'offTouchMove 存在',
        description: '验证取消触摸移动事件监听',
        type: 'sync',
        run: (runtime) => ({
          exists: typeof runtime.offTouchMove === 'function'
        }),
        expect: {
          exists: true
        }
      },
      {
        id: 'touch-007',
        name: 'offTouchEnd 存在',
        description: '验证取消触摸结束事件监听',
        type: 'sync',
        run: (runtime) => ({
          exists: typeof runtime.offTouchEnd === 'function'
        }),
        expect: {
          exists: true
        }
      },
      {
        id: 'touch-008',
        name: 'offTouchCancel 存在',
        description: '验证取消触摸取消事件监听',
        type: 'sync',
        run: (runtime) => ({
          exists: typeof runtime.offTouchCancel === 'function'
        }),
        expect: {
          exists: true
        }
      },
      {
        id: 'touch-009',
        name: 'onTouchStart 注册回调',
        description: '验证触摸事件回调注册',
        type: 'event',
        timeout: 100, // 短超时，只验证API不实际等待触摸
        run: (runtime, done) => {
          if (typeof runtime.onTouchStart !== 'function') {
            done({ apiNotFound: true });
            return;
          }
          
          let registered = false;
          const callback = (e) => {
            // 验证事件对象结构
            done({
              eventReceived: true,
              hasTouches: Array.isArray(e.touches),
              hasChangedTouches: Array.isArray(e.changedTouches),
              hasTimeStamp: typeof e.timeStamp === 'number'
            });
          };
          
          try {
            runtime.onTouchStart(callback);
            registered = true;
            
            // 取消注册
            if (typeof runtime.offTouchStart === 'function') {
              runtime.offTouchStart(callback);
            }
          } catch (e) {
            done({ registerError: e.message });
            return;
          }
          
          // 如果没有触发事件，返回注册成功
          setTimeout(() => {
            if (!done.called) {
              done({ registered: registered, eventReceived: false });
            }
          }, 50);
        },
        expect: {
          registered: true
        },
        allowVariance: ['eventReceived', 'hasTouches', 'hasChangedTouches', 'hasTimeStamp']
      }
    ]
  },
  
  // ==================== 键盘事件 ====================
  {
    name: 'Keyboard Events',
    category: 'input',
    tests: [
      {
        id: 'keyboard-001',
        name: 'showKeyboard 存在',
        description: '验证显示键盘 API',
        type: 'sync',
        run: (runtime) => ({
          exists: typeof runtime.showKeyboard === 'function'
        }),
        expect: {
          exists: true
        }
      },
      {
        id: 'keyboard-002',
        name: 'hideKeyboard 存在',
        description: '验证隐藏键盘 API',
        type: 'sync',
        run: (runtime) => ({
          exists: typeof runtime.hideKeyboard === 'function'
        }),
        expect: {
          exists: true
        }
      },
      {
        id: 'keyboard-003',
        name: 'onKeyboardInput 存在',
        description: '验证键盘输入事件监听',
        type: 'sync',
        run: (runtime) => ({
          exists: typeof runtime.onKeyboardInput === 'function'
        }),
        expect: {
          exists: true
        }
      }
    ]
  }
];
