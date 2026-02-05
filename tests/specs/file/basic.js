
export default [
  {
    name: 'FileSystemManager.access',
    category: 'file',
    tests: [
      {
        id: 'fs.access',
        name: '判断文件是否存在',
        description: '验证 access 接口',
        type: 'async',
        run: (runtime) => new Promise((resolve) => {
            const fs = runtime.getFileSystemManager();
            const path = `${runtime.env.USER_DATA_PATH}/access_test.txt`;
            try { fs.writeFileSync(path, 'test', 'utf8'); } catch(e) {}
            
            fs.access({
                path: path,
                success: () => {
                    try { fs.unlinkSync(path); } catch(e) {}
                    resolve('PASS');
                },
                fail: () => {
                    try { fs.unlinkSync(path); } catch(e) {}
                    resolve('FAIL');
                }
            });
        }),
        expect: 'PASS'
      },
      {
        id: 'fs.accessSync',
        name: '同步判断文件是否存在',
        description: '验证 accessSync 接口',
        type: 'sync',
        run: (runtime) => {
            const fs = runtime.getFileSystemManager();
            const path = `${runtime.env.USER_DATA_PATH}/access_sync_test.txt`;
            try { fs.writeFileSync(path, 'test', 'utf8'); } catch(e) {}
            
            try {
                fs.accessSync(path);
                fs.unlinkSync(path);
                return 'PASS';
            } catch (e) {
                try { fs.unlinkSync(path); } catch(e) {}
                return 'FAIL';
            }
        },
        expect: 'PASS'
      }
    ]
  },
  {
    name: 'FileSystemManager.open/close',
    category: 'file',
    tests: [
      {
        id: 'fs.open',
        name: '打开关闭文件',
        description: '验证 open 和 close 接口',
        type: 'async',
        run: (runtime) => new Promise((resolve) => {
            const fs = runtime.getFileSystemManager();
            const path = `${runtime.env.USER_DATA_PATH}/open_test.txt`;
            try { fs.writeFileSync(path, 'test', 'utf8'); } catch(e) {}
            
            fs.open({
                filePath: path,
                flag: 'r',
                success: (res) => {
                    const fd = res.fd;
                    if (!fd) {
                         try { fs.unlinkSync(path); } catch(e) {}
                         resolve('FAIL: no fd');
                         return;
                    }
                    fs.close({
                        fd: fd,
                        success: () => {
                             try { fs.unlinkSync(path); } catch(e) {}
                             resolve('PASS');
                        },
                        fail: () => {
                             try { fs.unlinkSync(path); } catch(e) {}
                             resolve('FAIL: close failed');
                        }
                    });
                },
                fail: () => {
                    try { fs.unlinkSync(path); } catch(e) {}
                    resolve('FAIL: open failed');
                }
            });
        }),
        expect: 'PASS'
      },
      {
        id: 'fs.openSync',
        name: '同步打开关闭文件',
        description: '验证 openSync 和 closeSync 接口',
        type: 'sync',
        run: (runtime) => {
            const fs = runtime.getFileSystemManager();
            const path = `${runtime.env.USER_DATA_PATH}/open_sync_test.txt`;
            try { fs.writeFileSync(path, 'test', 'utf8'); } catch(e) {}
            
            try {
                const fd = fs.openSync({ filePath: path, flag: 'r' });
                if (!fd) throw new Error('no fd');
                fs.closeSync({ fd: fd });
                fs.unlinkSync(path);
                return 'PASS';
            } catch (e) {
                try { fs.unlinkSync(path); } catch(e) {}
                return 'FAIL: ' + e.message;
            }
        },
        expect: 'PASS'
      }
    ]
  }
];
