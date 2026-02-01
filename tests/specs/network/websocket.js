export default [
  {
    name: 'migo.websocket.basic',
    category: 'network/websocket',
    tests: [
      {
        id: 'ws-connectSocket-exists',
        name: 'connectSocket 存在',
        description: '验证 connectSocket API 是否存在（预期未实现）',
        type: 'sync',
        run: (runtime) => ({ exists: typeof runtime.connectSocket === 'function' }),
        expect: { exists: false }
      },
      {
        id: 'ws-closeSocket-exists',
        name: 'closeSocket 存在',
        description: '验证 closeSocket API 是否存在（预期未实现）',
        type: 'sync',
        run: (runtime) => ({ exists: typeof runtime.closeSocket === 'function' }),
        expect: { exists: false }
      },
      {
        id: 'ws-onSocketOpen-exists',
        name: 'onSocketOpen 存在',
        description: '验证 onSocketOpen 是否存在（预期未实现）',
        type: 'sync',
        run: (runtime) => ({ exists: typeof runtime.onSocketOpen === 'function' }),
        expect: { exists: false }
      },
      {
        id: 'ws-onSocketMessage-exists',
        name: 'onSocketMessage 存在',
        description: '验证 onSocketMessage 是否存在（预期未实现）',
        type: 'sync',
        run: (runtime) => ({ exists: typeof runtime.onSocketMessage === 'function' }),
        expect: { exists: false }
      },
      {
        id: 'ws-onSocketError-exists',
        name: 'onSocketError 存在',
        description: '验证 onSocketError 是否存在（预期未实现）',
        type: 'sync',
        run: (runtime) => ({ exists: typeof runtime.onSocketError === 'function' }),
        expect: { exists: false }
      },
      {
        id: 'ws-onSocketClose-exists',
        name: 'onSocketClose 存在',
        description: '验证 onSocketClose 是否存在（预期未实现）',
        type: 'sync',
        run: (runtime) => ({ exists: typeof runtime.onSocketClose === 'function' }),
        expect: { exists: false }
      },
      {
        id: 'ws-sendSocketMessage-exists',
        name: 'sendSocketMessage 存在',
        description: '验证 sendSocketMessage 是否存在（预期未实现）',
        type: 'sync',
        run: (runtime) => ({ exists: typeof runtime.sendSocketMessage === 'function' }),
        expect: { exists: false }
      }
    ]
  },
  {
    name: 'migo.websocket.task',
    category: 'network/websocket',
    tests: [
      {
        id: 'ws-task-send-exists',
        name: 'SocketTask.send 存在',
        description: '验证 SocketTask.send 是否存在（预期未实现）',
        type: 'sync',
        run: (runtime) => {
          const exists =
            typeof runtime.connectSocket === 'function' &&
            typeof runtime.SocketTask === 'function' &&
            typeof runtime.SocketTask.prototype?.send === 'function';
          return { exists };
        },
        expect: { exists: false }
      },
      {
        id: 'ws-task-close-exists',
        name: 'SocketTask.close 存在',
        description: '验证 SocketTask.close 是否存在（预期未实现）',
        type: 'sync',
        run: (runtime) => {
          const exists =
            typeof runtime.SocketTask === 'function' &&
            typeof runtime.SocketTask.prototype?.close === 'function';
          return { exists };
        },
        expect: { exists: false }
      },
      {
        id: 'ws-task-onOpen-exists',
        name: 'SocketTask.onOpen 存在',
        description: '验证 SocketTask.onOpen 是否存在（预期未实现）',
        type: 'sync',
        run: (runtime) => {
          const exists =
            typeof runtime.SocketTask === 'function' &&
            typeof runtime.SocketTask.prototype?.onOpen === 'function';
          return { exists };
        },
        expect: { exists: false }
      },
      {
        id: 'ws-task-onMessage-exists',
        name: 'SocketTask.onMessage 存在',
        description: '验证 SocketTask.onMessage 是否存在（预期未实现）',
        type: 'sync',
        run: (runtime) => {
          const exists =
            typeof runtime.SocketTask === 'function' &&
            typeof runtime.SocketTask.prototype?.onMessage === 'function';
          return { exists };
        },
        expect: { exists: false }
      },
      {
        id: 'ws-task-onError-exists',
        name: 'SocketTask.onError 存在',
        description: '验证 SocketTask.onError 是否存在（预期未实现）',
        type: 'sync',
        run: (runtime) => {
          const exists =
            typeof runtime.SocketTask === 'function' &&
            typeof runtime.SocketTask.prototype?.onError === 'function';
          return { exists };
        },
        expect: { exists: false }
      },
      {
        id: 'ws-task-onClose-exists',
        name: 'SocketTask.onClose 存在',
        description: '验证 SocketTask.onClose 是否存在（预期未实现）',
        type: 'sync',
        run: (runtime) => {
          const exists =
            typeof runtime.SocketTask === 'function' &&
            typeof runtime.SocketTask.prototype?.onClose === 'function';
          return { exists };
        },
        expect: { exists: false }
      }
    ]
  }
];
