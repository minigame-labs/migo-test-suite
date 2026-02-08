/**
 * 加密相关 API 测试
 */

export default [
  {
    name: 'migo.getUserCryptoManager',
    category: 'base',
    tests: [
      {
        id: 'crypto-001',
        name: '获取用户加密管理器',
        description: '验证 getUserCryptoManager 返回的加密管理器对象',
        type: 'sync',
        run: (runtime) => {
          if (typeof runtime.getUserCryptoManager !== 'function') {
            return { _error: 'getUserCryptoManager 不存在' };
          }
          const manager = runtime.getUserCryptoManager();
          return {
            hasGetLatestUserKey: typeof manager.getLatestUserKey === 'function',
            hasGetRandomValues: typeof manager.getRandomValues === 'function'
          };
        },
        expect: {
          hasGetLatestUserKey: true,
          hasGetRandomValues: true
        }
      }
    ]
  },
  {
    name: 'UserCryptoManager.getLatestUserKey',
    category: 'base',
    tests: [
      {
        id: 'crypto-002',
        name: '获取最新用户密钥',
        description: '验证 getLatestUserKey 接口回调',
        type: 'async',
        timeout: 5000,
        run: (runtime, callback) => {
          if (typeof runtime.getUserCryptoManager !== 'function') return callback({ _error: 'API missing' });
          const manager = runtime.getUserCryptoManager();
          if (typeof manager.getLatestUserKey !== 'function') return callback({ _error: 'getLatestUserKey missing' });

          manager.getLatestUserKey({
            success: (res) => {
              callback({ success: true, res });
            },
            fail: (err) => {
              callback({ success: false, err });
            }
          });
        },
        expect: {
          success: true,
          res: {
            encryptKey: '@string',
            iv: '@string',
            version: '@number',
            expireTime: '@number'
          }
        }
      }
    ]
  },
  {
    name: 'UserCryptoManager.getRandomValues',
    category: 'base',
    tests: [
      {
        id: 'crypto-003',
        name: '获取随机数',
        description: '验证 getRandomValues 接口返回 ArrayBuffer',
        type: 'async',
        timeout: 5000,
        run: (runtime, callback) => {
          if (typeof runtime.getUserCryptoManager !== 'function') return callback({ _error: 'API missing' });
          const manager = runtime.getUserCryptoManager();
          if (typeof manager.getRandomValues !== 'function') return callback({ _error: 'getRandomValues missing' });

          manager.getRandomValues({
            length: 16,
            success: (res) => {
              callback({ success: true, res });
            },
            fail: (err) => {
              callback({ success: false, err });
            }
          });
        },
        expect: {
          success: true,
          res: {
            randomValues: '@ArrayBuffer'
          }
        }
      }
    ]
  }
];
