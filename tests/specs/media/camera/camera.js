/**
 * 相机 API 测试（对齐 apis.md）
 */

import {
  isObject,
  isString,
  isFiniteNumber,
  isThenable,
  normalizeRaw,
  formatError,
  safelyAttachPromiseHandlers
} from '../../_shared/runtime-helpers.js';
import {
  createRuntimeInstance,
  hasMethods,
  runInstanceMethodReturnContract as runSharedInstanceMethodReturnContract,
  runPromiseMethodOutcome as runSharedPromiseMethodOutcome
} from '../../_shared/instance-contract-helpers.js';

const CREATE_CAMERA_OPTIONS = {
  x: 0,
  y: 0,
  width: 300,
  height: 150,
  devicePosition: 'back',
  flash: 'auto',
  size: 'small'
};

const CAMERA_DEVICE_POSITION_VALUES = new Set(['front', 'back']);
const CAMERA_FLASH_VALUES = new Set(['auto', 'on', 'off']);
const CAMERA_SIZE_VALUES = new Set(['small', 'medium', 'large']);
const REQUIRED_CAMERA_METHODS = [
  'closeFrameChange',
  'destroy',
  'listenFrameChange',
  'onAuthCancel',
  'onCameraFrame',
  'onStop',
  'setZoom',
  'startRecord',
  'stopRecord',
  'takePhoto'
];

const CREATE_CAMERA_PARAMETER_CASES = [
  {
    caseId: 'default-spec',
    options: {
      x: 0,
      y: 0,
      width: 300,
      height: 150,
      devicePosition: 'back',
      flash: 'auto',
      size: 'small'
    }
  },
  {
    caseId: 'front-small-off',
    options: {
      x: 16,
      y: 20,
      width: 180,
      height: 120,
      devicePosition: 'front',
      flash: 'off',
      size: 'small'
    }
  },
  {
    caseId: 'back-medium-on',
    options: {
      x: 42,
      y: 58,
      width: 260,
      height: 180,
      devicePosition: 'back',
      flash: 'on',
      size: 'medium'
    }
  },
  {
    caseId: 'front-large-auto',
    options: {
      x: 8,
      y: 10,
      width: 320,
      height: 220,
      devicePosition: 'front',
      flash: 'auto',
      size: 'large'
    }
  }
];

const PHOTO_QUALITY_VALUES = new Set(['high', 'normal', 'low']);

let onAuthCancelCameraRef = null;
let onStopCameraRef = null;
let onCameraFrameCameraRef = null;
let onCameraFrameListenerRef = null;

function isPermissionRelatedError(error) {
  const message = formatError(error).toLowerCase();
  return /auth|authorize|permission|deny|denied|camera|record|photo|摄像头|授权|权限|拒绝/.test(message);
}

function destroyCameraSafely(camera) {
  if (!camera || typeof camera.destroy !== 'function') {
    return;
  }
  try {
    camera.destroy();
  } catch (e) {
    // ignore cleanup error
  }
}

function closeFrameChangeSafely(camera) {
  if (!camera || typeof camera.closeFrameChange !== 'function') {
    return;
  }
  try {
    camera.closeFrameChange();
  } catch (e) {
    // ignore cleanup error
  }
}

function stopFrameListenerSafely(listener) {
  if (!listener || typeof listener.stop !== 'function') {
    return;
  }
  try {
    listener.stop();
  } catch (e) {
    // ignore cleanup error
  }
}

function createCameraInstance(runtime, options = {}) {
  const created = createRuntimeInstance(runtime, 'createCamera', {
    ...CREATE_CAMERA_OPTIONS,
    ...options
  });

  if (created.errorResult) {
    const errorResult = {
      ...created.errorResult
    };

    if (typeof errorResult.createThrew !== 'undefined') {
      errorResult.createCameraThrew = errorResult.createThrew;
    }

    return {
      camera: null,
      raw: null,
      errorResult
    };
  }

  return {
    camera: created.instance,
    raw: created.raw,
    errorResult: null
  };
}

function hasRequiredCameraMethods(camera) {
  return hasMethods(camera, REQUIRED_CAMERA_METHODS);
}

function isValidCreateCameraOptions(options) {
  if (!isObject(options)) {
    return false;
  }

  return isFiniteNumber(options.x)
    && isFiniteNumber(options.y)
    && isFiniteNumber(options.width)
    && isFiniteNumber(options.height)
    && isString(options.devicePosition)
    && CAMERA_DEVICE_POSITION_VALUES.has(options.devicePosition)
    && isString(options.flash)
    && CAMERA_FLASH_VALUES.has(options.flash)
    && isString(options.size)
    && CAMERA_SIZE_VALUES.has(options.size);
}

