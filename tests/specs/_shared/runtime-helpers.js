export function isObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

export function isString(value) {
  return typeof value === 'string';
}

export function isFiniteNumber(value) {
  return typeof value === 'number' && Number.isFinite(value);
}

export function isThenable(value) {
  return !!value && (typeof value === 'object' || typeof value === 'function') && typeof value.then === 'function';
}

export function normalizeRaw(value) {
  return typeof value === 'undefined' ? null : value;
}

export function formatError(error) {
  if (!error) {
    return 'unknown error';
  }
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  try {
    return JSON.stringify(error);
  } catch (e) {
    return String(error);
  }
}

export function safelyAttachPromiseHandlers(value) {
  if (!isThenable(value)) {
    return;
  }
  try {
    value.then(() => {}, () => {});
  } catch (e) {
    // ignore
  }
}

export function probePromiseSupport(runtime, apiName, args = {}) {
  const api = runtime[apiName];
  if (typeof api !== 'function') {
    return { _error: `${apiName} 不存在` };
  }

  try {
    const returned = api(args);
    const promiseStyleSupported = isThenable(returned);
    safelyAttachPromiseHandlers(returned);

    return {
      apiExists: true,
      threw: false,
      promiseStyleSupported
    };
  } catch (e) {
    return {
      apiExists: true,
      threw: true,
      promiseStyleSupported: false,
      error: formatError(e)
    };
  }
}

export function runOptionApiContract(runtime, apiName, options = {}) {
  const {
    args = {},
    timeoutMs = 5000,
    settleDelayMs = 260,
    idleWaitMs = 2000,
    autoSettleAfterInvoke = false,
    validateSuccessPayload
  } = options;

  return new Promise((resolve) => {
    const api = runtime[apiName];
    if (typeof api !== 'function') {
      resolve({ _error: `${apiName} 不存在` });
      return;
    }

    let settled = false;
    let settleTimer = null;
    let idleTimer = null;
    let rawCaptured = false;
    const events = [];

    const result = {
      apiExists: true,
      threw: false,
      timeout: false,
      callbackInvoked: false,
      successCalled: false,
      failCalled: false,
      completeCalled: false,
      completeAfterOutcome: false,
      multipleOutcomeCallbacks: false,
      successPayloadValid: true,
      returnThenable: false,
      promiseResolved: false,
      promiseRejected: false,
      callbackTrace: [],
      raw: null,
      successPayload: null,
      failPayload: null,
      completePayload: null,
      error: null
    };

    const finish = () => {
      if (settled) {
        return;
      }

      settled = true;
      clearTimeout(timeoutTimer);
      if (settleTimer) {
        clearTimeout(settleTimer);
      }
      if (idleTimer) {
        clearTimeout(idleTimer);
      }

      const successIndex = events.indexOf('success');
      const failIndex = events.indexOf('fail');
      const completeIndex = events.indexOf('complete');
      const firstOutcomeIndex = (successIndex >= 0 && failIndex >= 0)
        ? Math.min(successIndex, failIndex)
        : Math.max(successIndex, failIndex);

      result.callbackInvoked = result.successCalled || result.failCalled;
      result.multipleOutcomeCallbacks = result.successCalled && result.failCalled;
      result.completeAfterOutcome = firstOutcomeIndex >= 0 && completeIndex >= firstOutcomeIndex;
      result.callbackTrace = events.slice();

      resolve(result);
    };

    const settleSoon = () => {
      if (settled) {
        return;
      }

      if (settleTimer) {
        clearTimeout(settleTimer);
      }

      settleTimer = setTimeout(() => {
        finish();
      }, settleDelayMs);
    };

    const timeoutTimer = setTimeout(() => {
      result.timeout = true;
      finish();
    }, timeoutMs);

    const captureRaw = (payload) => {
      if (rawCaptured) {
        return;
      }
      rawCaptured = true;
      result.raw = normalizeRaw(payload);
    };

    const callArgs = {
      ...args,
      success: (res) => {
        result.successCalled = true;
        result.successPayload = res;
        events.push('success');
        captureRaw(res);

        if (typeof validateSuccessPayload === 'function') {
          try {
            result.successPayloadValid = Boolean(validateSuccessPayload(res));
          } catch (e) {
            result.successPayloadValid = false;
          }
        }

        settleSoon();
      },
      fail: (err) => {
        result.failCalled = true;
        result.failPayload = err;
        events.push('fail');
        captureRaw(err);
        settleSoon();
      },
      complete: (res) => {
        result.completeCalled = true;
        result.completePayload = res;
        events.push('complete');
        captureRaw(res);
        settleSoon();
      }
    };

    let returned;
    try {
      returned = api(callArgs);
    } catch (e) {
      result.threw = true;
      result.error = formatError(e);
      result.raw = null;
      finish();
      return;
    }

    result.returnThenable = isThenable(returned);
    if (result.returnThenable) {
      returned
        .then(() => {
          result.promiseResolved = true;
          settleSoon();
        })
        .catch(() => {
          result.promiseRejected = true;
          settleSoon();
        });
    }

    if (autoSettleAfterInvoke) {
      settleSoon();
    }

    idleTimer = setTimeout(() => {
      if (!result.successCalled && !result.failCalled && !result.completeCalled
        && !result.promiseResolved && !result.promiseRejected) {
        finish();
      }
    }, idleWaitMs);
  });
}

