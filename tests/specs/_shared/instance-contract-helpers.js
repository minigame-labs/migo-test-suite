import {
  isObject,
  isString,
  isThenable,
  normalizeRaw,
  formatError,
  safelyAttachPromiseHandlers
} from './runtime-helpers.js';

const AD_UNIT_ENV_KEYS_BY_CREATE_API = {
  createBannerAd: ['MIGO_AD_UNIT_BANNER', 'AD_UNIT_BANNER', 'WX_AD_UNIT_BANNER'],
  createInterstitialAd: ['MIGO_AD_UNIT_INTERSTITIAL', 'AD_UNIT_INTERSTITIAL', 'WX_AD_UNIT_INTERSTITIAL'],
  createRewardedVideoAd: ['MIGO_AD_UNIT_REWARDED_VIDEO', 'AD_UNIT_REWARDED_VIDEO', 'WX_AD_UNIT_REWARDED_VIDEO'],
  createCustomAd: ['MIGO_AD_UNIT_CUSTOM', 'AD_UNIT_CUSTOM', 'WX_AD_UNIT_CUSTOM'],
  createGridAd: ['MIGO_AD_UNIT_GRID', 'AD_UNIT_GRID', 'WX_AD_UNIT_GRID']
};

export function isPlaceholderAdUnit(adUnitId) {
  return isString(adUnitId) && /^adunit-test-/i.test(adUnitId);
}

function pickEnvAdUnit(runtime, createApiName) {
  const env = runtime && isObject(runtime.env) ? runtime.env : null;
  if (!env) {
    return null;
  }

  const keys = AD_UNIT_ENV_KEYS_BY_CREATE_API[createApiName] || [];
  for (const key of keys) {
    const value = env[key];
    if (isString(value) && value.length > 0) {
      return value;
    }
  }

  return null;
}

export function resolveCreateOptions(runtime, createApiName, createOptions) {
  if (!isObject(createOptions) || !isString(createOptions.adUnitId)) {
    return createOptions;
  }

  if (!isPlaceholderAdUnit(createOptions.adUnitId)) {
    return createOptions;
  }

  const envAdUnitId = pickEnvAdUnit(runtime, createApiName);
  if (!envAdUnitId) {
    return createOptions;
  }

  return {
    ...createOptions,
    adUnitId: envAdUnitId
  };
}

export function hasRealAdUnitConfigured(runtime, createApiName, createOptions) {
  if (!isObject(createOptions) || !isString(createOptions.adUnitId)) {
    return false;
  }

  const resolvedOptions = resolveCreateOptions(runtime, createApiName, createOptions);
  return isString(resolvedOptions?.adUnitId)
    && resolvedOptions.adUnitId.length > 0
    && !isPlaceholderAdUnit(resolvedOptions.adUnitId);
}

export function createRuntimeInstance(runtime, createApiName, createOptions) {
  const createApi = runtime[createApiName];
  if (typeof createApi !== 'function') {
    return {
      instance: null,
      raw: null,
      errorResult: { _error: `${createApiName} 不存在` }
    };
  }

  try {
    const resolvedCreateOptions = resolveCreateOptions(runtime, createApiName, createOptions);
    const instance = createApi(resolvedCreateOptions);
    return {
      instance,
      raw: normalizeRaw(instance),
      errorResult: null
    };
  } catch (e) {
    return {
      instance: null,
      raw: null,
      errorResult: {
        apiExists: true,
        createThrew: true,
        raw: null,
        error: formatError(e)
      }
    };
  }
}

export function destroyInstanceSafely(instance, destroyMethodName = 'destroy') {
  if (!instance || typeof instance[destroyMethodName] !== 'function') {
    return;
  }
  try {
    instance[destroyMethodName]();
  } catch (e) {
    // ignore cleanup error
  }
}

export function hasMethods(target, methods) {
  return methods.every((methodName) => typeof target?.[methodName] === 'function');
}

export function runCreateInstanceContract(runtime, config) {
  const {
    createApiName,
    createOptions,
    requiredMethods,
    destroyMethodName = 'destroy'
  } = config;

  const created = createRuntimeInstance(runtime, createApiName, createOptions);
  if (created.errorResult) {
    return {
      ...created.errorResult,
      returnThenable: false,
      instanceObjectValid: false,
      requiredMethodsValid: false
    };
  }

  const instance = created.instance;
  const result = {
    apiExists: true,
    createThrew: false,
    returnThenable: isThenable(instance),
    instanceObjectValid: isObject(instance),
    requiredMethodsValid: hasMethods(instance, requiredMethods),
    raw: created.raw
  };

  destroyInstanceSafely(instance, destroyMethodName);
  return result;
}

