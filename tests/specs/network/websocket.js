import { getEndpoint } from '../../config.js';

const wsEndpoint = () => getEndpoint("ws");

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
            url: `${wsEndpoint()}/echo`,
            success: () => { },
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
            url: `${wsEndpoint()}/echo`,
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
            url: `${wsEndpoint()}/echo`,
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
          const task = runtime.connectSocket({ url: `${wsEndpoint()}/echo`, fail: reject });
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
          const task = runtime.connectSocket({ url: `${wsEndpoint()}/echo`, fail: reject });
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
          const task = runtime.connectSocket({ url: `${wsEndpoint()}/echo`, fail: reject });
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
      },
      {
        id: 'ws-task-close-non1000',
        name: '非 1000 关闭码',
        description: '使用自定义关闭码 (4000) 并验证 onClose 回调携带该码',
        type: 'async',
        run: (runtime) => new Promise((resolve, reject) => {
          const task = runtime.connectSocket({ url: `${wsEndpoint()}/echo`, fail: reject });
          task.onOpen(() => {
            task.close({ code: 4000, reason: 'custom close' });
          });
          task.onClose(({ code }) => {
            if (code === 4000) resolve('PASS');
            else reject('Unexpected close code ' + code);
          });
          setTimeout(() => reject('No onClose'), 4000);
        }),
        expect: 'PASS'
      }
    ]
  },
  // 协议与高级连接场景
  {
    name: 'migo.websocket.advanced',
    category: 'network/websocket',
    tests: [
      {
        id: 'ws-protocols-param',
        name: 'protocols 子协议参数',
        description: '验证 connectSocket 接受 protocols 参数',
        type: 'async',
        run: (runtime) => new Promise((resolve, reject) => {
          const task = runtime.connectSocket({
            url: `${wsEndpoint()}/echo`,
            protocols: ['protocol-a'],
            fail: reject
          });
          task.onOpen(() => {
            resolve('PASS');
            task.close({ code: 1000 });
          });
          setTimeout(() => reject('No onOpen with protocols'), 4000);
        }),
        expect: 'PASS'
      },
      {
        id: 'ws-custom-header',
        name: 'header 自定义握手头',
        description: '验证 connectSocket 接受 header 参数',
        type: 'async',
        run: (runtime) => new Promise((resolve, reject) => {
          const task = runtime.connectSocket({
            url: `${wsEndpoint()}/echo`,
            header: { 'X-Migo-WS-Test': 'HeaderVal' },
            fail: reject
          });
          task.onOpen(() => {
            resolve('PASS');
            task.close({ code: 1000 });
          });
          setTimeout(() => reject('No onOpen with header'), 4000);
        }),
        expect: 'PASS'
      },
      {
        id: 'ws-multiple-connections',
        name: '多 SocketTask 并发',
        description: '同时创建两个 WebSocket 连接',
        type: 'async',
        run: (runtime) => new Promise((resolve, reject) => {
          let openCount = 0;
          const checkDone = () => {
            openCount++;
            if (openCount === 2) resolve('PASS');
          };
          const task1 = runtime.connectSocket({ url: `${wsEndpoint()}/echo`, fail: reject });
          const task2 = runtime.connectSocket({ url: `${wsEndpoint()}/echo`, fail: reject });
          task1.onOpen(() => {
            checkDone();
            task1.close({ code: 1000 });
          });
          task2.onOpen(() => {
            checkDone();
            task2.close({ code: 1000 });
          });
          setTimeout(() => reject(`Only ${openCount}/2 connections opened`), 6000);
        }),
        expect: 'PASS'
      },
      {
        id: 'ws-onError-event',
        name: 'onError 事件',
        description: '连接无效地址触发 onError',
        type: 'async',
        run: (runtime) => new Promise((resolve, reject) => {
          const task = runtime.connectSocket({
            url: 'ws://127.0.0.1:1/invalid',
            fail: () => resolve('PASS')
          });
          if (task && typeof task.onError === 'function') {
            task.onError(() => resolve('PASS'));
          }
          setTimeout(() => reject('No error for invalid connection'), 5000);
        }),
        expect: 'PASS'
      }
    ]
  }
];
