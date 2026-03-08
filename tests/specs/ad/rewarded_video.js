import {
  isObject,
  isString,
  isFiniteNumber,
  runCreateAdContract,
  runCreateAdScenarioMatrix,
  runInstanceMethodReturnContract,
  runPromiseMethodOutcome,
  runAdShowWorkManual,
  runOnListenerContract,
  runOffListenerContract
} from './_helpers.js';

const CREATE_API = 'createRewardedVideoAd';

const BASE_CREATE_OPTIONS = {
  adUnitId: 'adunit-test-rewarded-video'
};

const REQUIRED_METHODS = [
  'show',
  'load',
  'destroy',
  'onLoad',
  'onError',
  'onClose',
  'offLoad',
  'offError',
  'offClose'
];

const CREATE_SCENARIOS = [
  {
    caseId: 'basic',
    options: { adUnitId: 'adunit-test-rewarded-video' }
  },
  {
    caseId: 'multiton-enabled',
    options: { adUnitId: 'adunit-test-rewarded-video', multiton: true }
  },
  {
    caseId: 'disable-fallback-share-page',
    options: { adUnitId: 'adunit-test-rewarded-video', disableFallbackSharePage: true }
  }
];

function validateCreateOptions(options) {
  if (!isObject(options) || !isString(options.adUnitId) || options.adUnitId.length === 0) {
    return false;
  }

  const multitonValidOrMissing = typeof options.multiton === 'undefined' || typeof options.multiton === 'boolean';
  const disableFallbackSharePageValidOrMissing = typeof options.disableFallbackSharePage === 'undefined'
    || typeof options.disableFallbackSharePage === 'boolean';

  return multitonValidOrMissing && disableFallbackSharePageValidOrMissing;
}

function validateRejectedPayload(payload) {
  if (typeof payload === 'undefined' || payload === null) {
    return true;
  }
  if (isString(payload)) {
    return true;
  }
  if (!isObject(payload)) {
    return false;
  }

  const errMsgValidOrMissing = typeof payload.errMsg === 'undefined' || isString(payload.errMsg);
  const errCodeValidOrMissing = typeof payload.errCode === 'undefined' || isFiniteNumber(payload.errCode);
  return errMsgValidOrMissing && errCodeValidOrMissing;
}

