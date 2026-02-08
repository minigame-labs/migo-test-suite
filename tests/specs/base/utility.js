/**
 * 基础工具 API 测试
 * canIUse / base64 转换等
 */

export default [
  {
    name: 'migo.canIUse',
    category: 'base',
    tests: [
      {
        id: 'caniuse-001',
        name: 'canIUse 测试',
        description: '测试 canIUse 对常用 API 的返回结果',
        type: 'sync',
        run: (runtime) => {
          if (typeof runtime.canIUse !== 'function') {
            return { _error: 'canIUse 不存在' };
          }
          return {
            getSystemInfo: runtime.canIUse('getSystemInfo'),
            getSystemInfoSync: runtime.canIUse('getSystemInfoSync'),
            getFileSystemManager: runtime.canIUse('getFileSystemManager'),
            createInnerAudioContext: runtime.canIUse('createInnerAudioContext'),
            getStorageSync: runtime.canIUse('getStorageSync')
          };
        },
        expect: {
          getSystemInfo: true,
          getSystemInfoSync: true,
          getFileSystemManager: true,
          createInnerAudioContext: true,
          getStorageSync: true
        }
      }
    ]
  },

  {
    name: 'migo.base64',
    category: 'base',
    tests: [
      {
        id: 'base64-001',
        name: 'base64 转换测试',
        description: '测试 arrayBufferToBase64 和 base64ToArrayBuffer 的转换',
        type: 'sync',
        run: (runtime) => {
          const hasArrayBufferToBase64 = typeof runtime.arrayBufferToBase64 === 'function';
          const hasBase64ToArrayBuffer = typeof runtime.base64ToArrayBuffer === 'function';

          if (!hasArrayBufferToBase64 || !hasBase64ToArrayBuffer) {
            return {
              hasArrayBufferToBase64,
              hasBase64ToArrayBuffer,
              _error: 'API 不完整'
            };
          }

          // 测试数据 "Hello"
          const testData = new Uint8Array([72, 101, 108, 108, 111]);
          const base64 = runtime.arrayBufferToBase64(testData.buffer);
          const resultBuffer = runtime.base64ToArrayBuffer(base64);
          const resultData = new Uint8Array(resultBuffer);

          let match = testData.length === resultData.length;
          for (let i = 0; i < testData.length && match; i++) {
            if (testData[i] !== resultData[i]) match = false;
          }

          return {
            hasArrayBufferToBase64,
            hasBase64ToArrayBuffer,
            base64Result: base64,
            roundTripMatch: match
          };
        },
        expect: {
          hasArrayBufferToBase64: true,
          hasBase64ToArrayBuffer: true,
          base64Result: 'SGVsbG8=',
          roundTripMatch: true
        }
      }
    ]
  }
];
