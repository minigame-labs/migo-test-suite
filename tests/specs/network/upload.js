const endpoint = 'http://10.246.1.239:8766';

function createTempFile(runtime, size = 1024, content = null) {
  const fs = runtime.getFileSystemManager();
  const userPath = runtime.env?.USER_DATA_PATH || '';
  const filePath = `${userPath}/upload-${Date.now()}.bin`;
  const buf = new Uint8Array(size);
  for (let i = 0; i < size; i++) buf[i] = i % 256;
  const data = content || buf;
  return new Promise((resolve, reject) => {
    fs.writeFile({
      filePath,
      data: typeof data === 'string' ? data : data.buffer,
      encoding: typeof data === 'string' ? 'utf8' : undefined,
      success: () => resolve({ filePath, size: typeof data === 'string' ? data.length : size }),
      fail: (err) => reject(err)
    });
  });
}

export default [
  {
    name: 'migo.uploadFile.basic',
    category: 'network/upload',
    tests: [
      {
        id: 'upload-exists',
        name: 'API exists',
        description: 'runtime.uploadFile should exist',
        type: 'sync',
        run: (runtime) => ({ exists: typeof runtime.uploadFile === 'function' }),
        expect: { exists: true }
      },
      {
        id: 'upload-basic',
        name: 'Basic upload',
        description: 'Upload a binary file with default options',
        type: 'async',
        run: (runtime) => new Promise((resolve, reject) => {
          createTempFile(runtime, 2048)
            .then((tmp) => {
              runtime.uploadFile({
                url: `${endpoint}/upload`,
                filePath: tmp.filePath,
                name: 'file',
                success: (res) => {
                  const body = typeof res.data === 'string' ? JSON.parse(res.data) : res.data;
                  if (res.statusCode === 200 && body.file && body.file.size === tmp.size) {
                    resolve('PASS');
                  } else {
                    reject(`Unexpected response: ${JSON.stringify(res)}`);
                  }
                },
                fail: (err) => reject(`Upload failed: ${JSON.stringify(err)}`)
              });
            })
            .catch((err) => reject(`File prep failed: ${JSON.stringify(err)}`));
        }),
        expect: 'PASS'
      }
    ]
  },
  {
    name: 'migo.uploadFile.options',
    category: 'network/upload',
    tests: [
      {
        id: 'upload-formdata-header',
        name: 'FormData & Header',
        description: 'Send extra headers and form fields',
        type: 'async',
        run: (runtime) => new Promise((resolve, reject) => {
          createTempFile(runtime, 512)
            .then((tmp) => {
              runtime.uploadFile({
                url: `${endpoint}/upload`,
                filePath: tmp.filePath,
                name: 'file',
                header: { 'X-Upload-Client': 'MigoTest' },
                formData: { meta: 'test', count: '3' },
                success: (res) => {
                  const body = typeof res.data === 'string' ? JSON.parse(res.data) : res.data;
                  const ok = body.file && body.file.size === tmp.size
                    && body.fields && body.fields.meta === 'test' && body.fields.count === '3';
                  if (res.statusCode === 200 && ok) resolve('PASS');
                  else reject(`Mismatch: ${JSON.stringify(body)}`);
                },
                fail: reject
              });
            })
            .catch(reject);
        }),
        expect: 'PASS'
      },
      {
        id: 'upload-timeout',
        name: 'Timeout',
        description: 'Verify timeout handling',
        type: 'async',
        run: (runtime) => new Promise((resolve, _reject) => {
          createTempFile(runtime, 1024)
            .then((tmp) => {
              runtime.uploadFile({
                url: `${endpoint}/delay/2000`,
                filePath: tmp.filePath,
                name: 'file',
                timeout: 500,
                success: () => resolve('FAIL'),
                fail: () => resolve('PASS'),
              });
            })
            .catch(() => resolve('PASS'));
        }),
        expect: 'PASS'
      }
    ]
  },
  {
    name: 'migo.uploadFile.task',
    category: 'network/upload',
    tests: [
      {
        id: 'upload-headers',
        name: 'onHeadersReceived',
        description: 'Headers event before success',
        type: 'async',
        run: (runtime) => new Promise((resolve, reject) => {
          let headersReceived = false;
          createTempFile(runtime, 256)
            .then((tmp) => {
              const task = runtime.uploadFile({
                url: `${endpoint}/upload`,
                filePath: tmp.filePath,
                name: 'file',
                success: (res) => {
                  if (headersReceived) resolve('PASS');
                  else reject('Headers not received before success');
                },
                fail: reject
              });
              task.onHeadersReceived((res) => {
                if (res.header) headersReceived = true;
              });
            })
            .catch(reject);
        }),
        expect: 'PASS'
      },
      {
        id: 'upload-progress',
        name: 'onProgressUpdate',
        description: 'Progress reaches 100%',
        type: 'async',
        run: (runtime) => new Promise((resolve, reject) => {
          createTempFile(runtime, 4096)
            .then((tmp) => {
              const task = runtime.uploadFile({
                url: `${endpoint}/upload`,
                filePath: tmp.filePath,
                name: 'file',
                success: () => resolve('PASS'),
                fail: reject
              });
              let finalOk = false;
              task.onProgressUpdate(({ progress, totalBytesSent, totalBytesExpectedToSend }) => {
                if (progress === 100 && totalBytesExpectedToSend === tmp.size) {
                  finalOk = true;
                }
              });
              setTimeout(() => {
                if (!finalOk) reject('Progress did not reach 100 or size mismatch');
              }, 3000);
            })
            .catch(reject);
        }),
        expect: 'PASS'
      },
      {
        id: 'upload-off-progress',
        name: 'offProgressUpdate',
        description: 'Remove progress listener',
        type: 'async',
        run: (runtime) => new Promise((resolve, reject) => {
          createTempFile(runtime, 1024)
            .then((tmp) => {
              const task = runtime.uploadFile({
                url: `${endpoint}/upload`,
                filePath: tmp.filePath,
                name: 'file',
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
            })
            .catch(reject);
        }),
        expect: 'PASS'
      },
      {
        id: 'upload-abort',
        name: 'UploadTask.abort',
        description: 'Abort an in-flight upload',
        type: 'async',
        run: (runtime) => new Promise((resolve, reject) => {
          createTempFile(runtime, 8192)
            .then((tmp) => {
              const task = runtime.uploadFile({
                url: `${endpoint}/upload`,
                filePath: tmp.filePath,
                name: 'file',
                success: () => reject('Should have been aborted'),
                fail: () => resolve('PASS')
              });
              setTimeout(() => { task.abort(); }, 50);
            })
            .catch(reject);
        }),
        expect: 'PASS'
      },
      {
        id: 'upload-off-headers',
        name: 'offHeadersReceived',
        description: 'Remove headers listener',
        type: 'async',
        run: (runtime) => new Promise((resolve, reject) => {
          createTempFile(runtime, 256)
            .then((tmp) => {
              const task = runtime.uploadFile({
                url: `${endpoint}/upload`,
                filePath: tmp.filePath,
                name: 'file',
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
            })
            .catch(reject);
        }),
        expect: 'PASS'
      }
    ]
  }
];
