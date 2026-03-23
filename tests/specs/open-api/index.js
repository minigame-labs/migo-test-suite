/**
 * 开放接口 API 测试
 * 覆盖: login, checkSession, authorize, getUserInfo, createUserInfoButton,
 *       getPhoneNumber, getSetting, openSetting, createOpenSettingButton,
 *       getOpenDataContext, onMessage, getAccountInfoSync,
 *       requestFacialRecognition, checkIsAddedToMyMiniProgram
 */

import {
  runOptionApiContract,
  probePromiseSupport,
  isObject,
  isString
} from '../_shared/runtime-helpers.js';

export default [
  // ── 登录 ──
  {
    name: 'migo.login',
    category: 'open-api/login',
    tests: [
      {
        id: 'open-api-login-exists',
        name: 'login API 存在',
        description: '验证 login 函数存在',
        type: 'sync',
        run: (runtime) => ({ exists: typeof runtime.login === 'function' }),
        expect: { exists: true }
      },
      {
        id: 'open-api-login-contract',
        name: 'login 回调契约',
        description: '验证 login success/fail/complete 回调顺序及返回 code',
        type: 'async',
        run: (runtime) => runOptionApiContract(runtime, 'login', {
          validateSuccessPayload: (res) =>
            isObject(res) && isString(res.code) && res.code.length > 0
        }),
        expect: {
          apiExists: true,
          threw: false,
          successCalled: true,
          completeCalled: true,
          completeAfterOutcome: true,
          multipleOutcomeCallbacks: false,
          successPayloadValid: true
        },
        allowVariance: ['successCalled', 'successPayloadValid']
      },
      {
        id: 'open-api-login-promise',
        name: 'login Promise 支持',
        description: '探测 login 是否支持 Promise 风格调用',
        type: 'sync',
        run: (runtime) => probePromiseSupport(runtime, 'login'),
        expect: {
          apiExists: true,
          threw: false,
          promiseStyleSupported: true
        }
      }
    ]
  },

  {
    name: 'migo.checkSession',
    category: 'open-api/login',
    tests: [
      {
        id: 'open-api-checkSession-exists',
        name: 'checkSession API 存在',
        description: '验证 checkSession 函数存在',
        type: 'sync',
        run: (runtime) => ({ exists: typeof runtime.checkSession === 'function' }),
        expect: { exists: true }
      },
      {
        id: 'open-api-checkSession-contract',
        name: 'checkSession 回调契约',
        description: '验证 checkSession success/fail/complete 回调顺序',
        type: 'async',
        run: (runtime) => runOptionApiContract(runtime, 'checkSession'),
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
        id: 'open-api-checkSession-promise',
        name: 'checkSession Promise 支持',
        description: '探测 checkSession 是否支持 Promise 风格调用',
        type: 'sync',
        run: (runtime) => probePromiseSupport(runtime, 'checkSession'),
        expect: {
          apiExists: true,
          threw: false,
          promiseStyleSupported: true
        }
      }
    ]
  },

  // ── 授权 ──
  {
    name: 'migo.authorize',
    category: 'open-api/authorize',
    tests: [
      {
        id: 'open-api-authorize-exists',
        name: 'authorize API 存在',
        description: '验证 authorize 函数存在',
        type: 'sync',
        run: (runtime) => ({ exists: typeof runtime.authorize === 'function' }),
        expect: { exists: true }
      },
      {
        id: 'open-api-authorize-contract',
        name: 'authorize 回调契约',
        description: '验证 authorize 接受 scope 参数并触发回调',
        type: 'async',
        run: (runtime) => runOptionApiContract(runtime, 'authorize', {
          args: { scope: 'scope.userInfo' }
        }),
        expect: {
          apiExists: true,
          threw: false,
          completeCalled: true,
          completeAfterOutcome: true,
          multipleOutcomeCallbacks: false
        },
        allowVariance: ['successCalled', 'failCalled']
      }
    ]
  },

  // ── 用户信息 ──
  {
    name: 'migo.getUserInfo',
    category: 'open-api/user-info',
    tests: [
      {
        id: 'open-api-getUserInfo-exists',
        name: 'getUserInfo API 存在',
        description: '验证 getUserInfo 函数存在',
        type: 'sync',
        run: (runtime) => ({ exists: typeof runtime.getUserInfo === 'function' }),
        expect: { exists: true }
      },
      {
        id: 'open-api-getUserInfo-contract',
        name: 'getUserInfo 回调契约',
        description: '验证 getUserInfo success/fail/complete 回调',
        type: 'async',
        run: (runtime) => runOptionApiContract(runtime, 'getUserInfo', {
          validateSuccessPayload: (res) =>
            isObject(res) && isObject(res.userInfo)
        }),
        expect: {
          apiExists: true,
          threw: false,
          completeCalled: true,
          completeAfterOutcome: true,
          multipleOutcomeCallbacks: false
        },
        allowVariance: ['successCalled', 'failCalled', 'successPayloadValid']
      }
    ]
  },

  {
    name: 'migo.createUserInfoButton',
    category: 'open-api/user-info',
    tests: [
      {
        id: 'open-api-createUserInfoButton-exists',
        name: 'createUserInfoButton API 存在',
        description: '验证 createUserInfoButton 函数存在',
        type: 'sync',
        run: (runtime) => ({ exists: typeof runtime.createUserInfoButton === 'function' }),
        expect: { exists: true }
      },
      {
        id: 'open-api-createUserInfoButton-instance',
        name: 'createUserInfoButton 创建实例',
        description: '验证创建的按钮实例具有 show/hide/destroy/onTap/offTap 方法',
        type: 'sync',
        run: (runtime) => {
          if (typeof runtime.createUserInfoButton !== 'function') {
            return { _error: 'createUserInfoButton 不存在' };
          }
          try {
            const btn = runtime.createUserInfoButton({
              type: 'text',
              text: 'test',
              style: { left: 0, top: 0, width: 100, height: 40 }
            });
            const result = {
              created: isObject(btn),
              hasShow: typeof btn?.show === 'function',
              hasHide: typeof btn?.hide === 'function',
              hasDestroy: typeof btn?.destroy === 'function',
              hasOnTap: typeof btn?.onTap === 'function',
              hasOffTap: typeof btn?.offTap === 'function'
            };
            if (btn && typeof btn.destroy === 'function') btn.destroy();
            return result;
          } catch (e) {
            return { _error: e.message };
          }
        },
        expect: {
          created: true,
          hasShow: true,
          hasHide: true,
          hasDestroy: true,
          hasOnTap: true,
          hasOffTap: true
        }
      }
    ]
  },

  {
    name: 'migo.getPhoneNumber',
    category: 'open-api/user-info',
    tests: [
      {
        id: 'open-api-getPhoneNumber-exists',
        name: 'getPhoneNumber API 存在',
        description: '验证 getPhoneNumber 函数存在',
        type: 'sync',
        run: (runtime) => ({ exists: typeof runtime.getPhoneNumber === 'function' }),
        expect: { exists: true }
      }
    ]
  },

  // ── 设置 ──
  {
    name: 'migo.getSetting',
    category: 'open-api/setting',
    tests: [
      {
        id: 'open-api-getSetting-exists',
        name: 'getSetting API 存在',
        description: '验证 getSetting 函数存在',
        type: 'sync',
        run: (runtime) => ({ exists: typeof runtime.getSetting === 'function' }),
        expect: { exists: true }
      },
      {
        id: 'open-api-getSetting-contract',
        name: 'getSetting 回调契约',
        description: '验证 getSetting 返回 authSetting 对象',
        type: 'async',
        run: (runtime) => runOptionApiContract(runtime, 'getSetting', {
          validateSuccessPayload: (res) =>
            isObject(res) && isObject(res.authSetting)
        }),
        expect: {
          apiExists: true,
          threw: false,
          successCalled: true,
          completeCalled: true,
          completeAfterOutcome: true,
          multipleOutcomeCallbacks: false,
          successPayloadValid: true
        },
        allowVariance: ['successCalled', 'successPayloadValid']
      },
      {
        id: 'open-api-getSetting-promise',
        name: 'getSetting Promise 支持',
        description: '探测 getSetting 是否支持 Promise 风格调用',
        type: 'sync',
        run: (runtime) => probePromiseSupport(runtime, 'getSetting'),
        expect: {
          apiExists: true,
          threw: false,
          promiseStyleSupported: true
        }
      }
    ]
  },

  {
    name: 'migo.openSetting',
    category: 'open-api/setting',
    tests: [
      {
        id: 'open-api-openSetting-exists',
        name: 'openSetting API 存在',
        description: '验证 openSetting 函数存在（不真实调用，会弹 UI）',
        type: 'sync',
        run: (runtime) => ({ exists: typeof runtime.openSetting === 'function' }),
        expect: { exists: true }
      }
    ]
  },

  {
    name: 'migo.createOpenSettingButton',
    category: 'open-api/setting',
    tests: [
      {
        id: 'open-api-createOpenSettingButton-exists',
        name: 'createOpenSettingButton API 存在',
        description: '验证 createOpenSettingButton 函数存在',
        type: 'sync',
        run: (runtime) => ({ exists: typeof runtime.createOpenSettingButton === 'function' }),
        expect: { exists: true }
      },
      {
        id: 'open-api-createOpenSettingButton-instance',
        name: 'createOpenSettingButton 创建实例',
        description: '验证创建的按钮实例具有 show/hide/destroy/onTap/offTap 方法',
        type: 'sync',
        run: (runtime) => {
          if (typeof runtime.createOpenSettingButton !== 'function') {
            return { _error: 'createOpenSettingButton 不存在' };
          }
          try {
            const btn = runtime.createOpenSettingButton({
              type: 'text',
              text: 'settings',
              style: { left: 0, top: 0, width: 100, height: 40 }
            });
            const result = {
              created: isObject(btn),
              hasShow: typeof btn?.show === 'function',
              hasHide: typeof btn?.hide === 'function',
              hasDestroy: typeof btn?.destroy === 'function',
              hasOnTap: typeof btn?.onTap === 'function',
              hasOffTap: typeof btn?.offTap === 'function'
            };
            if (btn && typeof btn.destroy === 'function') btn.destroy();
            return result;
          } catch (e) {
            return { _error: e.message };
          }
        },
        expect: {
          created: true,
          hasShow: true,
          hasHide: true,
          hasDestroy: true,
          hasOnTap: true,
          hasOffTap: true
        }
      }
    ]
  },

  // ── 开放数据域 ──
  {
    name: 'migo.getOpenDataContext',
    category: 'open-api/open-data',
    tests: [
      {
        id: 'open-api-getOpenDataContext-exists',
        name: 'getOpenDataContext API 存在',
        description: '验证 getOpenDataContext 函数存在',
        type: 'sync',
        run: (runtime) => ({ exists: typeof runtime.getOpenDataContext === 'function' }),
        expect: { exists: true }
      },
      {
        id: 'open-api-getOpenDataContext-instance',
        name: 'getOpenDataContext 返回实例',
        description: '验证返回的 OpenDataContext 具有 postMessage 方法',
        type: 'sync',
        run: (runtime) => {
          if (typeof runtime.getOpenDataContext !== 'function') {
            return { _error: 'getOpenDataContext 不存在' };
          }
          try {
            const ctx = runtime.getOpenDataContext();
            return {
              isObjectResult: isObject(ctx),
              hasPostMessage: typeof ctx?.postMessage === 'function'
            };
          } catch (e) {
            return { _error: e.message };
          }
        },
        expect: {
          isObjectResult: true,
          hasPostMessage: true
        }
      }
    ]
  },

  {
    name: 'migo.onMessage',
    category: 'open-api/open-data',
    tests: [
      {
        id: 'open-api-onMessage-exists',
        name: 'onMessage API 存在',
        description: '验证 onMessage 函数存在（开放数据域消息监听）',
        type: 'sync',
        run: (runtime) => ({ exists: typeof runtime.onMessage === 'function' }),
        expect: { exists: true }
      }
    ]
  },

  // ── 账号信息 ──
  {
    name: 'migo.getAccountInfoSync',
    category: 'open-api/account',
    tests: [
      {
        id: 'open-api-getAccountInfoSync-exists',
        name: 'getAccountInfoSync API 存在',
        description: '验证 getAccountInfoSync 函数存在',
        type: 'sync',
        run: (runtime) => ({ exists: typeof runtime.getAccountInfoSync === 'function' }),
        expect: { exists: true }
      },
      {
        id: 'open-api-getAccountInfoSync-return',
        name: 'getAccountInfoSync 返回值结构',
        description: '验证返回 miniProgram.appId 字段',
        type: 'sync',
        run: (runtime) => {
          if (typeof runtime.getAccountInfoSync !== 'function') {
            return { _error: 'getAccountInfoSync 不存在' };
          }
          const info = runtime.getAccountInfoSync();
          return {
            isObjectResult: isObject(info),
            hasMiniProgram: isObject(info?.miniProgram),
            hasAppId: isString(info?.miniProgram?.appId)
          };
        },
        expect: {
          isObjectResult: true,
          hasMiniProgram: true,
          hasAppId: true
        }
      }
    ]
  },

  // ── 人脸识别 ──
  {
    name: 'migo.requestFacialRecognition',
    category: 'open-api/facial',
    tests: [
      {
        id: 'open-api-requestFacialRecognition-exists',
        name: 'requestFacialRecognition API 存在',
        description: '验证 requestFacialRecognition 函数存在（不真实调用）',
        type: 'sync',
        run: (runtime) => ({ exists: typeof runtime.requestFacialRecognition === 'function' }),
        expect: { exists: true }
      }
    ]
  },

  // ── 我的小程序 ──
  {
    name: 'migo.checkIsAddedToMyMiniProgram',
    category: 'open-api/my-miniprogram',
    tests: [
      {
        id: 'open-api-checkIsAddedToMyMiniProgram-exists',
        name: 'checkIsAddedToMyMiniProgram API 存在',
        description: '验证 checkIsAddedToMyMiniProgram 函数存在',
        type: 'sync',
        run: (runtime) => ({ exists: typeof runtime.checkIsAddedToMyMiniProgram === 'function' }),
        expect: { exists: true }
      },
      {
        id: 'open-api-checkIsAddedToMyMiniProgram-contract',
        name: 'checkIsAddedToMyMiniProgram 回调契约',
        description: '验证 success/fail/complete 回调顺序',
        type: 'async',
        run: (runtime) => runOptionApiContract(runtime, 'checkIsAddedToMyMiniProgram'),
        expect: {
          apiExists: true,
          threw: false,
          completeCalled: true,
          completeAfterOutcome: true,
          multipleOutcomeCallbacks: false
        },
        allowVariance: ['successCalled', 'failCalled']
      }
    ]
  },

  // ── WiFi ──
  {
    name: 'migo.getConnectedWifi',
    category: 'open-api/wifi',
    tests: [
      {
        id: 'open-api-getConnectedWifi-exists',
        name: 'getConnectedWifi API 存在',
        description: '验证 getConnectedWifi 函数存在',
        type: 'sync',
        run: (runtime) => ({ exists: typeof runtime.getConnectedWifi === 'function' }),
        expect: { exists: true }
      },
      {
        id: 'open-api-getConnectedWifi-contract',
        name: 'getConnectedWifi 回调契约',
        description: '验证 getConnectedWifi success/fail/complete 回调',
        type: 'async',
        run: (runtime) => runOptionApiContract(runtime, 'getConnectedWifi', {
          validateSuccessPayload: (res) =>
            isObject(res) && isObject(res.wifi)
        }),
        expect: {
          apiExists: true,
          threw: false,
          completeCalled: true,
          completeAfterOutcome: true,
          multipleOutcomeCallbacks: false
        },
        allowVariance: ['successCalled', 'failCalled', 'successPayloadValid']
      }
    ]
  },

  // ── 运动数据 ──
  {
    name: 'migo.getWeRunData',
    category: 'open-api/werun',
    tests: [
      {
        id: 'open-api-getWeRunData-exists',
        name: 'getWeRunData API 存在',
        description: '验证 getWeRunData 函数存在',
        type: 'sync',
        run: (runtime) => ({ exists: typeof runtime.getWeRunData === 'function' }),
        expect: { exists: true }
      },
      {
        id: 'open-api-getWeRunData-contract',
        name: 'getWeRunData 回调契约',
        description: '验证 getWeRunData success/fail/complete 回调，success 返回 encryptedData/iv',
        type: 'async',
        run: (runtime) => runOptionApiContract(runtime, 'getWeRunData', {
          validateSuccessPayload: (res) =>
            isObject(res) && isString(res.encryptedData) && isString(res.iv)
        }),
        expect: {
          apiExists: true,
          threw: false,
          completeCalled: true,
          completeAfterOutcome: true,
          multipleOutcomeCallbacks: false
        },
        allowVariance: ['successCalled', 'failCalled', 'successPayloadValid']
      }
    ]
  },

  // ── 位置 ──
  {
    name: 'migo.openLocation',
    category: 'open-api/location',
    tests: [
      {
        id: 'open-api-openLocation-exists',
        name: 'openLocation API 存在',
        description: '验证 openLocation 函数存在（不真实调用，会打开地图 UI）',
        type: 'sync',
        run: (runtime) => ({ exists: typeof runtime.openLocation === 'function' }),
        expect: { exists: true }
      }
    ]
  },

  // ── API 类别 ──
  {
    name: 'migo.getApiCategory',
    category: 'open-api/misc',
    tests: [
      {
        id: 'open-api-getApiCategory-exists',
        name: 'getApiCategory API 存在',
        description: '验证 getApiCategory 函数存在',
        type: 'sync',
        run: (runtime) => ({ exists: typeof runtime.getApiCategory === 'function' }),
        expect: { exists: true }
      },
      {
        id: 'open-api-getApiCategory-contract',
        name: 'getApiCategory 回调契约',
        description: '验证 getApiCategory success 返回 apiCategory 字段',
        type: 'async',
        run: (runtime) => runOptionApiContract(runtime, 'getApiCategory', {
          validateSuccessPayload: (res) =>
            isObject(res) && isString(res.apiCategory)
        }),
        expect: {
          apiExists: true,
          threw: false,
          completeCalled: true,
          completeAfterOutcome: true,
          multipleOutcomeCallbacks: false
        },
        allowVariance: ['successCalled', 'failCalled', 'successPayloadValid']
      }
    ]
  },

  // ── createFeedbackButton ──
  {
    name: 'migo.createFeedbackButton',
    category: 'open-api/feedback',
    tests: [
      {
        id: 'open-api-createFeedbackButton-exists',
        name: 'createFeedbackButton API 存在',
        description: '验证 createFeedbackButton 函数存在',
        type: 'sync',
        run: (runtime) => ({ exists: typeof runtime.createFeedbackButton === 'function' }),
        expect: { exists: true }
      },
      {
        id: 'open-api-createFeedbackButton-instance',
        name: 'createFeedbackButton 创建实例',
        description: '验证创建的按钮实例具有 show/hide/destroy 方法',
        type: 'sync',
        run: (runtime) => {
          if (typeof runtime.createFeedbackButton !== 'function') {
            return { _error: 'createFeedbackButton 不存在' };
          }
          try {
            const btn = runtime.createFeedbackButton({
              type: 'text',
              text: 'feedback',
              style: { left: 0, top: 0, width: 100, height: 40 }
            });
            const result = {
              created: isObject(btn),
              hasShow: typeof btn?.show === 'function',
              hasHide: typeof btn?.hide === 'function',
              hasDestroy: typeof btn?.destroy === 'function'
            };
            if (btn && typeof btn.destroy === 'function') btn.destroy();
            return result;
          } catch (e) {
            return { _error: e.message };
          }
        },
        expect: {
          created: true,
          hasShow: true,
          hasHide: true,
          hasDestroy: true
        }
      }
    ]
  }
];
