
export default [
  {
    name: 'migo.keyboard',
    category: 'device',
    tests: [
      {
        id: 'migo.showKeyboard',
        name: '显示键盘',
        description: '显示键盘',
        type: 'async',
        run: (runtime) => new Promise((resolve) => {
          if (typeof runtime.showKeyboard !== 'function') {
            resolve({ _error: 'showKeyboard 不存在' });
            return;
          }
          runtime.showKeyboard({
            defaultValue: 'test',
            maxLength: 10,
            multiple: false,
            confirmHold: false,
            confirmType: 'done',
            success: () => resolve('PASS'),
            fail: () => resolve('FAIL')
          });
        }),
        expect: 'PASS'
      },
      {
        id: 'migo.hideKeyboard',
        name: '隐藏键盘',
        description: '隐藏键盘',
        type: 'async',
        run: (runtime) => new Promise((resolve) => {
          if (typeof runtime.hideKeyboard !== 'function') {
            resolve({ _error: 'hideKeyboard 不存在' });
            return;
          }
          runtime.hideKeyboard({
            success: () => resolve('PASS'),
            fail: () => resolve('FAIL')
          });
        }),
        expect: 'PASS'
      },
      {
        id: 'migo.onKeyboardInput',
        name: '监听键盘输入',
        description: '验证 onKeyboardInput (需输入字符)',
        type: 'event',
        timeout: 10000,
        run: (runtime, callback) => {
          if (typeof runtime.onKeyboardInput !== 'function') return callback({ _error: 'API missing' });
          runtime.onKeyboardInput((res) => callback(res));
          // 尝试调起键盘辅助测试
          if (runtime.showKeyboard) runtime.showKeyboard({ defaultValue: '' });
        },
        expect: {
          value: '@string'
        }
      },
      {
        id: 'migo.offKeyboardInput',
        name: '取消监听键盘输入',
        description: '验证 offKeyboardInput 接口存在性',
        type: 'sync',
        run: (runtime) => {
          if (typeof runtime.offKeyboardInput !== 'function') return { exists: false };
          return { exists: true };
        },
        expect: { exists: true }
      },
      {
        id: 'migo.onKeyboardConfirm',
        name: '监听键盘完成',
        description: '验证 onKeyboardConfirm (需点击完成)',
        type: 'event',
        timeout: 10000,
        run: (runtime, callback) => {
          if (typeof runtime.onKeyboardConfirm !== 'function') return callback({ _error: 'API missing' });
          runtime.onKeyboardConfirm((res) => callback(res));
          if (runtime.showKeyboard) runtime.showKeyboard({ confirmType: 'done' });
        },
        expect: {
          value: '@string'
        }
      },
      {
        id: 'migo.offKeyboardConfirm',
        name: '取消监听键盘完成',
        description: '验证 offKeyboardConfirm 接口存在性',
        type: 'sync',
        run: (runtime) => {
          if (typeof runtime.offKeyboardConfirm !== 'function') return { exists: false };
          return { exists: true };
        },
        expect: { exists: true }
      },
      {
        id: 'migo.onKeyboardComplete',
        name: '监听键盘收起',
        description: '验证 onKeyboardComplete (需收起键盘)',
        type: 'event',
        timeout: 10000,
        run: (runtime, callback) => {
          if (typeof runtime.onKeyboardComplete !== 'function') return callback({ _error: 'API missing' });
          runtime.onKeyboardComplete((res) => callback(res));
          // 先显示再隐藏可能触发，或者让用户操作
          if (runtime.showKeyboard) runtime.showKeyboard({});
        },
        expect: {
          value: '@string'
        }
      },
      {
        id: 'migo.offKeyboardComplete',
        name: '取消监听键盘收起',
        description: '验证 offKeyboardComplete 接口存在性',
        type: 'sync',
        run: (runtime) => {
          if (typeof runtime.offKeyboardComplete !== 'function') return { exists: false };
          return { exists: true };
        },
        expect: { exists: true }
      },
      {
        id: 'migo.onKeyDown',
        name: '监听键盘按键按下事件',
        description: '验证 onKeyDown (需按键)',
        type: 'event',
        timeout: 5000,
        run: (runtime, callback) => {
          if (typeof runtime.onKeyDown !== 'function') return callback({ _error: 'API missing' });
          runtime.onKeyDown((res) => callback(res));
        },
        expect: {
          key: '@string'
        }
      },
      {
        id: 'migo.offKeyDown',
        name: '取消监听键盘按键按下事件',
        description: '验证 offKeyDown 接口存在性',
        type: 'sync',
        run: (runtime) => {
          if (typeof runtime.offKeyDown !== 'function') return { exists: false };
          return { exists: true };
        },
        expect: { exists: true }
      },
      {
        id: 'migo.onKeyUp',
        name: '监听键盘按键松开事件',
        description: '验证 onKeyUp (需按键)',
        type: 'event',
        timeout: 5000,
        run: (runtime, callback) => {
          if (typeof runtime.onKeyUp !== 'function') return callback({ _error: 'API missing' });
          runtime.onKeyUp((res) => callback(res));
        },
        expect: {
          key: '@string'
        }
      },
      {
        id: 'migo.offKeyUp',
        name: '取消监听键盘按键松开事件',
        description: '验证 offKeyUp 接口存在性',
        type: 'sync',
        run: (runtime) => {
          if (typeof runtime.offKeyUp !== 'function') return { exists: false };
          return { exists: true };
        },
        expect: { exists: true }
      },
      {
        id: 'migo.onKeyboardHeightChange',
        name: '监听键盘高度变化',
        description: '验证 onKeyboardHeightChange',
        type: 'event',
        timeout: 5000,
        run: (runtime, callback) => {
          if (typeof runtime.onKeyboardHeightChange !== 'function') return callback({ _error: 'API missing' });
          runtime.onKeyboardHeightChange((res) => callback(res));
          if (runtime.showKeyboard) runtime.showKeyboard({});
        },
        expect: {
          height: '@number',
          duration: '@number'
        }
      },
      {
        id: 'migo.offKeyboardHeightChange',
        name: '取消监听键盘高度变化',
        description: '验证 offKeyboardHeightChange 接口存在性',
        type: 'sync',
        run: (runtime) => {
          if (typeof runtime.offKeyboardHeightChange !== 'function') return { exists: false };
          return { exists: true };
        },
        expect: { exists: true }
      },
      {
        id: 'migo.updateKeyboard',
        name: '更新键盘',
        description: '更新键盘输入框值',
        type: 'async',
        run: (runtime) => new Promise((resolve) => {
          if (typeof runtime.updateKeyboard !== 'function') {
            resolve({ _error: 'updateKeyboard 不存在' });
            return;
          }
          runtime.updateKeyboard({
            value: 'updated',
            success: () => resolve('PASS'),
            fail: () => resolve('FAIL')
          });
        }),
        expect: 'PASS'
      }
    ]
  }
];