function optionEchoValidOrMissing(camera, options) {
  if (!isObject(options)) {
    return false;
  }

  const keys = ['x', 'y', 'width', 'height', 'devicePosition', 'flash', 'size'];
  return keys.every((key) => typeof camera?.[key] === 'undefined' || camera[key] === options[key]);
}

function runCreateCameraParameterScenario(runtime, scenario) {
  const options = scenario?.options;
  const created = createCameraInstance(runtime, options);

  if (created.errorResult) {
    return {
      ...created.errorResult,
      caseId: scenario?.caseId || 'unknown',
      options,
      optionsValid: isValidCreateCameraOptions(options),
      optionEchoValidOrMissing: false,
      requiredMethodsValid: false,
      returnThenable: false,
      cameraObjectValid: false,
      invocationThrew: true
    };
  }

  const camera = created.camera;
  const result = {
    caseId: scenario?.caseId || 'unknown',
    options,
    optionsValid: isValidCreateCameraOptions(options),
    invocationThrew: false,
    returnThenable: isThenable(camera),
    cameraObjectValid: isObject(camera),
    requiredMethodsValid: hasRequiredCameraMethods(camera),
    optionEchoValidOrMissing: optionEchoValidOrMissing(camera, options),
    raw: created.raw
  };

  destroyCameraSafely(camera);
  return result;
}

function getCallbackOrderMeta(events, successCalled, failCalled, completeCalled) {
  const successIndex = events.indexOf('success');
  const failIndex = events.indexOf('fail');
  const completeIndex = events.indexOf('complete');
  const firstOutcomeIndex = (successIndex >= 0 && failIndex >= 0)
    ? Math.min(successIndex, failIndex)
    : Math.max(successIndex, failIndex);

  return {
    callbackInvoked: successCalled || failCalled,
    multipleOutcomeCallbacks: successCalled && failCalled,
    completeAfterOutcomeOrNoOutcome: !completeCalled || firstOutcomeIndex < 0 || completeIndex >= firstOutcomeIndex
  };
}

function runCreateCameraCallbackContract(runtime, cameraOptions = {}, timeoutMs = 5000) {
  return new Promise((resolve) => {
    if (typeof runtime.createCamera !== 'function') {
      resolve({ _error: 'createCamera 不存在' });
      return;
    }

    let camera = null;
    let settled = false;
    let settleTimer = null;
    const events = [];

    const result = {
      apiExists: true,
      threw: false,
      returnThenable: false,
      callbackInvoked: false,
      successCalled: false,
      failCalled: false,
      completeCalled: false,
      multipleOutcomeCallbacks: false,
      completeAfterOutcomeOrNoOutcome: true,
      callbackTrace: [],
      raw: null,
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

      const meta = getCallbackOrderMeta(events, result.successCalled, result.failCalled, result.completeCalled);
      result.callbackInvoked = meta.callbackInvoked;
      result.multipleOutcomeCallbacks = meta.multipleOutcomeCallbacks;
      result.completeAfterOutcomeOrNoOutcome = meta.completeAfterOutcomeOrNoOutcome;
      result.callbackTrace = events.slice();

      destroyCameraSafely(camera);
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
      }, 320);
    };

    const timeoutTimer = setTimeout(() => {
      finish();
    }, timeoutMs);

    try {
      const returned = runtime.createCamera({
        ...CREATE_CAMERA_OPTIONS,
        ...cameraOptions,
        success: (res) => {
          result.successCalled = true;
          events.push('success');
          if (result.raw === null) {
            result.raw = normalizeRaw(res);
          }
          settleSoon();
        },
        fail: (err) => {
          result.failCalled = true;
          events.push('fail');
          if (result.raw === null) {
            result.raw = normalizeRaw(err);
          }
          settleSoon();
        },
        complete: (res) => {
          result.completeCalled = true;
          events.push('complete');
          if (result.raw === null) {
            result.raw = normalizeRaw(res);
          }
          settleSoon();
        }
      });

      camera = returned;
      result.returnThenable = isThenable(returned);
      if (result.raw === null) {
        result.raw = normalizeRaw(returned);
      }
    } catch (e) {
      result.threw = true;
      result.error = formatError(e);
      result.raw = null;
      finish();
      return;
    }

    setTimeout(() => {
      settleSoon();
    }, 1200);
  });
}

function runMethodReturnContract(runtime, methodName, invoke, options = {}) {
  const {
    allowPermissionError = false,
    afterInvoke
  } = options;

  const base = runSharedInstanceMethodReturnContract(runtime, {
    createApiName: 'createCamera',
    createOptions: CREATE_CAMERA_OPTIONS,
    methodName,
    invoke,
    afterInvoke
  });

  if (!base || base._error || typeof base.invocationThrew !== 'boolean') {
    return base;
  }

  const permissionRelatedError = base.invocationThrew && isPermissionRelatedError(base.error);

  return {
    ...base,
    permissionRelatedError,
    invocationSucceededOrPermissionRelated: !base.invocationThrew || (allowPermissionError && permissionRelatedError),
    returnThenableOrPermissionRelated: base.returnThenable || (allowPermissionError && permissionRelatedError)
  };
}

