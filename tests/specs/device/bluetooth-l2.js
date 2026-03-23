/**
 * Bluetooth L2 tests - return value structure validation
 * Uses runOptionApiContract() for full callback+Promise contract coverage.
 *
 * Per WX spec:
 *   getBluetoothAdapterState => { available: boolean, discovering: boolean }
 *   getBluetoothDevices => { devices: [{deviceId, name?, RSSI, advertisData, ...}] }
 *   getConnectedBluetoothDevices({ services: string[] }) => { devices: [{deviceId, name?}] }
 *   getBeacons => { beacons: BeaconInfo[] }
 */
import {
  runOptionApiContract,
  probePromiseSupport,
  runGlobalOnRegisterContract,
  runGlobalOffContract,
  normalizeRaw
} from '../_shared/runtime-helpers.js';

const spec = {
  name: 'bluetooth L2 structure',
  category: 'device',
  tests: [
    // --- Adapter state with full contract ---
    {
      id: 'bt-l2-adapter-state',
      name: 'getBluetoothAdapterState callback contract + payload',
      type: 'async',
      run: (runtime) => runOptionApiContract(runtime, 'getBluetoothAdapterState', {
        validateSuccessPayload: (res) =>
          typeof res.available === 'boolean' && typeof res.discovering === 'boolean'
      }).then((r) => {
        const p = r.successPayload || {};
        return {
          apiExists: r.apiExists,
          successCalled: r.successCalled,
          completeCalled: r.completeCalled,
          completeAfterOutcome: r.completeAfterOutcome,
          returnThenable: r.returnThenable,
          successPayloadValid: r.successPayloadValid,
          hasAvailable: typeof p.available === 'boolean',
          hasDiscovering: typeof p.discovering === 'boolean',
          hasErrMsg: typeof p.errMsg === 'string',
          raw: r.raw
        };
      }),
      expect: {
        apiExists: true,
        successCalled: true,
        completeCalled: true,
        completeAfterOutcome: true,
        successPayloadValid: true,
        hasAvailable: true,
        hasDiscovering: true,
        hasErrMsg: true
      },
      allowVariance: ['raw', 'returnThenable']
    },

    // --- Open adapter ---
    {
      id: 'bt-l2-open-adapter',
      name: 'openBluetoothAdapter callback contract',
      type: 'async',
      timeoutMs: 8000,
      run: (runtime) => runOptionApiContract(runtime, 'openBluetoothAdapter', {
        timeoutMs: 8000
      }).then((r) => ({
        apiExists: r.apiExists,
        callbackInvoked: r.callbackInvoked,
        completeCalled: r.completeCalled,
        completeAfterOutcome: r.completeAfterOutcome,
        returnThenable: r.returnThenable,
        hasErrMsg: r.successPayload ? typeof r.successPayload.errMsg === 'string'
          : r.failPayload ? typeof r.failPayload.errMsg === 'string' : false,
        raw: r.raw
      })),
      expect: {
        apiExists: true,
        callbackInvoked: true,
        completeCalled: true,
        completeAfterOutcome: true,
        hasErrMsg: true
      },
      allowVariance: ['raw', 'returnThenable']
    },

    // --- Get devices ---
    {
      id: 'bt-l2-get-devices',
      name: 'getBluetoothDevices returns {devices: Array}',
      type: 'async',
      timeoutMs: 8000,
      run: (runtime) => runOptionApiContract(runtime, 'getBluetoothDevices', {
        timeoutMs: 8000,
        validateSuccessPayload: (res) => Array.isArray(res.devices)
      }).then((r) => {
        const p = r.successPayload || {};
        const devices = Array.isArray(p.devices) ? p.devices : [];
        let firstDeviceValid = null;
        if (devices.length > 0) {
          const d = devices[0];
          firstDeviceValid = {
            hasDeviceId: typeof d.deviceId === 'string',
            hasRSSI: typeof d.RSSI === 'number'
          };
        }
        return {
          apiExists: r.apiExists,
          successCalled: r.successCalled,
          successPayloadValid: r.successPayloadValid,
          completeCalled: r.completeCalled,
          returnThenable: r.returnThenable,
          deviceCount: devices.length,
          firstDeviceValid: firstDeviceValid,
          raw: r.raw
        };
      }),
      expect: {
        apiExists: true,
        successCalled: true,
        successPayloadValid: true,
        completeCalled: true
      },
      allowVariance: ['raw', 'returnThenable', 'deviceCount', 'firstDeviceValid']
    },

    // --- Get connected devices (services required per WX spec) ---
    {
      id: 'bt-l2-get-connected',
      name: 'getConnectedBluetoothDevices returns {devices: Array}',
      type: 'async',
      timeoutMs: 8000,
      run: (runtime) => runOptionApiContract(runtime, 'getConnectedBluetoothDevices', {
        args: { services: [] },
        timeoutMs: 8000,
        validateSuccessPayload: (res) => Array.isArray(res.devices)
      }).then((r) => ({
        apiExists: r.apiExists,
        successCalled: r.successCalled,
        successPayloadValid: r.successPayloadValid,
        completeCalled: r.completeCalled,
        completeAfterOutcome: r.completeAfterOutcome,
        returnThenable: r.returnThenable,
        raw: r.raw
      })),
      expect: {
        apiExists: true,
        successCalled: true,
        successPayloadValid: true,
        completeCalled: true,
        completeAfterOutcome: true
      },
      allowVariance: ['raw', 'returnThenable']
    },

    // --- On/Off adapter state using helpers ---
    {
      id: 'bt-l2-on-off-state',
      name: 'on/offBluetoothAdapterStateChange register+unregister contract',
      type: 'sync',
      run: (runtime) => runGlobalOnRegisterContract(runtime, 'onBluetoothAdapterStateChange', 'offBluetoothAdapterStateChange'),
      expect: {
        apiExists: true,
        registerThrew: false,
        unregisterWorkedOrUnsupported: true
      }
    },

    // --- Off without listener (clear all) using helper ---
    {
      id: 'bt-l2-off-device-found',
      name: 'offBluetoothDeviceFound with and without listener',
      type: 'sync',
      run: (runtime) => runGlobalOffContract(runtime, 'onBluetoothDeviceFound', 'offBluetoothDeviceFound'),
      expect: {
        offWithListenerThrew: false,
        offWithoutListenerThrew: false,
        registerSucceededOrOffSupported: true
      }
    },

    // --- Get beacons ---
    {
      id: 'bt-l2-get-beacons',
      name: 'getBeacons returns {beacons: Array}',
      type: 'async',
      timeoutMs: 5000,
      run: (runtime) => runOptionApiContract(runtime, 'getBeacons', {
        timeoutMs: 5000,
        validateSuccessPayload: (res) => Array.isArray(res.beacons)
      }).then((r) => ({
        apiExists: r.apiExists,
        successCalled: r.successCalled,
        successPayloadValid: r.successPayloadValid,
        completeCalled: r.completeCalled,
        returnThenable: r.returnThenable,
        raw: r.raw
      })),
      expect: {
        apiExists: true,
        successCalled: true,
        successPayloadValid: true,
        completeCalled: true
      },
      allowVariance: ['raw', 'returnThenable']
    },

    // --- BLE MTU APIs existence ---
    {
      id: 'bt-l2-ble-mtu',
      name: 'getBLEMTU / setBLEMTU / on/offBLEMTUChange all exist',
      type: 'sync',
      run: (runtime) => ({
        getMTUExists: typeof runtime.getBLEMTU === 'function',
        setMTUExists: typeof runtime.setBLEMTU === 'function',
        onMTUChangeExists: typeof runtime.onBLEMTUChange === 'function',
        offMTUChangeExists: typeof runtime.offBLEMTUChange === 'function'
      }),
      expect: {
        getMTUExists: true,
        setMTUExists: true,
        onMTUChangeExists: true,
        offMTUChangeExists: true
      }
    },

    // --- BLE connection state using helper ---
    {
      id: 'bt-l2-ble-conn-events',
      name: 'on/offBLEConnectionStateChange contract',
      type: 'sync',
      run: (runtime) => runGlobalOffContract(runtime, 'onBLEConnectionStateChange', 'offBLEConnectionStateChange'),
      expect: {
        offWithListenerThrew: false,
        offWithoutListenerThrew: false,
        registerSucceededOrOffSupported: true
      }
    },

    // --- Close adapter ---
    {
      id: 'bt-l2-close-adapter',
      name: 'closeBluetoothAdapter callback contract',
      type: 'async',
      timeoutMs: 5000,
      run: (runtime) => runOptionApiContract(runtime, 'closeBluetoothAdapter', {
        timeoutMs: 5000
      }).then((r) => ({
        apiExists: r.apiExists,
        callbackInvoked: r.callbackInvoked,
        completeCalled: r.completeCalled,
        completeAfterOutcome: r.completeAfterOutcome,
        returnThenable: r.returnThenable,
        hasErrMsg: r.successPayload ? typeof r.successPayload.errMsg === 'string'
          : r.failPayload ? typeof r.failPayload.errMsg === 'string' : false,
        raw: r.raw
      })),
      expect: {
        apiExists: true,
        callbackInvoked: true,
        completeCalled: true,
        completeAfterOutcome: true,
        hasErrMsg: true
      },
      allowVariance: ['raw', 'returnThenable']
    },

    // --- Promise support probes ---
    {
      id: 'bt-l2-promise-adapter-state',
      name: 'getBluetoothAdapterState returns Promise',
      type: 'sync',
      run: (runtime) => probePromiseSupport(runtime, 'getBluetoothAdapterState'),
      expect: { apiExists: true, promiseStyleSupported: true }
    },
    {
      id: 'bt-l2-promise-open',
      name: 'openBluetoothAdapter returns Promise',
      type: 'sync',
      run: (runtime) => probePromiseSupport(runtime, 'openBluetoothAdapter'),
      expect: { apiExists: true, promiseStyleSupported: true }
    }
  ]
};

export default [spec];
