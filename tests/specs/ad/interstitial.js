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

const CREATE_API = 'createInterstitialAd';

const BASE_CREATE_OPTIONS = {
  adUnitId: 'adunit-test-interstitial'
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
    options: { adUnitId: 'adunit-test-interstitial' }
  },
  {
    caseId: 'alternative-id',
    options: { adUnitId: 'adunit-test-interstitial-alt' }
  }
];

function validateCreateOptions(options) {
  return isObject(options) && isString(options.adUnitId) && options.adUnitId.length > 0;
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
    name: 'migo.createInterstitialAd',
    category: 'ad',
    tests: [
      {
        id: 'migo.createInterstitialAd',
        name: '创建插屏广告实例',
        description: '验证 createInterstitialAd 返回 InterstitialAd 对象与方法集，并记录 raw',
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
        id: 'interstitial-create-parameter-matrix',
        name: 'createInterstitialAd 参数矩阵',
        description: '覆盖不同 adUnitId 参数创建实例，验证行为一致',
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
          scenarioCount: 2,
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
    name: 'InterstitialAd.load',
    category: 'ad',
    tests: [
      {
        id: 'interstitial.load',
        name: 'load Promise 返回契约',
        description: '验证 InterstitialAd.load 返回 Promise 并记录 raw',
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
        id: 'interstitial-load-outcome',
        name: 'load Promise 结果',
        description: '验证 InterstitialAd.load Promise 结果单一且可观测（resolve/reject/timeout）',
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
    name: 'InterstitialAd.show',
    category: 'ad',
    tests: [
      {
        id: 'interstitial.show',
        name: 'show Promise 返回契约',
        description: '验证 InterstitialAd.show 返回 Promise 并记录 raw',
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
        id: 'interstitial-show-outcome',
        name: 'show Promise 结果',
        description: '验证 InterstitialAd.show Promise 结果单一且可观测（resolve/reject/timeout）',
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
        id: 'interstitial-show-manual-positive',
        name: '正向功能验证（真实展示）',
        description: '手动场景：使用已配置且有广告填充的 interstitial adUnitId，先 load 再 show，验证真实展示成功',
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
    name: 'InterstitialAd.destroy',
    category: 'ad',
    tests: [
      {
        id: 'interstitial.destroy',
        name: '销毁插屏广告实例',
        description: '验证 InterstitialAd.destroy 可调用、非 Promise，并输出 raw',
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
    name: 'InterstitialAd.onLoad',
    category: 'ad',
    tests: [
      {
        id: 'interstitial.onLoad',
        name: 'onLoad 注册契约',
        description: '验证 InterstitialAd.onLoad 可注册监听，返回值非 Promise',
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
    name: 'InterstitialAd.offLoad',
    category: 'ad',
    tests: [
      {
        id: 'interstitial.offLoad',
        name: 'offLoad 取消监听契约',
        description: '验证 InterstitialAd.offLoad 支持传 listener 和不传 listener',
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
    name: 'InterstitialAd.onError',
    category: 'ad',
    tests: [
      {
        id: 'interstitial.onError',
        name: 'onError 注册契约',
        description: '验证 InterstitialAd.onError 可注册监听，返回值非 Promise',
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
    name: 'InterstitialAd.offError',
    category: 'ad',
    tests: [
      {
        id: 'interstitial.offError',
        name: 'offError 取消监听契约',
        description: '验证 InterstitialAd.offError 支持传 listener 和不传 listener',
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
    name: 'InterstitialAd.onClose',
    category: 'ad',
    tests: [
      {
        id: 'interstitial.onClose',
        name: 'onClose 注册契约',
        description: '验证 InterstitialAd.onClose 可注册监听，返回值非 Promise',
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
    name: 'InterstitialAd.offClose',
    category: 'ad',
    tests: [
      {
        id: 'interstitial.offClose',
        name: 'offClose 取消监听契约',
        description: '验证 InterstitialAd.offClose 支持传 listener 和不传 listener',
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
