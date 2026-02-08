/**
 * 转发相关 API 测试
 */

export default [
  // 1) migo.updateShareMenu
  {
    name: 'migo.updateShareMenu',
    category: 'share',
    tests: [
      {
        id: 'share-001',
        name: '更新转发菜单',
        description: '更新转发菜单的配置',
        type: 'async',
        run: (runtime, callback) => {
          if (typeof runtime.updateShareMenu !== 'function') {
            return callback({ _error: 'updateShareMenu 不存在' });
          }
          runtime.updateShareMenu({
            withShareTicket: true,
            isPrivateMessage: true,
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

  // 2) migo.showShareMenu
  {
    name: 'migo.showShareMenu',
    category: 'share',
    tests: [
      {
        id: 'share-002',
        name: '显示转发菜单',
        description: '显示转发菜单',
        type: 'async',
        run: (runtime, callback) => {
          if (typeof runtime.showShareMenu !== 'function') {
            return callback({ _error: 'showShareMenu 不存在' });
          }
          runtime.showShareMenu({
            withShareTicket: true,
            menus: ['shareAppMessage', 'shareTimeline'],
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

  // 3) migo.hideShareMenu
  {
    name: 'migo.hideShareMenu',
    category: 'share',
    tests: [
      {
        id: 'share-003',
        name: '隐藏转发菜单',
        description: '隐藏转发菜单',
        type: 'async',
        run: (runtime, callback) => {
          if (typeof runtime.hideShareMenu !== 'function') {
            return callback({ _error: 'hideShareMenu 不存在' });
          }
          runtime.hideShareMenu({
            menus: ['shareAppMessage', 'shareTimeline'],
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

  // 4) migo.showShareImageMenu
  {
    name: 'migo.showShareImageMenu',
    category: 'share',
    tests: [
      {
        id: 'share-004',
        name: '显示图片转发菜单',
        description: '显示图片转发菜单',
        type: 'async',
        run: (runtime, callback) => {
          if (typeof runtime.showShareImageMenu !== 'function') {
            return callback({ _error: 'showShareImageMenu 不存在' });
          }
          runtime.showShareImageMenu({
            path: 'test.png',
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

  // 5) migo.shareAppMessage
  {
    name: 'migo.shareAppMessage',
    category: 'share',
    tests: [
      {
        id: 'share-005',
        name: '主动拉起转发',
        description: '主动拉起转发',
        type: 'sync',
        run: (runtime) => {
          if (typeof runtime.shareAppMessage !== 'function') {
            return { _error: 'shareAppMessage 不存在' };
          }
          // shareAppMessage 通常没有 success/fail 回调，直接调用
          runtime.shareAppMessage({
            title: 'Test Share',
            imageUrl: ''
          });
          return { called: true };
        },
        expect: {
          called: true
        }
      }
    ]
  },

  // 6) migo.getShareInfo
  {
    name: 'migo.getShareInfo',
    category: 'share',
    tests: [
      {
        id: 'share-006',
        name: '获取转发详细信息',
        description: '获取转发详细信息',
        type: 'async',
        run: (runtime, callback) => {
          if (typeof runtime.getShareInfo !== 'function') {
            return callback({ _error: 'getShareInfo 不存在' });
          }
          runtime.getShareInfo({
            shareTicket: 'test_ticket',
            success: (res) => callback({ success: true, res }),
            fail: (err) => callback({ success: false, err })
          });
        },
        expect: {
          success: true,
          res: {
            errMsg: '@string',
            encryptedData: '@string',
            iv: '@string'
          }
        }
      }
    ]
  },

  // 7) migo.authPrivateMessage
  {
    name: 'migo.authPrivateMessage',
    category: 'share',
    tests: [
      {
        id: 'share-007',
        name: '验证私密消息',
        description: '验证私密消息',
        type: 'async',
        run: (runtime, callback) => {
          if (typeof runtime.authPrivateMessage !== 'function') {
            return callback({ _error: 'authPrivateMessage 不存在' });
          }
          runtime.authPrivateMessage({
            shareTicket: 'test_ticket',
            success: (res) => callback({ success: true, res }),
            fail: (err) => callback({ success: false, err })
          });
        },
        expect: {
          success: true,
          res: {
            valid: '@boolean',
            encryptedData: '@string',
            iv: '@string'
          }
        }
      }
    ]
  },

  // 8) migo.setMessageToFriendQuery
  {
    name: 'migo.setMessageToFriendQuery',
    category: 'share',
    tests: [
      {
        id: 'share-008',
        name: '设置分享给朋友的查询参数',
        description: '设置分享给朋友的查询参数',
        type: 'sync',
        run: (runtime) => {
          if (typeof runtime.setMessageToFriendQuery !== 'function') {
            return { _error: 'setMessageToFriendQuery 不存在' };
          }
          const result = runtime.setMessageToFriendQuery({
            shareMessageToFriendScene: 1
          });
          return { result: result !== undefined }; // 验证调用是否成功
        },
        expect: {
          result: true
        }
      }
    ]
  },

  // 9) migo.onShareAppMessage / offShareAppMessage
  {
    name: 'migo.onShareAppMessage',
    category: 'share',
    tests: [
      {
        id: 'share-009',
        name: '监听/取消监听应用消息分享',
        description: '验证 onShareAppMessage 和 offShareAppMessage',
        type: 'sync',
        run: (runtime) => {
          if (typeof runtime.onShareAppMessage !== 'function' || typeof runtime.offShareAppMessage !== 'function') {
            return { _error: 'API 不完整' };
          }
          const listener = () => ({ title: 'Test' });
          runtime.onShareAppMessage(listener);
          runtime.offShareAppMessage(listener);
          return { success: true };
        },
        expect: {
          success: true
        }
      }
    ]
  },

  // 10) migo.onShareTimeline / offShareTimeline
  {
    name: 'migo.onShareTimeline',
    category: 'share',
    tests: [
      {
        id: 'share-010',
        name: '监听/取消监听分享到朋友圈',
        description: '验证 onShareTimeline 和 offShareTimeline',
        type: 'sync',
        run: (runtime) => {
          if (typeof runtime.onShareTimeline !== 'function' || typeof runtime.offShareTimeline !== 'function') {
            return { _error: 'API 不完整' };
          }
          const listener = () => ({ title: 'Test' });
          runtime.onShareTimeline(listener);
          runtime.offShareTimeline(listener);
          return { success: true };
        },
        expect: {
          success: true
        }
      }
    ]
  },

  // 11) migo.onShareMessageToFriend / offShareMessageToFriend
  {
    name: 'migo.onShareMessageToFriend',
    category: 'share',
    tests: [
      {
        id: 'share-011',
        name: '监听/取消监听分享给朋友',
        description: '验证 onShareMessageToFriend 和 offShareMessageToFriend',
        type: 'sync',
        run: (runtime) => {
          if (typeof runtime.onShareMessageToFriend !== 'function' || typeof runtime.offShareMessageToFriend !== 'function') {
            return { _error: 'API 不完整' };
          }
          const listener = (res) => {};
          runtime.onShareMessageToFriend(listener);
          runtime.offShareMessageToFriend(listener);
          return { success: true };
        },
        expect: {
          success: true
        }
      }
    ]
  },

  // 12) migo.onAddToFavorites / offAddToFavorites
  {
    name: 'migo.onAddToFavorites',
    category: 'share',
    tests: [
      {
        id: 'share-012',
        name: '监听/取消监听收藏事件',
        description: '验证 onAddToFavorites 和 offAddToFavorites',
        type: 'sync',
        run: (runtime) => {
          if (typeof runtime.onAddToFavorites !== 'function' || typeof runtime.offAddToFavorites !== 'function') {
            return { _error: 'API 不完整' };
          }
          const listener = (res) => ({ title: 'Fav' });
          runtime.onAddToFavorites(listener);
          runtime.offAddToFavorites(listener);
          return { success: true };
        },
        expect: {
          success: true
        }
      }
    ]
  },

  // 13) migo.onCopyUrl / offCopyUrl
  {
    name: 'migo.onCopyUrl',
    category: 'share',
    tests: [
      {
        id: 'share-013',
        name: '监听/取消监听复制链接事件',
        description: '验证 onCopyUrl 和 offCopyUrl',
        type: 'sync',
        run: (runtime) => {
          if (typeof runtime.onCopyUrl !== 'function' || typeof runtime.offCopyUrl !== 'function') {
            return { _error: 'API 不完整' };
          }
          const listener = () => ({ query: 'a=1' });
          runtime.onCopyUrl(listener);
          runtime.offCopyUrl(listener);
          return { success: true };
        },
        expect: {
          success: true
        }
      }
    ]
  },

  // 14) Handoff (接力) 相关
  {
    name: 'migo.handoff',
    category: 'share',
    tests: [
      {
        id: 'share-014',
        name: '接力 API 组测试',
        description: '验证 Handoff 相关 API 存在性',
        type: 'sync',
        run: (runtime) => {
          return {
            onHandoff: typeof runtime.onHandoff === 'function',
            offHandoff: typeof runtime.offHandoff === 'function',
            checkHandoffEnabled: typeof runtime.checkHandoffEnabled === 'function',
            startHandoff: typeof runtime.startHandoff === 'function',
            setHandoffQuery: typeof runtime.setHandoffQuery === 'function'
          };
        },
        expect: {
          onHandoff: true,
          offHandoff: true,
          checkHandoffEnabled: true,
          startHandoff: true,
          setHandoffQuery: true
        }
      },
      {
        id: 'share-015',
        name: '检查接力是否可用',
        description: 'checkHandoffEnabled 测试',
        type: 'async',
        run: (runtime, callback) => {
          if (typeof runtime.checkHandoffEnabled !== 'function') {
            return callback({ _error: 'checkHandoffEnabled 不存在' });
          }
          runtime.checkHandoffEnabled({
            success: (res) => callback({ success: true, res }),
            fail: (err) => callback({ success: false, err })
          });
        },
        expect: {
          success: true,
          res: {
            isEnabled: '@boolean',
            errMsg: '@string'
          }
        }
      },
      {
        id: 'share-016',
        name: '发起接力',
        description: 'startHandoff 测试',
        type: 'async',
        run: (runtime, callback) => {
          if (typeof runtime.startHandoff !== 'function') {
            return callback({ _error: 'startHandoff 不存在' });
          }
          runtime.startHandoff({
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
  }
];