export default [
  {
    name: 'migo.createRewardedVideoAd',
    category: 'ad',
    tests: [
      {
        id: 'migo.createRewardedVideoAd',
        name: '创建激励视频广告实例',
        description: '验证 createRewardedVideoAd 返回 RewardedVideoAd 对象与方法集，并记录 raw',
        type: 'sync',
        run: (runtime) => runCreateAdContract(runtime, {
          createApiName: CREATE_API,
          createOptions: BASE_CREATE_OPTIONS,
          requiredMethods: REQUIRED_METHODS
        }),
        expect: {
          apiExists: true,
          createThrew: false,
          returnThenable: false,
          instanceObjectValid: true,
          requiredMethodsValid: true,
          raw: '@exists'
        }
      },
      {
        id: 'rewarded-create-parameter-matrix',
        name: 'createRewardedVideoAd 参数矩阵',
        description: '覆盖 multiton/disableFallbackSharePage 参数组合，验证创建行为一致',
        type: 'sync',
        run: (runtime) => {
          const matrix = runCreateAdScenarioMatrix(runtime, {
            createApiName: CREATE_API,
            requiredMethods: REQUIRED_METHODS,
            scenarios: CREATE_SCENARIOS
          });

          if (matrix._error) {
            return matrix;
          }

          return {
            ...matrix,
            allOptionsValid: CREATE_SCENARIOS.every((item) => validateCreateOptions(item.options))
          };
        },
        expect: {
          scenarioCount: 3,
          allOptionsValid: true,
          allCreateSucceeded: true,
          allReturnNonPromise: true,
          allInstanceObjectValid: true,
          allRequiredMethodsValid: true,
          raw: '@exists'
        },
        allowVariance: ['scenarios']
      }
    ]
  },

  {
    name: 'RewardedVideoAd.load',
    category: 'ad',
    tests: [
      {
        id: 'rewarded.load',
        name: 'load Promise 返回契约',
        description: '验证 RewardedVideoAd.load 返回 Promise 并记录 raw',
        type: 'sync',
        run: (runtime) => runInstanceMethodReturnContract(runtime, {
          createApiName: CREATE_API,
          createOptions: BASE_CREATE_OPTIONS,
          methodName: 'load',
          invoke: (adInstance) => adInstance.load()
        }),
        expect: {
          methodExists: true,
          invocationThrew: false,
          invocationSucceeded: true,
          returnThenable: true,
          raw: '@exists'
        },
        allowVariance: ['error', 'afterInvokeError']
      },
      {
        id: 'rewarded-load-outcome',
        name: 'load Promise 结果',
        description: '验证 RewardedVideoAd.load Promise 结果单一且可观测（resolve/reject/timeout）',
        type: 'async',
        timeout: 14000,
        run: (runtime) => runPromiseMethodOutcome(runtime, {
          createApiName: CREATE_API,
          createOptions: BASE_CREATE_OPTIONS,
          methodName: 'load',
          invoke: (adInstance) => adInstance.load(),
          timeoutMs: 10000,
          validateRejectedPayload
        }),
        expect: {
          methodExists: true,
          invocationThrew: false,
          returnThenable: true,
          outcomeSingle: true,
          settledOrTimeout: true,
          rejectedPayloadValidOrNoReject: true
        },
        allowVariance: ['promiseResolved', 'promiseRejected', 'timeout', 'raw']
      }
    ]
  },

  {
    name: 'RewardedVideoAd.show',
    category: 'ad',
    tests: [
      {
        id: 'rewarded.show',
        name: 'show Promise 返回契约',
        description: '验证 RewardedVideoAd.show 返回 Promise 并记录 raw',
        type: 'sync',
        run: (runtime) => runInstanceMethodReturnContract(runtime, {
          createApiName: CREATE_API,
          createOptions: BASE_CREATE_OPTIONS,
          methodName: 'show',
          invoke: (adInstance) => adInstance.show()
        }),
        expect: {
          methodExists: true,
          invocationThrew: false,
          invocationSucceeded: true,
          returnThenable: true,
          raw: '@exists'
        },
        allowVariance: ['error', 'afterInvokeError']
      },
      {
        id: 'rewarded-show-outcome',
        name: 'show Promise 结果',
        description: '验证 RewardedVideoAd.show Promise 结果单一且可观测（resolve/reject/timeout）',
        type: 'async',
        timeout: 15000,
        run: (runtime) => runPromiseMethodOutcome(runtime, {
          createApiName: CREATE_API,
          createOptions: BASE_CREATE_OPTIONS,
          methodName: 'show',
          invoke: (adInstance) => adInstance.show(),
          timeoutMs: 11000,
          validateRejectedPayload
        }),
        expect: {
          methodExists: true,
          invocationThrew: false,
          returnThenable: true,
          outcomeSingle: true,
          settledOrTimeout: true,
          rejectedPayloadValidOrNoReject: true
        },
        allowVariance: ['promiseResolved', 'promiseRejected', 'timeout', 'raw']
      },
      {
        id: 'rewarded-show-manual-positive',
        name: '正向功能验证（真实展示）',
        description: '手动场景：使用已配置且有广告填充的 rewarded adUnitId，先 load 再 show，验证真实展示成功',
        type: 'async',
        timeout: 36000,
        automation: 'manual',
        manualRequired: true,
        unsupportedPolicy: 'skip',
        run: (runtime) => runAdShowWorkManual(runtime, {
          createApiName: CREATE_API,
          createOptions: BASE_CREATE_OPTIONS,
          requireLoad: true,
          loadTimeoutMs: 16000,
          showTimeoutMs: 22000
        }),
        expect: {
          adUnitConfigured: true,
          apiExists: true,
          createThrew: false,
          loadInvoked: true,
          loadInvokeThrew: false,
          loadReturnThenable: true,
          loadResolved: true,
          loadRejected: false,
          loadTimeout: false,
          showInvoked: true,
          showInvokeThrew: false,
          showReturnThenable: true,
          showResolved: true,
          showRejected: false,
          showTimeout: false,
          workSucceeded: true,
          raw: '@exists'
        },
        allowVariance: ['loadRaw', 'showRaw']
      }
    ]
  },

  {
    name: 'RewardedVideoAd.destroy',
    category: 'ad',
    tests: [
      {
        id: 'rewarded.destroy',
        name: '销毁激励视频广告实例',
        description: '验证 RewardedVideoAd.destroy 可调用、非 Promise，并输出 raw',
        type: 'sync',
        run: (runtime) => runInstanceMethodReturnContract(runtime, {
          createApiName: CREATE_API,
          createOptions: BASE_CREATE_OPTIONS,
          methodName: 'destroy',
          invoke: (adInstance) => adInstance.destroy()
        }),
        expect: {
          methodExists: true,
          invocationThrew: false,
          invocationSucceeded: true,
          returnThenable: false,
          raw: '@exists'
        },
        allowVariance: ['error']
      }
    ]
  },

  {
    name: 'RewardedVideoAd.onLoad',
    category: 'ad',
    tests: [
      {
        id: 'rewarded.onLoad',
        name: 'onLoad 注册契约',
        description: '验证 RewardedVideoAd.onLoad 可注册监听，返回值非 Promise',
        type: 'sync',
        run: (runtime) => runOnListenerContract(runtime, {
          createApiName: CREATE_API,
          createOptions: BASE_CREATE_OPTIONS,
          onMethodName: 'onLoad',
          offMethodName: 'offLoad'
        }),
        expect: {
          methodExists: true,
          registerThrew: false,
          registerSucceeded: true,
          registerReturnThenable: false,
          unregisterWorkedOrUnsupported: true,
          unregisterReturnThenable: false,
          raw: '@exists'
        },
        allowVariance: ['error']
      }
    ]
  },

  {
    name: 'RewardedVideoAd.offLoad',
    category: 'ad',
    tests: [
      {
        id: 'rewarded.offLoad',
        name: 'offLoad 取消监听契约',
        description: '验证 RewardedVideoAd.offLoad 支持传 listener 和不传 listener',
        type: 'sync',
        run: (runtime) => runOffListenerContract(runtime, {
          createApiName: CREATE_API,
          createOptions: BASE_CREATE_OPTIONS,
          onMethodName: 'onLoad',
          offMethodName: 'offLoad'
        }),
        expect: {
          offWithListenerThrew: false,
          offWithoutListenerThrew: false,
          registerSucceededOrOffSupported: true,
          offWithListenerReturnThenable: false,
          offWithoutListenerReturnThenable: false,
          raw: '@exists'
        },
        allowVariance: ['error', 'registerThrew']
      }
    ]
  },

  {
    name: 'RewardedVideoAd.onError',
    category: 'ad',
    tests: [
      {
        id: 'rewarded.onError',
        name: 'onError 注册契约',
        description: '验证 RewardedVideoAd.onError 可注册监听，返回值非 Promise',
        type: 'sync',
        run: (runtime) => runOnListenerContract(runtime, {
          createApiName: CREATE_API,
          createOptions: BASE_CREATE_OPTIONS,
          onMethodName: 'onError',
          offMethodName: 'offError'
        }),
        expect: {
          methodExists: true,
          registerThrew: false,
          registerSucceeded: true,
          registerReturnThenable: false,
          unregisterWorkedOrUnsupported: true,
          unregisterReturnThenable: false,
          raw: '@exists'
        },
        allowVariance: ['error']
      }
    ]
  },

  {
    name: 'RewardedVideoAd.offError',
    category: 'ad',
    tests: [
      {
        id: 'rewarded.offError',
        name: 'offError 取消监听契约',
        description: '验证 RewardedVideoAd.offError 支持传 listener 和不传 listener',
        type: 'sync',
        run: (runtime) => runOffListenerContract(runtime, {
          createApiName: CREATE_API,
          createOptions: BASE_CREATE_OPTIONS,
          onMethodName: 'onError',
          offMethodName: 'offError'
        }),
        expect: {
          offWithListenerThrew: false,
          offWithoutListenerThrew: false,
          registerSucceededOrOffSupported: true,
          offWithListenerReturnThenable: false,
          offWithoutListenerReturnThenable: false,
          raw: '@exists'
        },
        allowVariance: ['error', 'registerThrew']
      }
    ]
  },

  {
    name: 'RewardedVideoAd.onClose',
    category: 'ad',
    tests: [
      {
        id: 'rewarded.onClose',
        name: 'onClose 注册契约',
        description: '验证 RewardedVideoAd.onClose 可注册监听，返回值非 Promise',
        type: 'sync',
        run: (runtime) => runOnListenerContract(runtime, {
          createApiName: CREATE_API,
          createOptions: BASE_CREATE_OPTIONS,
          onMethodName: 'onClose',
          offMethodName: 'offClose'
        }),
        expect: {
          methodExists: true,
          registerThrew: false,
          registerSucceeded: true,
          registerReturnThenable: false,
          unregisterWorkedOrUnsupported: true,
          unregisterReturnThenable: false,
          raw: '@exists'
        },
        allowVariance: ['error']
      }
    ]
  },

  {
    name: 'RewardedVideoAd.offClose',
    category: 'ad',
    tests: [
      {
        id: 'rewarded.offClose',
        name: 'offClose 取消监听契约',
        description: '验证 RewardedVideoAd.offClose 支持传 listener 和不传 listener',
        type: 'sync',
        run: (runtime) => runOffListenerContract(runtime, {
          createApiName: CREATE_API,
          createOptions: BASE_CREATE_OPTIONS,
          onMethodName: 'onClose',
          offMethodName: 'offClose'
        }),
        expect: {
          offWithListenerThrew: false,
          offWithoutListenerThrew: false,
          registerSucceededOrOffSupported: true,
          offWithListenerReturnThenable: false,
          offWithoutListenerReturnThenable: false,
          raw: '@exists'
        },
        allowVariance: ['error', 'registerThrew']
      }
    ]
  }
];
