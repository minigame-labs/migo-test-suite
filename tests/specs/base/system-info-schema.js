/**
 * System info full schema validation
 * Verifies field names and types per WX MiniGame spec.
 * Uses runOptionApiContract() for async tests.
 */
import { runOptionApiContract, probePromiseSupport, normalizeRaw } from '../_shared/runtime-helpers.js';

// Required fields per WX spec (must be present on all platforms)
const REQUIRED_SCHEMA = {
  brand: 'string', model: 'string', pixelRatio: 'number',
  screenWidth: 'number', screenHeight: 'number',
  windowWidth: 'number', windowHeight: 'number',
  statusBarHeight: 'number', language: 'string',
  version: 'string', system: 'string', platform: 'string',
  SDKVersion: 'string', fontSizeSetting: 'number'
};

// Optional fields (platform-dependent)
const OPTIONAL_SCHEMA = {
  albumAuthorized: 'boolean', cameraAuthorized: 'boolean',
  locationAuthorized: 'boolean', microphoneAuthorized: 'boolean',
  notificationAuthorized: 'boolean', phoneCalendarAuthorized: 'boolean',
  notificationAlertAuthorized: 'boolean', notificationBadgeAuthorized: 'boolean',
  notificationSoundAuthorized: 'boolean',
  bluetoothEnabled: 'boolean', locationEnabled: 'boolean', wifiEnabled: 'boolean',
  locationReducedAccuracy: 'boolean',
  benchmarkLevel: 'number', enableDebug: 'boolean',
  deviceOrientation: 'string', host: 'object', theme: 'string'
};

const VALID_PLATFORMS = ['ios', 'android', 'ohos', 'ohos_pc', 'windows', 'mac', 'devtools'];

function validateSchema(info) {
  const missing = [];
  const wrongType = [];
  for (const [field, type] of Object.entries(REQUIRED_SCHEMA)) {
    if (typeof info[field] === 'undefined') missing.push(field);
    else if (typeof info[field] !== type) wrongType.push({ field, expected: type, actual: typeof info[field] });
  }

  const optionalPresent = {};
  for (const [field, type] of Object.entries(OPTIONAL_SCHEMA)) {
    if (typeof info[field] !== 'undefined') {
      optionalPresent[field] = { type: typeof info[field], matches: typeof info[field] === type };
    }
  }

  const hasSafeArea = info.safeArea && typeof info.safeArea === 'object';
  let safeAreaValid = false;
  if (hasSafeArea) {
    const sa = info.safeArea;
    safeAreaValid = ['left','right','top','bottom','width','height'].every((k) => typeof sa[k] === 'number');
  }

  return {
    totalRequired: Object.keys(REQUIRED_SCHEMA).length,
    missingFields: missing,
    missingCount: missing.length,
    wrongTypeFields: wrongType,
    wrongTypeCount: wrongType.length,
    allRequiredPresent: missing.length === 0,
    allRequiredTypesCorrect: wrongType.length === 0,
    hasSafeArea, safeAreaValid,
    platformValid: VALID_PLATFORMS.includes(info.platform),
    orientationValid: !info.deviceOrientation || ['portrait','landscape'].includes(info.deviceOrientation),
    optionalPresent,
    screenDimensionsPositive: info.screenWidth > 0 && info.screenHeight > 0,
    windowDimensionsPositive: info.windowWidth > 0 && info.windowHeight > 0,
    pixelRatioPositive: info.pixelRatio > 0,
    raw: info
  };
}

