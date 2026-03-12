import {
  isObject,
  isString,
  isFiniteNumber,
  isThenable,
  normalizeRaw,
  formatError,
  runOptionApiContract,
  probePromiseSupport,
  runGlobalOnRegisterContract,
  runGlobalOffContract
} from '../_shared/runtime-helpers.js';

const KEYBOARD_CONFIRM_TYPES = new Set(['done', 'next', 'search', 'go', 'send']);
const KEYBOARD_TYPES = new Set(['text', 'number']);

const SHOW_KEYBOARD_ARGS = {
  defaultValue: 'migo-keyboard',
  maxLength: 32,
  multiple: false,
  confirmHold: false,
  confirmType: 'done',
  keyboardType: 'text'
};

const UPDATE_KEYBOARD_ARGS = {
  value: 'migo-keyboard-updated'
};

const ACTIVE_GLOBAL_LISTENERS = Object.create(null);

function isBoolean(value) {
  return typeof value === 'boolean';
}

function isShowKeyboardArgsValid(args) {
  return isObject(args)
    && isString(args.defaultValue)
    && isFiniteNumber(args.maxLength)
    && args.maxLength >= 1
    && isBoolean(args.multiple)
    && isBoolean(args.confirmHold)
    && isString(args.confirmType)
    && KEYBOARD_CONFIRM_TYPES.has(args.confirmType)
    && isString(args.keyboardType)
    && KEYBOARD_TYPES.has(args.keyboardType);
}

function isUpdateKeyboardArgsValid(args) {
  return isObject(args) && isString(args.value);
}

function isOptionSuccessPayloadValid(payload) {
  if (typeof payload === 'undefined') {
    return true;
  }

  if (!isObject(payload)) {
    return false;
  }

  return typeof payload.errMsg === 'undefined' || isString(payload.errMsg);
}

function isFailPayloadValid(payload) {
  if (isString(payload)) {
    return payload.length > 0;
  }

  if (!isObject(payload)) {
    return false;
  }

  const errMsgValidOrMissing = typeof payload.errMsg === 'undefined' || isString(payload.errMsg);
  const errCodeValidOrMissing = typeof payload.errCode === 'undefined' || isFiniteNumber(payload.errCode);
  return errMsgValidOrMissing && errCodeValidOrMissing;
}

function clearGlobalListener(runtime, onApiName) {
  const state = ACTIVE_GLOBAL_LISTENERS[onApiName];
  if (!state) {
    return;
  }

  const offApi = runtime && runtime[state.offApiName];
  if (typeof offApi === 'function') {
    try {
      offApi(state.listener);
    } catch (e) {
      // ignore cleanup error
    }
  }

  delete ACTIVE_GLOBAL_LISTENERS[onApiName];
}

function registerGlobalListener(runtime, onApiName, offApiName, listener) {
  clearGlobalListener(runtime, onApiName);
  runtime[onApiName](listener);
  ACTIVE_GLOBAL_LISTENERS[onApiName] = { offApiName, listener };
}

function tryHideKeyboard(runtime) {
  if (!runtime || typeof runtime.hideKeyboard !== 'function') {
    return;
  }

  try {
    runtime.hideKeyboard({});
  } catch (e) {
    // ignore cleanup error
  }
}

function cleanupKeyboardState(runtime) {
  const onApis = Object.keys(ACTIVE_GLOBAL_LISTENERS);
  for (const onApiName of onApis) {
    clearGlobalListener(runtime, onApiName);
  }
  tryHideKeyboard(runtime);
}

function tryShowKeyboard(runtime, args = SHOW_KEYBOARD_ARGS) {
  if (!runtime || typeof runtime.showKeyboard !== 'function') {
    return {
      invoked: false,
      threw: false,
      returnThenable: false,
      error: null
    };
  }

  try {
    const returned = runtime.showKeyboard(args);
    return {
      invoked: true,
      threw: false,
      returnThenable: isThenable(returned),
      error: null
    };
  } catch (e) {
    return {
      invoked: true,
      threw: true,
      returnThenable: false,
      error: formatError(e)
    };
  }
}

