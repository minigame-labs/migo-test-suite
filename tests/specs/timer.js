/**
 * 定时器 API 测试用例
 */

export default [
  {
    name: 'Timer',
    category: 'timer',
    tests: [
      {
        id: 'timer-001',
        name: 'setTimeout 存在',
        description: '验证 setTimeout 全局函数',
        type: 'sync',
        run: (runtime) => ({
          exists: typeof setTimeout === 'function'
        }),
        expect: {
          exists: true
        }
      },
      {
        id: 'timer-002',
        name: 'clearTimeout 存在',
        description: '验证 clearTimeout 全局函数',
        type: 'sync',
        run: (runtime) => ({
          exists: typeof clearTimeout === 'function'
        }),
        expect: {
          exists: true
        }
      },
      {
        id: 'timer-003',
        name: 'setInterval 存在',
        description: '验证 setInterval 全局函数',
        type: 'sync',
        run: (runtime) => ({
          exists: typeof setInterval === 'function'
        }),
        expect: {
          exists: true
        }
      },
      {
        id: 'timer-004',
        name: 'clearInterval 存在',
        description: '验证 clearInterval 全局函数',
        type: 'sync',
        run: (runtime) => ({
          exists: typeof clearInterval === 'function'
        }),
        expect: {
          exists: true
        }
      },
      {
        id: 'timer-005',
        name: 'requestAnimationFrame 存在',
        description: '验证 requestAnimationFrame 全局函数',
        type: 'sync',
        run: (runtime) => ({
          exists: typeof requestAnimationFrame === 'function'
        }),
        expect: {
          exists: true
        }
      },
      {
        id: 'timer-006',
        name: 'cancelAnimationFrame 存在',
        description: '验证 cancelAnimationFrame 全局函数',
        type: 'sync',
        run: (runtime) => ({
          exists: typeof cancelAnimationFrame === 'function'
        }),
        expect: {
          exists: true
        }
      },
      {
        id: 'timer-007',
        name: 'setTimeout 执行',
        description: '验证 setTimeout 能正确执行回调',
        type: 'async',
        timeout: 2000,
        run: (runtime, done) => {
          const start = Date.now();
          const delay = 100;
          
          setTimeout(() => {
            const elapsed = Date.now() - start;
            done({
              executed: true,
              elapsed: Math.round(elapsed),
              withinRange: elapsed >= delay * 0.8 && elapsed < delay * 3
            });
          }, delay);
        },
        expect: {
          executed: true,
          withinRange: true
        }
      },
      {
        id: 'timer-008',
        name: 'clearTimeout 取消',
        description: '验证 clearTimeout 能取消定时器',
        type: 'async',
        timeout: 1000,
        run: (runtime, done) => {
          let called = false;
          
          const timerId = setTimeout(() => {
            called = true;
          }, 50);
          
          clearTimeout(timerId);
          
          // 等待足够时间确认没有执行
          setTimeout(() => {
            done({
              cancelled: !called
            });
          }, 200);
        },
        expect: {
          cancelled: true
        }
      },
      {
        id: 'timer-009',
        name: 'setInterval 执行',
        description: '验证 setInterval 能多次执行',
        type: 'async',
        timeout: 2000,
        run: (runtime, done) => {
          let count = 0;
          const targetCount = 3;
          
          const intervalId = setInterval(() => {
            count++;
            if (count >= targetCount) {
              clearInterval(intervalId);
              done({
                executedCount: count,
                reachedTarget: count >= targetCount
              });
            }
          }, 100);
        },
        expect: {
          reachedTarget: true
        }
      },
      {
        id: 'timer-010',
        name: 'requestAnimationFrame 执行',
        description: '验证 requestAnimationFrame 回调执行',
        type: 'async',
        timeout: 1000,
        run: (runtime, done) => {
          let frameCount = 0;
          
          const loop = () => {
            frameCount++;
            if (frameCount >= 3) {
              done({
                executed: true,
                frameCount: frameCount
              });
            } else {
              requestAnimationFrame(loop);
            }
          };
          
          requestAnimationFrame(loop);
        },
        expect: {
          executed: true
        }
      }
    ]
  }
];
