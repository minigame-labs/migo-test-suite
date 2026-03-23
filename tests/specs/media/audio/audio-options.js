/**
 * 音频选项 API 测试
 * 覆盖: getAvailableAudioSources, setInnerAudioOption
 */

import {
  runOptionApiContract,
  probePromiseSupport,
  isObject
} from '../../_shared/runtime-helpers.js';

export default [
  {
    name: 'migo.getAvailableAudioSources',
    category: 'media/audio',
    tests: [
      {
        id: 'media-getAvailableAudioSources-exists',
        name: 'getAvailableAudioSources API 存在',
        description: '验证 getAvailableAudioSources 函数存在',
        type: 'sync',
        run: (runtime) => ({ exists: typeof runtime.getAvailableAudioSources === 'function' }),
        expect: { exists: true }
      },
      {
        id: 'media-getAvailableAudioSources-contract',
        name: 'getAvailableAudioSources 回调契约',
        description: '验证 success 回调返回 audioSources 数组',
        type: 'async',
        run: (runtime) => runOptionApiContract(runtime, 'getAvailableAudioSources', {
          validateSuccessPayload: (res) =>
            isObject(res) && Array.isArray(res.audioSources)
        }),
        expect: {
          apiExists: true,
          threw: false,
          successCalled: true,
          completeCalled: true,
          completeAfterOutcome: true,
          multipleOutcomeCallbacks: false,
          successPayloadValid: true
        },
        allowVariance: ['successCalled', 'successPayloadValid']
      },
      {
        id: 'media-getAvailableAudioSources-promise',
        name: 'getAvailableAudioSources Promise 支持',
        description: '探测是否支持 Promise 风格调用',
        type: 'sync',
        run: (runtime) => probePromiseSupport(runtime, 'getAvailableAudioSources'),
        expect: {
          apiExists: true,
          threw: false,
          promiseStyleSupported: true
        }
      }
    ]
  },
  {
    name: 'migo.setInnerAudioOption',
    category: 'media/audio',
    tests: [
      {
        id: 'media-setInnerAudioOption-exists',
        name: 'setInnerAudioOption API 存在',
        description: '验证 setInnerAudioOption 函数存在',
        type: 'sync',
        run: (runtime) => ({ exists: typeof runtime.setInnerAudioOption === 'function' }),
        expect: { exists: true }
      },
      {
        id: 'media-setInnerAudioOption-mixWithOther',
        name: 'setInnerAudioOption mixWithOther',
        description: '设置 mixWithOther=true 允许与其他音频混合',
        type: 'async',
        run: (runtime) => runOptionApiContract(runtime, 'setInnerAudioOption', {
          args: { mixWithOther: true }
        }),
        expect: {
          apiExists: true,
          threw: false,
          successCalled: true,
          completeCalled: true,
          completeAfterOutcome: true,
          multipleOutcomeCallbacks: false
        },
        allowVariance: ['successCalled', 'failCalled']
      },
      {
        id: 'media-setInnerAudioOption-obeyMuteSwitch',
        name: 'setInnerAudioOption obeyMuteSwitch',
        description: '设置 obeyMuteSwitch=false 静音模式下仍播放',
        type: 'async',
        run: (runtime) => runOptionApiContract(runtime, 'setInnerAudioOption', {
          args: { obeyMuteSwitch: false }
        }),
        expect: {
          apiExists: true,
          threw: false,
          completeCalled: true,
          completeAfterOutcome: true,
          multipleOutcomeCallbacks: false
        },
        allowVariance: ['successCalled', 'failCalled']
      },
      {
        id: 'media-setInnerAudioOption-promise',
        name: 'setInnerAudioOption Promise 支持',
        description: '探测是否支持 Promise 风格调用',
        type: 'sync',
        run: (runtime) => probePromiseSupport(runtime, 'setInnerAudioOption', { mixWithOther: false }),
        expect: {
          apiExists: true,
          threw: false
        }
      }
    ]
  }
];