function runKeyboardOptionContract(runtime, apiName, args, options = {}) {
  const {
    timeoutMs = 12000,
    settleDelayMs = 150,
    idleWaitMs = 10000,
    validateSuccessPayload = isOptionSuccessPayloadValid
  } = options;

  return runOptionApiContract(runtime, apiName, {
    args,
    timeoutMs,
    settleDelayMs,
    idleWaitMs,
    validateSuccessPayload
  }).then((result) => ({
    ...result,
    successPayloadValidOrNoSuccess: !result.successCalled || result.successPayloadValid,
    failPayloadValidOrNoFail: !result.failCalled || isFailPayloadValid(result.failPayload)
  }));
}

function runHideKeyboardPositive(runtime) {
  const showPrep = tryShowKeyboard(runtime, {
    ...SHOW_KEYBOARD_ARGS,
    defaultValue: 'migo-hide-keyboard'
  });

  return runKeyboardOptionContract(runtime, 'hideKeyboard', {}, {
    timeoutMs: 15000,
    idleWaitMs: 12000
  }).then((result) => ({
    ...result,
    showPrepared: showPrep.invoked,
    showPrepareThrew: showPrep.threw,
    showPrepareError: showPrep.error
  }));
}

function runUpdateKeyboardPositive(runtime) {
  const showPrep = tryShowKeyboard(runtime, {
    ...SHOW_KEYBOARD_ARGS,
    defaultValue: 'migo-before-update'
  });

  return runKeyboardOptionContract(runtime, 'updateKeyboard', UPDATE_KEYBOARD_ARGS, {
    timeoutMs: 15000,
    idleWaitMs: 12000
  }).then((result) => ({
    ...result,
    showPrepared: showPrep.invoked,
    showPrepareThrew: showPrep.threw,
    showPrepareError: showPrep.error,
    updateArgsValid: isUpdateKeyboardArgsValid(UPDATE_KEYBOARD_ARGS)
  }));
}

function runShowKeyboardNegativeInvalidArgs(runtime) {
  const invalidArgs = {
    defaultValue: 123,
    maxLength: '32',
    multiple: 'false',
    confirmHold: 'false',
    confirmType: 'invalid',
    keyboardType: 'emoji'
  };

  return runKeyboardOptionContract(runtime, 'showKeyboard', invalidArgs, {
    timeoutMs: 6000,
    idleWaitMs: 3500
  }).then((result) => ({
    ...result,
    invalidArgsApplied: true,
    negativeOutcomeObserved: result.threw || result.failCalled || result.timeout || !result.successCalled
  }));
}

function runUpdateKeyboardNegativeInvalidArgs(runtime) {
  const invalidArgs = {
    value: 123
  };

  return runKeyboardOptionContract(runtime, 'updateKeyboard', invalidArgs, {
    timeoutMs: 6000,
    idleWaitMs: 3500
  }).then((result) => ({
    ...result,
    invalidArgsApplied: true,
    negativeOutcomeObserved: result.threw || result.failCalled || result.timeout || !result.successCalled
  }));
}

function isKeyboardValuePayloadValid(payload) {
  return isObject(payload) && isString(payload.value);
}

function isKeyEventPayloadValid(payload) {
  return isObject(payload)
    && isString(payload.key)
    && isString(payload.code)
    && isFiniteNumber(payload.timeStamp);
}

function isKeyboardHeightPayloadValid(payload) {
  return isObject(payload)
    && isFiniteNumber(payload.height)
    && payload.height >= 0;
}

function mapKeyEventPayload(payload) {
  return {
    payloadValid: isKeyEventPayloadValid(payload),
    keyValid: isString(payload?.key),
    codeValid: isString(payload?.code),
    timeStampValid: isFiniteNumber(payload?.timeStamp)
  };
}

function mapKeyboardValuePayload(payload) {
  return {
    payloadValid: isKeyboardValuePayloadValid(payload),
    valueValid: isString(payload?.value)
  };
}

function mapKeyboardHeightPayload(payload) {
  return {
    payloadValid: isKeyboardHeightPayloadValid(payload),
    heightValid: isFiniteNumber(payload?.height) && payload.height >= 0,
    durationValidOrMissing: typeof payload?.duration === 'undefined' || isFiniteNumber(payload.duration)
  };
}

function prepareKeyboardForTyping(runtime, override = {}) {
  tryShowKeyboard(runtime, {
    ...SHOW_KEYBOARD_ARGS,
    confirmHold: true,
    ...override
  });
}

