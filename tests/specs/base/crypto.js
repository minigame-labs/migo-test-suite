/**
 * 加密相关 API 测试
 * https://developers.weixin.qq.com/minigame/dev/api/base/crypto/wx.getUserCryptoManager.html
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
        expect: {}
      }
    ]
  }
];
