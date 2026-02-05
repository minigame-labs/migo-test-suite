export default [
  {
    name: 'migo.gamepad',
    category: 'device',
    tests: [
      {
        id: 'migo.getGamepads',
        name: '获取游戏手柄信息',
        description: '获取游戏手柄信息',
        type: 'sync',
        run: (runtime) => {
          if (typeof runtime.getGamepads !== 'function') return { exists: false };
          const pads = runtime.getGamepads();
          return { exists: true, isArray: Array.isArray(pads) };
        },
        expect: { exists: true }
      },
      {
        id: 'migo.onGamepadConnected',
        name: '监听游戏手柄连接',
        description: '验证 onGamepadConnected 接口存在性',
        type: 'sync',
        run: (runtime) => {
          if (typeof runtime.onGamepadConnected !== 'function') return { exists: false };
          runtime.onGamepadConnected(() => {});
          return { exists: true };
        },
        expect: { exists: true }
      },
      {
        id: 'migo.onGamepadDisconnected',
        name: '监听游戏手柄断开',
        description: '验证 onGamepadDisconnected 接口存在性',
        type: 'sync',
        run: (runtime) => {
          if (typeof runtime.onGamepadDisconnected !== 'function') return { exists: false };
          runtime.onGamepadDisconnected(() => {});
          return { exists: true };
        },
        expect: { exists: true }
      },
      {
        id: 'migo.offGamepadConnected',
        name: '取消监听游戏手柄连接',
        description: '验证 offGamepadConnected 接口存在性',
        type: 'sync',
        run: (runtime) => {
          if (typeof runtime.offGamepadConnected !== 'function') return { exists: false };
          runtime.offGamepadConnected(() => {});
          return { exists: true };
        },
        expect: { exists: true }
      },
      {
        id: 'migo.offGamepadDisconnected',
        name: '取消监听游戏手柄断开',
        description: '验证 offGamepadDisconnected 接口存在性',
        type: 'sync',
        run: (runtime) => {
          if (typeof runtime.offGamepadDisconnected !== 'function') return { exists: false };
          runtime.offGamepadDisconnected(() => {});
          return { exists: true };
        },
        expect: { exists: true }
      }
    ]
  }
];