const spec = {
  name: 'system info full schema',
  category: 'base',
  tests: [
    // --- Sync full schema ---
    {
      id: 'sysinfo-full-schema',
      name: 'getSystemInfoSync all required fields + types',
      type: 'sync',
      run: (rt) => {
        if (typeof rt.getSystemInfoSync !== 'function') return { _error: 'getSystemInfoSync not found' };
        const info = rt.getSystemInfoSync();
        if (!info || typeof info !== 'object') return { _error: 'returned non-object' };
        return validateSchema(info);
      },
      expect: {
        allRequiredPresent: true, allRequiredTypesCorrect: true,
        hasSafeArea: true, safeAreaValid: true,
        platformValid: true, orientationValid: true,
        screenDimensionsPositive: true, windowDimensionsPositive: true, pixelRatioPositive: true
      },
      allowVariance: ['raw', 'optionalPresent', 'missingFields', 'wrongTypeFields']
    },

    // --- Async with full contract ---
    {
      id: 'sysinfo-async-contract',
      name: 'getSystemInfo callback + Promise contract',
      type: 'async',
      run: (rt) => runOptionApiContract(rt, 'getSystemInfo', {
        validateSuccessPayload: (res) =>
          typeof res.platform === 'string' && typeof res.screenWidth === 'number'
      }).then((r) => ({
        apiExists: r.apiExists,
        successCalled: r.successCalled, completeCalled: r.completeCalled,
        completeAfterOutcome: r.completeAfterOutcome,
        returnThenable: r.returnThenable,
        promiseResolved: r.promiseResolved,
        successPayloadValid: r.successPayloadValid,
        hasErrMsg: r.successPayload ? typeof r.successPayload.errMsg === 'string' : false,
        errMsgOk: r.successPayload ? r.successPayload.errMsg === 'getSystemInfo:ok' : false,
        raw: r.raw
      })),
      expect: {
        apiExists: true, successCalled: true, completeCalled: true,
        completeAfterOutcome: true, successPayloadValid: true,
        hasErrMsg: true, errMsgOk: true
      },
      allowVariance: ['raw', 'returnThenable', 'promiseResolved']
    },

    // --- getWindowInfo schema ---
    {
      id: 'sysinfo-window-info',
      name: 'getWindowInfo returns window dimensions + safeArea',
      type: 'sync',
      run: (rt) => {
        if (typeof rt.getWindowInfo !== 'function') return { _error: 'getWindowInfo not found' };
        const info = rt.getWindowInfo();
        if (!info || typeof info !== 'object') return { _error: 'returned non-object' };
        return {
          hasScreenWidth: typeof info.screenWidth === 'number',
          hasScreenHeight: typeof info.screenHeight === 'number',
          hasWindowWidth: typeof info.windowWidth === 'number',
          hasWindowHeight: typeof info.windowHeight === 'number',
          hasPixelRatio: typeof info.pixelRatio === 'number',
          hasSafeArea: info.safeArea && typeof info.safeArea === 'object',
          raw: normalizeRaw(info)
        };
      },
      expect: {
        hasScreenWidth: true, hasScreenHeight: true,
        hasWindowWidth: true, hasWindowHeight: true,
        hasPixelRatio: true, hasSafeArea: true
      },
      allowVariance: ['raw']
    },

    // --- getDeviceInfo schema ---
    {
      id: 'sysinfo-device-info',
      name: 'getDeviceInfo returns brand, model, system, platform',
      type: 'sync',
      run: (rt) => {
        if (typeof rt.getDeviceInfo !== 'function') return { _error: 'getDeviceInfo not found' };
        const info = rt.getDeviceInfo();
        if (!info || typeof info !== 'object') return { _error: 'returned non-object' };
        return {
          hasBrand: typeof info.brand === 'string',
          hasModel: typeof info.model === 'string',
          hasSystem: typeof info.system === 'string',
          hasPlatform: typeof info.platform === 'string',
          platformValid: VALID_PLATFORMS.includes(info.platform),
          raw: normalizeRaw(info)
        };
      },
      expect: {
        hasBrand: true, hasModel: true, hasSystem: true,
        hasPlatform: true, platformValid: true
      },
      allowVariance: ['raw']
    },

    // --- Promise probes ---
    {
      id: 'sysinfo-promise-support',
      name: 'getSystemInfo returns Promise',
      type: 'sync',
      run: (rt) => probePromiseSupport(rt, 'getSystemInfo'),
      expect: { apiExists: true, promiseStyleSupported: true }
    }
  ]
};

export default [spec];
