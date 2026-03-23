/**
 * 订阅消息 API 测试
 * 覆盖: requestSubscribeMessage, requestSubscribeSystemMessage
 */

import {
  runOptionApiContract,
  probePromiseSupport
} from '../_shared/runtime-helpers.js';

export default [
  {
    name: 'migo.requestSubscribeMessage',
    category: 'subscribe-message',
    tests: [
      {
        id: 'subscribe-msg-request-exists',
        name: 'requestSubscribeMessage API 存在',
        description: '验证 requestSubscribeMessage 函数存在',
        type: 'sync',
        run: (runtime) => ({ exists: typeof runtime.requestSubscribeMessage === 'function' }),
        expect: { exists: true }
      },
      {
        id: 'subscribe-msg-request-contract',
        name: 'requestSubscribeMessage 回调契约',
        description: '验证传入 tmplIds 后 success/fail/complete 回调',
        type: 'async',
        run: (runtime) => runOptionApiContract(runtime, 'requestSubscribeMessage', {
          args: { tmplIds: ['test-tmpl-id-001'] }
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
        id: 'subscribe-msg-request-promise',
        name: 'requestSubscribeMessage Promise 支持',
        description: '探测是否支持 Promise 风格调用',
        type: 'sync',
        run: (runtime) => probePromiseSupport(runtime, 'requestSubscribeMessage', {
          tmplIds: ['test-tmpl-id-001']
        }),
        expect: {
          apiExists: true,
          threw: false
        }
      }
    ]
  },
  {
    name: 'migo.requestSubscribeSystemMessage',
    category: 'subscribe-message',
    tests: [
      {
        id: 'subscribe-msg-system-exists',
        name: 'requestSubscribeSystemMessage API 存在',
        description: '验证 requestSubscribeSystemMessage 函数存在',
        type: 'sync',
        run: (runtime) => ({ exists: typeof runtime.requestSubscribeSystemMessage === 'function' }),
        expect: { exists: true }
      },
      {
        id: 'subscribe-msg-system-contract',
        name: 'requestSubscribeSystemMessage 回调契约',
        description: '验证传入 msgTypeList 后回调',
        type: 'async',
        run: (runtime) => runOptionApiContract(runtime, 'requestSubscribeSystemMessage', {
          args: { msgTypeList: ['SYS_MSG_TYPE_INTERACTIVE'] }
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
        id: 'subscribe-msg-system-promise',
        name: 'requestSubscribeSystemMessage Promise 支持',
        description: '探测是否支持 Promise 风格调用',
        type: 'sync',
        run: (runtime) => probePromiseSupport(runtime, 'requestSubscribeSystemMessage', {
          msgTypeList: ['SYS_MSG_TYPE_INTERACTIVE']
        }),
        expect: {
          apiExists: true,
          threw: false
        }
      }
    ]
  }
];