function runKeyboardEventTrigger(runtime, callback, options) {
  const {
    onApiName,
    offApiName,
    payloadMapper,
    prepare
  } = options;

  const onApi = runtime && runtime[onApiName];
  if (typeof onApi !== 'function') {
    callback({ _error: `${onApiName} 不存在` });
    return;
  }

  const listener = (payload) => {
    clearGlobalListener(runtime, onApiName);
    let mapped = {};
    try {
      mapped = typeof payloadMapper === 'function' ? payloadMapper(payload) : {};
    } catch (e) {
      mapped = {
        payloadValid: false,
        payloadMapError: formatError(e)
      };
    }

    callback({
      apiExists: true,
      listenerRegistered: true,
      ...mapped,
      raw: normalizeRaw(payload)
    });
  };

  try {
    registerGlobalListener(runtime, onApiName, offApiName, listener);
  } catch (e) {
    callback({
      apiExists: true,
      listenerRegistered: false,
      error: formatError(e)
    });
    return;
  }

  try {
    if (typeof prepare === 'function') {
      prepare(runtime);
    }
  } catch (e) {
    clearGlobalListener(runtime, onApiName);
    callback({
      apiExists: true,
      listenerRegistered: true,
      prepareThrew: true,
      error: formatError(e)
    });
  }
}

function cleanupSingleKeyboardEvent(runtime, onApiName) {
  clearGlobalListener(runtime, onApiName);
  tryHideKeyboard(runtime);
}

