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

const CREATE_API = 'createBannerAd';

const BASE_CREATE_OPTIONS = {
  adUnitId: 'adunit-test-banner',
  style: {
    left: 0,
    top: 0,
    width: 300,
    height: 120
  }
};

const REQUIRED_METHODS = [
  'show',
  'hide',
  'destroy',
  'onLoad',
  'onError',
  'onResize',
  'offLoad',
  'offError',
  'offResize'
];

const CREATE_SCENARIOS = [
  {
    caseId: 'default-style',
    options: {
      adUnitId: 'adunit-test-banner',
      style: { left: 0, top: 0, width: 300, height: 120 }
    }
  },
  {
    caseId: 'with-adIntervals-30',
    options: {
      adUnitId: 'adunit-test-banner',
      adIntervals: 30,
      style: { left: 10, top: 20, width: 320, height: 128 }
    }
  },
  {
    caseId: 'with-adIntervals-60',
    options: {
      adUnitId: 'adunit-test-banner',
      adIntervals: 60,
      style: { left: 6, top: 40, width: 280, height: 100 }
    }
  }
];

function validateCreateOptions(options) {
  if (!isObject(options) || !isString(options.adUnitId) || options.adUnitId.length === 0) {
    return false;
  }

  if (typeof options.adIntervals !== 'undefined') {
    if (!isFiniteNumber(options.adIntervals) || options.adIntervals < 30) {
      return false;
    }
  }

  const style = options.style;
  if (!isObject(style)) {
    return false;
  }

  return isFiniteNumber(style.left)
    && isFiniteNumber(style.top)
    && isFiniteNumber(style.width)
    && isFiniteNumber(style.height);
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
  return typeof payload.errMsg === 'undefined' || isString(payload.errMsg);
}

export default [
  {
    name: 'migo.createBannerAd',
    category: 'ad',
    tests: [
      {
        id: 'migo.createBannerAd',
        name: '创建 Banner 广告实例',
        description: '验证 createBannerAd 返回 BannerAd 对象、方法集完整，并输出 raw',
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
        id: 'banner-create-parameter-matrix',
        name: 'createBannerAd 参数矩阵',
        description: '覆盖 adIntervals 与 style 参数组合，验证不同参数创建结果一致性',
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
    name: 'BannerAd.show',
    category: 'ad',
    tests: [
      {
        id: 'banner.show',
        name: 'show Promise 返回契约',
        description: '验证 BannerAd.show 返回 Promise 并记录 raw',
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
        id: 'banner-show-outcome',
        name: 'show Promise 结果',
        description: '验证 BannerAd.show Promise 结果单一且结果/超时可观测',
        type: 'async',
        timeout: 14000,
        run: (runtime) => runPromiseMethodOutcome(runtime, {
          createApiName: CREATE_API,
          createOptions: BASE_CREATE_OPTIONS,
          methodName: 'show',
          invoke: (adInstance) => adInstance.show(),
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
      },
      {
        id: 'banner-show-manual-positive',
        name: '正向功能验证（真实展示）',
        description: '手动场景：使用已配置且有广告填充的 banner adUnitId，验证 BannerAd.show 真实展示成功',
        type: 'async',
        timeout: 30000,
        automation: 'manual',
        manualRequired: true,
        unsupportedPolicy: 'skip',
        run: (runtime) => runAdShowWorkManual(runtime, {
          createApiName: CREATE_API,
          createOptions: BASE_CREATE_OPTIONS,
          requireLoad: false,
          showTimeoutMs: 22000
        }),
        expect: {
          adUnitConfigured: true,
          apiExists: true,
          createThrew: false,
          showInvoked: true,
          showInvokeThrew: false,
          showReturnThenable: true,
          showResolved: true,
          showRejected: false,
          showTimeout: false,
          workSucceeded: true,
          raw: '@exists'
        },
        allowVariance: ['loadInvoked', 'loadResolved', 'loadRejected', 'loadTimeout', 'loadRaw', 'showRaw']
      }
    ]
  },

  {
    name: 'BannerAd.hide',
    category: 'ad',
    tests: [
      {
        id: 'banner.hide',
        name: '隐藏 Banner 广告',
        description: '验证 BannerAd.hide 可调用、非 Promise，并输出 raw',
        type: 'sync',
        run: (runtime) => runInstanceMethodReturnContract(runtime, {
          createApiName: CREATE_API,
          createOptions: BASE_CREATE_OPTIONS,
          methodName: 'hide',
          invoke: (adInstance) => adInstance.hide()
        }),
        expect: {
          methodExists: true,
          invocationThrew: false,
          invocationSucceeded: true,
          returnThenable: false,
          raw: '@exists'
        },
        allowVariance: ['error', 'afterInvokeError']
      }
    ]
  },

  {
    name: 'BannerAd.destroy',
    category: 'ad',
    tests: [
      {
        id: 'banner.destroy',
        name: '销毁 Banner 广告',
        description: '验证 BannerAd.destroy 可调用、非 Promise，并输出 raw',
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
    name: 'BannerAd.onLoad',
    category: 'ad',
    tests: [
      {
        id: 'banner.onLoad',
        name: 'onLoad 注册契约',
        description: '验证 BannerAd.onLoad 可注册监听，返回值非 Promise',
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
    name: 'BannerAd.offLoad',
    category: 'ad',
    tests: [
      {
        id: 'banner.offLoad',
        name: 'offLoad 取消监听契约',
        description: '验证 BannerAd.offLoad 支持传 listener 和不传 listener',
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
    name: 'BannerAd.onError',
    category: 'ad',
    tests: [
      {
        id: 'banner.onError',
        name: 'onError 注册契约',
        description: '验证 BannerAd.onError 可注册监听，返回值非 Promise',
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
    name: 'BannerAd.offError',
    category: 'ad',
    tests: [
      {
        id: 'banner.offError',
        name: 'offError 取消监听契约',
        description: '验证 BannerAd.offError 支持传 listener 和不传 listener',
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
    name: 'BannerAd.onResize',
    category: 'ad',
    tests: [
      {
        id: 'banner.onResize',
        name: 'onResize 注册契约',
        description: '验证 BannerAd.onResize 可注册监听，返回值非 Promise',
        type: 'sync',
        run: (runtime) => runOnListenerContract(runtime, {
          createApiName: CREATE_API,
          createOptions: BASE_CREATE_OPTIONS,
          onMethodName: 'onResize',
          offMethodName: 'offResize'
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
    name: 'BannerAd.offResize',
    category: 'ad',
    tests: [
      {
        id: 'banner.offResize',
        name: 'offResize 取消监听契约',
        description: '验证 BannerAd.offResize 支持传 listener 和不传 listener',
        type: 'sync',
        run: (runtime) => runOffListenerContract(runtime, {
          createApiName: CREATE_API,
          createOptions: BASE_CREATE_OPTIONS,
          onMethodName: 'onResize',
          offMethodName: 'offResize'
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
