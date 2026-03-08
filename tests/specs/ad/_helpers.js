import {
  isObject,
  isString,
  isFiniteNumber,
  isThenable,
  normalizeRaw,
  formatError,
  safelyAttachPromiseHandlers
} from '../_shared/runtime-helpers.js';

import {
  createRuntimeInstance,
  destroyInstanceSafely,
  hasMethods,
  runCreateInstanceContract,
  runCreateInstanceScenarioMatrix,
  runInstanceMethodReturnContract,
  runPromiseMethodOutcome,
  runOnListenerContract,
  runOffListenerContract,
  hasRealAdUnitConfigured
} from '../_shared/instance-contract-helpers.js';

export {
  isObject,
  isString,
  isFiniteNumber,
  isThenable,
  normalizeRaw,
  formatError,
  safelyAttachPromiseHandlers
};

export {
  createRuntimeInstance as createAdInstance,
  destroyInstanceSafely as destroyAdSafely,
  hasMethods,
  runCreateInstanceContract as runCreateAdContract,
  runCreateInstanceScenarioMatrix as runCreateAdScenarioMatrix,
  runInstanceMethodReturnContract,
  runPromiseMethodOutcome,
  runOnListenerContract,
  runOffListenerContract,
  hasRealAdUnitConfigured
};

function waitThenableOutcome(value, timeoutMs) {
  if (!isThenable(value)) {
    return Promise.resolve({
      thenable: false,
      settled: true,
      resolved: false,
      rejected: false,
      timeout: false,
      raw: normalizeRaw(value),
      error: null
    });
  }

  return new Promise((resolve) => {
    let settled = false;
    const timer = setTimeout(() => {
      if (settled) {
        return;
      }
      settled = true;
      resolve({
        thenable: true,
        settled: false,
        resolved: false,
        rejected: false,
        timeout: true,
        raw: null,
        error: null
      });
    }, timeoutMs);

    value
      .then((res) => {
        if (settled) {
          return;
        }
        settled = true;
        clearTimeout(timer);
        resolve({
          thenable: true,
          settled: true,
          resolved: true,
          rejected: false,
          timeout: false,
          raw: normalizeRaw(res),
          error: null
        });
      })
      .catch((err) => {
        if (settled) {
          return;
        }
        settled = true;
        clearTimeout(timer);
        resolve({
          thenable: true,
          settled: true,
          resolved: false,
          rejected: true,
          timeout: false,
          raw: normalizeRaw(err),
          error: formatError(err)
        });
      });
  });
}

export async function runAdShowWorkManual(runtime, config) {
  const {
    createApiName,
    createOptions,
    showMethodName = 'show',
    loadMethodName = 'load',
    requireLoad = true,
    loadTimeoutMs = 16000,
    showTimeoutMs = 22000,
    destroyMethodName = 'destroy'
  } = config;

  if (!hasRealAdUnitConfigured(runtime, createApiName, createOptions)) {
    return {
      _error: `${createApiName} not supported: real adUnitId not configured in runtime.env`
    };
  }

  const created = createRuntimeInstance(runtime, createApiName, createOptions);
  if (created.errorResult) {
    return created.errorResult;
  }

  const adInstance = created.instance;
  if (!isObject(adInstance) || typeof adInstance[showMethodName] !== 'function') {
    destroyInstanceSafely(adInstance, destroyMethodName);
    return { _error: `${createApiName}.${showMethodName} 不存在` };
  }

  let loadInvoked = false;
  let loadInvokeThrew = false;
  let loadInvokeError = null;
  let loadReturned;
  let loadOutcome = null;

  if (requireLoad && typeof adInstance[loadMethodName] === 'function') {
    loadInvoked = true;
    try {
      loadReturned = adInstance[loadMethodName]();
      safelyAttachPromiseHandlers(loadReturned);
      loadOutcome = await waitThenableOutcome(loadReturned, loadTimeoutMs);
    } catch (e) {
      loadInvokeThrew = true;
      loadInvokeError = formatError(e);
    }
  }

  let showInvoked = false;
  let showInvokeThrew = false;
  let showInvokeError = null;
  let showReturned;
  let showOutcome = null;

  try {
    showInvoked = true;
    showReturned = adInstance[showMethodName]();
    safelyAttachPromiseHandlers(showReturned);
    showOutcome = await waitThenableOutcome(showReturned, showTimeoutMs);
  } catch (e) {
    showInvokeThrew = true;
    showInvokeError = formatError(e);
  }

  destroyInstanceSafely(adInstance, destroyMethodName);

  const showResolved = Boolean(showOutcome?.resolved);
  const showRejected = Boolean(showOutcome?.rejected);

  return {
    adUnitConfigured: true,
    apiExists: true,
    createThrew: false,
    loadInvoked,
    loadInvokeThrew,
    loadInvokeError,
    loadReturnThenable: isThenable(loadReturned),
    loadResolved: Boolean(loadOutcome?.resolved),
    loadRejected: Boolean(loadOutcome?.rejected),
    loadTimeout: Boolean(loadOutcome?.timeout),
    showInvoked,
    showInvokeThrew,
    showInvokeError,
    showReturnThenable: isThenable(showReturned),
    showResolved,
    showRejected,
    showTimeout: Boolean(showOutcome?.timeout),
    workSucceeded: showResolved,
    raw: showOutcome?.raw ?? loadOutcome?.raw ?? created.raw,
    loadRaw: loadOutcome?.raw ?? null,
    showRaw: showOutcome?.raw ?? null
  };
}
