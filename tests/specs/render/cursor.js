
export default [
  {
    name: 'Cursor APIs',
    category: 'render/cursor',
    tests: [
      {
        id: 'cursor-001',
        name: 'wx.setCursor',
        description: '设置光标样式',
        type: 'sync',
        run: (runtime) => {
          if (typeof runtime.setCursor !== 'function') return { _error: 'wx.setCursor 不存在' };
          try {
            // Valid values: 'auto', 'pointer', 'default', etc.
            runtime.setCursor({ cursor: 'pointer' });
            return { success: true };
          } catch (e) {
            return { success: false, error: e.message };
          }
        },
        expect: { success: true }
      },
      {
        id: 'cursor-002',
        name: 'Pointer Lock',
        description: '鼠标指针锁定',
        type: 'sync',
        run: (runtime) => {
           const methods = [
               'requestPointerLock',
               'isPointerLocked',
               'exitPointerLock'
           ];
           const missing = methods.filter(m => typeof runtime[m] !== 'function');
           if (missing.length > 0) return { _error: `Missing: ${missing.join(', ')}` };
           
           // Can't easily test actual locking without user interaction, 
           // but we can test API existence and basic calls.
           try {
               const isLocked = runtime.isPointerLocked();
               // requestPointerLock usually requires user gesture, might fail or return nothing.
               // exitPointerLock should be safe to call.
               runtime.exitPointerLock();
               return { success: true, isLockedType: typeof isLocked };
           } catch (e) {
               return { success: false, error: e.message };
           }
        },
        expect: { success: true, isLockedType: 'boolean' }
      }
    ]
  }
];
