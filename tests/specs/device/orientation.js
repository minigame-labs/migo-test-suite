/**
 * 设备方向（转屏）API 测试
 * 覆盖: setDeviceOrientation, onDeviceOrientationChange, offDeviceOrientationChange
 */

import {
  runOptionApiContract,
  probePromiseSupport,
  runGlobalOnRegisterContract,
  runGlobalOffContract
} from '../_shared/runtime-helpers.js';

export default [
  {
    name: 'migo.setDeviceOrientation',
    category: 'device/orientation',
    tests: [
      {
        id: 'device-orientation-set-exists',
        name: 'setDeviceOrientation API 存在',
        description: '验证 setDeviceOrientation 函数存在',
        type: 'sync',
        run: (runtime) => ({ exists: typeof runtime.setDeviceOrientation === 'function' }),
        expect: { exists: true }
      },
      {
        id: 'device-orientation-set-portrait',
        name: 'setDeviceOrientation portrait',
        description: '设置设备方向为竖屏',
        type: 'async',
        run: (runtime) => runOptionApiContract(runtime, 'setDeviceOrientation', {
          args: { value: 'portrait' }
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
        id: 'device-orientation-set-landscape',
        name: 'setDeviceOrientation landscape',
        description: '设置设备方向为横屏',
        type: 'async',
        run: (runtime) => runOptionApiContract(runtime, 'setDeviceOrientation', {
          args: { value: 'landscape' }
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
        id: 'device-orientation-set-promise',
        name: 'setDeviceOrientation Promise 支持',
        description: '探测是否支持 Promise 风格调用',
        type: 'sync',
        run: (runtime) => probePromiseSupport(runtime, 'setDeviceOrientation', { value: 'portrait' }),
        expect: {
          apiExists: true,
          threw: false
        }
      }
    ]
  },
  {
    name: 'migo.onDeviceOrientationChange',
    category: 'device/orientation',
    tests: [
      {
        id: 'device-orientation-on-register',
        name: 'onDeviceOrientationChange 注册',
        description: '验证 onDeviceOrientationChange 注册监听契约',
        type: 'sync',
        run: (runtime) => runGlobalOnRegisterContract(
          runtime,
          'onDeviceOrientationChange',
          'offDeviceOrientationChange'
        ),
        expect: {
          apiExists: true,
          registerThrew: false,
          registerReturnThenable: false,
          unregisterWorkedOrUnsupported: true
        }
      },
      {
        id: 'device-orientation-off-contract',
        name: 'offDeviceOrientationChange 注销',
        description: '验证 offDeviceOrientationChange 注销监听契约（含指定 listener 和无参清除）',
        type: 'sync',
        run: (runtime) => runGlobalOffContract(
          runtime,
          'onDeviceOrientationChange',
          'offDeviceOrientationChange'
        ),
        expect: {
          registerThrew: false,
          offWithListenerThrew: false,
          offWithoutListenerThrew: false,
          registerSucceededOrOffSupported: true
        }
      }
    ]
  }
];
