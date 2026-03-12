import {
  isObject,
  isString,
  isFiniteNumber,
  runOptionApiContract,
  probePromiseSupport
} from '../_shared/runtime-helpers.js';

const LOCATION_TYPE_VALUES = new Set(['wgs84', 'gcj02']);

function isLatitudeInRange(value) {
  return isFiniteNumber(value) && value >= -90 && value <= 90;
}

function isLongitudeInRange(value) {
  return isFiniteNumber(value) && value >= -180 && value <= 180;
}

function isLocationTypeValidOrMissing(value) {
  return typeof value === 'undefined' || (isString(value) && LOCATION_TYPE_VALUES.has(value));
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

function validateGetLocationSuccessPayload(payload) {
  if (!isObject(payload)) {
    return false;
  }

  const requiredFieldsValid = isLatitudeInRange(payload.latitude)
    && isLongitudeInRange(payload.longitude)
    && isFiniteNumber(payload.speed)
    && isFiniteNumber(payload.accuracy);

  const altitudeValidOrMissing = typeof payload.altitude === 'undefined' || isFiniteNumber(payload.altitude);
  const verticalAccuracyValidOrMissing = typeof payload.verticalAccuracy === 'undefined' || isFiniteNumber(payload.verticalAccuracy);
  const horizontalAccuracyValidOrMissing = typeof payload.horizontalAccuracy === 'undefined' || isFiniteNumber(payload.horizontalAccuracy);

  return requiredFieldsValid
    && altitudeValidOrMissing
    && verticalAccuracyValidOrMissing
    && horizontalAccuracyValidOrMissing;
}

function validateGetFuzzyLocationSuccessPayload(payload) {
  if (!isObject(payload)) {
    return false;
  }

  return isLatitudeInRange(payload.latitude) && isLongitudeInRange(payload.longitude);
}

function runLocationOptionContract(runtime, apiName, args, validateSuccessPayload) {
  return runOptionApiContract(runtime, apiName, {
    args,
    timeoutMs: 15000,
    settleDelayMs: 150,
    idleWaitMs: 12000,
    validateSuccessPayload
  }).then((result) => ({
    ...result,
    typeArgValidOrMissing: isLocationTypeValidOrMissing(args?.type),
    successPayloadValidOrNoSuccess: !result.successCalled || result.successPayloadValid,
    failPayloadValidOrNoFail: !result.failCalled || isFailPayloadValid(result.failPayload)
  }));
}

export default [
  {
    name: 'migo.getLocation',
    category: 'device',
    tests: [
      {
        id: 'migo.getLocation',
        name: '获取当前位置（正向能力）',
        description: '手动场景：授权定位后调用 getLocation(type=gcj02)，验证 success 路径、经纬度范围与 raw 输出',
        type: 'async',
        timeout: 22000,
        automation: 'manual',
        manualRequired: true,
        run: (runtime) => runLocationOptionContract(runtime, 'getLocation', {
          type: 'gcj02',
          altitude: true,
          isHighAccuracy: true,
          highAccuracyExpireTime: 3500
        }, validateGetLocationSuccessPayload).then((result) => ({
          ...result,
          latitudeInRange: isLatitudeInRange(result.successPayload?.latitude),
          longitudeInRange: isLongitudeInRange(result.successPayload?.longitude)
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
          typeArgValidOrMissing: true,
          successPayloadValidOrNoSuccess: true,
          failPayloadValidOrNoFail: true,
          latitudeInRange: true,
          longitudeInRange: true,
          raw: '@exists'
        },
        allowVariance: ['callbackTrace']
      },
      {
        id: 'location-getLocation-callback-contract',
        name: '回调契约（success/fail/complete）',
        description: '手动场景：验证 getLocation 的 outcome 单一性、complete 时序与 payload 合法性',
        type: 'async',
        timeout: 22000,
        automation: 'manual',
        manualRequired: true,
        run: (runtime) => runLocationOptionContract(runtime, 'getLocation', {
          type: 'wgs84'
        }, validateGetLocationSuccessPayload),
        expect: {
          apiExists: true,
          threw: false,
          timeout: false,
          callbackInvoked: true,
          completeCalled: true,
          completeAfterOutcome: true,
          multipleOutcomeCallbacks: false,
          typeArgValidOrMissing: true,
          successPayloadValidOrNoSuccess: true,
          failPayloadValidOrNoFail: true,
          raw: '@exists'
        },
        allowVariance: ['successCalled', 'failCalled', 'callbackTrace']
      },
      {
        id: 'location-getLocation-promise-support',
        name: 'Promise 风格支持',
        description: '验证 getLocation 支持 Promise 风格调用（与回调契约用例分离）',
        type: 'sync',
        run: (runtime) => probePromiseSupport(runtime, 'getLocation', {
          type: 'wgs84'
        }),
        expect: {
          apiExists: true,
          threw: false,
          promiseStyleSupported: true
        }
      }
    ]
  },

  {
    name: 'migo.getFuzzyLocation',
    category: 'device',
    tests: [
      {
        id: 'migo.getFuzzyLocation',
        name: '获取模糊位置（正向能力）',
        description: '手动场景：授权模糊定位后调用 getFuzzyLocation(type=wgs84)，验证 success 路径、经纬度范围与 raw 输出',
        type: 'async',
        timeout: 22000,
        automation: 'manual',
        manualRequired: true,
        run: (runtime) => runLocationOptionContract(runtime, 'getFuzzyLocation', {
          type: 'wgs84'
        }, validateGetFuzzyLocationSuccessPayload).then((result) => ({
          ...result,
          latitudeInRange: isLatitudeInRange(result.successPayload?.latitude),
          longitudeInRange: isLongitudeInRange(result.successPayload?.longitude)
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
          typeArgValidOrMissing: true,
          successPayloadValidOrNoSuccess: true,
          failPayloadValidOrNoFail: true,
          latitudeInRange: true,
          longitudeInRange: true,
          raw: '@exists'
        },
        allowVariance: ['callbackTrace']
      },
      {
        id: 'location-getFuzzyLocation-callback-contract',
        name: '回调契约（success/fail/complete）',
        description: '手动场景：验证 getFuzzyLocation 的 outcome 单一性、complete 时序与 payload 合法性',
        type: 'async',
        timeout: 22000,
        automation: 'manual',
        manualRequired: true,
        run: (runtime) => runLocationOptionContract(runtime, 'getFuzzyLocation', {
          type: 'gcj02'
        }, validateGetFuzzyLocationSuccessPayload),
        expect: {
          apiExists: true,
          threw: false,
          timeout: false,
          callbackInvoked: true,
          completeCalled: true,
          completeAfterOutcome: true,
          multipleOutcomeCallbacks: false,
          typeArgValidOrMissing: true,
          successPayloadValidOrNoSuccess: true,
          failPayloadValidOrNoFail: true,
          raw: '@exists'
        },
        allowVariance: ['successCalled', 'failCalled', 'callbackTrace']
      },
      {
        id: 'location-getFuzzyLocation-promise-support',
        name: 'Promise 风格支持（应不支持）',
        description: '验证 getFuzzyLocation 不支持 Promise 风格调用（与回调契约用例分离）',
        type: 'sync',
        run: (runtime) => probePromiseSupport(runtime, 'getFuzzyLocation', {
          type: 'wgs84'
        }),
        expect: {
          apiExists: true,
          threw: false,
          promiseStyleSupported: false
        }
      }
    ]
  }
];
