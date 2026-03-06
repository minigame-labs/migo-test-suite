/**
 * 生命周期 API 测试（对齐 apis.md）
 */

const CHAT_TYPE_VALUES = new Set([1, 2, 3, 4]);
const API_CATEGORY_VALUES = new Set(['default', 'nativeFunctionalized', 'browseOnly', 'embedded']);

let onShowListenerRef = null;
let onHideListenerRef = null;

function isObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function isFiniteNumber(value) {
  return typeof value === 'number' && Number.isFinite(value);
}

function isString(value) {
  return typeof value === 'string';
}

function isThenable(value) {
  return !!value && (typeof value === 'object' || typeof value === 'function') && typeof value.then === 'function';
}

function formatError(error) {
  if (!error) {
    return 'unknown error';
  }
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
}

function isValidChatTypeOrMissing(value) {
  return typeof value === 'undefined' || (isFiniteNumber(value) && CHAT_TYPE_VALUES.has(value));
}

function isValidReferrerInfoOrMissing(value) {
  return typeof value === 'undefined' || isObject(value);
}

function isValidReferrerAppIdOrMissing(referrerInfo) {
  if (typeof referrerInfo === 'undefined') {
    return true;
  }
  if (!isObject(referrerInfo)) {
    return false;
  }
  return typeof referrerInfo.appId === 'undefined' || isString(referrerInfo.appId);
}

function isValidReferrerExtraDataOrMissing(referrerInfo) {
  if (typeof referrerInfo === 'undefined') {
    return true;
  }
  if (!isObject(referrerInfo)) {
    return false;
  }
  return typeof referrerInfo.extraData === 'undefined' || isObject(referrerInfo.extraData);
}

function isValidHostExtraDataOrMissing(hostExtraData) {
  return typeof hostExtraData === 'undefined' || isObject(hostExtraData);
}

function isValidHostSceneOrMissing(hostExtraData) {
  if (typeof hostExtraData === 'undefined') {
    return true;
  }
  if (!isObject(hostExtraData)) {
    return false;
  }
  return typeof hostExtraData.host_scene === 'undefined' || isString(hostExtraData.host_scene);
}

function isValidApiCategoryOrMissing(value) {
  return typeof value === 'undefined' || (isString(value) && API_CATEGORY_VALUES.has(value));
}

function buildLaunchLikeValidation(raw) {
  const referrerInfo = isObject(raw) ? raw.referrerInfo : undefined;
  return {
    isObject: isObject(raw),
    sceneValid: isFiniteNumber(raw?.scene),
    queryValid: isObject(raw?.query),
    shareTicketValidOrMissing: typeof raw?.shareTicket === 'undefined' || isString(raw?.shareTicket),
    referrerInfoValidOrMissing: isValidReferrerInfoOrMissing(referrerInfo),
    referrerAppIdValidOrMissing: isValidReferrerAppIdOrMissing(referrerInfo),
    referrerExtraDataValidOrMissing: isValidReferrerExtraDataOrMissing(referrerInfo),
    chatTypeValidOrMissing: isValidChatTypeOrMissing(raw?.chatType)
  };
}

