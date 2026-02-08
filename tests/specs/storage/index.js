
export default [
  // --- Storage KV ---
  {
    name: 'migo.setStorage',
    category: 'storage',
    tests: [
      {
        id: 'storage-001',
        name: '异步设置缓存',
        description: '验证 setStorage 接口',
        type: 'async',
        run: (runtime, callback) => {
          if (typeof runtime.setStorage !== 'function') {
            return callback({ _error: 'setStorage 不存在' });
          }
          runtime.setStorage({
            key: 'test_key_async',
            data: 'test_data_async',
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
    name: 'migo.setStorageSync',
    category: 'storage',
    tests: [
      {
        id: 'storage-002',
        name: '同步设置缓存',
        description: '验证 setStorageSync 接口',
        type: 'sync',
        run: (runtime) => {
          if (typeof runtime.setStorageSync !== 'function') {
            return { _error: 'setStorageSync 不存在' };
          }
          try {
            runtime.setStorageSync('test_key_sync', 'test_data_sync');
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
    name: 'migo.getStorage',
    category: 'storage',
    tests: [
      {
        id: 'storage-003',
        name: '异步获取缓存',
        description: '验证 getStorage 接口',
        type: 'async',
        run: (runtime, callback) => {
          if (typeof runtime.getStorage !== 'function') {
            return callback({ _error: 'getStorage 不存在' });
          }
          // Ensure data exists first (using sync if available, or just rely on previous test order/mock)
          // Ideally each test is self-contained. Let's set then get.
          const key = 'test_key_get_async';
          const data = 'test_data_get_async';
          
          const doSet = (cb) => {
             if (runtime.setStorage) {
                 runtime.setStorage({ key, data, success: cb, fail: cb });
             } else {
                 cb();
             }
          };

          doSet(() => {
              runtime.getStorage({
                key: key,
                success: (res) => callback({ success: true, data: res.data, res }),
                fail: (err) => callback({ success: false, err })
              });
          });
        },
        expect: {
          success: true,
          data: 'test_data_get_async',
          res: {
            errMsg: '@string'
          }
        }
      }
    ]
  },
  {
    name: 'migo.getStorageSync',
    category: 'storage',
    tests: [
      {
        id: 'storage-004',
        name: '同步获取缓存',
        description: '验证 getStorageSync 接口',
        type: 'sync',
        run: (runtime) => {
          if (typeof runtime.getStorageSync !== 'function') {
            return { _error: 'getStorageSync 不存在' };
          }
          const key = 'test_key_get_sync';
          const data = 'test_data_get_sync';
          if (runtime.setStorageSync) {
            runtime.setStorageSync(key, data);
          }
          try {
            const result = runtime.getStorageSync(key);
            return { success: true, data: result };
          } catch (e) {
            return { success: false, error: e.message };
          }
        },
        expect: {
          success: true,
          data: 'test_data_get_sync'
        }
      }
    ]
  },
  {
    name: 'migo.getStorageInfo',
    category: 'storage',
    tests: [
      {
        id: 'storage-005',
        name: '异步获取缓存信息',
        description: '验证 getStorageInfo 接口',
        type: 'async',
        run: (runtime, callback) => {
          if (typeof runtime.getStorageInfo !== 'function') {
            return callback({ _error: 'getStorageInfo 不存在' });
          }
          runtime.getStorageInfo({
            success: (res) => callback({ success: true, res }),
            fail: (err) => callback({ success: false, err })
          });
        },
        expect: {
          success: true,
          res: {
            keys: '@array',
            currentSize: '@number',
            limitSize: '@number',
            errMsg: '@string'
          }
        }
      }
    ]
  },
  {
    name: 'migo.getStorageInfoSync',
    category: 'storage',
    tests: [
      {
        id: 'storage-006',
        name: '同步获取缓存信息',
        description: '验证 getStorageInfoSync 接口',
        type: 'sync',
        run: (runtime) => {
          if (typeof runtime.getStorageInfoSync !== 'function') {
            return { _error: 'getStorageInfoSync 不存在' };
          }
          try {
            const res = runtime.getStorageInfoSync();
            return { success: true, res };
          } catch (e) {
            return { success: false, error: e.message };
          }
        },
        expect: {
          success: true,
          res: {
            keys: '@array',
            currentSize: '@number',
            limitSize: '@number'
          }
        }
      }
    ]
  },
  {
    name: 'migo.removeStorage',
    category: 'storage',
    tests: [
      {
        id: 'storage-007',
        name: '异步移除缓存',
        description: '验证 removeStorage 接口',
        type: 'async',
        run: (runtime, callback) => {
          if (typeof runtime.removeStorage !== 'function') {
            return callback({ _error: 'removeStorage 不存在' });
          }
          const key = 'test_key_remove_async';
          if (runtime.setStorageSync) runtime.setStorageSync(key, 'data');

          runtime.removeStorage({
            key: key,
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
    name: 'migo.removeStorageSync',
    category: 'storage',
    tests: [
      {
        id: 'storage-008',
        name: '同步移除缓存',
        description: '验证 removeStorageSync 接口',
        type: 'sync',
        run: (runtime) => {
          if (typeof runtime.removeStorageSync !== 'function') {
            return { _error: 'removeStorageSync 不存在' };
          }
          const key = 'test_key_remove_sync';
          if (runtime.setStorageSync) runtime.setStorageSync(key, 'data');
          
          try {
            runtime.removeStorageSync(key);
            // Verify removal
            const val = runtime.getStorageSync ? runtime.getStorageSync(key) : '';
            return { success: true, val };
          } catch (e) {
            return { success: false, error: e.message };
          }
        },
        expect: {
          success: true,
          val: '' // Empty string or undefined depending on impl
        }
      }
    ]
  },
  {
    name: 'migo.clearStorage',
    category: 'storage',
    tests: [
      {
        id: 'storage-009',
        name: '异步清理缓存',
        description: '验证 clearStorage 接口',
        type: 'async',
        run: (runtime, callback) => {
          if (typeof runtime.clearStorage !== 'function') {
            return callback({ _error: 'clearStorage 不存在' });
          }
          runtime.clearStorage({
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
    name: 'migo.clearStorageSync',
    category: 'storage',
    tests: [
      {
        id: 'storage-010',
        name: '同步清理缓存',
        description: '验证 clearStorageSync 接口',
        type: 'sync',
        run: (runtime) => {
          if (typeof runtime.clearStorageSync !== 'function') {
            return { _error: 'clearStorageSync 不存在' };
          }
          try {
            runtime.clearStorageSync();
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
  // --- Buffer URL ---
  {
    name: 'migo.createBufferURL',
    category: 'storage',
    tests: [
      {
        id: 'storage-011',
        name: '创建 Buffer URL',
        description: '验证 createBufferURL 接口',
        type: 'sync',
        run: (runtime) => {
          if (typeof runtime.createBufferURL !== 'function') {
            return { _error: 'createBufferURL 不存在' };
          }
          try {
            const buffer = new ArrayBuffer(8);
            const url = runtime.createBufferURL(buffer);
            return { success: true, url, isString: typeof url === 'string' };
          } catch (e) {
            return { success: false, error: e.message };
          }
        },
        expect: {
          success: true,
          isString: true
        }
      }
    ]
  },
  {
    name: 'migo.revokeBufferURL',
    category: 'storage',
    tests: [
      {
        id: 'storage-012',
        name: '销毁 Buffer URL',
        description: '验证 revokeBufferURL 接口',
        type: 'sync',
        run: (runtime) => {
          if (typeof runtime.revokeBufferURL !== 'function') {
            return { _error: 'revokeBufferURL 不存在' };
          }
          try {
            // Need a URL to revoke
            const buffer = new ArrayBuffer(8);
            const url = runtime.createBufferURL ? runtime.createBufferURL(buffer) : 'blob:mock_url';
            runtime.revokeBufferURL(url);
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
  // --- Background Fetch ---
  {
    name: 'migo.getBackgroundFetchToken',
    category: 'storage',
    tests: [
      {
        id: 'storage-013',
        name: '获取预拉取 Token',
        description: '验证 getBackgroundFetchToken 接口',
        type: 'async',
        run: (runtime, callback) => {
          if (typeof runtime.getBackgroundFetchToken !== 'function') {
            return callback({ _error: 'getBackgroundFetchToken 不存在' });
          }
          runtime.getBackgroundFetchToken({
            success: (res) => callback({ success: true, res }),
            fail: (err) => callback({ success: false, err })
          });
        },
        expect: {
          success: true,
          res: {
            token: '@string',
            errMsg: '@string'
          }
        }
      }
    ]
  },
  {
    name: 'migo.setBackgroundFetchToken',
    category: 'storage',
    tests: [
      {
        id: 'storage-014',
        name: '设置预拉取 Token',
        description: '验证 setBackgroundFetchToken 接口',
        type: 'async',
        run: (runtime, callback) => {
          if (typeof runtime.setBackgroundFetchToken !== 'function') {
            return callback({ _error: 'setBackgroundFetchToken 不存在' });
          }
          runtime.setBackgroundFetchToken({
            token: 'test_token_' + Date.now(),
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
    name: 'migo.getBackgroundFetchData',
    category: 'storage',
    tests: [
      {
        id: 'storage-015',
        name: '获取预拉取数据',
        description: '验证 getBackgroundFetchData 接口',
        type: 'async',
        run: (runtime, callback) => {
          if (typeof runtime.getBackgroundFetchData !== 'function') {
            return callback({ _error: 'getBackgroundFetchData 不存在' });
          }
          runtime.getBackgroundFetchData({
            fetchType: 'pre',
            success: (res) => callback({ success: true, res }),
            fail: (err) => callback({ success: false, err })
          });
        },
        expect: {
          success: true,
          res: {
            fetchedData: '@string',
            timeStamp: '@number',
            path: '@string',
            query: '@string',
            scene: '@number',
            errMsg: '@string'
          }
        }
      }
    ]
  },
  {
    name: 'migo.onBackgroundFetchData',
    category: 'storage',
    tests: [
      {
        id: 'storage-016',
        name: '监听预拉取数据',
        description: '验证 onBackgroundFetchData 接口',
        type: 'event',
        timeout: 3000,
        run: (runtime, callback) => {
          if (typeof runtime.onBackgroundFetchData !== 'function') {
            return callback({ _error: 'onBackgroundFetchData 不存在' });
          }
          const listener = (res) => {
            callback({ triggered: true, res });
          };
          runtime.onBackgroundFetchData(listener);
          // Can't easily trigger this from user side, so we verify registration success mostly
          // or simulate if possible. For now, we assume registration is the test.
          callback({ registered: true });
        },
        expect: {
          registered: true
        }
      }
    ]
  }
];
