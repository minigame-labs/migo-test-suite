const wsEndpoint = 'ws://10.246.1.239:8767';

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export default [
  {
    name: 'migo.websocket.basic',
    category: 'network/websocket',
    tests: [
      {
        id: 'ws-connectSocket-exists',
        name: 'connectSocket 存在',
        description: '验证 connectSocket API 是否存在',
        type: 'sync',
        run: (runtime) => ({ exists: typeof runtime.connectSocket === 'function' }),
        expect: { exists: true }
      },
      {
        id: 'ws-global-apis-exist',
        name: '全局 WebSocket API 存在',
        description: '验证 on/off/send/close 全局 API 存在',
        type: 'sync',
        run: (runtime) => ({
          onOpen: typeof runtime.onSocketOpen === 'function',
          onMessage: typeof runtime.onSocketMessage === 'function',
          onError: typeof runtime.onSocketError === 'function',
          onClose: typeof runtime.onSocketClose === 'function',
          offOpen: typeof runtime.offSocketOpen === 'function',
          offMessage: typeof runtime.offSocketMessage === 'function',
          offError: typeof runtime.offSocketError === 'function',
          offClose: typeof runtime.offSocketClose === 'function',
          send: typeof runtime.sendSocketMessage === 'function',
          close: typeof runtime.closeSocket === 'function',
        }),
        expect: {
          onOpen: true, onMessage: true, onError: true, onClose: true,
          offOpen: true, offMessage: true, offError: true, offClose: true,
          send: true, close: true,
        }
      },
      {
        id: 'ws-connect-open-event',
        name: '连接并收到 onOpen',
        description: '连接 echo 服务并触发 SocketTask.onOpen',
        type: 'async',
        run: (runtime) => new Promise((resolve, reject) => {
          let opened = false;
          const task = runtime.connectSocket({
            url: `${wsEndpoint}/echo`,
            success: () => {},
            fail: reject
          });
          task.onOpen(() => {
            opened = true;
            resolve('PASS');
          });
          setTimeout(() => {
            if (!opened) reject('No onOpen within timeout');
          }, 3000);
        }),
        expect: 'PASS'
      }
    ]
  },
  {
    name: 'migo.websocket.messaging',
    category: 'network/websocket',
    tests: [
      {
        id: 'ws-task-text-echo',
        name: '任务文本消息 echo',
        description: 'SocketTask 发送字符串并收到同样的字符串',
        type: 'async',
        run: (runtime) => new Promise((resolve, reject) => {
          const task = runtime.connectSocket({
            url: `${wsEndpoint}/echo`,
            fail: reject
          });
          task.onOpen(() => {
            task.send({
              data: 'ping-text',
              fail: reject
            });
          });
          task.onMessage(({ data }) => {
            if (typeof data === 'string' && data === 'ping-text') {
              resolve('PASS');
            }
          });
          setTimeout(() => reject('No echo'), 4000);
        }),
        expect: 'PASS'
      },
      {
        id: 'ws-task-binary-echo',
        name: '任务二进制消息 echo',
        description: 'SocketTask 发送 ArrayBuffer 并收到相同二进制',
        type: 'async',
        run: (runtime) => new Promise((resolve, reject) => {
          const payload = new Uint8Array([1, 2, 3, 4, 5]).buffer;
          const task = runtime.connectSocket({
            url: `${wsEndpoint}/echo`,
            fail: reject
          });
          task.onOpen(() => {
            task.send({ data: payload, fail: reject });
          });
          task.onMessage(({ data }) => {
            if (data instanceof ArrayBuffer) {
              const recv = new Uint8Array(data);
              const expect = new Uint8Array(payload);
              if (recv.length === expect.length && recv.every((v, i) => v === expect[i])) {
                resolve('PASS');
              } else {
                reject('Binary mismatch');
              }
            }
          });
          setTimeout(() => reject('No echo'), 4000);
        }),
        expect: 'PASS'
      },
      {
        id: 'ws-global-send-echo',
        name: '全局 sendSocketMessage echo',
        description: '通过全局 API 发送字符串并收到 onSocketMessage',
        type: 'async',
        run: (runtime) => new Promise((resolve, reject) => {
          const task = runtime.connectSocket({ url: `${wsEndpoint}/echo`, fail: reject });
          const listener = ({ data }) => {
            if (data === 'g-echo') resolve('PASS');
          };
          runtime.onSocketMessage(listener);
          task.onOpen(() => {
            runtime.sendSocketMessage({ data: 'g-echo', fail: reject });
          });
          setTimeout(() => reject('No global echo'), 4000);
        }),
        expect: 'PASS'
      }
    ]
  },
  {
    name: 'migo.websocket.control',
    category: 'network/websocket',
    tests: [
      {
        id: 'ws-task-close',
        name: '任务关闭 onClose',
        description: '调用 SocketTask.close 触发 onClose 并 code=1000',
        type: 'async',
        run: (runtime) => new Promise((resolve, reject) => {
          const task = runtime.connectSocket({ url: `${wsEndpoint}/echo`, fail: reject });
          task.onOpen(() => {
            task.close({ code: 1000, reason: 'test' });
          });
          task.onClose(({ code }) => {
            if (code === 1000) resolve('PASS');
            else reject('Unexpected close code ' + code);
          });
          setTimeout(() => reject('No onClose'), 4000);
        }),
        expect: 'PASS'
      },
      {
        id: 'ws-global-off-message',
        name: '全局 offSocketMessage 移除监听',
        description: '移除监听后不再收到消息',
        type: 'async',
        run: (runtime) => new Promise((resolve, reject) => {
          const task = runtime.connectSocket({ url: `${wsEndpoint}/echo`, fail: reject });
          let count = 0;
          const listener = () => { count++; };
          runtime.onSocketMessage(listener);
          runtime.offSocketMessage(listener);
          task.onOpen(() => {
            runtime.sendSocketMessage({ data: 'should-not-count' });
          });
          wait(1500).then(() => {
            if (count === 0) resolve('PASS');
            else reject('Listener should have been removed');
          });
        }),
        expect: 'PASS'
      }
    ]
  }
];
