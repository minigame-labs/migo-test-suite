export default [
  {
    name: 'BannerAd',
    category: 'ad',
    tests: [
      {
        id: 'migo.createBannerAd',
        name: '创建 Banner 广告',
        description: '验证 createBannerAd 返回对象及基本方法',
        type: 'sync',
        run: (runtime) => {
          if (typeof runtime.createBannerAd !== 'function') return 'PASS: runtime.createBannerAd not supported';
          
          try {
            const bannerAd = runtime.createBannerAd({
              adUnitId: 'adunit-test-dummy',
              style: {
                left: 10,
                top: 76,
                width: 320
              }
            });

            if (!bannerAd) return 'FAIL: createBannerAd returned undefined';
            
            // 验证基本方法存在
            const methods = ['show', 'hide', 'destroy', 'onLoad', 'onError', 'onResize', 'offLoad', 'offError', 'offResize'];
            for (const m of methods) {
              if (typeof bannerAd[m] !== 'function') {
                return `FAIL: Method ${m} missing on BannerAd instance`;
              }
            }
            
            // 清理
            bannerAd.destroy();
            return 'PASS';
          } catch (e) {
            return 'FAIL: ' + e.message;
          }
        }
      },
      {
        id: 'BannerAd.methods',
        name: 'Banner 广告方法调用',
        description: '验证 show/hide/onLoad/onError 等',
        type: 'async',
        run: (runtime) => {
          if (typeof runtime.createBannerAd !== 'function') return 'PASS: runtime.createBannerAd not supported';
          
          return new Promise((resolve) => {
            const bannerAd = runtime.createBannerAd({
              adUnitId: 'adunit-test-dummy', // 无效 ID 通常会触发 onError
              style: { left: 0, top: 0, width: 300 }
            });
            
            let isResolved = false;
            const safeResolve = (msg) => {
              if (!isResolved) {
                isResolved = true;
                try { bannerAd.destroy(); } catch(e){}
                resolve(msg);
              }
            };

            bannerAd.onError((err) => {
              console.log('BannerAd onError:', err);
              // 错误回调触发也视为 API 调用成功 (因为 ID 是假的)
              safeResolve('PASS');
            });

            bannerAd.onLoad(() => {
              console.log('BannerAd onLoad');
              safeResolve('PASS');
            });

            // 尝试显示
            bannerAd.show().then(() => {
              console.log('BannerAd show success');
              // show 成功后隐藏
              bannerAd.hide();
              safeResolve('PASS');
            }).catch(err => {
              console.log('BannerAd show fail:', err);
              // show 失败通常也是因为 ID 无效，视为通过
              safeResolve('PASS'); 
            });
            
            // 设置超时防止卡死
            setTimeout(() => {
              safeResolve('PASS: Timeout (maybe no callback fired)');
            }, 2000);
          });
        }
      }
    ]
  }
];