export default [
  {
    name: 'migo.onShow',
    category: 'base',
    tests: [
      {
        id: 'lifecycle-onShow-register-contract',
        name: '注册监听参数契约',
        description: '验证 onShow 可接收 listener 参数，且返回值非 Promise',
        type: 'sync',
        run: (runtime) => {
          if (typeof runtime.onShow !== 'function') {
            return { _error: 'onShow 不存在' };
          }

          const listener = () => {};
          let registerThrew = false;
          let registerError = null;
          let unregisterThrew = false;
          let unregisterError = null;
          let registerReturn;
          let unregisterReturn;

          try {
            registerReturn = runtime.onShow(listener);
            onShowListenerRef = listener;
          } catch (e) {
            registerThrew = true;
            registerError = e && e.message ? e.message : String(e);
          }

          if (typeof runtime.offShow === 'function' && onShowListenerRef) {
            try {
              unregisterReturn = runtime.offShow(onShowListenerRef);
            } catch (e) {
              unregisterThrew = true;
              unregisterError = e && e.message ? e.message : String(e);
            }
          }

          onShowListenerRef = null;

          return {
            apiExists: true,
            registerThrew,
            registerReturnThenable: isThenable(registerReturn),
            unregisterWorkedOrUnsupported: typeof runtime.offShow !== 'function' || !unregisterThrew,
            unregisterReturnThenable: isThenable(unregisterReturn),
            error: registerError || unregisterError || null
          };
        },
        expect: {
          apiExists: true,
          registerThrew: false,
          registerReturnThenable: false,
          unregisterWorkedOrUnsupported: true,
          unregisterReturnThenable: false
        },
        allowVariance: ['error']
      },
      {
        id: 'migo.onShow',
        name: '回调触发与原始数据记录',
        description: '手动场景：切后台再回前台，验证 onShow 真实触发并记录 raw 参数',
        type: 'event',
        timeout: 15000,
        automation: 'manual',
        manualRequired: true,
        run: (runtime, callback) => {
          if (typeof runtime.onShow !== 'function') {
            return callback({ _error: 'onShow 不存在', triggered: false, raw: null });
          }

          const listener = (res) => {
            if (typeof runtime.offShow === 'function') {
              try {
                runtime.offShow(listener);
              } catch (e) {
                // ignore cleanup error
              }
            }

            const referrerInfo = isObject(res) ? res.referrerInfo : undefined;
            callback({
              triggered: true,
              raw: typeof res === 'undefined' ? null : res,
              payloadObjectValid: isObject(res),
              sceneValid: isFiniteNumber(res?.scene),
              queryValid: isObject(res?.query),
              shareTicketValidOrMissing: typeof res?.shareTicket === 'undefined' || isString(res?.shareTicket),
              referrerInfoValidOrMissing: isValidReferrerInfoOrMissing(referrerInfo),
              referrerAppIdValidOrMissing: isValidReferrerAppIdOrMissing(referrerInfo),
              referrerExtraDataValidOrMissing: isValidReferrerExtraDataOrMissing(referrerInfo),
              chatTypeValidOrMissing: isValidChatTypeOrMissing(res?.chatType)
            });
          };

          onShowListenerRef = listener;
          runtime.onShow(listener);
        },
        cleanup: (runtime) => {
          if (typeof runtime.offShow === 'function' && onShowListenerRef) {
            runtime.offShow(onShowListenerRef);
          }
          onShowListenerRef = null;
        },
        expect: {
          eventReceived: true,
          triggered: true,
          payloadObjectValid: true,
          sceneValid: true,
          queryValid: true,
          shareTicketValidOrMissing: true,
          referrerInfoValidOrMissing: true,
          referrerAppIdValidOrMissing: true,
          referrerExtraDataValidOrMissing: true,
          chatTypeValidOrMissing: true
        }
      },
      {
        id: 'lifecycle-onShow-offShow-sequence',
        name: 'onShow/offShow 触发序列校验',
        description: '手动场景：前后台切换两次，校验 offShow(listener) 后该 listener 不再触发',
        type: 'async',
        timeout: 30000,
        automation: 'manual',
        manualRequired: true,
        run: (runtime) => new Promise((resolve) => {
          if (typeof runtime.onShow !== 'function') {
            resolve({ _error: 'onShow 不存在' });
            return;
          }
          if (typeof runtime.offShow !== 'function') {
            resolve({ _error: 'offShow 不存在（序列测试依赖）' });
            return;
          }

          let finished = false;
          let timer = null;
          let listenerACallCount = 0;
          let listenerBCallCount = 0;
          let firstEventRaw = null;
          let secondEventRaw = null;
          let offShowCalled = false;
          let offShowCallSucceeded = false;
          let offShowCallError = null;

          const finish = (payload) => {
            if (finished) {
              return;
            }
            finished = true;
            if (timer) {
              clearTimeout(timer);
            }

            try {
              runtime.offShow(listenerA);
            } catch (e) {
              // ignore cleanup error
            }

            try {
              runtime.offShow(listenerB);
            } catch (e) {
              // ignore cleanup error
            }

            resolve(payload);
          };

          const listenerA = (res) => {
            listenerACallCount += 1;
            if (listenerACallCount === 1) {
              firstEventRaw = (typeof res === 'undefined') ? null : res;
            }
            if (listenerACallCount >= 2) {
              secondEventRaw = (typeof res === 'undefined') ? null : res;
            }
          };

          const listenerB = (res) => {
            listenerBCallCount += 1;
            const normalizedRes = (typeof res === 'undefined') ? null : res;

            if (listenerBCallCount === 1) {
              if (firstEventRaw === null) {
                firstEventRaw = normalizedRes;
              }

              offShowCalled = true;
              try {
                runtime.offShow(listenerA);
                offShowCallSucceeded = true;
              } catch (e) {
                offShowCallSucceeded = false;
                offShowCallError = formatError(e);
              }
              return;
            }

            if (listenerBCallCount >= 2) {
              if (secondEventRaw === null) {
                secondEventRaw = normalizedRes;
              }

              finish({
                sequenceCompleted: true,
                offShowCalled,
                offShowCallSucceeded,
                offShowCallError,
                listenerAFirstEventCalled: listenerACallCount >= 1,
                listenerACalledAfterOff: listenerACallCount > 1,
                listenerBStillCalledAfterOff: listenerBCallCount >= 2,
                listenerACallCount,
                listenerBCallCount,
                raw: {
                  firstEvent: firstEventRaw,
                  secondEvent: secondEventRaw
                }
              });
            }
          };

          runtime.onShow(listenerA);
          runtime.onShow(listenerB);

          timer = setTimeout(() => {
            finish({
              timeout: true,
              sequenceCompleted: false,
              offShowCalled,
              offShowCallSucceeded,
              offShowCallError,
              listenerAFirstEventCalled: listenerACallCount >= 1,
              listenerACalledAfterOff: listenerACallCount > 1,
              listenerBStillCalledAfterOff: listenerBCallCount >= 2,
              listenerACallCount,
              listenerBCallCount,
              raw: {
                firstEvent: firstEventRaw,
                secondEvent: secondEventRaw
              }
            });
          }, 28000);
        }),
        expect: {
          sequenceCompleted: true,
          offShowCalled: true,
          offShowCallSucceeded: true,
          listenerAFirstEventCalled: true,
          listenerACalledAfterOff: false,
          listenerBStillCalledAfterOff: true
        },
        allowVariance: ['offShowCallError', 'listenerACallCount', 'listenerBCallCount', 'raw']
      }
    ]
  },

  {
    name: 'migo.offShow',
    category: 'base',
    tests: [
      {
        id: 'migo.offShow',
        name: '取消监听切前台',
        description: '验证 offShow 支持传 listener 与不传 listener 两种参数形式',
        type: 'sync',
        run: (runtime) => {
          if (typeof runtime.onShow !== 'function') {
            return { _error: 'onShow 不存在（offShow 测试依赖）' };
          }
          if (typeof runtime.offShow !== 'function') {
            return { _error: 'offShow 不存在' };
          }

          const listener = () => {};
          let offWithListenerThrew = false;
          let offWithoutListenerThrew = false;
          let offWithListenerReturn;
          let offWithoutListenerReturn;

          runtime.onShow(listener);

          try {
            offWithListenerReturn = runtime.offShow(listener);
          } catch (e) {
            offWithListenerThrew = true;
          }

          try {
            offWithoutListenerReturn = runtime.offShow();
          } catch (e) {
            offWithoutListenerThrew = true;
          }

          return {
            offWithListenerThrew,
            offWithoutListenerThrew,
            offWithListenerReturnThenable: isThenable(offWithListenerReturn),
            offWithoutListenerReturnThenable: isThenable(offWithoutListenerReturn),
            raw: {
              offWithListenerReturn: typeof offWithListenerReturn === 'undefined' ? null : offWithListenerReturn,
              offWithoutListenerReturn: typeof offWithoutListenerReturn === 'undefined' ? null : offWithoutListenerReturn
            }
          };
        },
        expect: {
          offWithListenerThrew: false,
          offWithoutListenerThrew: false,
          offWithListenerReturnThenable: false,
          offWithoutListenerReturnThenable: false
        }
      }
    ]
  },

  {
    name: 'migo.onHide',
    category: 'base',
    tests: [
      {
        id: 'lifecycle-onHide-register-contract',
        name: '注册监听参数契约',
        description: '验证 onHide 可接收 listener 参数，且返回值非 Promise',
        type: 'sync',
        run: (runtime) => {
          if (typeof runtime.onHide !== 'function') {
            return { _error: 'onHide 不存在' };
          }

          const listener = () => {};
          let registerThrew = false;
          let registerError = null;
          let unregisterThrew = false;
          let unregisterError = null;
          let registerReturn;
          let unregisterReturn;

          try {
            registerReturn = runtime.onHide(listener);
            onHideListenerRef = listener;
          } catch (e) {
            registerThrew = true;
            registerError = e && e.message ? e.message : String(e);
          }

          if (typeof runtime.offHide === 'function' && onHideListenerRef) {
            try {
              unregisterReturn = runtime.offHide(onHideListenerRef);
            } catch (e) {
              unregisterThrew = true;
              unregisterError = e && e.message ? e.message : String(e);
            }
          }

          onHideListenerRef = null;

          return {
            apiExists: true,
            registerThrew,
            registerReturnThenable: isThenable(registerReturn),
            unregisterWorkedOrUnsupported: typeof runtime.offHide !== 'function' || !unregisterThrew,
            unregisterReturnThenable: isThenable(unregisterReturn),
            error: registerError || unregisterError || null
          };
        },
        expect: {
          apiExists: true,
          registerThrew: false,
          registerReturnThenable: false,
          unregisterWorkedOrUnsupported: true,
          unregisterReturnThenable: false
        },
        allowVariance: ['error']
      },
      {
        id: 'migo.onHide',
        name: '回调触发与原始数据记录',
        description: '手动场景：将小游戏切到后台，验证 onHide 真实触发并记录 raw 参数',
        type: 'event',
        timeout: 15000,
        automation: 'manual',
        manualRequired: true,
        run: (runtime, callback) => {
          if (typeof runtime.onHide !== 'function') {
            return callback({ _error: 'onHide 不存在', triggered: false, raw: null });
          }

          const listener = (res) => {
            if (typeof runtime.offHide === 'function') {
              try {
                runtime.offHide(listener);
              } catch (e) {
                // ignore cleanup error
              }
            }

            callback({
              triggered: true,
              raw: typeof res === 'undefined' ? null : res,
              payloadUndefinedOrObject: typeof res === 'undefined' || isObject(res)
            });
          };

          onHideListenerRef = listener;
          runtime.onHide(listener);
        },
        cleanup: (runtime) => {
          if (typeof runtime.offHide === 'function' && onHideListenerRef) {
            runtime.offHide(onHideListenerRef);
          }
          onHideListenerRef = null;
        },
        expect: {
          eventReceived: true,
          triggered: true,
          payloadUndefinedOrObject: true
        }
      },
      {
        id: 'lifecycle-onHide-offHide-sequence',
        name: 'onHide/offHide 触发序列校验',
        description: '手动场景：切后台两次，校验 offHide(listener) 后该 listener 不再触发',
        type: 'async',
        timeout: 30000,
        automation: 'manual',
        manualRequired: true,
        run: (runtime) => new Promise((resolve) => {
          if (typeof runtime.onHide !== 'function') {
            resolve({ _error: 'onHide 不存在' });
            return;
          }
          if (typeof runtime.offHide !== 'function') {
            resolve({ _error: 'offHide 不存在（序列测试依赖）' });
            return;
          }

          let finished = false;
          let timer = null;
          let listenerACallCount = 0;
          let listenerBCallCount = 0;
          let firstEventRaw = null;
          let secondEventRaw = null;
          let offHideCalled = false;
          let offHideCallSucceeded = false;
          let offHideCallError = null;

          const finish = (payload) => {
            if (finished) {
              return;
            }
            finished = true;
            if (timer) {
              clearTimeout(timer);
            }

            try {
              runtime.offHide(listenerA);
            } catch (e) {
              // ignore cleanup error
            }

            try {
              runtime.offHide(listenerB);
            } catch (e) {
              // ignore cleanup error
            }

            resolve(payload);
          };

          const listenerA = (res) => {
            listenerACallCount += 1;
            if (listenerACallCount === 1) {
              firstEventRaw = (typeof res === 'undefined') ? null : res;
            }
            if (listenerACallCount >= 2) {
              secondEventRaw = (typeof res === 'undefined') ? null : res;
            }
          };

          const listenerB = (res) => {
            listenerBCallCount += 1;
            const normalizedRes = (typeof res === 'undefined') ? null : res;

            if (listenerBCallCount === 1) {
              if (firstEventRaw === null) {
                firstEventRaw = normalizedRes;
              }

              offHideCalled = true;
              try {
                runtime.offHide(listenerA);
                offHideCallSucceeded = true;
              } catch (e) {
                offHideCallSucceeded = false;
                offHideCallError = formatError(e);
              }
              return;
            }

            if (listenerBCallCount >= 2) {
              if (secondEventRaw === null) {
                secondEventRaw = normalizedRes;
              }

              finish({
                sequenceCompleted: true,
                offHideCalled,
                offHideCallSucceeded,
                offHideCallError,
                listenerAFirstEventCalled: listenerACallCount >= 1,
                listenerACalledAfterOff: listenerACallCount > 1,
                listenerBStillCalledAfterOff: listenerBCallCount >= 2,
                listenerACallCount,
                listenerBCallCount,
                raw: {
                  firstEvent: firstEventRaw,
                  secondEvent: secondEventRaw
                }
              });
            }
          };

          runtime.onHide(listenerA);
          runtime.onHide(listenerB);

          timer = setTimeout(() => {
            finish({
              timeout: true,
              sequenceCompleted: false,
              offHideCalled,
              offHideCallSucceeded,
              offHideCallError,
              listenerAFirstEventCalled: listenerACallCount >= 1,
              listenerACalledAfterOff: listenerACallCount > 1,
              listenerBStillCalledAfterOff: listenerBCallCount >= 2,
              listenerACallCount,
              listenerBCallCount,
              raw: {
                firstEvent: firstEventRaw,
                secondEvent: secondEventRaw
              }
            });
          }, 28000);
        }),
        expect: {
          sequenceCompleted: true,
          offHideCalled: true,
          offHideCallSucceeded: true,
          listenerAFirstEventCalled: true,
          listenerACalledAfterOff: false,
          listenerBStillCalledAfterOff: true
        },
        allowVariance: ['offHideCallError', 'listenerACallCount', 'listenerBCallCount', 'raw']
      }
    ]
  },

  {
    name: 'migo.offHide',
    category: 'base',
    tests: [
      {
        id: 'migo.offHide',
        name: '取消监听切后台',
        description: '验证 offHide 支持传 listener 与不传 listener 两种参数形式',
        type: 'sync',
        run: (runtime) => {
          if (typeof runtime.onHide !== 'function') {
            return { _error: 'onHide 不存在（offHide 测试依赖）' };
          }
          if (typeof runtime.offHide !== 'function') {
            return { _error: 'offHide 不存在' };
          }

          const listener = () => {};
          let offWithListenerThrew = false;
          let offWithoutListenerThrew = false;
          let offWithListenerReturn;
          let offWithoutListenerReturn;

          runtime.onHide(listener);

          try {
            offWithListenerReturn = runtime.offHide(listener);
          } catch (e) {
            offWithListenerThrew = true;
          }

          try {
            offWithoutListenerReturn = runtime.offHide();
          } catch (e) {
            offWithoutListenerThrew = true;
          }

          return {
            offWithListenerThrew,
            offWithoutListenerThrew,
            offWithListenerReturnThenable: isThenable(offWithListenerReturn),
            offWithoutListenerReturnThenable: isThenable(offWithoutListenerReturn),
            raw: {
              offWithListenerReturn: typeof offWithListenerReturn === 'undefined' ? null : offWithListenerReturn,
              offWithoutListenerReturn: typeof offWithoutListenerReturn === 'undefined' ? null : offWithoutListenerReturn
            }
          };
        },
        expect: {
          offWithListenerThrew: false,
          offWithoutListenerThrew: false,
          offWithListenerReturnThenable: false,
          offWithoutListenerReturnThenable: false
        }
      }
    ]
  },

  {
    name: 'migo.getLaunchOptionsSync',
    category: 'base',
    tests: [
      {
        id: 'migo.getLaunchOptionsSync',
        name: '获取启动参数',
        description: '返回原始启动参数 raw，并校验 scene/query/referrerInfo/chatType 等字段契约',
        type: 'sync',
        run: (runtime) => {
          if (typeof runtime.getLaunchOptionsSync !== 'function') {
            return { _error: 'getLaunchOptionsSync 不存在' };
          }

          const raw = runtime.getLaunchOptionsSync();
          const common = buildLaunchLikeValidation(raw);

          return {
            raw,
            ...common,
            hostExtraDataValidOrMissing: isValidHostExtraDataOrMissing(raw?.hostExtraData),
            hostSceneValidOrMissing: isValidHostSceneOrMissing(raw?.hostExtraData)
          };
        },
        expect: {
          isObject: true,
          sceneValid: true,
          queryValid: true,
          shareTicketValidOrMissing: true,
          referrerInfoValidOrMissing: true,
          referrerAppIdValidOrMissing: true,
          referrerExtraDataValidOrMissing: true,
          chatTypeValidOrMissing: true,
          hostExtraDataValidOrMissing: true,
          hostSceneValidOrMissing: true
        }
      }
    ]
  },

  {
    name: 'migo.getEnterOptionsSync',
    category: 'base',
    tests: [
      {
        id: 'migo.getEnterOptionsSync',
        name: '获取进入参数',
        description: '返回原始进入参数 raw，并校验 scene/query/referrerInfo/chatType/apiCategory 字段契约',
        type: 'sync',
        run: (runtime) => {
          if (typeof runtime.getEnterOptionsSync !== 'function') {
            return { _error: 'getEnterOptionsSync 不存在' };
          }

          const raw = runtime.getEnterOptionsSync();
          const common = buildLaunchLikeValidation(raw);

          return {
            raw,
            ...common,
            apiCategoryValidOrMissing: isValidApiCategoryOrMissing(raw?.apiCategory)
          };
        },
        expect: {
          isObject: true,
          sceneValid: true,
          queryValid: true,
          shareTicketValidOrMissing: true,
          referrerInfoValidOrMissing: true,
          referrerAppIdValidOrMissing: true,
          referrerExtraDataValidOrMissing: true,
          chatTypeValidOrMissing: true,
          apiCategoryValidOrMissing: true
        }
      }
    ]
  }
];
