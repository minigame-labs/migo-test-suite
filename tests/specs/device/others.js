import {
  runOptionApiContract,
  probePromiseSupport,
  isObject,
  isString
} from '../_shared/runtime-helpers.js';

export default [
  {
    name: 'migo.scanCode',
    category: 'device/scan',
    tests: [
      // 存在性
      {
        id: 'migo.scanCode',
        name: '调起客户端扫码界面',
        description: '验证 scanCode 函数存在（不真实调用，会弹 UI）',
        type: 'sync',
        severity: 'P0',
        run: (runtime) => ({ exists: typeof runtime.scanCode === 'function' }),
        expect: { exists: true }
      },
      // scanType 参数接受性
      {
        id: 'migo.scanCode-scanType-barCode',
        name: 'scanCode scanType=barCode',
        description: '验证 scanCode 接受 scanType: ["barCode"]',
        type: 'async',
        run: (runtime) => runOptionApiContract(runtime, 'scanCode', {
          args: { scanType: ['barCode'] }
        }),
        expect: {
          apiExists: true,
          threw: false,
          completeCalled: true,
          completeAfterOutcome: true,
          multipleOutcomeCallbacks: false
        },
        allowVariance: ['successCalled', 'failCalled']
      },
      {
        id: 'migo.scanCode-scanType-qrCode',
        name: 'scanCode scanType=qrCode',
        description: '验证 scanCode 接受 scanType: ["qrCode"]',
        type: 'async',
        run: (runtime) => runOptionApiContract(runtime, 'scanCode', {
          args: { scanType: ['qrCode'] }
        }),
        expect: {
          apiExists: true,
          threw: false,
          completeCalled: true,
          completeAfterOutcome: true,
          multipleOutcomeCallbacks: false
        },
        allowVariance: ['successCalled', 'failCalled']
      },
      {
        id: 'migo.scanCode-scanType-all',
        name: 'scanCode scanType=全部',
        description: '验证 scanCode 接受所有 scanType',
        type: 'async',
        run: (runtime) => runOptionApiContract(runtime, 'scanCode', {
          args: { scanType: ['barCode', 'qrCode', 'datamatrix', 'pdf417'] }
        }),
        expect: {
          apiExists: true,
          threw: false,
          completeCalled: true,
          completeAfterOutcome: true,
          multipleOutcomeCallbacks: false
        },
        allowVariance: ['successCalled', 'failCalled']
      },
      // onlyFromCamera 参数
      {
        id: 'migo.scanCode-onlyFromCamera',
        name: 'scanCode onlyFromCamera=true',
        description: '验证 scanCode 接受 onlyFromCamera 参数',
        type: 'async',
        run: (runtime) => runOptionApiContract(runtime, 'scanCode', {
          args: { onlyFromCamera: true }
        }),
        expect: {
          apiExists: true,
          threw: false,
          completeCalled: true,
          completeAfterOutcome: true,
          multipleOutcomeCallbacks: false
        },
        allowVariance: ['successCalled', 'failCalled']
      },
      // 返回值结构验证（当 success 时）
      {
        id: 'migo.scanCode-return-fields',
        name: 'scanCode 返回值字段',
        description: '验证 success 返回 result/scanType/charSet 字段',
        type: 'async',
        run: (runtime) => runOptionApiContract(runtime, 'scanCode', {
          validateSuccessPayload: (res) =>
            isObject(res) &&
            isString(res.result) &&
            isString(res.scanType) &&
            isString(res.charSet)
        }),
        expect: {
          apiExists: true,
          threw: false,
          completeCalled: true,
          completeAfterOutcome: true,
          multipleOutcomeCallbacks: false,
          successPayloadValid: true
        },
        allowVariance: ['successCalled', 'failCalled', 'successPayloadValid']
      },
      // Promise 支持
      {
        id: 'migo.scanCode-promise',
        name: 'scanCode Promise 支持',
        description: '探测 scanCode 是否支持 Promise 风格调用',
        type: 'sync',
        run: (runtime) => probePromiseSupport(runtime, 'scanCode'),
        expect: {
          apiExists: true,
          threw: false,
          promiseStyleSupported: true
        }
      }
    ]
  },
  {
    name: 'migo.others',
    category: 'device',
    tests: [
      // 内存
      {
        id: 'migo.onMemoryWarning',
        name: '监听内存不足警告事件',
        description: '验证 onMemoryWarning 接口存在性',
        type: 'sync',
        severity: 'P0',
        run: (runtime) => {
          if (typeof runtime.onMemoryWarning !== 'function') return { exists: false };
          runtime.onMemoryWarning(() => {});
          return { exists: true };
        },
        expect: { exists: true }
      },
      {
        id: 'migo.offMemoryWarning',
        name: '取消监听内存不足警告事件',
        description: '验证 offMemoryWarning 接口存在性',
        type: 'sync',
        severity: 'P0',
        run: (runtime) => {
          if (typeof runtime.offMemoryWarning !== 'function') return { exists: false };
          runtime.offMemoryWarning(() => {});
          return { exists: true };
        },
        expect: { exists: true }
      }
    ]
  }
];
