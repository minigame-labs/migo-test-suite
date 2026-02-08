
export default [
  {
    name: 'migo.isChatTool',
    category: 'chat-tool',
    tests: [
      {
        id: 'chat-tool-001',
        name: '检查是否处于聊天工具模式',
        description: '验证 isChatTool 返回值类型',
        type: 'sync',
        run: (runtime) => {
          if (typeof runtime.isChatTool !== 'function') {
            return { _error: 'isChatTool 不存在' };
          }
          const result = runtime.isChatTool();
          return { result, type: typeof result };
        },
        expect: {
          result: '@boolean',
          type: 'boolean'
        }
      }
    ]
  },
  {
    name: 'migo.exitChatTool',
    category: 'chat-tool',
    tests: [
      {
        id: 'chat-tool-002',
        name: '退出聊天工具模式',
        description: '验证 exitChatTool 接口',
        type: 'async',
        run: (runtime, callback) => {
          if (typeof runtime.exitChatTool !== 'function') {
            return callback({ _error: 'exitChatTool 不存在' });
          }
          runtime.exitChatTool({
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
  {
    name: 'migo.getChatToolInfo',
    category: 'chat-tool',
    tests: [
      {
        id: 'chat-tool-003',
        name: '获取聊天工具信息',
        description: '验证 getChatToolInfo 返回结构',
        type: 'async',
        run: (runtime, callback) => {
          if (typeof runtime.getChatToolInfo !== 'function') {
            return callback({ _error: 'getChatToolInfo 不存在' });
          }
          runtime.getChatToolInfo({
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
  {
    name: 'migo.notifyGroupMembers',
    category: 'chat-tool',
    tests: [
      {
        id: 'chat-tool-004',
        name: '提醒群成员',
        description: '验证 notifyGroupMembers 接口',
        type: 'async',
        run: (runtime, callback) => {
          if (typeof runtime.notifyGroupMembers !== 'function') {
            return callback({ _error: 'notifyGroupMembers 不存在' });
          }
          runtime.notifyGroupMembers({
            title: '测试提醒',
            members: ['mock_openid'],
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
  {
    name: 'migo.openChatTool',
    category: 'chat-tool',
    tests: [
      {
        id: 'chat-tool-005',
        name: '打开聊天工具',
        description: '验证 openChatTool 接口',
        type: 'async',
        run: (runtime, callback) => {
          if (typeof runtime.openChatTool !== 'function') {
            return callback({ _error: 'openChatTool 不存在' });
          }
          runtime.openChatTool({
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
  {
    name: 'migo.selectGroupMembers',
    category: 'chat-tool',
    tests: [
      {
        id: 'chat-tool-006',
        name: '选择群成员',
        description: '验证 selectGroupMembers 接口',
        type: 'async',
        run: (runtime, callback) => {
          if (typeof runtime.selectGroupMembers !== 'function') {
            return callback({ _error: 'selectGroupMembers 不存在' });
          }
          runtime.selectGroupMembers({
            maxSelectCount: 1,
            success: (res) => callback({ success: true, res }),
            fail: (err) => callback({ success: false, err })
          });
        },
        expect: {
          success: true,
          res: {
            members: '@array',
            errMsg: '@string'
          }
        }
      }
    ]
  },
  {
    name: 'migo.shareAppMessageToGroup',
    category: 'chat-tool',
    tests: [
      {
        id: 'chat-tool-007',
        name: '分享小程序卡片到群',
        description: '验证 shareAppMessageToGroup 接口',
        type: 'async',
        run: (runtime, callback) => {
          if (typeof runtime.shareAppMessageToGroup !== 'function') {
            return callback({ _error: 'shareAppMessageToGroup 不存在' });
          }
          runtime.shareAppMessageToGroup({
            title: '测试分享',
            path: '/pages/index/index',
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
  {
    name: 'migo.shareEmojiToGroup',
    category: 'chat-tool',
    tests: [
      {
        id: 'chat-tool-008',
        name: '分享表情到群',
        description: '验证 shareEmojiToGroup 接口',
        type: 'async',
        run: (runtime, callback) => {
          if (typeof runtime.shareEmojiToGroup !== 'function') {
            return callback({ _error: 'shareEmojiToGroup 不存在' });
          }
          // 使用一个假设的临时路径，实际环境可能需要先下载或使用本地文件
          // 这里主要验证接口调用
          runtime.shareEmojiToGroup({
            imagePath: 'migo-file://tmp/test.gif',
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
  {
    name: 'migo.shareImageToGroup',
    category: 'chat-tool',
    tests: [
      {
        id: 'chat-tool-009',
        name: '分享图片到群',
        description: '验证 shareImageToGroup 接口',
        type: 'async',
        run: (runtime, callback) => {
          if (typeof runtime.shareImageToGroup !== 'function') {
            return callback({ _error: 'shareImageToGroup 不存在' });
          }
          runtime.shareImageToGroup({
            imagePath: 'migo-file://tmp/test.png',
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
  {
    name: 'migo.shareTextToGroup',
    category: 'chat-tool',
    tests: [
      {
        id: 'chat-tool-010',
        name: '分享文本到群',
        description: '验证 shareTextToGroup 接口',
        type: 'async',
        run: (runtime, callback) => {
          if (typeof runtime.shareTextToGroup !== 'function') {
            return callback({ _error: 'shareTextToGroup 不存在' });
          }
          runtime.shareTextToGroup({
            content: 'Hello Migo',
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
  {
    name: 'migo.shareVideoToGroup',
    category: 'chat-tool',
    tests: [
      {
        id: 'chat-tool-011',
        name: '分享视频到群',
        description: '验证 shareVideoToGroup 接口',
        type: 'async',
        run: (runtime, callback) => {
          if (typeof runtime.shareVideoToGroup !== 'function') {
            return callback({ _error: 'shareVideoToGroup 不存在' });
          }
          runtime.shareVideoToGroup({
            videoPath: 'migo-file://tmp/test.mp4',
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