function runPromiseMethodOutcome(runtime, methodName, invoke, options = {}) {
  const {
    timeoutMs = 12000,
    validateResolvedPayload
  } = options;

  return runSharedPromiseMethodOutcome(runtime, {
    createApiName: 'createCamera',
    createOptions: CREATE_CAMERA_OPTIONS,
    methodName,
    invoke,
    timeoutMs,
    validateResolvedPayload
  }).then((base) => {
    if (!base || base._error || typeof base.promiseResolved !== 'boolean') {
      return base;
    }

    return {
      ...base,
      resolvedPayloadValidOrRejected: !base.promiseResolved || base.resolvedPayloadValid,
      permissionRelatedRejection: base.promiseRejected ? isPermissionRelatedError(base.raw) : false
    };
  });
}

function validateFramePayload(res) {
  if (!isObject(res)) {
    return false;
  }
  return isFiniteNumber(res.width)
    && isFiniteNumber(res.height)
    && res.data instanceof ArrayBuffer;
}

function validateSetZoomResolvedPayload(res) {
  if (typeof res === 'undefined' || res === null) {
    return true;
  }
  if (!isObject(res)) {
    return false;
  }
  return typeof res.zoom === 'undefined' || isFiniteNumber(res.zoom);
}

function validateStartRecordResolvedPayload(res) {
  return typeof res === 'undefined' || isObject(res);
}

function validateStopRecordResolvedPayload(res) {
  if (!isObject(res)) {
    return false;
  }
  const tempThumbPathValidOrMissing = typeof res.tempThumbPath === 'undefined' || isString(res.tempThumbPath);
  const tempVideoPathValidOrMissing = typeof res.tempVideoPath === 'undefined' || isString(res.tempVideoPath);
  return tempThumbPathValidOrMissing && tempVideoPathValidOrMissing;
}

function validateTakePhotoResolvedPayload(res) {
  if (!isObject(res)) {
    return false;
  }
  const tempImagePathValidOrMissing = typeof res.tempImagePath === 'undefined' || isString(res.tempImagePath);
  const widthValidOrMissing = typeof res.width === 'undefined' || isFiniteNumber(res.width);
  const heightValidOrMissing = typeof res.height === 'undefined' || isFiniteNumber(res.height);
  return tempImagePathValidOrMissing && widthValidOrMissing && heightValidOrMissing;
}

function cleanupOnAuthCancelState() {
  destroyCameraSafely(onAuthCancelCameraRef);
  onAuthCancelCameraRef = null;
}

function cleanupOnStopState() {
  destroyCameraSafely(onStopCameraRef);
  onStopCameraRef = null;
}

function cleanupOnCameraFrameState() {
  stopFrameListenerSafely(onCameraFrameListenerRef);
  closeFrameChangeSafely(onCameraFrameCameraRef);
  destroyCameraSafely(onCameraFrameCameraRef);
  onCameraFrameListenerRef = null;
  onCameraFrameCameraRef = null;
}

