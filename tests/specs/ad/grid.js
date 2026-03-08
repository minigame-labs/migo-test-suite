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

const CREATE_API = 'createGridAd';

const BASE_CREATE_OPTIONS = {
  adUnitId: 'adunit-test-grid',
  style: {
    left: 0,
    top: 0,
    width: 300,
    height: 120
  },
  adTheme: 'white',
  gridCount: 5
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
    caseId: 'white-theme-5',
    options: {
      adUnitId: 'adunit-test-grid',
      style: { left: 0, top: 0, width: 300, height: 120 },
      adTheme: 'white',
      gridCount: 5
    }
  },
  {
    caseId: 'black-theme-8',
    options: {
      adUnitId: 'adunit-test-grid',
      adIntervals: 30,
      style: { left: 10, top: 24, width: 320, height: 140 },
      adTheme: 'black',
      gridCount: 8
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
  const styleValid = isFiniteNumber(style.left)
    && isFiniteNumber(style.top)
    && isFiniteNumber(style.width)
    && isFiniteNumber(style.height);

  const adThemeValid = options.adTheme === 'white' || options.adTheme === 'black';
  const gridCountValid = options.gridCount === 5 || options.gridCount === 8;

  return styleValid && adThemeValid && gridCountValid;
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
    name: 'migo.createGridAd',
    category: 'ad',
    tests: [
      {
        id: 'migo.createGridAd',
        name: '创建 Grid 广告实例',
        description: '验证 createGridAd 返回 GridAd 对象与方法集，并记录 raw',
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
        id: 'grid-create-parameter-matrix',
        name: 'createGridAd 参数矩阵',
        description: '覆盖 adIntervals/style/adTheme/gridCount 参数组合，验证创建行为一致',
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
    name: 'GridAd.show',
    category: 'ad',
    tests: [
      {
        id: 'grid.show',
        name: 'show Promise 返回契约',
        description: '验证 GridAd.show 返回 Promise 并记录 raw',
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
        id: 'grid-show-outcome',
        name: 'show Promise 结果',
        description: '验证 GridAd.show Promise 结果单一且可观测（resolve/reject/timeout）',
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
        id: 'grid-show-manual-positive',
        name: '正向功能验证（真实展示）',
        description: '手动场景：使用已配置且有广告填充的 grid adUnitId，验证 GridAd.show 真实展示成功',
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
    name: 'GridAd.hide',
    category: 'ad',
    tests: [
      {
        id: 'grid.hide',
        name: '隐藏 Grid 广告',
        description: '验证 GridAd.hide 可调用、非 Promise，并输出 raw',
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
    name: 'GridAd.destroy',
    category: 'ad',
    tests: [
      {
        id: 'grid.destroy',
        name: '销毁 Grid 广告',
        description: '验证 GridAd.destroy 可调用、非 Promise，并输出 raw',
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
    name: 'GridAd.onLoad',
    category: 'ad',
    tests: [
      {
        id: 'grid.onLoad',
        name: 'onLoad 注册契约',
        description: '验证 GridAd.onLoad 可注册监听，返回值非 Promise',
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
    name: 'GridAd.offLoad',
    category: 'ad',
    tests: [
      {
        id: 'grid.offLoad',
        name: 'offLoad 取消监听契约',
        description: '验证 GridAd.offLoad 支持传 listener 和不传 listener',
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
    name: 'GridAd.onError',
    category: 'ad',
    tests: [
      {
        id: 'grid.onError',
        name: 'onError 注册契约',
        description: '验证 GridAd.onError 可注册监听，返回值非 Promise',
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
    name: 'GridAd.offError',
    category: 'ad',
    tests: [
      {
        id: 'grid.offError',
        name: 'offError 取消监听契约',
        description: '验证 GridAd.offError 支持传 listener 和不传 listener',
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
    name: 'GridAd.onResize',
    category: 'ad',
    tests: [
      {
        id: 'grid.onResize',
        name: 'onResize 注册契约',
        description: '验证 GridAd.onResize 可注册监听，返回值非 Promise',
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
    name: 'GridAd.offResize',
    category: 'ad',
    tests: [
      {
        id: 'grid.offResize',
        name: 'offResize 取消监听契约',
        description: '验证 GridAd.offResize 支持传 listener 和不传 listener',
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
