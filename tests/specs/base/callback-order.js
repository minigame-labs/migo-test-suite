/**
 * Callback order verification tests
 * Validates: success/fail fires before complete, complete always fires.
 * Uses runOptionApiContract() which tracks callbackTrace and completeAfterOutcome.
 */
import { runOptionApiContract, probePromiseSupport } from '../_shared/runtime-helpers.js';

function callbackOrderTest(apiName, args = {}, expectSuccess = true) {
  const suffix = expectSuccess ? 'success' : 'fail';
  return {
    id: `cborder-${suffix}-${apiName}`,
    name: `${apiName} ${suffix} fires before complete`,
    type: 'async',
    run: (runtime) => runOptionApiContract(runtime, apiName, { args }).then((r) => {
      const trace = r.callbackTrace || [];
      const outcomeIndex = trace.indexOf(expectSuccess ? 'success' : 'fail');
      const completeIndex = trace.indexOf('complete');
      return {
        apiExists: r.apiExists,
        callbackInvoked: r.callbackInvoked,
        successCalled: r.successCalled,
        failCalled: r.failCalled,
        completeCalled: r.completeCalled,
        completeAfterOutcome: r.completeAfterOutcome,
        multipleOutcomeCallbacks: r.multipleOutcomeCallbacks,
        returnThenable: r.returnThenable,
        promiseResolved: r.promiseResolved,
        promiseRejected: r.promiseRejected,
        callbackTrace: trace,
        outcomeBeforeComplete: outcomeIndex >= 0 && completeIndex > outcomeIndex,
        raw: r.raw
      };
    }),
    expect: {
      apiExists: true,
      callbackInvoked: true,
      completeCalled: true,
      completeAfterOutcome: true,
      multipleOutcomeCallbacks: false,
      outcomeBeforeComplete: true
    },
    allowVariance: ['raw', 'callbackTrace', 'returnThenable', 'promiseResolved', 'promiseRejected',
      'successCalled', 'failCalled']
  };
}

function promiseSupportTest(apiName, args = {}) {
  return {
    id: `cborder-promise-${apiName}`,
    name: `${apiName} returns thenable (Promise support)`,
    type: 'sync',
    run: (runtime) => probePromiseSupport(runtime, apiName, args),
    expect: {
      apiExists: true,
      promiseStyleSupported: true
    }
  };
}

const spec = {
  name: 'callback order & Promise support',
  category: 'base',
  tests: [
    // success path: verify success before complete
    callbackOrderTest('getNetworkType', {}, true),
    callbackOrderTest('getSystemInfo', {}, true),
    callbackOrderTest('getBatteryInfo', {}, true),
    callbackOrderTest('getStorageInfo', {}, true),
    callbackOrderTest('setStorage', { key: '__cborder__', data: 'v' }, true),
    callbackOrderTest('getStorage', { key: '__cborder__' }, true),

    // fail path: verify fail before complete
    callbackOrderTest('getStorage', {}, false),

    // Promise support probes
    promiseSupportTest('getNetworkType'),
    promiseSupportTest('getSystemInfo'),
    promiseSupportTest('getBatteryInfo'),
    promiseSupportTest('setStorage', { key: '__cborder_p__', data: 'v' }),
  ]
};

export default [spec];