export function runCreateInstanceScenarioMatrix(runtime, config) {
  const {
    createApiName,
    requiredMethods,
    scenarios,
    destroyMethodName = 'destroy'
  } = config;

  if (typeof runtime[createApiName] !== 'function') {
    return { _error: `${createApiName} 不存在` };
  }

  const scenarioResults = scenarios.map((scenario) => {
    const created = createRuntimeInstance(runtime, createApiName, scenario.options);
    if (created.errorResult) {
      return {
        caseId: scenario.caseId,
        options: scenario.options,
        apiExists: true,
        createThrew: true,
        returnThenable: false,
        instanceObjectValid: false,
        requiredMethodsValid: false,
        raw: null,
        error: created.errorResult.error || null
      };
    }

    const instance = created.instance;
    const item = {
      caseId: scenario.caseId,
      options: scenario.options,
      apiExists: true,
      createThrew: false,
      returnThenable: isThenable(instance),
      instanceObjectValid: isObject(instance),
      requiredMethodsValid: hasMethods(instance, requiredMethods),
      raw: created.raw,
      error: null
    };

    destroyInstanceSafely(instance, destroyMethodName);
    return item;
  });

  return {
    scenarioCount: scenarioResults.length,
    allCreateSucceeded: scenarioResults.every((item) => item.createThrew === false),
    allReturnNonPromise: scenarioResults.every((item) => item.returnThenable === false),
    allInstanceObjectValid: scenarioResults.every((item) => item.instanceObjectValid === true),
    allRequiredMethodsValid: scenarioResults.every((item) => item.requiredMethodsValid === true),
    raw: scenarioResults.map((item) => item.raw),
    scenarios: scenarioResults.map((item) => ({
      caseId: item.caseId,
      createThrew: item.createThrew,
      returnThenable: item.returnThenable,
      instanceObjectValid: item.instanceObjectValid,
      requiredMethodsValid: item.requiredMethodsValid,
      error: item.error
    }))
  };
}

export function runInstanceMethodReturnContract(runtime, config) {
  const {
    createApiName,
    createOptions,
    methodName,
    invoke,
    afterInvoke,
    destroyMethodName = 'destroy'
  } = config;

  const created = createRuntimeInstance(runtime, createApiName, createOptions);
  if (created.errorResult) {
    return created.errorResult;
  }

  const instance = created.instance;
  if (!isObject(instance) || typeof instance[methodName] !== 'function') {
    destroyInstanceSafely(instance, destroyMethodName);
    return { _error: `${createApiName}.${methodName} 不存在` };
  }

  let returned;
  let invocationThrew = false;
  let error = null;
  let afterInvokeError = null;

  try {
    returned = typeof invoke === 'function' ? invoke(instance) : instance[methodName]();
    safelyAttachPromiseHandlers(returned);

    if (typeof afterInvoke === 'function') {
      try {
        afterInvoke(instance, returned);
      } catch (e) {
        afterInvokeError = formatError(e);
      }
    }
  } catch (e) {
    invocationThrew = true;
    error = formatError(e);
  }

  destroyInstanceSafely(instance, destroyMethodName);

  return {
    methodExists: true,
    invocationThrew,
    invocationSucceeded: !invocationThrew,
    returnThenable: isThenable(returned),
    raw: invocationThrew ? null : normalizeRaw(returned),
    error,
    afterInvokeError
  };
}