export function runGlobalOnRegisterContract(runtime, onApiName, offApiName) {
  const onApi = runtime[onApiName];
  if (typeof onApi !== 'function') {
    return { _error: `${onApiName} 不存在` };
  }

  const offApi = offApiName ? runtime[offApiName] : undefined;
  const listener = () => {};
  let registerThrew = false;
  let unregisterThrew = false;
  let registerReturn;
  let unregisterReturn;
  let error = null;

  try {
    registerReturn = onApi(listener);
  } catch (e) {
    registerThrew = true;
    error = formatError(e);
  }

  if (!registerThrew && offApiName && typeof offApi === 'function') {
    try {
      unregisterReturn = offApi(listener);
    } catch (e) {
      unregisterThrew = true;
      error = error || formatError(e);
    }
  }

  return {
    apiExists: true,
    registerThrew,
    registerReturnThenable: isThenable(registerReturn),
    unregisterWorkedOrUnsupported: !offApiName || typeof offApi !== 'function' || !unregisterThrew,
    unregisterReturnThenable: isThenable(unregisterReturn),
    raw: normalizeRaw(registerReturn),
    error
  };
}

export function runGlobalOffContract(runtime, onApiName, offApiName) {
  const onApi = runtime[onApiName];
  if (typeof onApi !== 'function') {
    return { _error: `${onApiName} 不存在（${offApiName} 测试依赖）` };
  }

  const offApi = runtime[offApiName];
  if (typeof offApi !== 'function') {
    return { _error: `${offApiName} 不存在` };
  }

  const listener = () => {};
  let registerThrew = false;
  let offWithListenerThrew = false;
  let offWithoutListenerThrew = false;
  let offWithListenerReturn;
  let offWithoutListenerReturn;
  let error = null;

  try {
    onApi(listener);
  } catch (e) {
    registerThrew = true;
    error = formatError(e);
  }

  try {
    offWithListenerReturn = offApi(listener);
  } catch (e) {
    offWithListenerThrew = true;
    error = error || formatError(e);
  }

  try {
    offWithoutListenerReturn = offApi();
  } catch (e) {
    offWithoutListenerThrew = true;
    error = error || formatError(e);
  }

  return {
    registerThrew,
    offWithListenerThrew,
    offWithoutListenerThrew,
    registerSucceededOrOffSupported: !registerThrew || (!offWithListenerThrew && !offWithoutListenerThrew),
    offWithListenerReturnThenable: isThenable(offWithListenerReturn),
    offWithoutListenerReturnThenable: isThenable(offWithoutListenerReturn),
    raw: {
      offWithListenerReturn: normalizeRaw(offWithListenerReturn),
      offWithoutListenerReturn: normalizeRaw(offWithoutListenerReturn)
    },
    error
  };
}
