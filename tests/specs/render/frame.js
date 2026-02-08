
export default [
  {
    name: 'Frame APIs',
    category: 'render/frame',
    tests: [
      {
        id: 'frame-001',
        name: 'requestAnimationFrame',
        description: '请求动画帧',
        type: 'async',
        run: (runtime, callback) => {
             if (typeof runtime.requestAnimationFrame !== 'function') return callback({ _error: 'requestAnimationFrame 不存在' });
             
             try {
                 const id = runtime.requestAnimationFrame(() => {
                     callback({ success: true, callbackCalled: true });
                 });
                 if (!id) {
                     // Some implementations might return void or 0 if failed? 
                     // Standard returns a non-zero integer.
                     // But we wait for callback to confirm success.
                 }
             } catch (e) {
                 callback({ success: false, error: e.message });
             }
        },
        expect: { success: true, callbackCalled: true }
      },
      {
        id: 'frame-002',
        name: 'cancelAnimationFrame',
        description: '取消动画帧',
        type: 'sync',
        run: (runtime) => {
             if (typeof runtime.requestAnimationFrame !== 'function') return { _error: 'requestAnimationFrame 不存在' };
             if (typeof runtime.cancelAnimationFrame !== 'function') return { _error: 'cancelAnimationFrame 不存在' };
             
             try {
                 const id = runtime.requestAnimationFrame(() => {});
                 runtime.cancelAnimationFrame(id);
                 return { success: true };
             } catch (e) {
                 return { success: false, error: e.message };
             }
        },
        expect: { success: true }
      },
      {
        id: 'frame-003',
        name: 'wx.setPreferredFramesPerSecond',
        description: '设置首选帧率',
        type: 'sync',
        run: (runtime) => {
             if (typeof runtime.setPreferredFramesPerSecond !== 'function') return { _error: 'setPreferredFramesPerSecond 不存在' };
             try {
                 runtime.setPreferredFramesPerSecond(30);
                 return { success: true };
             } catch (e) {
                 return { success: false, error: e.message };
             }
        },
        expect: { success: true }
      }
    ]
  }
];
