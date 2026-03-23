/**
 * errMsg format consistency tests
 * Verifies success/fail error messages follow "apiName:ok" / "apiName:fail reason" pattern.
 * Uses runOptionApiContract() for full callback+Promise contract coverage.
 */
import { runOptionApiContract } from '../_shared/runtime-helpers.js';

const ERRMSG_OK_RE = /^[a-zA-Z]+:ok$/;
const ERRMSG_FAIL_RE = /^[a-zA-Z]+:fail($|\s)/;

function successErrMsgTest(apiName, args = {}) {
  return {
    id: `errmsg-ok-${apiName}`,
    name: `${apiName} success errMsg = "...ok"`,
    type: 'async',
    run: (runtime) => runOptionApiContract(runtime, apiName, { args }).then((r) => {
      const payload = r.successPayload || {};
      const msg = typeof payload.errMsg === 'string' ? payload.errMsg : '';
      return {
        apiExists: r.apiExists,
        successCalled: r.successCalled,
        completeCalled: r.completeCalled,
        completeAfterOutcome: r.completeAfterOutcome,
        returnThenable: r.returnThenable,
        hasErrMsg: typeof payload.errMsg === 'string',
        errMsg: msg,
        matchesOkPattern: ERRMSG_OK_RE.test(msg),
        startsWithApiName: msg.startsWith(apiName + ':'),
        raw: r.raw
      };
    }),
    expect: {
      apiExists: true,
      successCalled: true,
      completeCalled: true,
      completeAfterOutcome: true,
      hasErrMsg: true,
      matchesOkPattern: true,
      startsWithApiName: true
    },
    allowVariance: ['raw', 'errMsg', 'returnThenable']
  };
}

function failErrMsgTest(apiName, args = {}) {
  return {
    id: `errmsg-fail-${apiName}`,
    name: `${apiName} fail errMsg = "...fail ..."`,
    type: 'async',
    run: (runtime) => runOptionApiContract(runtime, apiName, { args }).then((r) => {
      const payload = r.failPayload || {};
      const msg = typeof payload.errMsg === 'string' ? payload.errMsg : '';
      return {
        apiExists: r.apiExists,
        failCalled: r.failCalled,
        completeCalled: r.completeCalled,
        completeAfterOutcome: r.completeAfterOutcome,
        returnThenable: r.returnThenable,
        hasErrMsg: typeof payload.errMsg === 'string',
        errMsg: msg,
        matchesFailPattern: ERRMSG_FAIL_RE.test(msg),
        startsWithApiName: msg.startsWith(apiName + ':'),
        raw: r.raw
      };
    }),
    expect: {
      apiExists: true,
      failCalled: true,
      completeCalled: true,
      completeAfterOutcome: true,
      hasErrMsg: true,
      matchesFailPattern: true,
      startsWithApiName: true
    },
    allowVariance: ['raw', 'errMsg', 'returnThenable']
  };
}

const spec = {
  name: 'errMsg format',
  category: 'base',
  tests: [
    successErrMsgTest('getNetworkType'),
    successErrMsgTest('getSystemInfo'),
    successErrMsgTest('getBatteryInfo'),
    successErrMsgTest('getClipboardData'),
    successErrMsgTest('getScreenBrightness'),
    successErrMsgTest('getStorageInfo'),
    successErrMsgTest('setStorage', { key: '__errmsg_test__', data: 'v' }),
    failErrMsgTest('setStorage', { data: 'no_key' }),
    failErrMsgTest('getStorage', { key: '' }),
    failErrMsgTest('saveImageToPhotosAlbum', { filePath: '' }),
  ]
};

export default [spec];
