/**
 * 广告全局 API 测试（对齐 api2s.md）
 */

import {
  isObject,
  isString,
  isFiniteNumber,
  isThenable,
  normalizeRaw,
  formatError,
  runOptionApiContract,
  probePromiseSupport
} from '../_shared/runtime-helpers.js';

const SPLASH_STATUS_VALUES = new Set(['unknown', 'pending', 'success', 'fail']);
const SPLASH_CODE_VALUES = new Set([-1, 1, 2, 3]);

let directAdStatusListenerRef = null;

function validateDirectAdStatusPayload(payload) {
  if (!isObject(payload)) {
    return false;
  }

  const isInMaskValid = typeof payload.isInMask === 'boolean';
  const isInDirectGameAdValid = typeof payload.isInDirectGameAd === 'boolean';
  const isEndByAbnormalValidOrMissing = typeof payload.isEndByAbnormal === 'undefined'
    || typeof payload.isEndByAbnormal === 'boolean';

  return isInMaskValid && isInDirectGameAdValid && isEndByAbnormalValidOrMissing;
}

function validateShowSplashStatusPayload(payload) {
  if (!isObject(payload)) {
    return false;
  }

  return isString(payload.status)
    && SPLASH_STATUS_VALUES.has(payload.status)
    && isFiniteNumber(payload.code)
    && SPLASH_CODE_VALUES.has(payload.code);
}

function cleanupDirectAdStatusListener(runtime) {
  if (typeof runtime.offDirectAdStatusChange === 'function' && directAdStatusListenerRef) {
    try {
      runtime.offDirectAdStatusChange(directAdStatusListenerRef);
    } catch (e) {
      // ignore cleanup error
    }
  }
  directAdStatusListenerRef = null;
}

