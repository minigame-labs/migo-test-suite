/**
 * 网络 API 测试用例
 */

export default [
  {
    name: 'migo.request',
    category: 'network',
    tests: [
      {
        id: 'request-001',
        name: 'request 存在',
        description: '验证网络请求 API',
        type: 'sync',
        run: (runtime) => ({
          exists: typeof runtime.request === 'function'
        }),
        expect: {
          exists: true
        }
      },
      {
        id: 'request-002',
        name: 'request 返回 RequestTask',
        description: '验证请求返回任务对象',
        type: 'sync',
        run: (runtime) => {
          if (typeof runtime.request !== 'function') {
            return { apiNotFound: true };
          }
          
          const task = runtime.request({
            url: 'https://httpbin.org/get',
            success: () => {},
            fail: () => {}
          });
          
          const hasAbort = task && typeof task.abort === 'function';
          
          // 立即取消请求
          if (hasAbort) task.abort();
          
          return {
            taskReturned: task !== null && task !== undefined,
            hasAbort: hasAbort
          };
        },
        expect: {
          taskReturned: true,
          hasAbort: true
        }
      },
      {
        id: 'request-003',
        name: 'GET 请求',
        description: '验证 GET 请求功能',
        type: 'async',
        timeout: 10000,
        run: (runtime, done) => {
          if (typeof runtime.request !== 'function') {
            done({ apiNotFound: true });
            return;
          }
          
          runtime.request({
            url: 'https://httpbin.org/get?test=migo',
            method: 'GET',
            success: (res) => {
              done({
                success: true,
                statusCode: res.statusCode,
                hasData: res.data !== undefined,
                is200: res.statusCode === 200
              });
            },
            fail: (err) => {
              done({
                success: false,
                error: err.errMsg
              });
            }
          });
        },
        expect: {
          success: true,
          is200: true,
          hasData: true
        }
      },
      {
        id: 'request-004',
        name: 'POST 请求',
        description: '验证 POST 请求功能',
        type: 'async',
        timeout: 10000,
        run: (runtime, done) => {
          if (typeof runtime.request !== 'function') {
            done({ apiNotFound: true });
            return;
          }
          
          runtime.request({
            url: 'https://httpbin.org/post',
            method: 'POST',
            data: { key: 'value' },
            header: {
              'content-type': 'application/json'
            },
            success: (res) => {
              done({
                success: true,
                statusCode: res.statusCode,
                is200: res.statusCode === 200
              });
            },
            fail: (err) => {
              done({
                success: false,
                error: err.errMsg
              });
            }
          });
        },
        expect: {
          success: true,
          is200: true
        }
      }
    ]
  },
  
  // ==================== downloadFile ====================
  {
    name: 'migo.downloadFile',
    category: 'network',
    tests: [
      {
        id: 'download-001',
        name: 'downloadFile 存在',
        description: '验证文件下载 API',
        type: 'sync',
        run: (runtime) => ({
          exists: typeof runtime.downloadFile === 'function'
        }),
        expect: {
          exists: true
        }
      }
    ]
  },
  
  // ==================== uploadFile ====================
  {
    name: 'migo.uploadFile',
    category: 'network',
    tests: [
      {
        id: 'upload-001',
        name: 'uploadFile 存在',
        description: '验证文件上传 API',
        type: 'sync',
        run: (runtime) => ({
          exists: typeof runtime.uploadFile === 'function'
        }),
        expect: {
          exists: true
        }
      }
    ]
  },
  
  // ==================== WebSocket ====================
  {
    name: 'migo.connectSocket',
    category: 'network',
    tests: [
      {
        id: 'websocket-001',
        name: 'connectSocket 存在',
        description: '验证 WebSocket 连接 API',
        type: 'sync',
        run: (runtime) => ({
          exists: typeof runtime.connectSocket === 'function'
        }),
        expect: {
          exists: true
        }
      }
    ]
  }
];