export default [
  {
    name: 'migo.createCamera',
    category: 'camera',
    tests: [
      {
        id: 'migo.createCamera',
        name: '创建 Camera 实例',
        description: '验证 createCamera 返回 Camera 对象、非 Promise，并记录原始返回 raw',
        type: 'sync',
        run: (runtime) => {
          const created = createCameraInstance(runtime);
          if (created.errorResult) {
            return created.errorResult;
          }

          const camera = created.camera;

          const result = {
            apiExists: true,
            threw: false,
            returnThenable: isThenable(camera),
            cameraObjectValid: isObject(camera),
            requiredMethodsValid: hasRequiredCameraMethods(camera),
            raw: created.raw
          };

          destroyCameraSafely(camera);
          return result;
        },
        expect: {
          apiExists: true,
          threw: false,
          returnThenable: false,
          cameraObjectValid: true,
          requiredMethodsValid: true,
          raw: '@exists'
        }
      },
      {
        id: 'camera-createCamera-parameter-matrix',
        name: '不同参数创建 Camera',
        description: '使用多组 x/y/width/height/devicePosition/flash/size 参数创建 Camera，校验不同参数下行为一致',
        type: 'sync',
        run: (runtime) => {
          if (typeof runtime.createCamera !== 'function') {
            return { _error: 'createCamera 不存在' };
          }

          const scenarioResults = CREATE_CAMERA_PARAMETER_CASES.map((scenario) => runCreateCameraParameterScenario(runtime, scenario));

          return {
            scenarioCount: scenarioResults.length,
            allOptionsValid: scenarioResults.every((item) => item.optionsValid),
            allCreateSucceeded: scenarioResults.every((item) => item.invocationThrew === false),
            allReturnNonPromise: scenarioResults.every((item) => item.returnThenable === false),
            allCameraObjectValid: scenarioResults.every((item) => item.cameraObjectValid === true),
            allRequiredMethodsValid: scenarioResults.every((item) => item.requiredMethodsValid === true),
            allOptionEchoValidOrMissing: scenarioResults.every((item) => item.optionEchoValidOrMissing === true),
            raw: scenarioResults.map((item) => item.raw),
            scenarios: scenarioResults.map((item) => ({
              caseId: item.caseId,
              options: item.options,
              invocationThrew: item.invocationThrew,
              returnThenable: item.returnThenable,
              cameraObjectValid: item.cameraObjectValid,
              optionEchoValidOrMissing: item.optionEchoValidOrMissing
            }))
          };
        },
        expect: {
          scenarioCount: 4,
          allOptionsValid: true,
          allCreateSucceeded: true,
          allReturnNonPromise: true,
          allCameraObjectValid: true,
          allRequiredMethodsValid: true,
          allOptionEchoValidOrMissing: true,
          raw: '@exists'
        }
      },
      {
        id: 'camera-createCamera-callback-contract',
        name: 'createCamera 回调契约（success/fail/complete）',
        description: '验证 createCamera options 回调互斥与顺序契约，并记录原始回调 payload',
        type: 'async',
        timeout: 7000,
        run: (runtime) => runCreateCameraCallbackContract(runtime, {}, 5000),
        expect: {
          apiExists: true,
          threw: false,
          returnThenable: false,
          multipleOutcomeCallbacks: false,
          completeAfterOutcomeOrNoOutcome: true,
          raw: '@exists'
        },
        allowVariance: ['callbackInvoked', 'successCalled', 'failCalled', 'completeCalled', 'callbackTrace']
      },
      {
        id: 'camera-createCamera-params-callback-contract',
        name: '多参数回调契约对齐',
        description: '使用多组 createCamera 参数验证 success/fail/complete 契约一致性，并输出每组 raw payload',
        type: 'async',
        timeout: 26000,
        run: async (runtime) => {
          if (typeof runtime.createCamera !== 'function') {
            return { _error: 'createCamera 不存在' };
          }

          const scenarioResults = [];

          for (const scenario of CREATE_CAMERA_PARAMETER_CASES) {
            const contract = await runCreateCameraCallbackContract(runtime, scenario.options, 5000);
            scenarioResults.push({
              caseId: scenario.caseId,
              options: scenario.options,
              optionsValid: isValidCreateCameraOptions(scenario.options),
              ...contract
            });
          }

          return {
            scenarioCount: scenarioResults.length,
            allOptionsValid: scenarioResults.every((item) => item.optionsValid),
            allScenariosNoThrow: scenarioResults.every((item) => item.threw === false),
            allScenariosReturnNonPromise: scenarioResults.every((item) => item.returnThenable === false),
            allNoMultipleOutcomeCallbacks: scenarioResults.every((item) => item.multipleOutcomeCallbacks === false),
            allCompleteAfterOutcomeOrNoOutcome: scenarioResults.every((item) => item.completeAfterOutcomeOrNoOutcome === true),
            raw: scenarioResults.map((item) => item.raw),
            scenarios: scenarioResults.map((item) => ({
              caseId: item.caseId,
              callbackInvoked: item.callbackInvoked,
              successCalled: item.successCalled,
              failCalled: item.failCalled,
              completeCalled: item.completeCalled,
              callbackTrace: item.callbackTrace
            }))
          };
        },
        expect: {
          scenarioCount: 4,
          allOptionsValid: true,
          allScenariosNoThrow: true,
          allScenariosReturnNonPromise: true,
          allNoMultipleOutcomeCallbacks: true,
          allCompleteAfterOutcomeOrNoOutcome: true,
          raw: '@exists'
        },
        allowVariance: ['scenarios']
      }
    ]
  },

  {
    name: 'Camera.closeFrameChange',
    category: 'camera',
    tests: [
      {
        id: 'camera.closeFrameChange',
        name: '关闭帧数据监听',
        description: '验证 closeFrameChange 可调用，返回值非 Promise，并输出 raw',
        type: 'sync',
        run: (runtime) => runMethodReturnContract(
          runtime,
          'closeFrameChange',
          (camera) => camera.closeFrameChange(),
          { allowPermissionError: true }
        ),
        expect: {
          methodExists: true,
          invocationSucceededOrPermissionRelated: true,
          returnThenable: false,
          raw: '@exists'
        },
        allowVariance: ['error', 'afterInvokeError']
      }
    ]
  },

  {
    name: 'Camera.destroy',
    category: 'camera',
    tests: [
      {
        id: 'camera.destroy',
        name: '销毁 Camera 实例',
        description: '验证 destroy 可调用且返回值非 Promise，并记录 raw',
        type: 'sync',
        run: (runtime) => {
          const created = createCameraInstance(runtime);
          if (created.errorResult) {
            return created.errorResult;
          }

          const camera = created.camera;
          if (!isObject(camera) || typeof camera.destroy !== 'function') {
            destroyCameraSafely(camera);
            return { _error: 'Camera.destroy 不存在' };
          }

          let returned;
          try {
            returned = camera.destroy();
            return {
              methodExists: true,
              invocationThrew: false,
              returnThenable: isThenable(returned),
              raw: normalizeRaw(returned)
            };
          } catch (e) {
            return {
              methodExists: true,
              invocationThrew: true,
              returnThenable: false,
              raw: null,
              error: formatError(e)
            };
          }
        },
        expect: {
          methodExists: true,
          invocationThrew: false,
          returnThenable: false,
          raw: '@exists'
        },
        allowVariance: ['error']
      }
    ]
  },

  {
    name: 'Camera.listenFrameChange',
    category: 'camera',
    tests: [
      {
        id: 'camera.listenFrameChange',
        name: '开启帧数据监听',
        description: '验证 listenFrameChange 可调用，支持无 Worker 参数，并记录 raw',
        type: 'sync',
        run: (runtime) => runMethodReturnContract(
          runtime,
          'listenFrameChange',
          (camera) => camera.listenFrameChange(),
          {
            allowPermissionError: true,
            afterInvoke: (camera) => {
              closeFrameChangeSafely(camera);
            }
          }
        ),
        expect: {
          methodExists: true,
          invocationSucceededOrPermissionRelated: true,
          returnThenable: false,
          raw: '@exists'
        },
        allowVariance: ['error', 'afterInvokeError']
      }
    ]
  },

  {
    name: 'Camera.onAuthCancel',
    category: 'camera',
    tests: [
      {
        id: 'camera.onAuthCancel',
        name: 'onAuthCancel 注册契约',
        description: '验证 onAuthCancel 可注册回调、返回值非 Promise，并记录 raw',
        type: 'sync',
        run: (runtime) => {
          const created = createCameraInstance(runtime);
          if (created.errorResult) {
            return created.errorResult;
          }

          const camera = created.camera;
          if (!isObject(camera) || typeof camera.onAuthCancel !== 'function') {
            destroyCameraSafely(camera);
            return { _error: 'Camera.onAuthCancel 不存在' };
          }

          let returned;
          let registerThrew = false;
          let error = null;

          try {
            returned = camera.onAuthCancel(() => {});
          } catch (e) {
            registerThrew = true;
            error = formatError(e);
          }

          const permissionRelatedError = registerThrew && isPermissionRelatedError(error);
          destroyCameraSafely(camera);

          return {
            methodExists: true,
            registerThrew,
            permissionRelatedError,
            registerSucceededOrPermissionRelated: !registerThrew || permissionRelatedError,
            returnThenable: isThenable(returned),
            raw: registerThrew ? null : normalizeRaw(returned),
            error
          };
        },
        expect: {
          methodExists: true,
          registerSucceededOrPermissionRelated: true,
          returnThenable: false,
          raw: '@exists'
        },
        allowVariance: ['error']
      },
      {
        id: 'camera-onAuthCancel-trigger-manual',
        name: 'onAuthCancel 真实触发',
        description: '手动场景：首次请求摄像头权限时选择拒绝，验证 onAuthCancel 回调触发并记录 raw',
        type: 'event',
        timeout: 20000,
        automation: 'manual',
        manualRequired: true,
        run: (runtime, callback) => {
          const created = createCameraInstance(runtime);
          if (created.errorResult) {
            return callback({ ...created.errorResult, triggered: false, raw: null });
          }

          const camera = created.camera;
          onAuthCancelCameraRef = camera;
          if (!isObject(camera) || typeof camera.onAuthCancel !== 'function') {
            return callback({ _error: 'Camera.onAuthCancel 不存在', triggered: false, raw: null });
          }

          try {
            camera.onAuthCancel((res) => {
              callback({
                triggered: true,
                raw: normalizeRaw(res),
                payloadUndefinedOrObject: typeof res === 'undefined' || isObject(res)
              });
            });
          } catch (e) {
            callback({
              triggered: false,
              registerThrew: true,
              raw: null,
              error: formatError(e)
            });
          }
        },
        cleanup: () => {
          cleanupOnAuthCancelState();
        },
        expect: {
          eventReceived: true,
          triggered: true,
          payloadUndefinedOrObject: true
        }
      }
    ]
  },

  {
    name: 'Camera.onCameraFrame',
    category: 'camera',
    tests: [
      {
        id: 'camera-onCameraFrame-register-contract',
        name: 'onCameraFrame 注册契约',
        description: '验证 onCameraFrame 可注册回调，返回 listener（或 undefined），并记录 raw',
        type: 'sync',
        run: (runtime) => {
          const created = createCameraInstance(runtime);
          if (created.errorResult) {
            return created.errorResult;
          }

          const camera = created.camera;
          if (!isObject(camera) || typeof camera.onCameraFrame !== 'function') {
            destroyCameraSafely(camera);
            return { _error: 'Camera.onCameraFrame 不存在' };
          }

          let returned;
          let registerThrew = false;
          let error = null;

          try {
            returned = camera.onCameraFrame(() => {});
          } catch (e) {
            registerThrew = true;
            error = formatError(e);
          }

          const permissionRelatedError = registerThrew && isPermissionRelatedError(error);

          if (!registerThrew) {
            stopFrameListenerSafely(returned);
            closeFrameChangeSafely(camera);
          }
          destroyCameraSafely(camera);

          return {
            methodExists: true,
            registerThrew,
            permissionRelatedError,
            registerSucceededOrPermissionRelated: !registerThrew || permissionRelatedError,
            listenerObjectValidOrUndefined: registerThrew
              ? true
              : (typeof returned === 'undefined' || isObject(returned)),
            listenerStartValidOrMissing: registerThrew
              ? true
              : (typeof returned === 'undefined' || typeof returned.start === 'function'),
            listenerStopValidOrMissing: registerThrew
              ? true
              : (typeof returned === 'undefined' || typeof returned.stop === 'function'),
            returnThenable: isThenable(returned),
            raw: registerThrew ? null : normalizeRaw(returned),
            error
          };
        },
        expect: {
          methodExists: true,
          registerSucceededOrPermissionRelated: true,
          listenerObjectValidOrUndefined: true,
          listenerStartValidOrMissing: true,
          listenerStopValidOrMissing: true,
          returnThenable: false,
          raw: '@exists'
        },
        allowVariance: ['error']
      },
      {
        id: 'camera.onCameraFrame',
        name: '摄像头帧回调触发',
        description: '手动场景：授权摄像头并保持画面，验证 onCameraFrame 实时回调触发与 payload 结构',
        type: 'event',
        timeout: 20000,
        automation: 'manual',
        manualRequired: true,
        run: (runtime, callback) => {
          const created = createCameraInstance(runtime);
          if (created.errorResult) {
            return callback({ ...created.errorResult, triggered: false, raw: null });
          }

          const camera = created.camera;
          onCameraFrameCameraRef = camera;

          if (!isObject(camera) || typeof camera.onCameraFrame !== 'function') {
            return callback({ _error: 'Camera.onCameraFrame 不存在', triggered: false, raw: null });
          }

          let finished = false;
          const finish = (payload) => {
            if (finished) {
              return;
            }
            finished = true;
            cleanupOnCameraFrameState();
            callback(payload);
          };

          try {
            const listener = camera.onCameraFrame((res) => {
              finish({
                triggered: true,
                raw: normalizeRaw(res),
                payloadObjectValid: isObject(res),
                framePayloadValid: validateFramePayload(res),
                widthValid: isFiniteNumber(res?.width),
                heightValid: isFiniteNumber(res?.height),
                dataArrayBufferValid: res?.data instanceof ArrayBuffer
              });
            });

            onCameraFrameListenerRef = listener || null;

            if (listener && typeof listener.start === 'function') {
              try {
                const started = listener.start();
                safelyAttachPromiseHandlers(started);
              } catch (e) {
                // ignore start error, keep waiting for callback
              }
            } else if (typeof camera.listenFrameChange === 'function') {
              try {
                camera.listenFrameChange();
              } catch (e) {
                // ignore listen error, keep waiting for callback
              }
            }
          } catch (e) {
            finish({
              triggered: false,
              registerThrew: true,
              raw: null,
              error: formatError(e)
            });
          }
        },
        cleanup: () => {
          cleanupOnCameraFrameState();
        },
        expect: {
          eventReceived: true,
          triggered: true,
          payloadObjectValid: true,
          framePayloadValid: true,
          widthValid: true,
          heightValid: true,
          dataArrayBufferValid: true
        }
      }
    ]
  },

  {
    name: 'Camera.onStop',
    category: 'camera',
    tests: [
      {
        id: 'camera.onStop',
        name: 'onStop 注册契约',
        description: '验证 onStop 可注册回调、返回值非 Promise，并记录 raw',
        type: 'sync',
        run: (runtime) => {
          const created = createCameraInstance(runtime);
          if (created.errorResult) {
            return created.errorResult;
          }

          const camera = created.camera;
          if (!isObject(camera) || typeof camera.onStop !== 'function') {
            destroyCameraSafely(camera);
            return { _error: 'Camera.onStop 不存在' };
          }

          let returned;
          let registerThrew = false;
          let error = null;

          try {
            returned = camera.onStop(() => {});
          } catch (e) {
            registerThrew = true;
            error = formatError(e);
          }

          const permissionRelatedError = registerThrew && isPermissionRelatedError(error);
          destroyCameraSafely(camera);

          return {
            methodExists: true,
            registerThrew,
            permissionRelatedError,
            registerSucceededOrPermissionRelated: !registerThrew || permissionRelatedError,
            returnThenable: isThenable(returned),
            raw: registerThrew ? null : normalizeRaw(returned),
            error
          };
        },
        expect: {
          methodExists: true,
          registerSucceededOrPermissionRelated: true,
          returnThenable: false,
          raw: '@exists'
        },
        allowVariance: ['error']
      },
      {
        id: 'camera-onStop-trigger-manual',
        name: 'onStop 真实触发',
        description: '手动场景：授权摄像头后将小游戏切后台，验证 onStop 回调触发并记录 raw',
        type: 'event',
        timeout: 20000,
        automation: 'manual',
        manualRequired: true,
        run: (runtime, callback) => {
          const created = createCameraInstance(runtime);
          if (created.errorResult) {
            return callback({ ...created.errorResult, triggered: false, raw: null });
          }

          const camera = created.camera;
          onStopCameraRef = camera;

          if (!isObject(camera) || typeof camera.onStop !== 'function') {
            return callback({ _error: 'Camera.onStop 不存在', triggered: false, raw: null });
          }

          try {
            camera.onStop((res) => {
              callback({
                triggered: true,
                raw: normalizeRaw(res),
                payloadUndefinedOrObject: typeof res === 'undefined' || isObject(res)
              });
            });
          } catch (e) {
            callback({
              triggered: false,
              registerThrew: true,
              raw: null,
              error: formatError(e)
            });
          }
        },
        cleanup: () => {
          cleanupOnStopState();
        },
        expect: {
          eventReceived: true,
          triggered: true,
          payloadUndefinedOrObject: true
        }
      }
    ]
  },

  {
    name: 'Camera.setZoom',
    category: 'camera',
    tests: [
      {
        id: 'camera.setZoom',
        name: 'setZoom Promise 返回契约',
        description: '验证 setZoom 返回 Promise（或在权限拒绝场景抛出权限错误）并记录 raw',
        type: 'sync',
        run: (runtime) => runMethodReturnContract(
          runtime,
          'setZoom',
          (camera) => camera.setZoom({ zoom: 1 }),
          { allowPermissionError: true }
        ),
        expect: {
          methodExists: true,
          invocationSucceededOrPermissionRelated: true,
          returnThenableOrPermissionRelated: true,
          raw: '@exists'
        },
        allowVariance: ['error', 'afterInvokeError', 'returnThenable']
      },
      {
        id: 'camera-setZoom-outcome-manual',
        name: 'setZoom Promise 结果校验',
        description: '手动场景：授权摄像头后调用 setZoom，验证 Promise 结果并记录 raw',
        type: 'async',
        timeout: 16000,
        automation: 'manual',
        manualRequired: true,
        run: (runtime) => runPromiseMethodOutcome(
          runtime,
          'setZoom',
          (camera) => camera.setZoom({ zoom: 1 }),
          {
            timeoutMs: 12000,
            validateResolvedPayload: validateSetZoomResolvedPayload
          }
        ),
        expect: {
          methodExists: true,
          invocationThrew: false,
          returnThenable: true,
          promiseSettled: true,
          outcomeSingle: true,
          resolvedPayloadValidOrRejected: true,
          timeout: false
        },
        allowVariance: ['promiseResolved', 'promiseRejected', 'permissionRelatedRejection', 'raw']
      }
    ]
  },

  {
    name: 'Camera.startRecord',
    category: 'camera',
    tests: [
      {
        id: 'camera.startRecord',
        name: 'startRecord Promise 返回契约',
        description: '验证 startRecord 返回 Promise（或权限拒绝错误）并记录 raw',
        type: 'sync',
        run: (runtime) => runMethodReturnContract(
          runtime,
          'startRecord',
          (camera) => camera.startRecord(),
          { allowPermissionError: true }
        ),
        expect: {
          methodExists: true,
          invocationSucceededOrPermissionRelated: true,
          returnThenableOrPermissionRelated: true,
          raw: '@exists'
        },
        allowVariance: ['error', 'afterInvokeError', 'returnThenable']
      },
      {
        id: 'camera-startRecord-outcome-manual',
        name: 'startRecord Promise 结果校验',
        description: '手动场景：授权摄像头后调用 startRecord，验证 Promise 结果并记录 raw',
        type: 'async',
        timeout: 16000,
        automation: 'manual',
        manualRequired: true,
        run: (runtime) => runPromiseMethodOutcome(
          runtime,
          'startRecord',
          (camera) => camera.startRecord(),
          {
            timeoutMs: 12000,
            validateResolvedPayload: validateStartRecordResolvedPayload
          }
        ),
        expect: {
          methodExists: true,
          invocationThrew: false,
          returnThenable: true,
          promiseSettled: true,
          outcomeSingle: true,
          resolvedPayloadValidOrRejected: true,
          timeout: false
        },
        allowVariance: ['promiseResolved', 'promiseRejected', 'permissionRelatedRejection', 'raw']
      }
    ]
  },

  {
    name: 'Camera.stopRecord',
    category: 'camera',
    tests: [
      {
        id: 'camera.stopRecord',
        name: 'stopRecord Promise 返回契约',
        description: '验证 stopRecord(compressed) 返回 Promise（或权限拒绝错误）并记录 raw',
        type: 'sync',
        run: (runtime) => runMethodReturnContract(
          runtime,
          'stopRecord',
          (camera) => camera.stopRecord(true),
          { allowPermissionError: true }
        ),
        expect: {
          methodExists: true,
          invocationSucceededOrPermissionRelated: true,
          returnThenableOrPermissionRelated: true,
          raw: '@exists'
        },
        allowVariance: ['error', 'afterInvokeError', 'returnThenable']
      },
      {
        id: 'camera-stopRecord-outcome-manual',
        name: 'stopRecord Promise 结果校验',
        description: '手动场景：授权摄像头并录制后调用 stopRecord，验证 Promise 返回封面/视频字段',
        type: 'async',
        timeout: 18000,
        automation: 'manual',
        manualRequired: true,
        run: (runtime) => runPromiseMethodOutcome(
          runtime,
          'stopRecord',
          (camera) => {
            if (typeof camera.startRecord === 'function') {
              try {
                const startReturned = camera.startRecord();
                safelyAttachPromiseHandlers(startReturned);
              } catch (e) {
                // ignore pre-start error, keep validating stopRecord promise behavior
              }
            }
            return camera.stopRecord(true);
          },
          {
            timeoutMs: 14000,
            validateResolvedPayload: validateStopRecordResolvedPayload
          }
        ),
        expect: {
          methodExists: true,
          invocationThrew: false,
          returnThenable: true,
          promiseSettled: true,
          outcomeSingle: true,
          resolvedPayloadValidOrRejected: true,
          timeout: false
        },
        allowVariance: ['promiseResolved', 'promiseRejected', 'permissionRelatedRejection', 'raw']
      }
    ]
  },

  {
    name: 'Camera.takePhoto',
    category: 'camera',
    tests: [
      {
        id: 'camera.takePhoto',
        name: 'takePhoto Promise 返回契约',
        description: '验证 takePhoto(quality) 返回 Promise（或权限拒绝错误）并记录 raw',
        type: 'sync',
        run: (runtime) => runMethodReturnContract(
          runtime,
          'takePhoto',
          (camera) => camera.takePhoto('normal'),
          { allowPermissionError: true }
        ),
        expect: {
          methodExists: true,
          invocationSucceededOrPermissionRelated: true,
          returnThenableOrPermissionRelated: true,
          raw: '@exists'
        },
        allowVariance: ['error', 'afterInvokeError', 'returnThenable']
      },
      {
        id: 'camera-takePhoto-outcome-manual',
        name: 'takePhoto Promise 结果校验',
        description: '手动场景：授权摄像头后执行 takePhoto，验证返回图片路径与尺寸字段',
        type: 'async',
        timeout: 18000,
        automation: 'manual',
        manualRequired: true,
        run: (runtime) => runPromiseMethodOutcome(
          runtime,
          'takePhoto',
          (camera) => camera.takePhoto('normal'),
          {
            timeoutMs: 14000,
            validateResolvedPayload: validateTakePhotoResolvedPayload
          }
        ).then((result) => ({
          ...result,
          qualityArgValid: PHOTO_QUALITY_VALUES.has('normal')
        })),
        expect: {
          methodExists: true,
          invocationThrew: false,
          returnThenable: true,
          promiseSettled: true,
          outcomeSingle: true,
          resolvedPayloadValidOrRejected: true,
          qualityArgValid: true,
          timeout: false
        },
        allowVariance: ['promiseResolved', 'promiseRejected', 'permissionRelatedRejection', 'raw']
      }
    ]
  }
];
