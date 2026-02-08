
export default [
  {
    name: 'migo.requestMidasFriendPayment',
    category: 'payment',
    tests: [
      {
        id: 'payment-001',
        name: '发起米大师朋友礼物索要',
        description: '验证 requestMidasFriendPayment 接口 (Deprecated)',
        type: 'async',
        run: (runtime, callback) => {
          if (typeof runtime.requestMidasFriendPayment !== 'function') {
            return callback({ _error: 'requestMidasFriendPayment 不存在' });
          }
          runtime.requestMidasFriendPayment({
            mode: 'game',
            env: 1, // Sandbox
            offerId: 'mock_offerId',
            currencyType: 'CNY',
            platform: 'android',
            buyQuantity: 10,
            zoneId: '1',
            outTradeNo: 'test_trade_no_' + Date.now(),
            nonceStr: 'random_nonce',
            timeStamp: Math.floor(Date.now() / 1000),
            signature: 'mock_signature',
            success: (res) => callback({ success: true, res }),
            fail: (err) => callback({ success: false, err })
          });
        },
        expect: {
          success: true,
          res: {
            errMsg: '@string',
            encryptedData: '@string',
            iv: '@string'
          }
        }
      }
    ]
  },
  {
    name: 'migo.requestMidasPayment',
    category: 'payment',
    tests: [
      {
        id: 'payment-002',
        name: '发起购买游戏币支付',
        description: '验证 requestMidasPayment 接口',
        type: 'async',
        run: (runtime, callback) => {
          if (typeof runtime.requestMidasPayment !== 'function') {
            return callback({ _error: 'requestMidasPayment 不存在' });
          }
          runtime.requestMidasPayment({
            mode: 'game',
            env: 1, // Sandbox
            offerId: 'mock_offerId',
            currencyType: 'CNY',
            platform: 'android',
            buyQuantity: 10,
            zoneId: '1',
            outTradeNo: 'test_trade_no_' + Date.now(),
            success: (res) => callback({ success: true, res }),
            fail: (err) => callback({ success: false, err })
          });
        },
        expect: {
          success: true,
          res: {
            errMsg: '@string'
          }
        }
      }
    ]
  },
  {
    name: 'migo.requestMidasPaymentGameItem',
    category: 'payment',
    tests: [
      {
        id: 'payment-003',
        name: '发起道具直购支付',
        description: '验证 requestMidasPaymentGameItem 接口',
        type: 'async',
        run: (runtime, callback) => {
          if (typeof runtime.requestMidasPaymentGameItem !== 'function') {
            return callback({ _error: 'requestMidasPaymentGameItem 不存在' });
          }
          runtime.requestMidasPaymentGameItem({
            mode: 'game',
            offerId: 'mock_offerId',
            buyQuantity: 1,
            env: 1, // Sandbox
            currencyType: 'CNY',
            platform: 'android',
            zoneId: '1',
            productId: 'test_product_id',
            goodsPrice: 100,
            outTradeNo: 'test_trade_no_' + Date.now(),
            paySig: 'mock_paySig',
            signature: 'mock_signature',
            success: (res) => callback({ success: true, res }),
            fail: (err) => callback({ success: false, err })
          });
        },
        expect: {
          success: true,
          res: {
            errMsg: '@string'
          }
        }
      }
    ]
  }
];
