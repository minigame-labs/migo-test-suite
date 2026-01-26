/**
 * 基础 API 测试用例
 */

export default [
  // ==================== migo.env ====================
  {
    name: 'migo.env',
    category: 'base',
    tests: [
      {
        id: 'env-001',
        name: 'env 对象存在',
        description: '验证 runtime.env 对象是否存在',
        type: 'sync',
        run: (runtime) => ({
          exists: typeof runtime.env === 'object',
          notNull: runtime.env !== null
        }),
        expect: {
          exists: true,
          notNull: true
        }
      },
      {
        id: 'env-002',
        name: 'USER_DATA_PATH 存在',
        description: '验证用户数据路径是否为有效字符串',
        type: 'sync',
        run: (runtime) => ({
          type: typeof runtime.env.USER_DATA_PATH,
          notEmpty: runtime.env.USER_DATA_PATH && runtime.env.USER_DATA_PATH.length > 0
        }),
        expect: {
          type: 'string',
          notEmpty: true
        }
      }
    ]
  },
  
  // ==================== getSystemInfo ====================
  {
    name: 'migo.getSystemInfo',
    category: 'base',
    tests: [
      {
        id: 'sysinfo-001',
        name: 'getSystemInfoSync 存在',
        description: '验证同步获取系统信息API是否存在',
        type: 'sync',
        run: (runtime) => ({
          exists: typeof runtime.getSystemInfoSync === 'function'
        }),
        expect: {
          exists: true
        }
      },
      {
        id: 'sysinfo-002',
        name: 'getSystemInfoSync 返回值',
        description: '验证系统信息包含必要字段，并捕获完整数据作为 baseline',
        type: 'sync',
        run: (runtime) => {
          const info = runtime.getSystemInfoSync();
          return {
            // 验证字段
            hasBrand: typeof info.brand === 'string',
            hasModel: typeof info.model === 'string',
            hasSystem: typeof info.system === 'string',
            hasPlatform: typeof info.platform === 'string',
            hasWindowWidth: typeof info.windowWidth === 'number',
            hasWindowHeight: typeof info.windowHeight === 'number',
            hasPixelRatio: typeof info.pixelRatio === 'number',
            // 捕获实际值用于 baseline 对比
            _raw: {
              brand: info.brand,
              model: info.model,
              system: info.system,
              platform: info.platform,
              version: info.version,
              SDKVersion: info.SDKVersion,
              language: info.language,
              windowWidth: info.windowWidth,
              windowHeight: info.windowHeight,
              screenWidth: info.screenWidth,
              screenHeight: info.screenHeight,
              pixelRatio: info.pixelRatio,
              statusBarHeight: info.statusBarHeight,
              safeArea: info.safeArea,
              deviceOrientation: info.deviceOrientation
            }
          };
        },
        expect: {
          hasBrand: true,
          hasModel: true,
          hasSystem: true,
          hasPlatform: true,
          hasWindowWidth: true,
          hasWindowHeight: true,
          hasPixelRatio: true
        },
        allowVariance: ['_raw']  // _raw 字段用于 baseline，不参与通过/失败判断
      },
      {
        id: 'sysinfo-003',
        name: 'getSystemInfo 异步',
        description: '验证异步获取系统信息',
        type: 'async',
        timeout: 3000,
        run: (runtime, done) => {
          runtime.getSystemInfo({
            success: (res) => {
              done({
                success: true,
                hasWindowWidth: typeof res.windowWidth === 'number'
              });
            },
            fail: (err) => {
              done({
                success: false,
                error: err.errMsg
              });
            }
          });
        },
        expect: {
          success: true,
          hasWindowWidth: true
        }
      }
    ]
  },
  
  // ==================== canIUse ====================
  {
    name: 'migo.canIUse',
    category: 'base',
    tests: [
      {
        id: 'caniuse-001',
        name: 'canIUse 存在',
        description: '验证 canIUse API 是否存在',
        type: 'sync',
        run: (runtime) => ({
          exists: typeof runtime.canIUse === 'function'
        }),
        expect: {
          exists: true
        }
      },
      {
        id: 'caniuse-002',
        name: 'canIUse 返回布尔值',
        description: '验证 canIUse 返回正确类型',
        type: 'sync',
        run: (runtime) => {
          if (typeof runtime.canIUse !== 'function') {
            return { apiNotFound: true };
          }
          const result = runtime.canIUse('getSystemInfo');
          return {
            returnType: typeof result,
            isBoolean: typeof result === 'boolean'
          };
        },
        expect: {
          isBoolean: true
        }
      }
    ]
  },
  
  // ==================== base64 转换 ====================
  {
    name: 'migo.base64',
    category: 'base',
    tests: [
      {
        id: 'base64-001',
        name: 'arrayBufferToBase64 存在',
        description: '验证 ArrayBuffer 转 Base64 API',
        type: 'sync',
        run: (runtime) => ({
          exists: typeof runtime.arrayBufferToBase64 === 'function'
        }),
        expect: {
          exists: true
        }
      },
      {
        id: 'base64-002',
        name: 'base64ToArrayBuffer 存在',
        description: '验证 Base64 转 ArrayBuffer API',
        type: 'sync',
        run: (runtime) => ({
          exists: typeof runtime.base64ToArrayBuffer === 'function'
        }),
        expect: {
          exists: true
        }
      },
      {
        id: 'base64-003',
        name: 'base64 双向转换',
        description: '验证 Base64 转换的正确性',
        type: 'sync',
        run: (runtime) => {
          if (typeof runtime.arrayBufferToBase64 !== 'function' ||
              typeof runtime.base64ToArrayBuffer !== 'function') {
            return { apiNotFound: true };
          }
          
          // 创建测试数据
          const testData = new Uint8Array([72, 101, 108, 108, 111]); // "Hello"
          const buffer = testData.buffer;
          
          // ArrayBuffer -> Base64
          const base64 = runtime.arrayBufferToBase64(buffer);
          
          // Base64 -> ArrayBuffer
          const resultBuffer = runtime.base64ToArrayBuffer(base64);
          const resultData = new Uint8Array(resultBuffer);
          
          // 验证
          let match = testData.length === resultData.length;
          for (let i = 0; i < testData.length && match; i++) {
            if (testData[i] !== resultData[i]) match = false;
          }
          
          return {
            base64Type: typeof base64,
            resultIsArrayBuffer: resultBuffer instanceof ArrayBuffer,
            dataMatch: match
          };
        },
        expect: {
          base64Type: 'string',
          resultIsArrayBuffer: true,
          dataMatch: true
        }
      }
    ]
  },
  
  // ==================== 生命周期 ====================
  {
    name: 'lifecycle',
    category: 'base',
    tests: [
      {
        id: 'lifecycle-001',
        name: 'onShow 存在',
        description: '验证 onShow 生命周期钩子',
        type: 'sync',
        run: (runtime) => ({
          exists: typeof runtime.onShow === 'function'
        }),
        expect: {
          exists: true
        }
      },
      {
        id: 'lifecycle-002',
        name: 'onHide 存在',
        description: '验证 onHide 生命周期钩子',
        type: 'sync',
        run: (runtime) => ({
          exists: typeof runtime.onHide === 'function'
        }),
        expect: {
          exists: true
        }
      },
      {
        id: 'lifecycle-003',
        name: 'offShow 存在',
        description: '验证 offShow 取消监听',
        type: 'sync',
        run: (runtime) => ({
          exists: typeof runtime.offShow === 'function'
        }),
        expect: {
          exists: true
        }
      },
      {
        id: 'lifecycle-004',
        name: 'offHide 存在',
        description: '验证 offHide 取消监听',
        type: 'sync',
        run: (runtime) => ({
          exists: typeof runtime.offHide === 'function'
        }),
        expect: {
          exists: true
        }
      }
    ]
  }
];
