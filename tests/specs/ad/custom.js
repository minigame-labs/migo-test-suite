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

const CREATE_API = 'createCustomAd';

const BASE_CREATE_OPTIONS = {
  adUnitId: 'adunit-test-custom',
  adIntervals: 30,
  style: {
    left: 0,
    top: 0,
    width: 300,
    fixed: false
  }
};

const REQUIRED_METHODS = [
  'show',
  'hide',
  'isShow',
  'destroy',
  'onLoad',
  'onError',
  'onClose',
  'onHide',
  'onResize',
  'offLoad',
  'offError',
  'offClose',
  'offHide',
  'offResize'
];

const CREATE_SCENARIOS = [
  {
    caseId: 'fixed-false',
    options: {
      adUnitId: 'adunit-test-custom',
      adIntervals: 30,
      style: { left: 0, top: 0, width: 300, fixed: false }
    }
  },
  {
    caseId: 'fixed-true',
    options: {
      adUnitId: 'adunit-test-custom',
      adIntervals: 60,
      style: { left: 12, top: 36, width: 320, fixed: true }
    }
  }
];

function validateCreateOptions(options) {
  if (!isObject(options) || !isString(options.adUnitId) || options.adUnitId.length === 0) {
    return false;
  }

  if (!isFiniteNumber(options.adIntervals) || options.adIntervals < 30) {
    return false;
  }

  const style = options.style;
  if (!isObject(style)) {
    return false;
  }

  const styleBaseValid = isFiniteNumber(style.left)
    && isFiniteNumber(style.top)
    && (typeof style.width === 'undefined' || isFiniteNumber(style.width));
  const fixedValidOrMissing = typeof style.fixed === 'undefined' || typeof style.fixed === 'boolean';

  return styleBaseValid && fixedValidOrMissing;
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
    name: 'migo.createCustomAd',
    category: 'ad',
    tests: [
      {
        id: 'migo.createCustomAd',
        name: '创建原生模板广告实例',
        description: '验证 createCustomAd 返回 CustomAd 对象与方法集，并记录 raw',
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
        id: 'custom-create-parameter-matrix',
        name: 'createCustomAd 参数矩阵',
        description: '覆盖 adIntervals/style.fixed 参数组合，验证创建行为一致',
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
    name: 'CustomAd.show',
    category: 'ad',
    tests: [
      {
        id: 'custom.show',
        name: 'show Promise 返回契约',
        description: '验证 CustomAd.show 返回 Promise 并记录 raw',
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
        id: 'custom-show-outcome',
        name: 'show Promise 结果',
        description: '验证 CustomAd.show Promise 结果单一且可观测（resolve/reject/timeout）',
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
        id: 'custom-show-manual-positive',
        name: '正向功能验证（真实展示）',
        description: '手动场景：使用已配置且有广告填充的 custom adUnitId，验证 CustomAd.show 真实展示成功',
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
    name: 'CustomAd.hide',
    category: 'ad',
    tests: [
      {
        id: 'custom.hide',
        name: 'hide Promise 返回契约',
        description: '验证 CustomAd.hide 返回 Promise 并记录 raw',
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
          returnThenable: true,
          raw: '@exists'
        },
        allowVariance: ['error', 'afterInvokeError']
      },
      {
        id: 'custom-hide-outcome',
        name: 'hide Promise 结果',
        description: '验证 CustomAd.hide Promise 结果单一且可观测（resolve/reject/timeout）',
        type: 'async',
        timeout: 14000,
        run: (runtime) => runPromiseMethodOutcome(runtime, {
          createApiName: CREATE_API,
          createOptions: BASE_CREATE_OPTIONS,
          methodName: 'hide',
          invoke: (adInstance) => adInstance.hide(),
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
    name: 'CustomAd.isShow',
    category: 'ad',
    tests: [
      {
        id: 'custom.isShow',
        name: '查询展示状态',
        description: '验证 CustomAd.isShow 返回 boolean 并记录 raw',
        type: 'sync',
        run: (runtime) => runInstanceMethodReturnContract(runtime, {
          createApiName: CREATE_API,
          createOptions: BASE_CREATE_OPTIONS,
          methodName: 'isShow',
          invoke: (adInstance) => adInstance.isShow()
        }),
        expect: {
          methodExists: true,
          invocationThrew: false,
          invocationSucceeded: true,
          returnThenable: false,
          raw: '@boolean'
        },
        allowVariance: ['error']
      }
    ]
  },

  {
    name: 'CustomAd.destroy',
    category: 'ad',
    tests: [
      {
        id: 'custom.destroy',
        name: '销毁原生模板广告实例',
        description: '验证 CustomAd.destroy 可调用、非 Promise，并输出 raw',
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
    name: 'CustomAd.onLoad',
    category: 'ad',
    tests: [
      {
        id: 'custom.onLoad',
        name: 'onLoad 注册契约',
        description: '验证 CustomAd.onLoad 可注册监听，返回值非 Promise',
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
    name: 'CustomAd.offLoad',
    category: 'ad',
    tests: [
      {
        id: 'custom.offLoad',
        name: 'offLoad 取消监听契约',
        description: '验证 CustomAd.offLoad 支持传 listener 和不传 listener',
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
    name: 'CustomAd.onError',
    category: 'ad',
    tests: [
      {
        id: 'custom.onError',
        name: 'onError 注册契约',
        description: '验证 CustomAd.onError 可注册监听，返回值非 Promise',
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
    name: 'CustomAd.offError',
    category: 'ad',
    tests: [
      {
        id: 'custom.offError',
        name: 'offError 取消监听契约',
        description: '验证 CustomAd.offError 支持传 listener 和不传 listener',
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
    name: 'CustomAd.onClose',
    category: 'ad',
    tests: [
      {
        id: 'custom.onClose',
        name: 'onClose 注册契约',
        description: '验证 CustomAd.onClose 可注册监听，返回值非 Promise',
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
    name: 'CustomAd.offClose',
    category: 'ad',
    tests: [
      {
        id: 'custom.offClose',
        name: 'offClose 取消监听契约',
        description: '验证 CustomAd.offClose 支持传 listener 和不传 listener',
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
  },

  {
    name: 'CustomAd.onHide',
    category: 'ad',
    tests: [
      {
        id: 'custom.onHide',
        name: 'onHide 注册契约',
        description: '验证 CustomAd.onHide 可注册监听，返回值非 Promise',
        type: 'sync',
        run: (runtime) => runOnListenerContract(runtime, {
          createApiName: CREATE_API,
          createOptions: BASE_CREATE_OPTIONS,
          onMethodName: 'onHide',
          offMethodName: 'offHide'
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
    name: 'CustomAd.offHide',
    category: 'ad',
    tests: [
      {
        id: 'custom.offHide',
        name: 'offHide 取消监听契约',
        description: '验证 CustomAd.offHide 支持传 listener 和不传 listener',
        type: 'sync',
        run: (runtime) => runOffListenerContract(runtime, {
          createApiName: CREATE_API,
          createOptions: BASE_CREATE_OPTIONS,
          onMethodName: 'onHide',
          offMethodName: 'offHide'
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
    name: 'CustomAd.onResize',
    category: 'ad',
    tests: [
      {
        id: 'custom.onResize',
        name: 'onResize 注册契约',
        description: '验证 CustomAd.onResize 可注册监听，返回值非 Promise',
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
    name: 'CustomAd.offResize',
    category: 'ad',
    tests: [
      {
        id: 'custom.offResize',
        name: 'offResize 取消监听契约',
        description: '验证 CustomAd.offResize 支持传 listener 和不传 listener',
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
