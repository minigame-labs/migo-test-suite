
export default [
  {
    name: 'migo.getFuzzyLocation',
    category: 'device/location',
    tests: [
      {
        id: 'device-location-001',
        name: '获取模糊地理位置',
        description: '验证 getFuzzyLocation 接口',
        type: 'async',
        run: (runtime, callback) => {
          if (typeof runtime.getFuzzyLocation !== 'function') {
            return callback({ _error: 'getFuzzyLocation 不存在' });
          }
          runtime.getFuzzyLocation({
            type: 'wgs84',
            success: (res) => callback({ success: true, res }),
            fail: (err) => callback({ success: false, error: err.errMsg || err })
          });
        },
        expect: {
          success: true,
          res: {
            latitude: '@number',
            longitude: '@number'
          }
        }
      }
    ]
  },
  {
    name: 'migo.getLocation',
    category: 'device/location',
    tests: [
      {
        id: 'device-location-002',
        name: '获取精准地理位置',
        description: '验证 getLocation 接口',
        type: 'async',
        run: (runtime, callback) => {
          if (typeof runtime.getLocation !== 'function') {
            return callback({ _error: 'getLocation 不存在' });
          }
          runtime.getLocation({
            type: 'gcj02',
            success: (res) => callback({ success: true, res }),
            fail: (err) => callback({ success: false, error: err.errMsg || err })
          });
        },
        expect: {
          success: true,
          res: {
            latitude: '@number',
            longitude: '@number',
            speed: '@number',
            accuracy: '@number'
          }
        }
      }
    ]
  }
];
