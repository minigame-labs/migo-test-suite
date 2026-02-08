
export default [
  // --- Menu Button ---
  {
    name: 'migo.getMenuButtonBoundingClientRect',
    category: 'ui/menu',
    tests: [
      {
        id: 'ui-menu-001',
        name: '获取胶囊按钮布局信息',
        description: '验证 getMenuButtonBoundingClientRect 接口',
        type: 'sync',
        run: (runtime) => {
          if (typeof runtime.getMenuButtonBoundingClientRect !== 'function') {
            return { _error: 'getMenuButtonBoundingClientRect 不存在' };
          }
          try {
            const rect = runtime.getMenuButtonBoundingClientRect();
            return { success: true, rect };
          } catch (e) {
            return { success: false, error: e.message };
          }
        },
        expect: {
          success: true,
          rect: {
            width: '@number',
            height: '@number',
            top: '@number',
            right: '@number',
            bottom: '@number',
            left: '@number'
          }
        }
      }
    ]
  },
  {
    name: 'migo.setMenuStyle',
    category: 'ui/menu',
    tests: [
      {
        id: 'ui-menu-002',
        name: '设置胶囊按钮样式',
        description: '验证 setMenuStyle 接口',
        type: 'async', // Usually async with callback
        run: (runtime, callback) => {
          if (typeof runtime.setMenuStyle !== 'function') {
            return callback({ _error: 'setMenuStyle 不存在' });
          }
          runtime.setMenuStyle({
            style: 'light', // light or dark
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
  
  // --- Official Components ---
  {
    name: 'migo.getOfficialComponentsInfo',
    category: 'ui/menu',
    tests: [
      {
        id: 'ui-menu-003',
        name: '获取官方组件信息',
        description: '验证 getOfficialComponentsInfo 接口',
        type: 'async', // Docs say async for some getters, checking docs again... Wait, docs say returns Object directly? 
        // User provided link: https://developers.weixin.qq.com/minigame/dev/api/ui/menu/wx.getOfficialComponentsInfo.html
        // Doc says "返回值 Object". It is sync.
        // Wait, standard wx.* sync APIs end with Sync usually.
        // But doc says "返回值 Object", example: const res = wx.getOfficialComponentsInfo().
        // Wait, checking the doc snippet provided by user...
        // <web_reference number="8"> ... # 返回值 # Object ...
        // So it is SYNC.
        type: 'sync',
        run: (runtime) => {
          if (typeof runtime.getOfficialComponentsInfo !== 'function') {
            return { _error: 'getOfficialComponentsInfo 不存在' };
          }
          try {
            const res = runtime.getOfficialComponentsInfo();
            return { success: true, res };
          } catch (e) {
            return { success: false, error: e.message };
          }
        },
        expect: {
          success: true,
          res: {
            // It returns an object with component infos, might be empty if none
            // We check if it is an object at least.
            // notificationComponentInfo: { name: '@string', isVisible: '@boolean', ... }
          }
        }
      }
    ]
  },
  {
    name: 'migo.onOfficialComponentsInfoChange',
    category: 'ui/menu',
    tests: [
      {
        id: 'ui-menu-004',
        name: '监听官方组件信息变化',
        description: '验证 onOfficialComponentsInfoChange 接口',
        type: 'event',
        timeout: 3000,
        run: (runtime, callback) => {
          if (typeof runtime.onOfficialComponentsInfoChange !== 'function') {
            return callback({ _error: 'onOfficialComponentsInfoChange 不存在' });
          }
          const listener = (res) => {
             callback({ triggered: true, res });
          };
          runtime.onOfficialComponentsInfoChange(listener);
          // Hard to trigger change in test, so we verify registration
          callback({ registered: true });
        },
        expect: {
          registered: true
        }
      }
    ]
  },
  {
    name: 'migo.offOfficialComponentsInfoChange',
    category: 'ui/menu',
    tests: [
      {
        id: 'ui-menu-005',
        name: '取消监听官方组件信息变化',
        description: '验证 offOfficialComponentsInfoChange 接口',
        type: 'sync',
        run: (runtime) => {
          if (typeof runtime.offOfficialComponentsInfoChange !== 'function') {
            return { _error: 'offOfficialComponentsInfoChange 不存在' };
          }
          const listener = () => {};
          try {
            runtime.onOfficialComponentsInfoChange && runtime.onOfficialComponentsInfoChange(listener);
            runtime.offOfficialComponentsInfoChange(listener);
            return { success: true };
          } catch (e) {
            return { success: false, error: e.message };
          }
        },
        expect: {
          success: true
        }
      }
    ]
  }
];
