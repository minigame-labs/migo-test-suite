
export default [
  // --- TCPSocket ---
  {
    name: 'migo.createTCPSocket',
    category: 'network/tcp',
    tests: [
      {
        id: 'network-tcp-001',
        name: '创建 TCPSocket',
        description: '验证 createTCPSocket 接口',
        type: 'sync',
        run: (runtime) => {
          if (typeof runtime.createTCPSocket !== 'function') {
            return { _error: 'createTCPSocket 不存在' };
          }
          try {
            const tcp = runtime.createTCPSocket();
            return { success: true, hasTcp: !!tcp };
          } catch (e) {
            return { success: false, error: e.message };
          }
        },
        expect: {
          success: true,
          hasTcp: true
        }
      }
    ]
  },
  {
    name: 'TCPSocket.connect',
    category: 'network/tcp',
    tests: [
      {
        id: 'network-tcp-002',
        name: 'TCPSocket 连接',
        description: '验证 connect 接口',
        type: 'async', // Connect is async but returns nothing, usually triggers onConnect
        run: (runtime, callback) => {
          if (typeof runtime.createTCPSocket !== 'function') return callback({ _error: 'createTCPSocket 不存在' });
          const tcp = runtime.createTCPSocket();
          if (!tcp || typeof tcp.connect !== 'function') return callback({ _error: 'TCPSocket.connect 不存在' });

          // Mock connect
          try {
            tcp.connect({ address: '127.0.0.1', port: 8080 });
            callback({ success: true });
          } catch (e) {
            callback({ success: false, error: e.message });
          }
        },
        expect: {
          success: true
        }
      }
    ]
  },
  {
    name: 'TCPSocket.write',
    category: 'network/tcp',
    tests: [
      {
        id: 'network-tcp-003',
        name: 'TCPSocket 发送数据',
        description: '验证 write 接口',
        type: 'sync',
        run: (runtime) => {
          if (typeof runtime.createTCPSocket !== 'function') return { _error: 'createTCPSocket 不存在' };
          const tcp = runtime.createTCPSocket();
          if (!tcp || typeof tcp.write !== 'function') return { _error: 'TCPSocket.write 不存在' };

          try {
            tcp.write('test data');
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
    name: 'TCPSocket.close',
    category: 'network/tcp',
    tests: [
      {
        id: 'network-tcp-004',
        name: 'TCPSocket 关闭连接',
        description: '验证 close 接口',
        type: 'sync',
        run: (runtime) => {
          if (typeof runtime.createTCPSocket !== 'function') return { _error: 'createTCPSocket 不存在' };
          const tcp = runtime.createTCPSocket();
          if (!tcp || typeof tcp.close !== 'function') return { _error: 'TCPSocket.close 不存在' };

          try {
            tcp.close();
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
    name: 'TCPSocket.bindWifi',
    category: 'network/tcp',
    tests: [
      {
        id: 'network-tcp-005',
        name: 'TCPSocket 绑定 Wifi',
        description: '验证 bindWifi 接口',
        type: 'sync', // Docs say returns nothing, triggers onBindWifi
        run: (runtime) => {
          if (typeof runtime.createTCPSocket !== 'function') return { _error: 'createTCPSocket 不存在' };
          const tcp = runtime.createTCPSocket();
          if (!tcp || typeof tcp.bindWifi !== 'function') {
             // Optional API on some platforms, but we test existence if expected
             return { _error: 'TCPSocket.bindWifi 不存在' };
          }

          try {
            tcp.bindWifi({ BSSID: 'test_bssid' });
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
    name: 'TCPSocket Events',
    category: 'network/tcp',
    tests: [
      {
        id: 'network-tcp-006',
        name: 'TCPSocket 事件监听与取消',
        description: '验证 on/off Connect, Close, Error, Message, BindWifi',
        type: 'sync',
        run: (runtime) => {
          if (typeof runtime.createTCPSocket !== 'function') return { _error: 'createTCPSocket 不存在' };
          const tcp = runtime.createTCPSocket();
          
          const methods = [
            'onConnect', 'offConnect',
            'onClose', 'offClose',
            'onError', 'offError',
            'onMessage', 'offMessage',
            'onBindWifi', 'offBindWifi'
          ];
          
          const missing = methods.filter(m => typeof tcp[m] !== 'function');
          
          if (missing.length > 0) {
            return { _error: `Missing methods: ${missing.join(', ')}` };
          }

          try {
            const listener = () => {};
            methods.forEach(m => {
              if (m.startsWith('on')) tcp[m](listener);
              if (m.startsWith('off')) tcp[m](listener);
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
