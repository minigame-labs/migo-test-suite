/**
 * 生命周期 API 测试
 * https://developers.weixin.qq.com/minigame/dev/api/base/app/life-cycle/wx.onShow.html
 */

export default [
  {
    name: 'migo.lifecycle',
    category: 'base',
    tests: [
      {
        id: 'lifecycle-001',
        name: '生命周期 API 检测',
        description: '检测生命周期相关 API 是否存在',
        type: 'sync',
        run: (runtime) => ({
          onShow: typeof runtime.onShow === 'function',
          offShow: typeof runtime.offShow === 'function',
          onHide: typeof runtime.onHide === 'function',
          offHide: typeof runtime.offHide === 'function',
          onAudioInterruptionBegin: typeof runtime.onAudioInterruptionBegin === 'function',
          offAudioInterruptionBegin: typeof runtime.offAudioInterruptionBegin === 'function',
          onAudioInterruptionEnd: typeof runtime.onAudioInterruptionEnd === 'function',
          offAudioInterruptionEnd: typeof runtime.offAudioInterruptionEnd === 'function',
          onError: typeof runtime.onError === 'function',
          offError: typeof runtime.offError === 'function'
        }),
        expect: {}
      }
    ]
  },

  {
    name: 'migo.getLaunchOptionsSync',
    category: 'base',
    tests: [
      {
        id: 'launch-001',
        name: '获取启动参数',
        description: '通过 getLaunchOptionsSync 获取小游戏启动参数',
        type: 'sync',
        run: (runtime) => {
          if (typeof runtime.getLaunchOptionsSync !== 'function') {
            return { _error: 'getLaunchOptionsSync 不存在' };
          }
          return runtime.getLaunchOptionsSync();
        },
        expect: {}
      }
    ]
  },

  {
    name: 'migo.getEnterOptionsSync',
    category: 'base',
    tests: [
      {
        id: 'enter-001',
        name: '获取进入参数',
        description: '通过 getEnterOptionsSync 获取小游戏进入前台的参数',
        type: 'sync',
        run: (runtime) => {
          if (typeof runtime.getEnterOptionsSync !== 'function') {
            return { _error: 'getEnterOptionsSync 不存在' };
          }
          return runtime.getEnterOptionsSync();
        },
        expect: {}
      }
    ]
  }
];
