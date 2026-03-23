/**
 * 渲染 - 指针锁定 API 测试
 * 覆盖: requestPointerLock, exitPointerLock, isPointerLocked
 */

export default [
  {
    name: 'migo.pointerLock',
    category: 'render/pointer-lock',
    tests: [
      {
        id: 'render-requestPointerLock-exists',
        name: 'requestPointerLock API 存在',
        description: '验证 requestPointerLock 函数存在',
        type: 'sync',
        run: (runtime) => ({ exists: typeof runtime.requestPointerLock === 'function' }),
        expect: { exists: true }
      },
      {
        id: 'render-exitPointerLock-exists',
        name: 'exitPointerLock API 存在',
        description: '验证 exitPointerLock 函数存在',
        type: 'sync',
        run: (runtime) => ({ exists: typeof runtime.exitPointerLock === 'function' }),
        expect: { exists: true }
      },
      {
        id: 'render-isPointerLocked-exists',
        name: 'isPointerLocked API 存在',
        description: '验证 isPointerLocked 函数存在',
        type: 'sync',
        run: (runtime) => ({ exists: typeof runtime.isPointerLocked === 'function' }),
        expect: { exists: true }
      },
      {
        id: 'render-isPointerLocked-default',
        name: 'isPointerLocked 默认返回 false',
        description: '未锁定时应返回 false',
        type: 'sync',
        run: (runtime) => {
          if (typeof runtime.isPointerLocked !== 'function') {
            return { _error: 'isPointerLocked 不存在' };
          }
          const locked = runtime.isPointerLocked();
          return {
            isBoolean: typeof locked === 'boolean',
            defaultFalse: locked === false
          };
        },
        expect: {
          isBoolean: true,
          defaultFalse: true
        }
      },
      {
        id: 'render-pointerLock-lifecycle',
        name: '指针锁定生命周期',
        description: 'requestPointerLock → isPointerLocked → exitPointerLock → isPointerLocked',
        type: 'sync',
        run: (runtime) => {
          if (typeof runtime.requestPointerLock !== 'function' ||
              typeof runtime.exitPointerLock !== 'function' ||
              typeof runtime.isPointerLocked !== 'function') {
            return { _error: 'pointerLock API 不完整' };
          }
          let requestThrew = false;
          let exitThrew = false;
          try { runtime.requestPointerLock(); } catch (e) { requestThrew = true; }
          const lockedAfterRequest = runtime.isPointerLocked();
          try { runtime.exitPointerLock(); } catch (e) { exitThrew = true; }
          const lockedAfterExit = runtime.isPointerLocked();
          return {
            requestThrew,
            exitThrew,
            lockedAfterRequest: typeof lockedAfterRequest === 'boolean',
            lockedAfterExit: lockedAfterExit === false
          };
        },
        expect: {
          requestThrew: false,
          exitThrew: false,
          lockedAfterRequest: true,
          lockedAfterExit: true
        }
      }
    ]
  }
];
