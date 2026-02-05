
export default [
  {
    name: 'FileSystemManager.mkdir/rmdir',
    category: 'file',
    tests: [
      {
        id: 'fs.mkdir_rmdir',
        name: '创建删除目录',
        description: '验证 mkdir 和 rmdir 接口',
        type: 'async',
        run: (runtime) => new Promise((resolve) => {
            const fs = runtime.getFileSystemManager();
            const dir = `${runtime.env.USER_DATA_PATH}/test_dir`;
            
            fs.mkdir({
                dirPath: dir,
                recursive: true,
                success: () => {
                    fs.rmdir({
                        dirPath: dir,
                        recursive: true,
                        success: () => resolve('PASS'),
                        fail: () => {
                            try { fs.rmdirSync(dir, true); } catch(e) {}
                            resolve('FAIL: rmdir failed');
                        }
                    });
                },
                fail: () => resolve('FAIL: mkdir failed')
            });
        }),
        expect: 'PASS'
      },
      {
        id: 'fs.mkdirSync_rmdirSync',
        name: '同步创建删除目录',
        description: '验证 mkdirSync 和 rmdirSync 接口',
        type: 'sync',
        run: (runtime) => {
            const fs = runtime.getFileSystemManager();
            const dir = `${runtime.env.USER_DATA_PATH}/test_sync_dir`;
            
            try {
                fs.mkdirSync(dir, true);
                fs.rmdirSync(dir, true);
                return 'PASS';
            } catch (e) {
                try { fs.rmdirSync(dir, true); } catch(e) {}
                return 'FAIL: ' + e.message;
            }
        },
        expect: 'PASS'
      }
    ]
  },
  {
    name: 'FileSystemManager.readdir',
    category: 'file',
    tests: [
      {
        id: 'fs.readdir',
        name: '读取目录',
        description: '验证 readdir 接口',
        type: 'async',
        run: (runtime) => new Promise((resolve) => {
            const fs = runtime.getFileSystemManager();
            const dir = `${runtime.env.USER_DATA_PATH}/read_dir`;
            
            try {
                fs.mkdirSync(dir, true);
                fs.writeFileSync(`${dir}/file1.txt`, '1', 'utf8');
                fs.writeFileSync(`${dir}/file2.txt`, '2', 'utf8');
            } catch(e) {
                resolve('FAIL: setup failed ' + e.message);
                return;
            }
            
            fs.readdir({
                dirPath: dir,
                success: (res) => {
                    const files = res.files;
                    try { fs.rmdirSync(dir, true); } catch(e) {}
                    
                    if (files && files.includes('file1.txt') && files.includes('file2.txt')) {
                        resolve('PASS');
                    } else {
                        resolve('FAIL: files mismatch');
                    }
                },
                fail: () => {
                    try { fs.rmdirSync(dir, true); } catch(e) {}
                    resolve('FAIL: readdir failed');
                }
            });
        }),
        expect: 'PASS'
      },
      {
        id: 'fs.readdirSync',
        name: '同步读取目录',
        description: '验证 readdirSync 接口',
        type: 'sync',
        run: (runtime) => {
            const fs = runtime.getFileSystemManager();
            const dir = `${runtime.env.USER_DATA_PATH}/read_sync_dir`;
            
            try {
                fs.mkdirSync(dir, true);
                fs.writeFileSync(`${dir}/file1.txt`, '1', 'utf8');
                
                const files = fs.readdirSync(dir);
                
                fs.rmdirSync(dir, true);
                
                return (files && files.includes('file1.txt')) ? 'PASS' : 'FAIL';
            } catch (e) {
                try { fs.rmdirSync(dir, true); } catch(e) {}
                return 'FAIL: ' + e.message;
            }
        },
        expect: 'PASS'
      }
    ]
  }
];
