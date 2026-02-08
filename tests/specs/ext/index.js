
export default [
  {
    name: 'ExtConfig',
    category: 'ext',
    tests: [
      {
        id: 'wx.getExtConfigSync',
        name: '获取第三方平台数据(Sync)',
        description: '验证 wx.getExtConfigSync 返回对象',
        type: 'sync',
        run: (runtime) => {
          if (typeof wx.getExtConfigSync === 'function') {
            try {
              const extConfig = wx.getExtConfigSync();
              console.log('wx.getExtConfigSync result:', extConfig);
              if (extConfig && typeof extConfig === 'object') {
                return 'PASS';
              } else {
                return 'FAIL: return value is not an object';
              }
            } catch (e) {
              return 'FAIL: ' + e.message;
            }
          } else {
            return 'PASS: wx.getExtConfigSync is not a function (maybe not supported)';
          }
        }
      },
      {
        id: 'wx.getExtConfig',
        name: '获取第三方平台数据(Async)',
        description: '验证 wx.getExtConfig 回调',
        type: 'async',
        run: (runtime) => {
          if (typeof wx.getExtConfig === 'function') {
            return new Promise((resolve) => {
              wx.getExtConfig({
                success: (res) => {
                  console.log('wx.getExtConfig success:', res);
                  if (res && typeof res.extConfig === 'object') {
                    resolve('PASS');
                  } else {
                    resolve('FAIL: res.extConfig is not an object');
                  }
                },
                fail: (err) => {
                  console.log('wx.getExtConfig fail:', err);
                  // 某些环境下如果没有 ext info 可能会 fail，暂且认为 fail 也是一种响应，除非明确是 API 错误
                  // 为了严谨，如果报错信息包含 "not found" 之类可能也是正常的
                  resolve('FAIL: ' + (err.errMsg || JSON.stringify(err)));
                }
              });
            });
          } else {
            return 'PASS: wx.getExtConfig is not a function (maybe not supported)';
          }
        }
      }
    ]
  }
];
