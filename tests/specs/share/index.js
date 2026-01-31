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
        id: 'migo.updateShareMenu',
        name: '更新转发菜单',
        description: '更新转发菜单的配置（仅校验接口可用）',
        type: 'sync',
        run: (runtime) => {
          if (typeof runtime.updateShareMenu !== 'function') {
            return { _error: 'updateShareMenu 不存在' };
          }
          return runtime.updateShareMenu({});
        },
        expect: {}
      }
    ]
  },

  // 2) migo.showShareMenu
  {
    name: 'migo.showShareMenu',
    category: 'share',
    tests: [
      {
        id: 'migo.showShareMenu',
        name: '显示转发菜单',
        description: '通过 showShareMenu 显示转发菜单（仅校验接口可用）',
        type: 'sync',
        run: (runtime) => {
          if (typeof runtime.showShareMenu !== 'function') {
            return { _error: 'showShareMenu 不存在' };
          }
          return runtime.showShareMenu({});
        },
        expect: {}
      }
    ]
  },

  // 3) migo.hideShareMenu
  {
    name: 'migo.hideShareMenu',
    category: 'share',
    tests: [
      {
        id: 'migo.hideShareMenu',
        name: '隐藏转发菜单',
        description: '通过 hideShareMenu 隐藏转发菜单（仅校验接口可用）',
        type: 'sync',
        run: (runtime) => {
          if (typeof runtime.hideShareMenu !== 'function') {
            return { _error: 'hideShareMenu 不存在' };
          }
          return runtime.hideShareMenu({});
        },
        expect: {}
      }
    ]
  },

  // 4) migo.showShareImageMenu
  {
    name: 'migo.showShareImageMenu',
    category: 'share',
    tests: [
      {
        id: 'migo.showShareImageMenu',
        name: '显示图片转发菜单',
        description: '通过 showShareImageMenu 显示图片转发菜单（仅校验接口可用）',
        type: 'sync',
        run: (runtime) => {
          if (typeof runtime.showShareImageMenu !== 'function') {
            return { _error: 'showShareImageMenu 不存在' };
          }
          return runtime.showShareImageMenu({});
        },
        expect: {}
      }
    ]
  },

  // 5) migo.shareAppMessage
  {
    name: 'migo.shareAppMessage',
    category: 'share',
    tests: [
      {
        id: 'migo.shareAppMessage',
        name: '分享应用消息',
        description: '通过 shareAppMessage 分享应用消息（仅校验接口可用）',
        type: 'sync',
        run: (runtime) => {
          if (typeof runtime.shareAppMessage !== 'function') {
            return { _error: 'shareAppMessage 不存在' };
          }
          return runtime.shareAppMessage({});
        },
        expect: {}
      }
    ]
  },

  // 6) migo.getShareInfo
  {
    name: 'migo.getShareInfo',
    category: 'share',
    tests: [
      {
        id: 'migo.getShareInfo',
        name: '获取分享信息',
        description: '通过 getShareInfo 获取分享相关的信息（仅校验接口可用）',
        type: 'sync',
        run: (runtime) => {
          if (typeof runtime.getShareInfo !== 'function') {
            return { _error: 'getShareInfo 不存在' };
          }
          return runtime.getShareInfo({});
        },
        expect: {}
      }
    ]
  },

  // 7) migo.setMessageToFriendQuery
  {
    name: 'migo.setMessageToFriendQuery',
    category: 'share',
    tests: [
      {
        id: 'migo.setMessageToFriendQuery',
        name: '设置消息分享给朋友的查询参数',
        description: '通过 setMessageToFriendQuery 设置消息分享给朋友的查询参数（仅校验接口可用）',
        type: 'sync',
        run: (runtime) => {
          if (typeof runtime.setMessageToFriendQuery !== 'function') {
            return { _error: 'setMessageToFriendQuery 不存在' };
          }
          return runtime.setMessageToFriendQuery({});
        },
        expect: {}
      }
    ]
  },

  // 8) migo.onShareAppMessage
  {
    name: 'migo.onShareAppMessage',
    category: 'share',
    tests: [
      {
        id: 'migo.onShareAppMessage',
        name: '监听应用消息分享',
        description: '通过 onShareAppMessage 监听应用消息分享（仅校验接口可用）',
        type: 'event',
        run: (runtime) => {
          if (typeof runtime.onShareAppMessage !== 'function') {
            return { _error: 'onShareAppMessage 不存在' };
          }
          const listener = () => {};
          runtime.onShareAppMessage(listener);
          return { registered: true };
        },
        expect: {}
      }
    ]
  },

  // 9) migo.offShareAppMessage
  {
    name: 'migo.offShareAppMessage',
    category: 'share',
    tests: [
      {
        id: 'migo.offShareAppMessage',
        name: '取消监听应用消息分享',
        description: '通过 offShareAppMessage 取消监听应用消息分享（仅校验接口可用）',
        type: 'event',
        run: (runtime) => {
          if (typeof runtime.onShareAppMessage !== 'function') {
            return { _error: 'onShareAppMessage 不存在（offShareAppMessage 测试依赖）' };
          }
          if (typeof runtime.offShareAppMessage !== 'function') {
            return { _error: 'offShareAppMessage 不存在' };
          }
          const listener = () => {};
          runtime.onShareAppMessage(listener);
          runtime.offShareAppMessage(listener);
          return { removed: true };
        },
        expect: {}
      }
    ]
  },

  // 10) migo.onShareTimeline
  {
    name: 'migo.onShareTimeline',
    category: 'share',
    tests: [
      {
        id: 'migo.onShareTimeline',
        name: '监听分享到时间线',
        description: '通过 onShareTimeline 监听分享到时间线（仅校验接口可用）',
        type: 'event',
        run: (runtime) => {
          if (typeof runtime.onShareTimeline !== 'function') {
            return { _error: 'onShareTimeline 不存在' };
          }
          const listener = () => {};
          runtime.onShareTimeline(listener);
          return { registered: true };
        },
        expect: {}
      }
    ]
  },

  // 11) migo.offShareTimeline
  {
    name: 'migo.offShareTimeline',
    category: 'share',
    tests: [
      {
        id: 'migo.offShareTimeline',
        name: '取消监听分享到时间线',
        description: '通过 offShareTimeline 取消监听分享到时间线（仅校验接口可用）',
        type: 'event',
        run: (runtime) => {
          if (typeof runtime.onShareTimeline !== 'function') {
            return { _error: 'onShareTimeline 不存在（offShareTimeline 测试依赖）' };
          }
          if (typeof runtime.offShareTimeline !== 'function') {
            return { _error: 'offShareTimeline 不存在' };
          }
          const listener = () => {};
          runtime.onShareTimeline(listener);
          runtime.offShareTimeline(listener);
          return { removed: true };
        },
        expect: {}
      }
    ]
  },

  // 12) migo.onShareMessageToFriend
  {
    name: 'migo.onShareMessageToFriend',
    category: 'share',
    tests: [
      {
        id: 'migo.onShareMessageToFriend',
        name: '监听分享消息给朋友',
        description: '通过 onShareMessageToFriend 监听分享消息给朋友（仅校验接口可用）',
        type: 'event',
        run: (runtime) => {
          if (typeof runtime.onShareMessageToFriend !== 'function') {
            return { _error: 'onShareMessageToFriend 不存在' };
          }
          const listener = () => {};
          runtime.onShareMessageToFriend(listener);
          return { registered: true };
        },
        expect: {}
      }
    ]
  },

  // 13) migo.offShareMessageToFriend
  {
    name: 'migo.offShareMessageToFriend',
    category: 'share',
    tests: [
      {
        id: 'migo.offShareMessageToFriend',
        name: '取消监听分享消息给朋友',
        description: '通过 offShareMessageToFriend 取消监听分享消息给朋友（仅校验接口可用）',
        type: 'event',
        run: (runtime) => {
          if (typeof runtime.onShareMessageToFriend !== 'function') {
            return { _error: 'onShareMessageToFriend 不存在（offShareMessageToFriend 测试依赖）' };
          }
          if (typeof runtime.offShareMessageToFriend !== 'function') {
            return { _error: 'offShareMessageToFriend 不存在' };
          }
          const listener = () => {};
          runtime.onShareMessageToFriend(listener);
          runtime.offShareMessageToFriend(listener);
          return { removed: true };
        },
        expect: {}
      }
    ]
  },

  // 14) migo.onHandoff
  {
    name: 'migo.onHandoff',
    category: 'share',
    tests: [
      {
        id: 'migo.onHandoff',
        name: '监听交接事件',
        description: '通过 onHandoff 监听交接事件（仅校验接口可用）',
        type: 'event',
        run: (runtime) => {
          if (typeof runtime.onHandoff !== 'function') {
            return { _error: 'onHandoff 不存在' };
          }
          const listener = () => {};
          runtime.onHandoff(listener);
          return { registered: true };
        },
        expect: {}
      }
    ]
  },

  // 15) migo.offHandoff
  {
    name: 'migo.offHandoff',
    category: 'share',
    tests: [
      {
        id: 'migo.offHandoff',
        name: '取消监听交接事件',
        description: '通过 offHandoff 取消监听交接事件（仅校验接口可用）',
        type: 'event',
        run: (runtime) => {
          if (typeof runtime.onHandoff !== 'function') {
            return { _error: 'onHandoff 不存在（offHandoff 测试依赖）' };
          }
          if (typeof runtime.offHandoff !== 'function') {
            return { _error: 'offHandoff 不存在' };
          }
          const listener = () => {};
          runtime.onHandoff(listener);
          runtime.offHandoff(listener);
          return { removed: true };
        },
        expect: {}
      }
    ]
  }
];
