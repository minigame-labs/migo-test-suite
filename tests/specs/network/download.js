const endpoint = 'http://10.246.1.239:8766';

function resolvePath(runtime, name) {
  const userPath = runtime.env?.USER_DATA_PATH || '';
  return `${userPath}/${name}-${Date.now()}.bin`;
}

export default [
  {
    name: 'migo.downloadFile.basic',
    category: 'network/download',
    tests: [
      {
        id: 'download-exists',
        name: 'API exists',
        description: 'runtime.downloadFile should exist',
        type: 'sync',
        run: (runtime) => ({ exists: typeof runtime.downloadFile === 'function' }),
        expect: { exists: true }
      },
      {
        id: 'download-temp',
        name: 'Temp file download',
        description: 'Download binary without filePath returns tempFilePath',
        type: 'async',
        run: (runtime) => new Promise((resolve, reject) => {
          runtime.downloadFile({
            url: `${endpoint}/binary`,
            success: (res) => {
              const fs = runtime.getFileSystemManager();
              const tempPath = res.tempFilePath;
              if (!tempPath || res.statusCode !== 200) {
                reject(`No tempFilePath or status ${res.statusCode}`);
                return;
              }
              fs.stat({
                path: tempPath,
                success: (stat) => {
                  console.log( JSON.stringify(stat))
                  if (typeof stat.stats.size === 'number' && stat.stats.size === 256) {
                    resolve('PASS');
                  } else {
                    reject(`Size mismatch: ${stat.size}`);
                  }
                },
                fail: (err) => reject(`FS stat failed: ${JSON.stringify(err)}`)
              });
            },
            fail: (err) => reject(`Download failed: ${JSON.stringify(err)}`)
          });
        }),
        expect: 'PASS'
      },
      {
        id: 'download-filepath',
        name: 'FilePath download',
        description: 'Specify filePath and verify write',
        type: 'async',
        run: (runtime) => new Promise((resolve, reject) => {
          const filePath = resolvePath(runtime, 'download');
          runtime.downloadFile({
            url: `${endpoint}/binary`,
            filePath,
            success: (res) => {
              const fs = runtime.getFileSystemManager();
              if (res.filePath !== filePath) {
                reject(`filePath mismatch: ${res.filePath}`);
                return;
              }
              fs.stat({
                path: filePath,
                success: (stat) => {
                  if (typeof stat.stats.size === 'number' && stat.stats.size === 256) {
                    resolve('PASS');
                  } else {
                    reject(`Size mismatch: ${stat.size}`);
                  }
                },
                fail: (err) => reject(`FS stat failed: ${JSON.stringify(err)}`)
              });
            },
            fail: reject
          });
        }),
        expect: 'PASS'
      },
      {
        id: 'download-timeout',
        name: 'Timeout',
        description: 'Verify timeout handling',
        type: 'async',
        run: (runtime) => new Promise((resolve) => {
          runtime.downloadFile({
            url: `${endpoint}/delay/2000`,
            timeout: 500,
            success: () => resolve('FAIL'),
            fail: () => resolve('PASS'),
          });
        }),
        expect: 'PASS'
      }
    ]
  },
  {
    name: 'migo.downloadFile.task',
    category: 'network/download',
    tests: [
      {
        id: 'download-headers',
        name: 'onHeadersReceived',
        description: 'Headers event before success',
        type: 'async',
        run: (runtime) => new Promise((resolve, reject) => {
          let headersReceived = false;
          const task = runtime.downloadFile({
            url: `${endpoint}/binary`,
            success: (res) => {
              if (headersReceived) resolve('PASS');
              else reject('Headers not received before success');
            },
            fail: reject
          });
          task.onHeadersReceived((res) => {
            if (res.header) headersReceived = true;
          });
        }),
        expect: 'PASS'
      },
      {
        id: 'download-progress',
        name: 'onProgressUpdate',
        description: 'Progress reaches 100%',
        type: 'async',
        run: (runtime) => new Promise((resolve, reject) => {
          let finalOk = false;
          const task = runtime.downloadFile({
            url: `${endpoint}/binary`,
            success: () => {
              if (finalOk) resolve('PASS');
              else reject('Progress did not reach 100');
            },
            fail: reject
          });
          task.onProgressUpdate(({ progress, totalBytesWritten, totalBytesExpectedToWrite }) => {
            const p = Number.isFinite(progress) ? Number(progress) : 0;
            const percent = totalBytesExpectedToWrite > 0
              ? Math.round((totalBytesWritten / totalBytesExpectedToWrite) * 100)
              : p;
            const norm = Math.max(0, Math.min(percent, 100));
            console.log('download progress: ' + norm);
            if (norm === 100) {
              finalOk = true;
            }
          });
        }),
        expect: 'PASS'
      },
      {
        id: 'download-off-progress',
        name: 'offProgressUpdate',
        description: 'Remove progress listener',
        type: 'async',
        run: (runtime) => new Promise((resolve, reject) => {
          const task = runtime.downloadFile({
            url: `${endpoint}/binary`,
            success: () => resolve('PASS'),
            fail: reject
          });
          let count = 0;
          const listener = () => { count++; };
          task.onProgressUpdate(listener);
          task.offProgressUpdate(listener);
          setTimeout(() => {
            if (count === 0) resolve('PASS');
            else reject('Listener should have been removed');
          }, 1500);
        }),
        expect: 'PASS'
      },
      {
        id: 'download-abort',
        name: 'DownloadTask.abort',
        description: 'Abort an in-flight download',
        type: 'async',
        run: (runtime) => new Promise((resolve, reject) => {
          const task = runtime.downloadFile({
            url: `${endpoint}/delay/2000`,
            success: () => reject('Should have been aborted'),
            fail: () => resolve('PASS')
          });
          setTimeout(() => { task.abort(); }, 50);
        }),
        expect: 'PASS'
      },
      {
        id: 'download-off-headers',
        name: 'offHeadersReceived',
        description: 'Remove headers listener',
        type: 'async',
        run: (runtime) => new Promise((resolve, reject) => {
          const task = runtime.downloadFile({
            url: `${endpoint}/binary`,
            success: () => resolve('PASS'),
            fail: reject
          });
          let count = 0;
          const listener = () => { count++; };
          task.onHeadersReceived(listener);
          task.offHeadersReceived(listener);
          setTimeout(() => {
            if (count === 0) resolve('PASS');
            else reject('Listener should have been removed');
          }, 1500);
        }),
        expect: 'PASS'
      }
    ]
  }
];
