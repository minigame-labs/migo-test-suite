export default [
  {
    name: 'migo.getBatteryInfoSync',
    category: 'base',
    tests: [
      {
        id: 'migo.getBatteryInfoSync',
        name: '同步电量信息',
        description: '校验 level 在 1-100，充电与省电模式为布尔值',
        type: 'sync',
        run: (runtime) => {
          if (typeof runtime.getBatteryInfoSync !== 'function') {
            return { _error: 'getBatteryInfoSync 不存在' };
          }
          const res = runtime.getBatteryInfoSync();
          const levelNum = Number(res?.level);
          const validLevel = Number.isFinite(levelNum) && levelNum >= 1 && levelNum <= 100;
          const validCharging = typeof res?.isCharging === 'boolean';
          const validLowPower = typeof res?.isLowPowerModeEnabled === 'boolean';
          return {
            validLevel,
            validCharging,
            validLowPower,
            level: levelNum,
            isCharging: res?.isCharging,
            isLowPowerModeEnabled: res?.isLowPowerModeEnabled
          };
        },
        expect: {}
      }
    ]
  },
  {
    name: 'migo.getBatteryInfo',
    category: 'base',
    tests: [
      {
        id: 'migo.getBatteryInfo',
        name: '异步电量信息',
        description: '校验回调结果 level 在 1-100，充电与省电模式为布尔值',
        type: 'async',
        run: (runtime) => new Promise((resolve) => {
          if (typeof runtime.getBatteryInfo !== 'function') {
            resolve({ _error: 'getBatteryInfo 不存在' });
            return;
          }
          runtime.getBatteryInfo({
            success: (res) => {
              const levelNum = Number(res?.level);
              const validLevel = Number.isFinite(levelNum) && levelNum >= 1 && levelNum <= 100;
              const validCharging = typeof res?.isCharging === 'boolean';
              const validLowPower = typeof res?.isLowPowerModeEnabled === 'boolean';
              if (validLevel && validCharging && validLowPower) resolve('PASS');
              else resolve('FAIL');
            },
            fail: () => resolve('FAIL')
          });
        }),
        expect: 'PASS'
      }
    ]
  }
];
