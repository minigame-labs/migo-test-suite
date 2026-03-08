/**
 * 数据缓存 API 测试（对齐 apis.md）
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

const STORAGE_KEYS = {
  setSync: '__migo_spec_storage_set_sync__',
  setAsync: '__migo_spec_storage_set_async__',
  setPromise: '__migo_spec_storage_set_promise__',
  getSync: '__migo_spec_storage_get_sync__',
  getAsync: '__migo_spec_storage_get_async__',
  getPromise: '__migo_spec_storage_get_promise__',
  removeSync: '__migo_spec_storage_remove_sync__',
  removeAsync: '__migo_spec_storage_remove_async__',
  removePromise: '__migo_spec_storage_remove_promise__',
  clearA: '__migo_spec_storage_clear_a__',
  clearB: '__migo_spec_storage_clear_b__',
  clearPromise: '__migo_spec_storage_clear_promise__'
};

const STORAGE_VALUES = {
  setSync: 'migo-storage-sync-value',
  setAsync: 'migo-storage-async-value',
  setPromise: 'migo-storage-promise-value',
  getSync: 'migo-storage-get-sync-value',
  getAsync: 'migo-storage-get-async-value',
  clearA: 'migo-storage-clear-a',
  clearB: 'migo-storage-clear-b',
  clearPromise: 'migo-storage-clear-promise'
};

function validateStorageInfoPayload(payload) {
  if (!isObject(payload)) {
    return false;
  }

  if (!Array.isArray(payload.keys) || !payload.keys.every(isString)) {
    return false;
  }

  if (!isFiniteNumber(payload.currentSize) || payload.currentSize < 0) {
    return false;
  }

  if (!isFiniteNumber(payload.limitSize) || payload.limitSize < 0) {
    return false;
  }

  return true;
}

function removeStorageKeySync(runtime, key) {
  if (typeof runtime.removeStorageSync !== 'function') {
    return;
  }
  try {
    runtime.removeStorageSync(key);
  } catch (e) {
    // ignore cleanup error
  }
}

function removeStorageKeysSync(runtime, keys) {
  keys.forEach((key) => removeStorageKeySync(runtime, key));
}

function isStorageValueMissing(value) {
  return typeof value === 'undefined' || value === null || value === '';
}

function verifyKeyMissing(runtime, key) {
  let checked = false;
  let keyMissingByGet = true;
  let keyMissingByInfo = true;
  let verificationError = null;

  if (typeof runtime.getStorageSync === 'function') {
    checked = true;
    try {
      keyMissingByGet = isStorageValueMissing(runtime.getStorageSync(key));
    } catch (e) {
      keyMissingByGet = false;
      verificationError = formatError(e);
    }
  }

  if (typeof runtime.getStorageInfoSync === 'function') {
    checked = true;
    try {
      const info = runtime.getStorageInfoSync();
      if (Array.isArray(info?.keys)) {
        keyMissingByInfo = !info.keys.includes(key);
      } else {
        keyMissingByInfo = false;
      }
    } catch (e) {
      keyMissingByInfo = false;
      if (!verificationError) {
        verificationError = formatError(e);
      }
    }
  }

  return {
    checked,
    keyMissing: keyMissingByGet && keyMissingByInfo,
    verificationError
  };
}

function verifyKeysMissing(runtime, keys) {
  const checks = keys.map((key) => verifyKeyMissing(runtime, key));
  return {
    checked: checks.some((item) => item.checked),
    allMissing: checks.every((item) => item.keyMissing),
    verificationError: checks.find((item) => item.verificationError)?.verificationError || null
  };
}

function writeStorageValue(runtime, key, data) {
  return new Promise((resolve) => {
    const writeApiAvailable = typeof runtime.setStorageSync === 'function' || typeof runtime.setStorage === 'function';

    if (typeof runtime.setStorageSync === 'function') {
      try {
        runtime.setStorageSync(key, data);
        resolve({
          ok: true,
          method: 'setStorageSync',
          writeApiAvailable,
          error: null
        });
      } catch (e) {
        resolve({
          ok: false,
          method: 'setStorageSync',
          writeApiAvailable,
          error: formatError(e)
        });
      }
      return;
    }

    if (typeof runtime.setStorage !== 'function') {
      resolve({
        ok: false,
        method: null,
        writeApiAvailable,
        error: 'setStorage/setStorageSync 不存在'
      });
      return;
    }

    let settled = false;
    let timeoutTimer = null;

    const finish = (payload) => {
      if (settled) {
        return;
      }
      settled = true;
      if (timeoutTimer) {
        clearTimeout(timeoutTimer);
      }
      resolve({
        writeApiAvailable,
        ...payload
      });
    };

    timeoutTimer = setTimeout(() => {
      finish({
        ok: false,
        method: 'setStorage',
        error: 'setStorage 预置超时'
      });
    }, 2500);

    try {
      const returned = runtime.setStorage({
        key,
        data,
        success: () => {
          finish({
            ok: true,
            method: 'setStorage'
          });
        },
        fail: (err) => {
          finish({
            ok: false,
            method: 'setStorage',
            error: formatError(err)
          });
        },
        complete: () => {}
      });

      if (isThenable(returned)) {
        returned
          .then(() => {
            finish({
              ok: true,
              method: 'setStorage(promise)'
            });
          })
          .catch((err) => {
            finish({
              ok: false,
              method: 'setStorage(promise)',
              error: formatError(err)
            });
          });
      }
    } catch (e) {
      finish({
        ok: false,
        method: 'setStorage',
        error: formatError(e)
      });
    }
  });
}

export default [
  {
    name: 'migo.setStorageSync',
    category: 'storage',
    tests: [
      {
        id: 'migo.setStorageSync',
        name: '同步写入缓存',
        description: '验证 setStorageSync 可写入指定 key，并输出同步返回 raw（undefined 归一为 null）',
        type: 'sync',
        run: (runtime) => {
          if (typeof runtime.setStorageSync !== 'function') {
            return { _error: 'setStorageSync 不存在' };
          }

          try {
            const returned = runtime.setStorageSync(STORAGE_KEYS.setSync, STORAGE_VALUES.setSync);
            let readBackMatchesOrReadApiMissing = true;
            let readBackError = null;

            if (typeof runtime.getStorageSync === 'function') {
              try {
                readBackMatchesOrReadApiMissing = runtime.getStorageSync(STORAGE_KEYS.setSync) === STORAGE_VALUES.setSync;
              } catch (e) {
                readBackMatchesOrReadApiMissing = false;
                readBackError = formatError(e);
              }
            }

            return {
              threw: false,
              raw: normalizeRaw(returned),
              readBackMatchesOrReadApiMissing,
              readBackError
            };
          } catch (e) {
            return {
              threw: true,
              raw: null,
              readBackMatchesOrReadApiMissing: false,
              error: formatError(e)
            };
          }
        },
        expect: {
          threw: false,
          raw: '@exists',
          readBackMatchesOrReadApiMissing: true
        },
        cleanup: (runtime) => {
          removeStorageKeySync(runtime, STORAGE_KEYS.setSync);
        }
      }
    ]
  },

  {
    name: 'migo.setStorage',
    category: 'storage',
    tests: [
      {
        id: 'migo.setStorage',
        name: '异步写入缓存（回调契约）',
        description: '验证 setStorage 的 success/fail/complete 契约，并输出 raw 回调 payload',
        type: 'async',
        timeout: 8000,
        run: (runtime) => runOptionApiContract(runtime, 'setStorage', {
          args: {
            key: STORAGE_KEYS.setAsync,
            data: STORAGE_VALUES.setAsync
          },
          timeoutMs: 6000,
          validateSuccessPayload: (res) => isObject(res)
            && (typeof res.errMsg === 'undefined' || isString(res.errMsg))
        }).then((result) => {
          let readBackMatchesOrReadApiMissing = true;
          let readBackError = null;

          if (result.successCalled && typeof runtime.getStorageSync === 'function') {
            try {
              readBackMatchesOrReadApiMissing = runtime.getStorageSync(STORAGE_KEYS.setAsync) === STORAGE_VALUES.setAsync;
            } catch (e) {
              readBackMatchesOrReadApiMissing = false;
              readBackError = formatError(e);
            }
          }

          return {
            ...result,
            readBackMatchesOrReadApiMissing,
            readBackError
          };
        }),
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
          successPayloadValid: true,
          raw: '@exists',
          readBackMatchesOrReadApiMissing: true
        },
        cleanup: (runtime) => {
          removeStorageKeySync(runtime, STORAGE_KEYS.setAsync);
        }
      },
      {
        id: 'storage-setStorage-promise-support',
        name: 'Promise 风格支持',
        description: '验证 setStorage 支持 Promise 风格调用（与回调契约测试拆分）',
        type: 'sync',
        run: (runtime) => probePromiseSupport(runtime, 'setStorage', {
          key: STORAGE_KEYS.setPromise,
          data: STORAGE_VALUES.setPromise
        }),
        expect: {
          apiExists: true,
          threw: false,
          promiseStyleSupported: true
        },
        cleanup: (runtime) => {
          removeStorageKeySync(runtime, STORAGE_KEYS.setPromise);
        }
      }
    ]
  },

  {
    name: 'migo.getStorage',
    category: 'storage',
    tests: [
      {
        id: 'migo.getStorage',
        name: '异步读取缓存（回调契约）',
        description: '验证 getStorage 的回调契约与返回结构，并记录 raw 原始 payload',
        type: 'async',
        timeout: 8000,
        run: async (runtime) => {
          const setup = await writeStorageValue(runtime, STORAGE_KEYS.getAsync, STORAGE_VALUES.getAsync);
          const result = await runOptionApiContract(runtime, 'getStorage', {
            args: {
              key: STORAGE_KEYS.getAsync
            },
            timeoutMs: 6000,
            validateSuccessPayload: (res) => isObject(res)
              && Object.prototype.hasOwnProperty.call(res, 'data')
              && (typeof res.errMsg === 'undefined' || isString(res.errMsg))
          });

          return {
            ...result,
            setupSucceededOrWriteApiMissing: setup.ok || !setup.writeApiAvailable,
            successCalledOrSetupFailed: result.successCalled || !setup.ok,
            failCalledOnlyWhenSetupFailed: !result.failCalled || !setup.ok,
            successPayloadValidOrNoSuccess: !result.successCalled || result.successPayloadValid,
            successDataMatchedOrNoSuccess: !result.successCalled || result.successPayload?.data === STORAGE_VALUES.getAsync,
            setupMethod: setup.method || null,
            setupError: setup.error || null
          };
        },
        expect: {
          apiExists: true,
          threw: false,
          timeout: false,
          callbackInvoked: true,
          completeCalled: true,
          completeAfterOutcome: true,
          multipleOutcomeCallbacks: false,
          raw: '@exists',
          setupSucceededOrWriteApiMissing: true,
          successCalledOrSetupFailed: true,
          failCalledOnlyWhenSetupFailed: true,
          successPayloadValidOrNoSuccess: true,
          successDataMatchedOrNoSuccess: true
        },
        cleanup: (runtime) => {
          removeStorageKeySync(runtime, STORAGE_KEYS.getAsync);
        }
      },
      {
        id: 'storage-getStorage-promise-support',
        name: 'Promise 风格支持',
        description: '验证 getStorage 支持 Promise 风格调用（与回调契约测试拆分）',
        type: 'sync',
        run: (runtime) => probePromiseSupport(runtime, 'getStorage', {
          key: STORAGE_KEYS.getPromise
        }),
        expect: {
          apiExists: true,
          threw: false,
          promiseStyleSupported: true
        },
        cleanup: (runtime) => {
          removeStorageKeySync(runtime, STORAGE_KEYS.getPromise);
        }
      }
    ]
  },

  {
    name: 'migo.getStorageSync',
    category: 'storage',
    tests: [
      {
        id: 'migo.getStorageSync',
        name: '同步读取缓存',
        description: '验证 getStorageSync 返回指定 key 的值，并返回 raw 原始读取结果',
        type: 'sync',
        run: (runtime) => {
          if (typeof runtime.getStorageSync !== 'function') {
            return { _error: 'getStorageSync 不存在' };
          }

          const hasSetStorageSync = typeof runtime.setStorageSync === 'function';
          let seedSucceeded = false;
          let seedError = null;

          if (hasSetStorageSync) {
            try {
              runtime.setStorageSync(STORAGE_KEYS.getSync, STORAGE_VALUES.getSync);
              seedSucceeded = true;
            } catch (e) {
              seedError = formatError(e);
            }
          }

          try {
            const raw = runtime.getStorageSync(STORAGE_KEYS.getSync);
            return {
              threw: false,
              raw: normalizeRaw(raw),
              seedSucceededOrSetApiMissing: seedSucceeded || !hasSetStorageSync,
              valueMatchedOrUnseeded: !seedSucceeded || raw === STORAGE_VALUES.getSync,
              seedError
            };
          } catch (e) {
            return {
              threw: true,
              raw: null,
              seedSucceededOrSetApiMissing: seedSucceeded || !hasSetStorageSync,
              valueMatchedOrUnseeded: false,
              error: formatError(e),
              seedError
            };
          }
        },
        expect: {
          threw: false,
          raw: '@exists',
          seedSucceededOrSetApiMissing: true,
          valueMatchedOrUnseeded: true
        },
        cleanup: (runtime) => {
          removeStorageKeySync(runtime, STORAGE_KEYS.getSync);
        }
      }
    ]
  },

  {
    name: 'migo.getStorageInfo',
    category: 'storage',
    tests: [
      {
        id: 'migo.getStorageInfo',
        name: '异步读取缓存信息（回调契约）',
        description: '验证 getStorageInfo 的 success/fail/complete 契约，并校验返回结构',
        type: 'async',
        timeout: 8000,
        run: (runtime) => runOptionApiContract(runtime, 'getStorageInfo', {
          args: {},
          timeoutMs: 6000,
          validateSuccessPayload: validateStorageInfoPayload
        }).then((result) => ({
          ...result,
          successPayloadValidOrNoSuccess: !result.successCalled || result.successPayloadValid
        })),
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
          raw: '@exists',
          successPayloadValidOrNoSuccess: true
        }
      },
      {
        id: 'storage-getStorageInfo-promise-support',
        name: 'Promise 风格支持',
        description: '验证 getStorageInfo 支持 Promise 风格调用（与回调契约测试拆分）',
        type: 'sync',
        run: (runtime) => probePromiseSupport(runtime, 'getStorageInfo', {}),
        expect: {
          apiExists: true,
          threw: false,
          promiseStyleSupported: true
        }
      }
    ]
  },

  {
    name: 'migo.getStorageInfoSync',
    category: 'storage',
    tests: [
      {
        id: 'migo.getStorageInfoSync',
        name: '同步读取缓存信息',
        description: '验证 getStorageInfoSync 返回字段结构，并记录 raw 原始返回值',
        type: 'sync',
        run: (runtime) => {
          if (typeof runtime.getStorageInfoSync !== 'function') {
            return { _error: 'getStorageInfoSync 不存在' };
          }

          try {
            const raw = runtime.getStorageInfoSync();
            return {
              threw: false,
              raw,
              payloadValid: validateStorageInfoPayload(raw)
            };
          } catch (e) {
            return {
              threw: true,
              raw: null,
              payloadValid: false,
              error: formatError(e)
            };
          }
        },
        expect: {
          threw: false,
          raw: '@exists',
          payloadValid: true
        }
      }
    ]
  },

  {
    name: 'migo.removeStorage',
    category: 'storage',
    tests: [
      {
        id: 'migo.removeStorage',
        name: '异步移除缓存（回调契约）',
        description: '验证 removeStorage 的回调契约，并校验指定 key 已被移除',
        type: 'async',
        timeout: 8000,
        run: async (runtime) => {
          const setup = await writeStorageValue(runtime, STORAGE_KEYS.removeAsync, STORAGE_VALUES.getAsync);
          const result = await runOptionApiContract(runtime, 'removeStorage', {
            args: {
              key: STORAGE_KEYS.removeAsync
            },
            timeoutMs: 6000,
            validateSuccessPayload: (res) => isObject(res)
              && (typeof res.errMsg === 'undefined' || isString(res.errMsg))
          });

          const removalCheck = result.successCalled
            ? verifyKeyMissing(runtime, STORAGE_KEYS.removeAsync)
            : { checked: false, keyMissing: false, verificationError: null };

          return {
            ...result,
            setupSucceededOrWriteApiMissing: setup.ok || !setup.writeApiAvailable,
            successCalledOrSetupFailed: result.successCalled || !setup.ok,
            failCalledOnlyWhenSetupFailed: !result.failCalled || !setup.ok,
            keyMissingOrNotChecked: !removalCheck.checked || removalCheck.keyMissing,
            setupMethod: setup.method || null,
            setupError: setup.error || null,
            verificationError: removalCheck.verificationError
          };
        },
        expect: {
          apiExists: true,
          threw: false,
          timeout: false,
          callbackInvoked: true,
          completeCalled: true,
          completeAfterOutcome: true,
          multipleOutcomeCallbacks: false,
          raw: '@exists',
          setupSucceededOrWriteApiMissing: true,
          successCalledOrSetupFailed: true,
          failCalledOnlyWhenSetupFailed: true,
          keyMissingOrNotChecked: true
        },
        cleanup: (runtime) => {
          removeStorageKeySync(runtime, STORAGE_KEYS.removeAsync);
        }
      },
      {
        id: 'storage-removeStorage-promise-support',
        name: 'Promise 风格支持',
        description: '验证 removeStorage 支持 Promise 风格调用（与回调契约测试拆分）',
        type: 'sync',
        run: (runtime) => probePromiseSupport(runtime, 'removeStorage', {
          key: STORAGE_KEYS.removePromise
        }),
        expect: {
          apiExists: true,
          threw: false,
          promiseStyleSupported: true
        },
        cleanup: (runtime) => {
          removeStorageKeySync(runtime, STORAGE_KEYS.removePromise);
        }
      }
    ]
  },

  {
    name: 'migo.removeStorageSync',
    category: 'storage',
    tests: [
      {
        id: 'migo.removeStorageSync',
        name: '同步移除缓存',
        description: '验证 removeStorageSync 移除指定 key，并记录同步返回 raw',
        type: 'sync',
        run: (runtime) => {
          if (typeof runtime.removeStorageSync !== 'function') {
            return { _error: 'removeStorageSync 不存在' };
          }

          const hasSetStorageSync = typeof runtime.setStorageSync === 'function';
          let seedSucceeded = false;
          let seedError = null;

          if (hasSetStorageSync) {
            try {
              runtime.setStorageSync(STORAGE_KEYS.removeSync, STORAGE_VALUES.getSync);
              seedSucceeded = true;
            } catch (e) {
              seedError = formatError(e);
            }
          }

          try {
            const raw = runtime.removeStorageSync(STORAGE_KEYS.removeSync);
            const removalCheck = verifyKeyMissing(runtime, STORAGE_KEYS.removeSync);
            return {
              threw: false,
              raw: normalizeRaw(raw),
              seedSucceededOrSetApiMissing: seedSucceeded || !hasSetStorageSync,
              keyMissingOrNotChecked: !removalCheck.checked || removalCheck.keyMissing,
              seedError,
              verificationError: removalCheck.verificationError
            };
          } catch (e) {
            return {
              threw: true,
              raw: null,
              seedSucceededOrSetApiMissing: seedSucceeded || !hasSetStorageSync,
              keyMissingOrNotChecked: false,
              error: formatError(e),
              seedError
            };
          }
        },
        expect: {
          threw: false,
          raw: '@exists',
          seedSucceededOrSetApiMissing: true,
          keyMissingOrNotChecked: true
        },
        cleanup: (runtime) => {
          removeStorageKeySync(runtime, STORAGE_KEYS.removeSync);
        }
      }
    ]
  },

  {
    name: 'migo.clearStorage',
    category: 'storage',
    tests: [
      {
        id: 'migo.clearStorage',
        name: '异步清空缓存（回调契约）',
        description: '验证 clearStorage 的回调契约，并校验预置 key 被清空',
        type: 'async',
        timeout: 8000,
        run: async (runtime) => {
          const seedA = await writeStorageValue(runtime, STORAGE_KEYS.clearA, STORAGE_VALUES.clearA);
          const seedB = await writeStorageValue(runtime, STORAGE_KEYS.clearB, STORAGE_VALUES.clearB);
          const writeApiAvailable = seedA.writeApiAvailable || seedB.writeApiAvailable;

          const result = await runOptionApiContract(runtime, 'clearStorage', {
            args: {},
            timeoutMs: 6000,
            validateSuccessPayload: (res) => isObject(res)
              && (typeof res.errMsg === 'undefined' || isString(res.errMsg))
          });

          const clearCheck = result.successCalled
            ? verifyKeysMissing(runtime, [STORAGE_KEYS.clearA, STORAGE_KEYS.clearB])
            : { checked: false, allMissing: false, verificationError: null };

          return {
            ...result,
            setupSucceededOrWriteApiMissing: (seedA.ok && seedB.ok) || !writeApiAvailable,
            seededKeysRemovedOrNotChecked: !clearCheck.checked || clearCheck.allMissing,
            successPayloadValidOrNoSuccess: !result.successCalled || result.successPayloadValid,
            setupErrors: [seedA.error, seedB.error].filter(Boolean),
            verificationError: clearCheck.verificationError
          };
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
          raw: '@exists',
          setupSucceededOrWriteApiMissing: true,
          seededKeysRemovedOrNotChecked: true,
          successPayloadValidOrNoSuccess: true
        },
        cleanup: (runtime) => {
          removeStorageKeysSync(runtime, [STORAGE_KEYS.clearA, STORAGE_KEYS.clearB]);
        }
      },
      {
        id: 'storage-clearStorage-promise-support',
        name: 'Promise 风格支持',
        description: '验证 clearStorage 支持 Promise 风格调用（与回调契约测试拆分）',
        type: 'sync',
        run: (runtime) => probePromiseSupport(runtime, 'clearStorage', {}),
        expect: {
          apiExists: true,
          threw: false,
          promiseStyleSupported: true
        },
        cleanup: (runtime) => {
          removeStorageKeySync(runtime, STORAGE_KEYS.clearPromise);
        }
      }
    ]
  },

  {
    name: 'migo.clearStorageSync',
    category: 'storage',
    tests: [
      {
        id: 'migo.clearStorageSync',
        name: '同步清空缓存',
        description: '验证 clearStorageSync 清空缓存并返回 raw（undefined 归一为 null）',
        type: 'sync',
        run: (runtime) => {
          if (typeof runtime.clearStorageSync !== 'function') {
            return { _error: 'clearStorageSync 不存在' };
          }

          const hasSetStorageSync = typeof runtime.setStorageSync === 'function';
          let setupSucceeded = false;
          let setupError = null;

          if (hasSetStorageSync) {
            try {
              runtime.setStorageSync(STORAGE_KEYS.clearA, STORAGE_VALUES.clearA);
              runtime.setStorageSync(STORAGE_KEYS.clearB, STORAGE_VALUES.clearB);
              setupSucceeded = true;
            } catch (e) {
              setupError = formatError(e);
            }
          }

          try {
            const raw = runtime.clearStorageSync();
            const clearCheck = verifyKeysMissing(runtime, [STORAGE_KEYS.clearA, STORAGE_KEYS.clearB]);
            return {
              threw: false,
              raw: normalizeRaw(raw),
              setupSucceededOrSetApiMissing: setupSucceeded || !hasSetStorageSync,
              seededKeysRemovedOrNotChecked: !clearCheck.checked || clearCheck.allMissing,
              setupError,
              verificationError: clearCheck.verificationError
            };
          } catch (e) {
            return {
              threw: true,
              raw: null,
              setupSucceededOrSetApiMissing: setupSucceeded || !hasSetStorageSync,
              seededKeysRemovedOrNotChecked: false,
              error: formatError(e),
              setupError
            };
          }
        },
        expect: {
          threw: false,
          raw: '@exists',
          setupSucceededOrSetApiMissing: true,
          seededKeysRemovedOrNotChecked: true
        },
        cleanup: (runtime) => {
          removeStorageKeysSync(runtime, [STORAGE_KEYS.clearA, STORAGE_KEYS.clearB]);
        }
      }
    ]
  },

  {
    name: 'migo.createBufferURL',
    category: 'storage',
    tests: [
      {
        id: 'migo.createBufferURL',
        name: '创建 Buffer URL',
        description: '验证 createBufferURL 支持 ArrayBuffer/TypedArray 输入并返回 string raw',
        type: 'sync',
        run: (runtime) => {
          if (typeof runtime.createBufferURL !== 'function') {
            return { _error: 'createBufferURL 不存在' };
          }

          try {
            const raw = runtime.createBufferURL(new ArrayBuffer(8));
            let typedArraySupported = true;
            let typedArrayUrl = null;
            let typedArrayError = null;

            try {
              typedArrayUrl = runtime.createBufferURL(new Uint8Array([1, 2, 3, 4]));
            } catch (e) {
              typedArraySupported = false;
              typedArrayError = formatError(e);
            }

            if (typeof runtime.revokeBufferURL === 'function') {
              try {
                if (isString(raw)) {
                  runtime.revokeBufferURL(raw);
                }
                if (isString(typedArrayUrl)) {
                  runtime.revokeBufferURL(typedArrayUrl);
                }
              } catch (e) {
                // ignore cleanup error
              }
            }

            return {
              threw: false,
              raw,
              rawIsString: isString(raw),
              rawNonEmpty: isString(raw) && raw.length > 0,
              typedArraySupported,
              typedArrayUrlValidOrMissing: !typedArraySupported || (isString(typedArrayUrl) && typedArrayUrl.length > 0),
              typedArrayError
            };
          } catch (e) {
            return {
              threw: true,
              raw: null,
              rawIsString: false,
              rawNonEmpty: false,
              typedArraySupported: false,
              typedArrayUrlValidOrMissing: false,
              error: formatError(e)
            };
          }
        },
        expect: {
          threw: false,
          raw: '@string',
          rawIsString: true,
          rawNonEmpty: true,
          typedArraySupported: true,
          typedArrayUrlValidOrMissing: true
        }
      }
    ]
  },

  {
    name: 'migo.revokeBufferURL',
    category: 'storage',
    tests: [
      {
        id: 'migo.revokeBufferURL',
        name: '销毁 Buffer URL',
        description: '验证 revokeBufferURL 可销毁由 createBufferURL 创建的 URL，并输出 raw',
        type: 'sync',
        run: (runtime) => {
          if (typeof runtime.revokeBufferURL !== 'function') {
            return { _error: 'revokeBufferURL 不存在' };
          }
          if (typeof runtime.createBufferURL !== 'function') {
            return { _error: 'createBufferURL 不存在（revokeBufferURL 测试依赖）' };
          }

          try {
            const url = runtime.createBufferURL(new ArrayBuffer(8));
            const raw = runtime.revokeBufferURL(url);
            return {
              threw: false,
              urlStringValid: isString(url) && url.length > 0,
              raw: normalizeRaw(raw)
            };
          } catch (e) {
            return {
              threw: true,
              urlStringValid: false,
              raw: null,
              error: formatError(e)
            };
          }
        },
        expect: {
          threw: false,
          urlStringValid: true,
          raw: '@exists'
        }
      }
    ]
  },

  {
    name: 'migo.getBackgroundFetchToken',
    category: 'storage',
    tests: [
      {
        id: 'storage-013',
        name: '获取预拉取 Token',
        description: '验证 getBackgroundFetchToken 接口',
        type: 'async',
        run: (runtime, callback) => {
          if (typeof runtime.getBackgroundFetchToken !== 'function') {
            return callback({ _error: 'getBackgroundFetchToken 不存在' });
          }
          runtime.getBackgroundFetchToken({
            success: (res) => callback({ success: true, res }),
            fail: (err) => callback({ success: false, err })
          });
        },
        expect: {
          success: true,
          res: {
            token: '@string',
            errMsg: '@string'
          }
        }
      }
    ]
  },
  {
    name: 'migo.setBackgroundFetchToken',
    category: 'storage',
    tests: [
      {
        id: 'storage-014',
        name: '设置预拉取 Token',
        description: '验证 setBackgroundFetchToken 接口',
        type: 'async',
        run: (runtime, callback) => {
          if (typeof runtime.setBackgroundFetchToken !== 'function') {
            return callback({ _error: 'setBackgroundFetchToken 不存在' });
          }
          runtime.setBackgroundFetchToken({
            token: `test_token_${Date.now()}`,
            success: (res) => callback({ success: true, res }),
            fail: (err) => callback({ success: false, err })
          });
        },
        expect: {
          success: true,
          res: {
            errMsg: '@string'
          }
        }
      }
    ]
  },
  {
    name: 'migo.getBackgroundFetchData',
    category: 'storage',
    tests: [
      {
        id: 'storage-015',
        name: '获取预拉取数据',
        description: '验证 getBackgroundFetchData 接口',
        type: 'async',
        run: (runtime, callback) => {
          if (typeof runtime.getBackgroundFetchData !== 'function') {
            return callback({ _error: 'getBackgroundFetchData 不存在' });
          }
          runtime.getBackgroundFetchData({
            fetchType: 'pre',
            success: (res) => callback({ success: true, res }),
            fail: (err) => callback({ success: false, err })
          });
        },
        expect: {
          success: true,
          res: {
            fetchedData: '@string',
            timeStamp: '@number',
            path: '@string',
            query: '@string',
            scene: '@number',
            errMsg: '@string'
          }
        }
      }
    ]
  },
  {
    name: 'migo.onBackgroundFetchData',
    category: 'storage',
    tests: [
      {
        id: 'storage-016',
        name: '监听预拉取数据',
        description: '验证 onBackgroundFetchData 接口',
        type: 'sync',
        run: (runtime) => {
          if (typeof runtime.onBackgroundFetchData !== 'function') {
            return { _error: 'onBackgroundFetchData 不存在' };
          }
          const listener = (res) => {
            return res;
          };
          try {
            runtime.onBackgroundFetchData(listener);
            if (typeof runtime.offBackgroundFetchData === 'function') {
              runtime.offBackgroundFetchData(listener);
            }
            return { registered: true };
          } catch (e) {
            return { registered: false, error: e.message };
          }
        },
        expect: {
          registered: true
        }
      }
    ]
  }
];
