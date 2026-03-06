/**
 * 系统信息相关 API 测试（对齐 apis.md）
 */

const PLATFORM_VALUES = new Set(['ios', 'android', 'ohos', 'ohos_pc', 'windows', 'mac', 'devtools']);
const ORIENTATION_VALUES = new Set(['portrait', 'landscape']);
const THEME_VALUES = new Set(['light', 'dark']);
const AUTH_STATUS_VALUES = new Set(['authorized', 'denied', 'not determined', 'non determined']);

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
  if (!error) return 'unknown error';
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  try {
    return JSON.stringify(error);
  } catch (e) {
    return String(error);
  }
}

function isValidPlatform(value) {
  return isString(value) && PLATFORM_VALUES.has(value);
}

function isValidOrientation(value) {
  return isString(value) && ORIENTATION_VALUES.has(value);
}

function isValidThemeOrMissing(value) {
  return typeof value === 'undefined' || (isString(value) && THEME_VALUES.has(value));
}

function isValidSafeAreaOrMissing(value) {
  if (typeof value === 'undefined') {
    return true;
  }

  if (!isObject(value)) {
    return false;
  }

  return [
    value.left,
    value.right,
    value.top,
    value.bottom,
    value.width,
    value.height
  ].every(isFiniteNumber);
}

function isValidHostOrMissing(value) {
  if (typeof value === 'undefined') {
    return true;
  }

  if (!isObject(value)) {
    return false;
  }

  if (typeof value.appId !== 'undefined' && !isString(value.appId)) {
    return false;
  }

  return true;
}

function isValidAuthorizeStatus(value) {
  return isString(value) && AUTH_STATUS_VALUES.has(value);
}

function validateSystemInfoPayload(value) {
  if (!isObject(value)) {
    return false;
  }

  const requiredStringKeys = ['brand', 'model', 'language', 'version', 'system', 'platform', 'SDKVersion'];
  const requiredNumberKeys = [
    'pixelRatio',
    'screenWidth',
    'screenHeight',
    'windowWidth',
    'windowHeight',
    'statusBarHeight',
    'fontSizeSetting'
  ];
  const optionalBooleanKeys = [
    'albumAuthorized',
    'cameraAuthorized',
    'locationAuthorized',
    'microphoneAuthorized',
    'notificationAuthorized',
    'notificationAlertAuthorized',
    'notificationBadgeAuthorized',
    'notificationSoundAuthorized',
    'phoneCalendarAuthorized',
    'bluetoothEnabled',
    'locationEnabled',
    'wifiEnabled',
    'locationReducedAccuracy',
    'enableDebug'
  ];

  const requiredStringsValid = requiredStringKeys.every((key) => isString(value[key]));
  const requiredNumbersValid = requiredNumberKeys.every((key) => isFiniteNumber(value[key]));
  const optionalBooleansValid = optionalBooleanKeys.every((key) => {
    if (typeof value[key] === 'undefined') {
      return true;
    }
    return typeof value[key] === 'boolean';
  });
  const benchmarkLevelValid = typeof value.benchmarkLevel === 'undefined' || isFiniteNumber(value.benchmarkLevel);
  const platformValid = isValidPlatform(value.platform);
  const orientationValidOrMissing = typeof value.deviceOrientation === 'undefined' || isValidOrientation(value.deviceOrientation);

  return requiredStringsValid
    && requiredNumbersValid
    && optionalBooleansValid
    && benchmarkLevelValid
    && platformValid
    && orientationValidOrMissing
    && isValidSafeAreaOrMissing(value.safeArea)
    && isValidThemeOrMissing(value.theme)
    && isValidHostOrMissing(value.host);
}