export default [
  {
    name: 'migo.getDirectAdStatusSync',
    category: 'ad',
    tests: [
      {
        id: 'migo.getDirectAdStatusSync',
        name: '获取直玩广告状态',
        description: '验证 getDirectAdStatusSync 返回结构（isInMask/isInDirectGameAd）并记录 raw',
        type: 'sync',
        run: (runtime) => {
          if (typeof runtime.getDirectAdStatusSync !== 'function') {
            return { _error: 'getDirectAdStatusSync 不存在' };
          }

          try {
            const raw = runtime.getDirectAdStatusSync();
            return {
              threw: false,
              payloadValid: validateDirectAdStatusPayload(raw),
              isInMaskValid: typeof raw?.isInMask === 'boolean',
              isInDirectGameAdValid: typeof raw?.isInDirectGameAd === 'boolean',
              raw
            };
          } catch (e) {
            return {
              threw: true,
              payloadValid: false,
              isInMaskValid: false,
              isInDirectGameAdValid: false,
              raw: null,
              error: formatError(e)
            };
          }
        },
        expect: {
          threw: false,
          payloadValid: true,
          isInMaskValid: true,
          isInDirectGameAdValid: true,
          raw: '@exists'
        }
      }
    ]
  },

  {
    name: 'migo.getShowSplashAdStatus',
    category: 'ad',
    tests: [
      {
        id: 'migo.getShowSplashAdStatus',
        name: '获取封面广告状态（回调契约）',
        description: '验证 getShowSplashAdStatus 的 success/fail/complete 契约与 success payload 枚举值',
        type: 'async',
        timeout: 9000,
        run: (runtime) => runOptionApiContract(runtime, 'getShowSplashAdStatus', {
          args: {},
          timeoutMs: 7000,
          validateSuccessPayload: validateShowSplashStatusPayload
        }).then((result) => ({
          ...result,
          successPayloadValidOrNoSuccess: !result.successCalled || result.successPayloadValid
        })),
        expect: {
          apiExists: true,
          threw: false,
          timeout: false,
          callbackInvoked: true,
          completeCalled: true,
          completeAfterOutcome: true,
          multipleOutcomeCallbacks: false,
          returnThenable: false,
          successPayloadValidOrNoSuccess: true,
          raw: '@exists'
        },
        allowVariance: ['successCalled', 'failCalled', 'callbackTrace']
      },
      {
        id: 'ad-getShowSplashAdStatus-promise-support',
        name: 'Promise 风格支持（应不支持）',
        description: '验证 getShowSplashAdStatus 不支持 Promise 风格调用',
        type: 'sync',
        run: (runtime) => probePromiseSupport(runtime, 'getShowSplashAdStatus', {}),
        expect: {
          apiExists: true,
          threw: false,
          promiseStyleSupported: false
        }
      }
    ]
  },

  {
    name: 'migo.onDirectAdStatusChange',
    category: 'ad',
    tests: [
      {
        id: 'ad-onDirectAdStatusChange-register-contract',
        name: 'onDirectAdStatusChange 注册契约',
        description: '验证 onDirectAdStatusChange 可注册 listener，返回值非 Promise',
        type: 'sync',
        run: (runtime) => {
          if (typeof runtime.onDirectAdStatusChange !== 'function') {
            return { _error: 'onDirectAdStatusChange 不存在' };
          }

          const listener = () => {};
          let registerThrew = false;
          let unregisterThrew = false;
          let registerReturn;
          let unregisterReturn;
          let error = null;

          try {
            registerReturn = runtime.onDirectAdStatusChange(listener);
            directAdStatusListenerRef = listener;
          } catch (e) {
            registerThrew = true;
            error = formatError(e);
          }

          if (typeof runtime.offDirectAdStatusChange === 'function' && directAdStatusListenerRef) {
            try {
              unregisterReturn = runtime.offDirectAdStatusChange(directAdStatusListenerRef);
            } catch (e) {
              unregisterThrew = true;
              error = error || formatError(e);
            }
          }

          directAdStatusListenerRef = null;

          return {
            apiExists: true,
            registerThrew,
            registerReturnThenable: isThenable(registerReturn),
            unregisterWorkedOrUnsupported: typeof runtime.offDirectAdStatusChange !== 'function' || !unregisterThrew,
            unregisterReturnThenable: isThenable(unregisterReturn),
            raw: normalizeRaw(registerReturn),
            error
          };
        },
        expect: {
          apiExists: true,
          registerThrew: false,
          registerReturnThenable: false,
          unregisterWorkedOrUnsupported: true,
          unregisterReturnThenable: false,
          raw: '@exists'
        },
        allowVariance: ['error']
      },
      {
        id: 'migo.onDirectAdStatusChange',
        name: '直玩广告状态变化真实触发',
        description: '手动场景：触发直玩广告流程，验证 onDirectAdStatusChange 回调触发并记录 raw',
        type: 'event',
        timeout: 25000,
        automation: 'manual',
        manualRequired: true,
        run: (runtime, callback) => {
          if (typeof runtime.onDirectAdStatusChange !== 'function') {
            return callback({ _error: 'onDirectAdStatusChange 不存在', triggered: false, raw: null });
          }

          const listener = (res) => {
            if (typeof runtime.offDirectAdStatusChange === 'function') {
              try {
                runtime.offDirectAdStatusChange(listener);
              } catch (e) {
                // ignore cleanup error
              }
            }
            directAdStatusListenerRef = null;

            callback({
              triggered: true,
              raw: normalizeRaw(res),
              payloadObjectValid: isObject(res),
              isInMaskValid: typeof res?.isInMask === 'boolean',
              isInDirectGameAdValid: typeof res?.isInDirectGameAd === 'boolean',
              isEndByAbnormalValidOrMissing: typeof res?.isEndByAbnormal === 'undefined'
                || typeof res?.isEndByAbnormal === 'boolean'
            });
          };

          directAdStatusListenerRef = listener;
          runtime.onDirectAdStatusChange(listener);
        },
        cleanup: (runtime) => {
          cleanupDirectAdStatusListener(runtime);
        },
        expect: {
          eventReceived: true,
          triggered: true,
          payloadObjectValid: true,
          isInMaskValid: true,
          isInDirectGameAdValid: true,
          isEndByAbnormalValidOrMissing: true
        }
      }
    ]
  },

  {
    name: 'migo.offDirectAdStatusChange',
    category: 'ad',
    tests: [
      {
        id: 'migo.offDirectAdStatusChange',
        name: '取消直玩广告状态监听',
        description: '验证 offDirectAdStatusChange 支持传 listener 与不传 listener 两种形式',
        type: 'sync',
        run: (runtime) => {
          if (typeof runtime.onDirectAdStatusChange !== 'function') {
            return { _error: 'onDirectAdStatusChange 不存在（offDirectAdStatusChange 测试依赖）' };
          }
          if (typeof runtime.offDirectAdStatusChange !== 'function') {
            return { _error: 'offDirectAdStatusChange 不存在' };
          }

          const listener = () => {};
          let offWithListenerThrew = false;
          let offWithoutListenerThrew = false;
          let offWithListenerReturn;
          let offWithoutListenerReturn;

          runtime.onDirectAdStatusChange(listener);

          try {
            offWithListenerReturn = runtime.offDirectAdStatusChange(listener);
          } catch (e) {
            offWithListenerThrew = true;
          }

          try {
            offWithoutListenerReturn = runtime.offDirectAdStatusChange();
          } catch (e) {
            offWithoutListenerThrew = true;
          }

          return {
            offWithListenerThrew,
            offWithoutListenerThrew,
            offWithListenerReturnThenable: isThenable(offWithListenerReturn),
            offWithoutListenerReturnThenable: isThenable(offWithoutListenerReturn),
            raw: {
              offWithListenerReturn: normalizeRaw(offWithListenerReturn),
              offWithoutListenerReturn: normalizeRaw(offWithoutListenerReturn)
            }
          };
        },
        expect: {
          offWithListenerThrew: false,
          offWithoutListenerThrew: false,
          offWithListenerReturnThenable: false,
          offWithoutListenerReturnThenable: false,
          raw: '@exists'
        }
      }
    ]
  }
];