export default [
  {
    name: 'migo.showKeyboard',
    category: 'device',
    tests: [
      {
        id: 'migo.showKeyboard',
        name: '拉起键盘（正向能力）',
        description: '手动场景：调用 showKeyboard 拉起键盘，确认键盘出现并验证 success/fail/complete 契约与 raw 输出',
        type: 'async',
        timeout: 18000,
        automation: 'manual',
        manualRequired: true,
        run: (runtime) => runKeyboardOptionContract(runtime, 'showKeyboard', SHOW_KEYBOARD_ARGS, {
          timeoutMs: 15000,
          idleWaitMs: 12000
        }).then((result) => ({
          ...result,
          showArgsValid: isShowKeyboardArgsValid(SHOW_KEYBOARD_ARGS)
        })),
        cleanup: (runtime) => {
          cleanupKeyboardState(runtime);
        },
        expect: {
          apiExists: true,
          threw: false,
          timeout: false,
          callbackInvoked: true,
          successCalled: true,
          failCalled: false,
          completeCalled: true,
          completeAfterOutcome: true,
          multipleOutcomeCallbacks: false,
          showArgsValid: true,
          successPayloadValidOrNoSuccess: true,
          failPayloadValidOrNoFail: true,
          raw: '@exists'
        },
        allowVariance: ['callbackTrace']
      },
      {
        id: 'keyboard-showKeyboard-callback-contract',
        name: '回调契约（success/fail/complete）',
        description: '验证 showKeyboard 的 outcome 单一性与 complete 时序，允许 success/fail 分支波动',
        type: 'async',
        timeout: 15000,
        run: (runtime) => runKeyboardOptionContract(runtime, 'showKeyboard', SHOW_KEYBOARD_ARGS, {
          timeoutMs: 12000,
          idleWaitMs: 9000
        }).then((result) => ({
          ...result,
          showArgsValid: isShowKeyboardArgsValid(SHOW_KEYBOARD_ARGS)
        })),
        cleanup: (runtime) => {
          cleanupKeyboardState(runtime);
        },
        expect: {
          apiExists: true,
          threw: false,
          timeout: false,
          callbackInvoked: true,
          completeCalled: true,
          completeAfterOutcome: true,
          multipleOutcomeCallbacks: false,
          showArgsValid: true,
          successPayloadValidOrNoSuccess: true,
          failPayloadValidOrNoFail: true,
          raw: '@exists'
        },
        allowVariance: ['successCalled', 'failCalled', 'callbackTrace']
      },
      {
        id: 'keyboard-showKeyboard-promise-support',
        name: 'Promise 风格支持',
        description: '验证 showKeyboard 支持 Promise 风格调用（与回调契约用例分离）',
        type: 'sync',
        run: (runtime) => probePromiseSupport(runtime, 'showKeyboard', SHOW_KEYBOARD_ARGS),
        expect: {
          apiExists: true,
          threw: false,
          promiseStyleSupported: true
        }
      },
      {
        id: 'keyboard-showKeyboard-invalid-options-negative',
        name: '反向异常验证（无效参数）',
        description: '使用非法参数调用 showKeyboard，验证异常路径可观测（fail/throw/timeout）',
        type: 'async',
        timeout: 7000,
        run: (runtime) => runShowKeyboardNegativeInvalidArgs(runtime),
        cleanup: (runtime) => {
          cleanupKeyboardState(runtime);
        },
        expect: {
          apiExists: true,
          invalidArgsApplied: true,
          negativeOutcomeObserved: true,
          multipleOutcomeCallbacks: false,
          failPayloadValidOrNoFail: true
        },
        allowVariance: ['threw', 'timeout', 'callbackInvoked', 'successCalled', 'failCalled', 'completeCalled', 'completeAfterOutcome', 'callbackTrace', 'raw', 'error']
      }
    ]
  },

  {
    name: 'migo.hideKeyboard',
    category: 'device',
    tests: [
      {
        id: 'migo.hideKeyboard',
        name: '收起键盘（正向能力）',
        description: '手动场景：先拉起键盘再调用 hideKeyboard，验证 success 路径与回调契约',
        type: 'async',
        timeout: 18000,
        automation: 'manual',
        manualRequired: true,
        run: (runtime) => runHideKeyboardPositive(runtime),
        cleanup: (runtime) => {
          cleanupKeyboardState(runtime);
        },
        expect: {
          apiExists: true,
          threw: false,
          timeout: false,
          callbackInvoked: true,
          successCalled: true,
          failCalled: false,
          completeCalled: true,
          completeAfterOutcome: true,
          multipleOutcomeCallbacks: false,
          successPayloadValidOrNoSuccess: true,
          failPayloadValidOrNoFail: true,
          raw: '@exists'
        },
        allowVariance: ['showPrepared', 'showPrepareThrew', 'showPrepareError', 'callbackTrace']
      },
      {
        id: 'keyboard-hideKeyboard-callback-contract',
        name: '回调契约（success/fail/complete）',
        description: '验证 hideKeyboard 的 outcome 单一性与 complete 时序，允许 success/fail 分支波动',
        type: 'async',
        timeout: 12000,
        run: (runtime) => runKeyboardOptionContract(runtime, 'hideKeyboard', {}, {
          timeoutMs: 10000,
          idleWaitMs: 8000
        }),
        cleanup: (runtime) => {
          cleanupKeyboardState(runtime);
        },
        expect: {
          apiExists: true,
          threw: false,
          timeout: false,
          callbackInvoked: true,
          completeCalled: true,
          completeAfterOutcome: true,
          multipleOutcomeCallbacks: false,
          successPayloadValidOrNoSuccess: true,
          failPayloadValidOrNoFail: true,
          raw: '@exists'
        },
        allowVariance: ['successCalled', 'failCalled', 'callbackTrace']
      },
      {
        id: 'keyboard-hideKeyboard-promise-support',
        name: 'Promise 风格支持',
        description: '验证 hideKeyboard 支持 Promise 风格调用（与回调契约用例分离）',
        type: 'sync',
        run: (runtime) => probePromiseSupport(runtime, 'hideKeyboard', {}),
        expect: {
          apiExists: true,
          threw: false,
          promiseStyleSupported: true
        }
      }
    ]
  },

  {
    name: 'migo.updateKeyboard',
    category: 'device',
    tests: [
      {
        id: 'migo.updateKeyboard',
        name: '更新键盘输入内容（正向能力）',
        description: '手动场景：先拉起键盘再调用 updateKeyboard，验证 success 路径、value 参数与 raw 输出',
        type: 'async',
        timeout: 18000,
        automation: 'manual',
        manualRequired: true,
        run: (runtime) => runUpdateKeyboardPositive(runtime),
        cleanup: (runtime) => {
          cleanupKeyboardState(runtime);
        },
        expect: {
          apiExists: true,
          threw: false,
          timeout: false,
          callbackInvoked: true,
          successCalled: true,
          failCalled: false,
          completeCalled: true,
          completeAfterOutcome: true,
          multipleOutcomeCallbacks: false,
          updateArgsValid: true,
          successPayloadValidOrNoSuccess: true,
          failPayloadValidOrNoFail: true,
          raw: '@exists'
        },
        allowVariance: ['showPrepared', 'showPrepareThrew', 'showPrepareError', 'callbackTrace']
      },
      {
        id: 'keyboard-updateKeyboard-callback-contract',
        name: '回调契约（success/fail/complete）',
        description: '验证 updateKeyboard 的 outcome 单一性与 complete 时序，允许 success/fail 分支波动',
        type: 'async',
        timeout: 12000,
        run: (runtime) => runKeyboardOptionContract(runtime, 'updateKeyboard', UPDATE_KEYBOARD_ARGS, {
          timeoutMs: 10000,
          idleWaitMs: 8000
        }).then((result) => ({
          ...result,
          updateArgsValid: isUpdateKeyboardArgsValid(UPDATE_KEYBOARD_ARGS)
        })),
        cleanup: (runtime) => {
          cleanupKeyboardState(runtime);
        },
        expect: {
          apiExists: true,
          threw: false,
          timeout: false,
          callbackInvoked: true,
          completeCalled: true,
          completeAfterOutcome: true,
          multipleOutcomeCallbacks: false,
          updateArgsValid: true,
          successPayloadValidOrNoSuccess: true,
          failPayloadValidOrNoFail: true,
          raw: '@exists'
        },
        allowVariance: ['successCalled', 'failCalled', 'callbackTrace']
      },
      {
        id: 'keyboard-updateKeyboard-promise-support',
        name: 'Promise 风格支持',
        description: '验证 updateKeyboard 支持 Promise 风格调用（与回调契约用例分离）',
        type: 'sync',
        run: (runtime) => probePromiseSupport(runtime, 'updateKeyboard', UPDATE_KEYBOARD_ARGS),
        expect: {
          apiExists: true,
          threw: false,
          promiseStyleSupported: true
        }
      },
      {
        id: 'keyboard-updateKeyboard-invalid-options-negative',
        name: '反向异常验证（无效参数）',
        description: '使用非法 value 调用 updateKeyboard，验证异常路径可观测（fail/throw/timeout）',
        type: 'async',
        timeout: 7000,
        run: (runtime) => runUpdateKeyboardNegativeInvalidArgs(runtime),
        cleanup: (runtime) => {
          cleanupKeyboardState(runtime);
        },
        expect: {
          apiExists: true,
          invalidArgsApplied: true,
          negativeOutcomeObserved: true,
          multipleOutcomeCallbacks: false,
          failPayloadValidOrNoFail: true
        },
        allowVariance: ['threw', 'timeout', 'callbackInvoked', 'successCalled', 'failCalled', 'completeCalled', 'completeAfterOutcome', 'callbackTrace', 'raw', 'error']
      }
    ]
  },

  {
    name: 'migo.onKeyDown',
    category: 'device',
    tests: [
      {
        id: 'keyboard-onKeyDown-register-contract',
        name: 'onKeyDown 注册契约',
        description: '验证 onKeyDown 可注册监听，且可配套 offKeyDown 解除（仅 PC 平台）',
        type: 'sync',
        unsupportedPolicy: 'skip',
        run: (runtime) => runGlobalOnRegisterContract(runtime, 'onKeyDown', 'offKeyDown'),
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
        id: 'migo.onKeyDown',
        name: '按键按下事件触发',
        description: '手动场景：拉起键盘后按任意键，验证 onKeyDown payload（key/code/timeStamp）与 raw 输出（仅 PC 平台）',
        type: 'event',
        timeout: 18000,
        automation: 'manual',
        manualRequired: true,
        unsupportedPolicy: 'skip',
        run: (runtime, callback) => runKeyboardEventTrigger(runtime, callback, {
          onApiName: 'onKeyDown',
          offApiName: 'offKeyDown',
          payloadMapper: mapKeyEventPayload,
          prepare: (rt) => {
            prepareKeyboardForTyping(rt, { defaultValue: 'keydown' });
          }
        }),
        cleanup: (runtime) => {
          cleanupSingleKeyboardEvent(runtime, 'onKeyDown');
        },
        expect: {
          eventReceived: true,
          apiExists: true,
          listenerRegistered: true,
          payloadValid: true,
          keyValid: true,
          codeValid: true,
          timeStampValid: true,
          raw: '@exists'
        }
      }
    ]
  },

  {
    name: 'migo.offKeyDown',
    category: 'device',
    tests: [
      {
        id: 'migo.offKeyDown',
        name: 'offKeyDown 取消监听契约',
        description: '验证 offKeyDown 支持传 listener 与不传 listener 两种反注册方式（仅 PC 平台）',
        type: 'sync',
        unsupportedPolicy: 'skip',
        run: (runtime) => runGlobalOffContract(runtime, 'onKeyDown', 'offKeyDown'),
        expect: {
          offWithListenerThrew: false,
          offWithoutListenerThrew: false,
          registerSucceededOrOffSupported: true,
          offWithListenerReturnThenable: false,
          offWithoutListenerReturnThenable: false,
          raw: '@exists'
        },
        allowVariance: ['registerThrew', 'error']
      }
    ]
  },

  {
    name: 'migo.onKeyUp',
    category: 'device',
    tests: [
      {
        id: 'keyboard-onKeyUp-register-contract',
        name: 'onKeyUp 注册契约',
        description: '验证 onKeyUp 可注册监听，且可配套 offKeyUp 解除（仅 PC 平台）',
        type: 'sync',
        unsupportedPolicy: 'skip',
        run: (runtime) => runGlobalOnRegisterContract(runtime, 'onKeyUp', 'offKeyUp'),
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
        id: 'migo.onKeyUp',
        name: '按键抬起事件触发',
        description: '手动场景：拉起键盘后按任意键并抬起，验证 onKeyUp payload（key/code/timeStamp）与 raw 输出（仅 PC 平台）',
        type: 'event',
        timeout: 18000,
        automation: 'manual',
        manualRequired: true,
        unsupportedPolicy: 'skip',
        run: (runtime, callback) => runKeyboardEventTrigger(runtime, callback, {
          onApiName: 'onKeyUp',
          offApiName: 'offKeyUp',
          payloadMapper: mapKeyEventPayload,
          prepare: (rt) => {
            prepareKeyboardForTyping(rt, { defaultValue: 'keyup' });
          }
        }),
        cleanup: (runtime) => {
          cleanupSingleKeyboardEvent(runtime, 'onKeyUp');
        },
        expect: {
          eventReceived: true,
          apiExists: true,
          listenerRegistered: true,
          payloadValid: true,
          keyValid: true,
          codeValid: true,
          timeStampValid: true,
          raw: '@exists'
        }
      }
    ]
  },

  {
    name: 'migo.offKeyUp',
    category: 'device',
    tests: [
      {
        id: 'migo.offKeyUp',
        name: 'offKeyUp 取消监听契约',
        description: '验证 offKeyUp 支持传 listener 与不传 listener 两种反注册方式（仅 PC 平台）',
        type: 'sync',
        unsupportedPolicy: 'skip',
        run: (runtime) => runGlobalOffContract(runtime, 'onKeyUp', 'offKeyUp'),
        expect: {
          offWithListenerThrew: false,
          offWithoutListenerThrew: false,
          registerSucceededOrOffSupported: true,
          offWithListenerReturnThenable: false,
          offWithoutListenerReturnThenable: false,
          raw: '@exists'
        },
        allowVariance: ['registerThrew', 'error']
      }
    ]
  },

  {
    name: 'migo.onKeyboardInput',
    category: 'device',
    tests: [
      {
        id: 'keyboard-onKeyboardInput-register-contract',
        name: 'onKeyboardInput 注册契约',
        description: '验证 onKeyboardInput 可注册监听，且可配套 offKeyboardInput 解除',
        type: 'sync',
        run: (runtime) => runGlobalOnRegisterContract(runtime, 'onKeyboardInput', 'offKeyboardInput'),
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
        id: 'migo.onKeyboardInput',
        name: '键盘输入事件触发',
        description: '手动场景：拉起键盘并输入字符，验证 onKeyboardInput payload.value 与 raw 输出',
        type: 'event',
        timeout: 18000,
        automation: 'manual',
        manualRequired: true,
        run: (runtime, callback) => runKeyboardEventTrigger(runtime, callback, {
          onApiName: 'onKeyboardInput',
          offApiName: 'offKeyboardInput',
          payloadMapper: mapKeyboardValuePayload,
          prepare: (rt) => {
            prepareKeyboardForTyping(rt, { defaultValue: 'input' });
          }
        }),
        cleanup: (runtime) => {
          cleanupSingleKeyboardEvent(runtime, 'onKeyboardInput');
        },
        expect: {
          eventReceived: true,
          apiExists: true,
          listenerRegistered: true,
          payloadValid: true,
          valueValid: true,
          raw: '@exists'
        }
      }
    ]
  },

  {
    name: 'migo.offKeyboardInput',
    category: 'device',
    tests: [
      {
        id: 'migo.offKeyboardInput',
        name: 'offKeyboardInput 取消监听契约',
        description: '验证 offKeyboardInput 支持传 listener 与不传 listener 两种反注册方式',
        type: 'sync',
        run: (runtime) => runGlobalOffContract(runtime, 'onKeyboardInput', 'offKeyboardInput'),
        expect: {
          offWithListenerThrew: false,
          offWithoutListenerThrew: false,
          registerSucceededOrOffSupported: true,
          offWithListenerReturnThenable: false,
          offWithoutListenerReturnThenable: false,
          raw: '@exists'
        },
        allowVariance: ['registerThrew', 'error']
      }
    ]
  },

  {
    name: 'migo.onKeyboardHeightChange',
    category: 'device',
    tests: [
      {
        id: 'keyboard-onKeyboardHeightChange-register-contract',
        name: 'onKeyboardHeightChange 注册契约',
        description: '验证 onKeyboardHeightChange 可注册监听，且可配套 offKeyboardHeightChange 解除',
        type: 'sync',
        run: (runtime) => runGlobalOnRegisterContract(runtime, 'onKeyboardHeightChange', 'offKeyboardHeightChange'),
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
        id: 'migo.onKeyboardHeightChange',
        name: '键盘高度变化事件触发',
        description: '手动场景：拉起/收起键盘，验证 onKeyboardHeightChange payload.height 与 raw 输出',
        type: 'event',
        timeout: 18000,
        automation: 'manual',
        manualRequired: true,
        run: (runtime, callback) => runKeyboardEventTrigger(runtime, callback, {
          onApiName: 'onKeyboardHeightChange',
          offApiName: 'offKeyboardHeightChange',
          payloadMapper: mapKeyboardHeightPayload,
          prepare: (rt) => {
            prepareKeyboardForTyping(rt, { defaultValue: 'height', confirmHold: false });
            setTimeout(() => {
              tryHideKeyboard(rt);
            }, 800);
          }
        }),
        cleanup: (runtime) => {
          cleanupSingleKeyboardEvent(runtime, 'onKeyboardHeightChange');
        },
        expect: {
          eventReceived: true,
          apiExists: true,
          listenerRegistered: true,
          payloadValid: true,
          heightValid: true,
          durationValidOrMissing: true,
          raw: '@exists'
        }
      }
    ]
  },

  {
    name: 'migo.offKeyboardHeightChange',
    category: 'device',
    tests: [
      {
        id: 'migo.offKeyboardHeightChange',
        name: 'offKeyboardHeightChange 取消监听契约',
        description: '验证 offKeyboardHeightChange 支持传 listener 与不传 listener 两种反注册方式',
        type: 'sync',
        run: (runtime) => runGlobalOffContract(runtime, 'onKeyboardHeightChange', 'offKeyboardHeightChange'),
        expect: {
          offWithListenerThrew: false,
          offWithoutListenerThrew: false,
          registerSucceededOrOffSupported: true,
          offWithListenerReturnThenable: false,
          offWithoutListenerReturnThenable: false,
          raw: '@exists'
        },
        allowVariance: ['registerThrew', 'error']
      }
    ]
  },

  {
    name: 'migo.onKeyboardConfirm',
    category: 'device',
    tests: [
      {
        id: 'keyboard-onKeyboardConfirm-register-contract',
        name: 'onKeyboardConfirm 注册契约',
        description: '验证 onKeyboardConfirm 可注册监听，且可配套 offKeyboardConfirm 解除',
        type: 'sync',
        run: (runtime) => runGlobalOnRegisterContract(runtime, 'onKeyboardConfirm', 'offKeyboardConfirm'),
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
        id: 'migo.onKeyboardConfirm',
        name: '键盘确认事件触发',
        description: '手动场景：拉起键盘并点击确认按钮，验证 onKeyboardConfirm payload.value 与 raw 输出',
        type: 'event',
        timeout: 18000,
        automation: 'manual',
        manualRequired: true,
        run: (runtime, callback) => runKeyboardEventTrigger(runtime, callback, {
          onApiName: 'onKeyboardConfirm',
          offApiName: 'offKeyboardConfirm',
          payloadMapper: mapKeyboardValuePayload,
          prepare: (rt) => {
            prepareKeyboardForTyping(rt, {
              defaultValue: 'confirm',
              confirmType: 'done'
            });
          }
        }),
        cleanup: (runtime) => {
          cleanupSingleKeyboardEvent(runtime, 'onKeyboardConfirm');
        },
        expect: {
          eventReceived: true,
          apiExists: true,
          listenerRegistered: true,
          payloadValid: true,
          valueValid: true,
          raw: '@exists'
        }
      }
    ]
  },

  {
    name: 'migo.offKeyboardConfirm',
    category: 'device',
    tests: [
      {
        id: 'migo.offKeyboardConfirm',
        name: 'offKeyboardConfirm 取消监听契约',
        description: '验证 offKeyboardConfirm 支持传 listener 与不传 listener 两种反注册方式',
        type: 'sync',
        run: (runtime) => runGlobalOffContract(runtime, 'onKeyboardConfirm', 'offKeyboardConfirm'),
        expect: {
          offWithListenerThrew: false,
          offWithoutListenerThrew: false,
          registerSucceededOrOffSupported: true,
          offWithListenerReturnThenable: false,
          offWithoutListenerReturnThenable: false,
          raw: '@exists'
        },
        allowVariance: ['registerThrew', 'error']
      }
    ]
  },

  {
    name: 'migo.onKeyboardComplete',
    category: 'device',
    tests: [
      {
        id: 'keyboard-onKeyboardComplete-register-contract',
        name: 'onKeyboardComplete 注册契约',
        description: '验证 onKeyboardComplete 可注册监听，且可配套 offKeyboardComplete 解除',
        type: 'sync',
        run: (runtime) => runGlobalOnRegisterContract(runtime, 'onKeyboardComplete', 'offKeyboardComplete'),
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
        id: 'migo.onKeyboardComplete',
        name: '键盘收起事件触发',
        description: '手动场景：拉起后收起键盘，验证 onKeyboardComplete payload.value 与 raw 输出',
        type: 'event',
        timeout: 18000,
        automation: 'manual',
        manualRequired: true,
        run: (runtime, callback) => runKeyboardEventTrigger(runtime, callback, {
          onApiName: 'onKeyboardComplete',
          offApiName: 'offKeyboardComplete',
          payloadMapper: mapKeyboardValuePayload,
          prepare: (rt) => {
            prepareKeyboardForTyping(rt, { defaultValue: 'complete' });
            setTimeout(() => {
              tryHideKeyboard(rt);
            }, 900);
          }
        }),
        cleanup: (runtime) => {
          cleanupSingleKeyboardEvent(runtime, 'onKeyboardComplete');
        },
        expect: {
          eventReceived: true,
          apiExists: true,
          listenerRegistered: true,
          payloadValid: true,
          valueValid: true,
          raw: '@exists'
        }
      }
    ]
  },

  {
    name: 'migo.offKeyboardComplete',
    category: 'device',
    tests: [
      {
        id: 'migo.offKeyboardComplete',
        name: 'offKeyboardComplete 取消监听契约',
        description: '验证 offKeyboardComplete 支持传 listener 与不传 listener 两种反注册方式',
        type: 'sync',
        run: (runtime) => runGlobalOffContract(runtime, 'onKeyboardComplete', 'offKeyboardComplete'),
        expect: {
          offWithListenerThrew: false,
          offWithoutListenerThrew: false,
          registerSucceededOrOffSupported: true,
          offWithListenerReturnThenable: false,
          offWithoutListenerReturnThenable: false,
          raw: '@exists'
        },
        allowVariance: ['registerThrew', 'error']
      }
    ]
  }
];