function runOptionApiContract(runtime, apiName, options = {}) {
  const {
    args = {},
    timeoutMs = 5000,
    validateSuccessPayload
  } = options;

  return new Promise((resolve) => {
    const api = runtime[apiName];
    if (typeof api !== 'function') {
      resolve({ _error: `${apiName} 不存在` });
      return;
    }

    let settled = false;
    let delayTimer = null;
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
      if (delayTimer) {
        clearTimeout(delayTimer);
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
      if (delayTimer) {
        clearTimeout(delayTimer);
      }
      delayTimer = setTimeout(finish, 120);
    };

    const timeoutTimer = setTimeout(() => {
      result.timeout = true;
      finish();
    }, timeoutMs);

    const callOptions = {
      ...args,
      success: (res) => {
        result.successCalled = true;
        events.push('success');
        result.successPayload = res;
        result.raw = (typeof result.successPayload === 'undefined') ? null : result.successPayload;

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
        events.push('fail');
        result.failPayload = err;
        if (result.raw === null || typeof result.raw === 'undefined') {
          result.raw = (typeof result.failPayload === 'undefined') ? null : result.failPayload;
        }
        settleSoon();
      },
      complete: (res) => {
        result.completeCalled = true;
        events.push('complete');
        result.completePayload = res;
        if (result.raw === null || typeof result.raw === 'undefined') {
          result.raw = (typeof result.completePayload === 'undefined') ? null : result.completePayload;
        }
        settleSoon();
      }
    };

    let returned;
    try {
      returned = api(callOptions);
    } catch (e) {
      result.threw = true;
      result.error = formatError(e);
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

    settleSoon();
  });
}

function probePromiseSupport(runtime, apiName, args = {}) {
  const api = runtime[apiName];
  if (typeof api !== 'function') {
    return { _error: `${apiName} 不存在` };
  }

  try {
    const returned = api(args);
    const promiseStyleSupported = isThenable(returned);

    if (promiseStyleSupported) {
      try {
        returned.then(() => {}, () => {});
      } catch (e) {
        // ignore
      }
    }

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

function checkSyncSystemInfo(runtime, apiName) {
  const api = runtime[apiName];
  if (typeof api !== 'function') {
    return { _error: `${apiName} 不存在` };
  }

  try {
    const result = api();
    return {
      threw: false,
      payloadValid: validateSystemInfoPayload(result),
      raw: result
    };
  } catch (e) {
    return {
      threw: true,
      payloadValid: false,
      error: formatError(e)
    };
  }
}

export default [
  {
    name: 'migo.openSystemBluetoothSetting',
    category: 'base',
    tests: [
      {
        id: 'migo.openSystemBluetoothSetting',
        name: '打开系统蓝牙设置页（非侵入 dryRun）',
        description: '通过 navigate 协议验证 openSystemBluetoothSetting 存在性（dryRun）',
        type: 'navigate',
        run: (runtime, nav = {}) => {
          if (typeof runtime.openSystemBluetoothSetting !== 'function') {
            return { _error: 'openSystemBluetoothSetting 不存在' };
          }

          if (nav.dryRun) {
            return { apiExists: true, executed: false };
          }

          runtime.openSystemBluetoothSetting({
            success: (res) => nav.onSuccess && nav.onSuccess({ apiExists: true, executed: true, success: true, res }),
            fail: (err) => nav.onFail && nav.onFail(err)
          });

          return undefined;
        },
        expect: {
          apiExists: true
        },
        allowVariance: ['executed', 'success', 'res']
      },
      {
        id: 'system-openSystemBluetoothSetting-callback-contract',
        name: '参数回调契约（success/fail/complete）',
        description: '手动场景：验证 openSystemBluetoothSetting 回调参数契约和 complete 触发顺序',
        type: 'async',
        timeout: 12000,
        automation: 'manual',
        manualRequired: true,
        run: (runtime) => runOptionApiContract(runtime, 'openSystemBluetoothSetting', { timeoutMs: 10000 }),
        expect: {
          apiExists: true,
          threw: false,
          timeout: false,
          callbackInvoked: true,
          completeCalled: true,
          completeAfterOutcome: true,
          multipleOutcomeCallbacks: false
        }
      },
      {
        id: 'system-openSystemBluetoothSetting-promise-support',
        name: 'Promise 风格支持',
        description: '手动场景：验证 openSystemBluetoothSetting 是否支持 Promise 风格调用',
        type: 'sync',
        automation: 'manual',
        manualRequired: true,
        run: (runtime) => probePromiseSupport(runtime, 'openSystemBluetoothSetting', {}),
        expect: {
          apiExists: true,
          threw: false,
          promiseStyleSupported: true
        }
      }
    ]
  },

  {
    name: 'migo.openAppAuthorizeSetting',
    category: 'base',
    tests: [
      {
        id: 'migo.openAppAuthorizeSetting',
        name: '打开应用授权设置页（非侵入 dryRun）',
        description: '通过 navigate 协议验证 openAppAuthorizeSetting 存在性（dryRun）',
        type: 'navigate',
        run: (runtime, nav = {}) => {
          if (typeof runtime.openAppAuthorizeSetting !== 'function') {
            return { _error: 'openAppAuthorizeSetting 不存在' };
          }

          if (nav.dryRun) {
            return { apiExists: true, executed: false };
          }

          runtime.openAppAuthorizeSetting({
            success: (res) => nav.onSuccess && nav.onSuccess({ apiExists: true, executed: true, success: true, res }),
            fail: (err) => nav.onFail && nav.onFail(err)
          });

          return undefined;
        },
        expect: {
          apiExists: true
        },
        allowVariance: ['executed', 'success', 'res']
      },
      {
        id: 'system-openAppAuthorizeSetting-callback-contract',
        name: '参数回调契约（success/fail/complete）',
        description: '手动场景：验证 openAppAuthorizeSetting 回调参数契约和 complete 触发顺序',
        type: 'async',
        timeout: 12000,
        automation: 'manual',
        manualRequired: true,
        run: (runtime) => runOptionApiContract(runtime, 'openAppAuthorizeSetting', { timeoutMs: 10000 }),
        expect: {
          apiExists: true,
          threw: false,
          timeout: false,
          callbackInvoked: true,
          completeCalled: true,
          completeAfterOutcome: true,
          multipleOutcomeCallbacks: false
        }
      },
      {
        id: 'system-openAppAuthorizeSetting-promise-support',
        name: 'Promise 风格支持',
        description: '手动场景：验证 openAppAuthorizeSetting 是否支持 Promise 风格调用',
        type: 'sync',
        automation: 'manual',
        manualRequired: true,
        run: (runtime) => probePromiseSupport(runtime, 'openAppAuthorizeSetting', {}),
        expect: {
          apiExists: true,
          threw: false,
          promiseStyleSupported: true
        }
      }
    ]
  },

  {
    name: 'migo.getWindowInfo',
    category: 'base',
    tests: [
      {
        id: 'migo.getWindowInfo',
        name: '获取窗口信息',
        description: '验证 getWindowInfo 返回值字段与可选字段（safeArea/screenTop）',
        type: 'sync',
        run: (runtime) => {
          if (typeof runtime.getWindowInfo !== 'function') {
            return { _error: 'getWindowInfo 不存在' };
          }

          const info = runtime.getWindowInfo();
          const coreNumbers = [
            info?.pixelRatio,
            info?.screenWidth,
            info?.screenHeight,
            info?.windowWidth,
            info?.windowHeight,
            info?.statusBarHeight
          ];

          return {
            isObject: isObject(info),
            coreFieldsValid: coreNumbers.every(isFiniteNumber),
            safeAreaValidOrMissing: isValidSafeAreaOrMissing(info?.safeArea),
            screenTopValidOrMissing: typeof info?.screenTop === 'undefined' || isFiniteNumber(info?.screenTop),
            raw: info
          };
        },
        expect: {
          isObject: true,
          coreFieldsValid: true,
          safeAreaValidOrMissing: true,
          screenTopValidOrMissing: true
        }
      }
    ]
  },

  {
    name: 'migo.getSystemSetting',
    category: 'base',
    tests: [
      {
        id: 'migo.getSystemSetting',
        name: '获取系统设置',
        description: '验证 getSystemSetting 字段类型与 deviceOrientation 合法值',
        type: 'sync',
        run: (runtime) => {
          if (typeof runtime.getSystemSetting !== 'function') {
            return { _error: 'getSystemSetting 不存在' };
          }

          const setting = runtime.getSystemSetting();
          return {
            isObject: isObject(setting),
            bluetoothEnabledValid: typeof setting?.bluetoothEnabled === 'boolean',
            locationEnabledValid: typeof setting?.locationEnabled === 'boolean',
            wifiEnabledValid: typeof setting?.wifiEnabled === 'boolean',
            orientationValid: isValidOrientation(setting?.deviceOrientation),
            raw: setting
          };
        },
        expect: {
          isObject: true,
          bluetoothEnabledValid: true,
          locationEnabledValid: true,
          wifiEnabledValid: true,
          orientationValid: true
        }
      }
    ]
  },

  {
    name: 'migo.getSystemInfoSync',
    category: 'base',
    tests: [
      {
        id: 'migo.getSystemInfoSync',
        name: '获取系统信息（同步）',
        description: '验证 getSystemInfoSync 同步返回值结构（兼容已废弃但仍可用接口）',
        type: 'sync',
        run: (runtime) => checkSyncSystemInfo(runtime, 'getSystemInfoSync'),
        expect: {
          threw: false,
          payloadValid: true
        }
      }
    ]
  },

  {
    name: 'migo.getSystemInfoAsync',
    category: 'base',
    tests: [
      {
        id: 'migo.getSystemInfoAsync',
        name: '异步回调契约与返回结构',
        description: '验证 getSystemInfoAsync 参数（success/fail/complete）和 success 数据结构',
        type: 'async',
        timeout: 8000,
        run: (runtime) => runOptionApiContract(runtime, 'getSystemInfoAsync', {
          timeoutMs: 6000,
          validateSuccessPayload: validateSystemInfoPayload
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
          successPayloadValidOrNoSuccess: true
        }
      },
      {
        id: 'system-getSystemInfoAsync-promise-support',
        name: 'Promise 风格支持（应不支持）',
        description: '验证 getSystemInfoAsync 不支持 Promise 风格调用',
        type: 'sync',
        run: (runtime) => probePromiseSupport(runtime, 'getSystemInfoAsync', {}),
        expect: {
          apiExists: true,
          threw: false,
          promiseStyleSupported: false
        }
      }
    ]
  },

  {
    name: 'migo.getSystemInfo',
    category: 'base',
    tests: [
      {
        id: 'migo.getSystemInfo',
        name: '异步格式回调契约与返回结构',
        description: '验证 getSystemInfo 参数（success/fail/complete）和 success 数据结构',
        type: 'async',
        timeout: 8000,
        run: (runtime) => runOptionApiContract(runtime, 'getSystemInfo', {
          timeoutMs: 6000,
          validateSuccessPayload: validateSystemInfoPayload
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
          successPayloadValidOrNoSuccess: true
        }
      },
      {
        id: 'system-getSystemInfo-promise-support',
        name: 'Promise 风格支持（应支持）',
        description: '验证 getSystemInfo 支持 Promise 风格调用',
        type: 'sync',
        run: (runtime) => probePromiseSupport(runtime, 'getSystemInfo', {}),
        expect: {
          apiExists: true,
          threw: false,
          promiseStyleSupported: true
        }
      }
    ]
  },

  {
    name: 'migo.getDeviceInfo',
    category: 'base',
    tests: [
      {
        id: 'migo.getDeviceInfo',
        name: '获取设备基础信息',
        description: '验证 getDeviceInfo 的必填字段、平台枚举与可选字段类型',
        type: 'sync',
        run: (runtime) => {
          if (typeof runtime.getDeviceInfo !== 'function') {
            return { _error: 'getDeviceInfo 不存在' };
          }

          const info = runtime.getDeviceInfo();
          return {
            isObject: isObject(info),
            requiredStringsValid: isString(info?.brand)
              && isString(info?.model)
              && isString(info?.system)
              && isString(info?.platform),
            platformValid: isValidPlatform(info?.platform),
            benchmarkLevelValidOrMissing: typeof info?.benchmarkLevel === 'undefined' || isFiniteNumber(info?.benchmarkLevel),
            abiValidOrMissing: typeof info?.abi === 'undefined' || isString(info?.abi),
            deviceAbiValidOrMissing: typeof info?.deviceAbi === 'undefined' || isString(info?.deviceAbi),
            cpuTypeValidOrMissing: typeof info?.cpuType === 'undefined' || isString(info?.cpuType),
            memorySizeValidOrMissing: typeof info?.memorySize === 'undefined' || isString(info?.memorySize),
            raw: info
          };
        },
        expect: {
          isObject: true,
          requiredStringsValid: true,
          platformValid: true,
          benchmarkLevelValidOrMissing: true,
          abiValidOrMissing: true,
          deviceAbiValidOrMissing: true,
          cpuTypeValidOrMissing: true,
          memorySizeValidOrMissing: true
        }
      }
    ]
  },

  {
    name: 'migo.getDeviceBenchmarkInfo',
    category: 'base',
    tests: [
      {
        id: 'migo.getDeviceBenchmarkInfo',
        name: '回调契约与数据结构',
        description: '验证 getDeviceBenchmarkInfo 参数（success/fail/complete）和 success 返回值结构',
        type: 'async',
        timeout: 8000,
        run: (runtime) => runOptionApiContract(runtime, 'getDeviceBenchmarkInfo', {
          timeoutMs: 6000,
          validateSuccessPayload: (res) => isObject(res)
            && isFiniteNumber(res.benchmarkLevel)
            && isFiniteNumber(res.modelLevel)
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
          successPayloadValidOrNoSuccess: true
        }
      },
      {
        id: 'system-getDeviceBenchmarkInfo-promise-support',
        name: 'Promise 风格支持（应不支持）',
        description: '验证 getDeviceBenchmarkInfo 不支持 Promise 风格调用',
        type: 'sync',
        run: (runtime) => probePromiseSupport(runtime, 'getDeviceBenchmarkInfo', {}),
        expect: {
          apiExists: true,
          threw: false,
          promiseStyleSupported: false
        }
      }
    ]
  },

  {
    name: 'migo.getAppBaseInfo',
    category: 'base',
    tests: [
      {
        id: 'migo.getAppBaseInfo',
        name: '获取应用基础信息',
        description: '验证 getAppBaseInfo 必填字段与可选字段类型（host/theme/PCKernelVersion 等）',
        type: 'sync',
        run: (runtime) => {
          if (typeof runtime.getAppBaseInfo !== 'function') {
            return { _error: 'getAppBaseInfo 不存在' };
          }

          const info = runtime.getAppBaseInfo();
          return {
            isObject: isObject(info),
            requiredFieldsValid: isString(info?.SDKVersion)
              && typeof info?.enableDebug === 'boolean'
              && isString(info?.language)
              && isString(info?.version),
            hostValidOrMissing: isValidHostOrMissing(info?.host),
            themeValidOrMissing: isValidThemeOrMissing(info?.theme),
            pcKernelVersionValidOrMissing: typeof info?.PCKernelVersion === 'undefined' || isString(info?.PCKernelVersion),
            fontSizeScaleFactorValidOrMissing: typeof info?.fontSizeScaleFactor === 'undefined' || isFiniteNumber(info?.fontSizeScaleFactor),
            fontSizeSettingValidOrMissing: typeof info?.fontSizeSetting === 'undefined' || isFiniteNumber(info?.fontSizeSetting),
            raw: info
          };
        },
        expect: {
          isObject: true,
          requiredFieldsValid: true,
          hostValidOrMissing: true,
          themeValidOrMissing: true,
          pcKernelVersionValidOrMissing: true,
          fontSizeScaleFactorValidOrMissing: true,
          fontSizeSettingValidOrMissing: true
        }
      }
    ]
  },

  {
    name: 'migo.getAppAuthorizeSetting',
    category: 'base',
    tests: [
      {
        id: 'migo.getAppAuthorizeSetting',
        name: '获取应用授权设置',
        description: '验证 getAppAuthorizeSetting 授权状态枚举与可选字段类型',
        type: 'sync',
        run: (runtime) => {
          if (typeof runtime.getAppAuthorizeSetting !== 'function') {
            return { _error: 'getAppAuthorizeSetting 不存在' };
          }

          const setting = runtime.getAppAuthorizeSetting();
          const requiredKeys = [
            'albumAuthorized',
            'bluetoothAuthorized',
            'cameraAuthorized',
            'locationAuthorized',
            'microphoneAuthorized',
            'notificationAuthorized'
          ];
          const optionalKeys = [
            'notificationAlertAuthorized',
            'notificationBadgeAuthorized',
            'notificationSoundAuthorized',
            'phoneCalendarAuthorized'
          ];

          return {
            isObject: isObject(setting),
            requiredAuthorizeStatesValid: requiredKeys.every((key) => isValidAuthorizeStatus(setting?.[key])),
            optionalAuthorizeStatesValid: optionalKeys.every((key) => {
              const value = setting?.[key];
              return typeof value === 'undefined' || isValidAuthorizeStatus(value);
            }),
            locationReducedAccuracyValidOrMissing: typeof setting?.locationReducedAccuracy === 'undefined'
              || typeof setting?.locationReducedAccuracy === 'boolean',
            raw: setting
          };
        },
        expect: {
          isObject: true,
          requiredAuthorizeStatesValid: true,
          optionalAuthorizeStatesValid: true,
          locationReducedAccuracyValidOrMissing: true
        }
      }
    ]
  }
];