export function runPromiseMethodOutcome(runtime, config) {
  const {
    createApiName,
    createOptions,
    methodName,
    invoke,
    timeoutMs = 12000,
    validateResolvedPayload,
    validateRejectedPayload,
    destroyMethodName = 'destroy'
  } = config;

  return new Promise((resolve) => {
    const created = createRuntimeInstance(runtime, createApiName, createOptions);
    if (created.errorResult) {
      resolve(created.errorResult);
      return;
    }

    const instance = created.instance;
    if (!isObject(instance) || typeof instance[methodName] !== 'function') {
      destroyInstanceSafely(instance, destroyMethodName);
      resolve({ _error: `${createApiName}.${methodName} 不存在` });
      return;
    }

    let settled = false;
    let timeoutTimer = null;
    let resolveCount = 0;
    let rejectCount = 0;

    const result = {
      methodExists: true,
      invocationThrew: false,
      returnThenable: false,
      promiseSettled: false,
      promiseResolved: false,
      promiseRejected: false,
      outcomeSingle: true,
      timeout: false,
      settledOrTimeout: false,
      resolvedPayloadValid: true,
      rejectedPayloadValid: true,
      resolvedPayloadValidOrNoResolve: true,
      rejectedPayloadValidOrNoReject: true,
      raw: null,
      error: null
    };

    const finish = () => {
      if (settled) {
        return;
      }
      settled = true;
      if (timeoutTimer) {
        clearTimeout(timeoutTimer);
      }

      result.promiseSettled = result.promiseResolved || result.promiseRejected;
      result.settledOrTimeout = result.promiseSettled || result.timeout;
      result.outcomeSingle = (resolveCount + rejectCount) <= 1;
      result.resolvedPayloadValidOrNoResolve = !result.promiseResolved || result.resolvedPayloadValid;
      result.rejectedPayloadValidOrNoReject = !result.promiseRejected || result.rejectedPayloadValid;

      destroyInstanceSafely(instance, destroyMethodName);
      resolve(result);
    };

    let returned;
    try {
      returned = typeof invoke === 'function' ? invoke(instance) : instance[methodName]();
      result.raw = normalizeRaw(returned);
    } catch (e) {
      result.invocationThrew = true;
      result.error = formatError(e);
      result.raw = null;
      finish();
      return;
    }

    result.returnThenable = isThenable(returned);
    if (!result.returnThenable) {
      finish();
      return;
    }

    timeoutTimer = setTimeout(() => {
      result.timeout = true;
      finish();
    }, timeoutMs);

    returned
      .then((res) => {
        resolveCount += 1;
        result.promiseResolved = true;
        result.raw = normalizeRaw(res);

        if (typeof validateResolvedPayload === 'function') {
          try {
            result.resolvedPayloadValid = Boolean(validateResolvedPayload(res));
          } catch (e) {
            result.resolvedPayloadValid = false;
          }
        }

        finish();
      })
      .catch((err) => {
        rejectCount += 1;
        result.promiseRejected = true;
        result.raw = normalizeRaw(err);

        if (typeof validateRejectedPayload === 'function') {
          try {
            result.rejectedPayloadValid = Boolean(validateRejectedPayload(err));
          } catch (e) {
            result.rejectedPayloadValid = false;
          }
        }

        finish();
      });
  });
}

export function runOnListenerContract(runtime, config) {
  const {
    createApiName,
    createOptions,
    onMethodName,
    offMethodName,
    destroyMethodName = 'destroy'
  } = config;

  const created = createRuntimeInstance(runtime, createApiName, createOptions);
  if (created.errorResult) {
    return created.errorResult;
  }

  const instance = created.instance;
  if (!isObject(instance) || typeof instance[onMethodName] !== 'function') {
    destroyInstanceSafely(instance, destroyMethodName);
    return { _error: `${createApiName}.${onMethodName} 不存在` };
  }

  const listener = () => {};
  let registerThrew = false;
  let unregisterThrew = false;
  let registerReturn;
  let unregisterReturn;
  let error = null;

  try {
    registerReturn = instance[onMethodName](listener);
  } catch (e) {
    registerThrew = true;
    error = formatError(e);
  }

  if (!registerThrew && offMethodName && typeof instance[offMethodName] === 'function') {
    try {
      unregisterReturn = instance[offMethodName](listener);
    } catch (e) {
      unregisterThrew = true;
      error = error || formatError(e);
    }
  }

  destroyInstanceSafely(instance, destroyMethodName);

  return {
    methodExists: true,
    registerThrew,
    registerSucceeded: !registerThrew,
    registerReturnThenable: isThenable(registerReturn),
    unregisterWorkedOrUnsupported: !offMethodName
      || typeof instance[offMethodName] !== 'function'
      || !unregisterThrew,
    unregisterReturnThenable: isThenable(unregisterReturn),
    raw: normalizeRaw(registerReturn),
    error
  };
}

export function runOffListenerContract(runtime, config) {
  const {
    createApiName,
    createOptions,
    onMethodName,
    offMethodName,
    destroyMethodName = 'destroy'
  } = config;

  const created = createRuntimeInstance(runtime, createApiName, createOptions);
  if (created.errorResult) {
    return created.errorResult;
  }

  const instance = created.instance;
  if (!isObject(instance) || typeof instance[onMethodName] !== 'function') {
    destroyInstanceSafely(instance, destroyMethodName);
    return { _error: `${createApiName}.${onMethodName} 不存在（${offMethodName} 测试依赖）` };
  }
  if (!isObject(instance) || typeof instance[offMethodName] !== 'function') {
    destroyInstanceSafely(instance, destroyMethodName);
    return { _error: `${createApiName}.${offMethodName} 不存在` };
  }

  const listener = () => {};
  let registerThrew = false;
  let offWithListenerThrew = false;
  let offWithoutListenerThrew = false;
  let offWithListenerReturn;
  let offWithoutListenerReturn;
  let error = null;

  try {
    instance[onMethodName](listener);
  } catch (e) {
    registerThrew = true;
    error = formatError(e);
  }

  try {
    offWithListenerReturn = instance[offMethodName](listener);
  } catch (e) {
    offWithListenerThrew = true;
    error = error || formatError(e);
  }

  try {
    offWithoutListenerReturn = instance[offMethodName]();
  } catch (e) {
    offWithoutListenerThrew = true;
    error = error || formatError(e);
  }

  destroyInstanceSafely(instance, destroyMethodName);

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
