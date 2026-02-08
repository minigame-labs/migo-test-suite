
export default [
  // --- UDPSocket ---
  {
    name: 'migo.createUDPSocket',
    category: 'network/udp',
    tests: [
      {
        id: 'network-udp-001',
        name: '创建 UDPSocket',
        description: '验证 createUDPSocket 接口',
        type: 'sync',
        run: (runtime) => {
          if (typeof runtime.createUDPSocket !== 'function') {
            return { _error: 'createUDPSocket 不存在' };
          }
          try {
            const udp = runtime.createUDPSocket();
            return { success: true, hasUdp: !!udp };
          } catch (e) {
            return { success: false, error: e.message };
          }
        },
        expect: {
          success: true,
          hasUdp: true
        }
      }
    ]
  },
  {
    name: 'UDPSocket.bind',
    category: 'network/udp',
    tests: [
      {
        id: 'network-udp-002',
        name: 'UDPSocket 绑定端口',
        description: '验证 bind 接口',
        type: 'sync', // Returns number (port)
        run: (runtime) => {
          if (typeof runtime.createUDPSocket !== 'function') return { _error: 'createUDPSocket 不存在' };
          const udp = runtime.createUDPSocket();
          if (!udp || typeof udp.bind !== 'function') return { _error: 'UDPSocket.bind 不存在' };

          try {
            const port = udp.bind(); // Random port
            return { success: true, portType: typeof port };
          } catch (e) {
            return { success: false, error: e.message };
          }
        },
        expect: {
          success: true,
          portType: 'number'
        }
      }
    ]
  },
  {
    name: 'UDPSocket.connect',
    category: 'network/udp',
    tests: [
      {
        id: 'network-udp-003',
        name: 'UDPSocket 连接',
        description: '验证 connect 接口',
        type: 'sync',
        run: (runtime) => {
            if (typeof runtime.createUDPSocket !== 'function') return { _error: 'createUDPSocket 不存在' };
            const udp = runtime.createUDPSocket();
            if (!udp || typeof udp.connect !== 'function') return { _error: 'UDPSocket.connect 不存在' };
  
            try {
              udp.connect({ address: '127.0.0.1', port: 8080 });
              return { success: true };
            } catch (e) {
              return { success: false, error: e.message };
            }
        },
        expect: {
          success: true
        }
      }
    ]
  },
  {
    name: 'UDPSocket.send',
    category: 'network/udp',
    tests: [
      {
        id: 'network-udp-004',
        name: 'UDPSocket 发送数据 (send)',
        description: '验证 send 接口',
        type: 'sync',
        run: (runtime) => {
          if (typeof runtime.createUDPSocket !== 'function') return { _error: 'createUDPSocket 不存在' };
          const udp = runtime.createUDPSocket();
          if (!udp || typeof udp.send !== 'function') return { _error: 'UDPSocket.send 不存在' };

          try {
            udp.send({
                address: '127.0.0.1',
                port: 8080,
                message: 'test'
            });
            return { success: true };
          } catch (e) {
            return { success: false, error: e.message };
          }
        },
        expect: {
          success: true
        }
      }
    ]
  },
    {
    name: 'UDPSocket.write',
    category: 'network/udp',
    tests: [
      {
        id: 'network-udp-005',
        name: 'UDPSocket 发送数据 (write)',
        description: '验证 write 接口',
        type: 'sync',
        run: (runtime) => {
          if (typeof runtime.createUDPSocket !== 'function') return { _error: 'createUDPSocket 不存在' };
          const udp = runtime.createUDPSocket();
          // connect first usually required for write? Docs say connect() + write()
          if (!udp || typeof udp.write !== 'function') return { _error: 'UDPSocket.write 不存在' };

          try {
             if (udp.connect) udp.connect({ address: '127.0.0.1', port: 8080 });
             udp.write('test');
             return { success: true };
          } catch (e) {
            return { success: false, error: e.message };
          }
        },
        expect: {
          success: true
        }
      }
    ]
  },
  {
    name: 'UDPSocket.close',
    category: 'network/udp',
    tests: [
      {
        id: 'network-udp-006',
        name: 'UDPSocket 关闭',
        description: '验证 close 接口',
        type: 'sync',
        run: (runtime) => {
          if (typeof runtime.createUDPSocket !== 'function') return { _error: 'createUDPSocket 不存在' };
          const udp = runtime.createUDPSocket();
          if (!udp || typeof udp.close !== 'function') return { _error: 'UDPSocket.close 不存在' };

          try {
            udp.close();
            return { success: true };
          } catch (e) {
            return { success: false, error: e.message };
          }
        },
        expect: {
          success: true
        }
      }
    ]
  },
   {
    name: 'UDPSocket.setTTL',
    category: 'network/udp',
    tests: [
      {
        id: 'network-udp-007',
        name: 'UDPSocket 设置 TTL',
        description: '验证 setTTL 接口',
        type: 'sync',
        run: (runtime) => {
          if (typeof runtime.createUDPSocket !== 'function') return { _error: 'createUDPSocket 不存在' };
          const udp = runtime.createUDPSocket();
          if (!udp || typeof udp.setTTL !== 'function') return { _error: 'UDPSocket.setTTL 不存在' };

          try {
            udp.setTTL(64);
            return { success: true };
          } catch (e) {
            return { success: false, error: e.message };
          }
        },
        expect: {
          success: true
        }
      }
    ]
  },
  {
    name: 'UDPSocket Events',
    category: 'network/udp',
    tests: [
      {
        id: 'network-udp-008',
        name: 'UDPSocket 事件监听与取消',
        description: '验证 on/off Close, Error, Message, Listening',
        type: 'sync',
        run: (runtime) => {
          if (typeof runtime.createUDPSocket !== 'function') return { _error: 'createUDPSocket 不存在' };
          const udp = runtime.createUDPSocket();
          
          const methods = [
            'onClose', 'offClose',
            'onError', 'offError',
            'onMessage', 'offMessage',
            'onListening', 'offListening'
          ];
          
          const missing = methods.filter(m => typeof udp[m] !== 'function');
          
          if (missing.length > 0) {
            return { _error: `Missing methods: ${missing.join(', ')}` };
          }

          try {
            const listener = () => {};
            methods.forEach(m => {
              if (m.startsWith('on')) udp[m](listener);
              if (m.startsWith('off')) udp[m](listener);
            });
            return { success: true };
          } catch (e) {
            return { success: false, error: e.message };
          }
        },
        expect: {
          success: true
        }
      }
    ]
  }
];
