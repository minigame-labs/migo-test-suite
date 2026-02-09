
export default [
  {
    name: 'FileSystemManager.stat',
    category: 'file',
    tests: [
      {
        id: 'fs.stat',
        name: '获取文件状态',
        description: '验证 stat 接口',
        type: 'async',
        run: (runtime) => new Promise((resolve) => {
            const fs = runtime.getFileSystemManager();
            const path = `${runtime.env.USER_DATA_PATH}/stat_test.txt`;
            try { fs.writeFileSync(path, 'stat', 'utf8'); } catch(e) {}
            
            fs.stat({
                path: path,
                recursive: false,
                success: (res) => {
                    const stats = res.stats;
                    try { fs.unlinkSync(path); } catch(e) {}
                    
                    if (stats.isFile()) resolve('PASS');
                    else resolve('FAIL: isFile false');
                },
                fail: () => {
                    try { fs.unlinkSync(path); } catch(e) {}
                    resolve('FAIL: stat failed');
                }
            });
        }),
        expect: 'PASS'
      },
      {
        id: 'fs.statSync',
        name: '同步获取文件状态',
        description: '验证 statSync 接口',
        type: 'sync',
        run: (runtime) => {
            const fs = runtime.getFileSystemManager();
            const path = `${runtime.env.USER_DATA_PATH}/stat_sync_test.txt`;
            try { fs.writeFileSync(path, 'stat', 'utf8'); } catch(e) {}
            
            try {
                const stats = fs.statSync(path, false);
                fs.unlinkSync(path);
                
                return stats.isFile() ? 'PASS' : 'FAIL';
            } catch (e) {
                try { fs.unlinkSync(path); } catch(e) {}
                return 'FAIL: ' + e.message;
            }
        },
        expect: 'PASS'
      }
    ]
  },
  {
    name: 'FileSystemManager.fstat',
    category: 'file',
    tests: [
      {
        id: 'fs.fstat',
        name: '获取文件描述符状态',
        description: '验证 fstat 接口',
        type: 'async',
        run: (runtime) => new Promise((resolve) => {
            const fs = runtime.getFileSystemManager();
            const path = `${runtime.env.USER_DATA_PATH}/fstat_test.txt`;
            try { fs.writeFileSync(path, 'fstat', 'utf8'); } catch(e) {}
            
            fs.open({
                filePath: path,
                flag: 'r',
                success: (res) => {
                    const fd = res.fd;
                    fs.fstat({
                        fd: fd,
                        success: (statRes) => {
                            const stats = statRes.stats;
                            fs.closeSync({fd: fd});
                            try { fs.unlinkSync(path); } catch(e) {}
                            
                            if (stats.isFile()) resolve('PASS');
                            else resolve('FAIL: isFile false');
                        },
                        fail: () => {
                            fs.closeSync({fd: fd});
                            try { fs.unlinkSync(path); } catch(e) {}
                            resolve('FAIL: fstat failed');
                        }
                    });
                },
                fail: () => resolve('FAIL: open failed')
            });
        }),
        expect: 'PASS'
      },
      {
        id: 'fs.fstatSync',
        name: '同步获取文件描述符状态',
        description: '验证 fstatSync 接口',
        type: 'sync',
        run: (runtime) => {
            const fs = runtime.getFileSystemManager();
            const path = `${runtime.env.USER_DATA_PATH}/fstat_sync_test.txt`;
            try { fs.writeFileSync(path, 'fstat', 'utf8'); } catch(e) {}
            
            try {
                const fd = fs.openSync({ filePath: path, flag: 'r' });
                const stats = fs.fstatSync({ fd: fd });
                fs.closeSync({fd: fd});
                fs.unlinkSync(path);
                
                return stats.isFile() ? 'PASS' : 'FAIL';
            } catch (e) {
                try { fs.unlinkSync(path); } catch(e) {}
                return 'FAIL: ' + e.message;
            }
        },
        expect: 'PASS'
      }
    ]
  },
  {
    name: 'FileSystemManager.getFileInfo',
    category: 'file',
    tests: [
      {
        id: 'fs.getFileInfo',
        name: '获取文件信息',
        description: '验证 getFileInfo 接口',
        type: 'async',
        run: (runtime) => new Promise((resolve) => {
            const fs = runtime.getFileSystemManager();
            const path = `${runtime.env.USER_DATA_PATH}/file_info.txt`;
            try { fs.writeFileSync(path, 'info', 'utf8'); } catch(e) {}
            
            fs.getFileInfo({
                filePath: path,
                success: (res) => {
                    try { fs.unlinkSync(path); } catch(e) {}
                    if (typeof res.size === 'number') resolve('PASS');
                    else resolve('FAIL: invalid size');
                },
                fail: () => {
                    try { fs.unlinkSync(path); } catch(e) {}
                    resolve('FAIL: getFileInfo failed');
                }
            });
        }),
        expect: 'PASS'
      }
    ]
  },
  {
    name: 'Stats',
    category: 'file',
    tests: [
      {
        id: 'Stats.isDirectory',
        name: 'Stats.isDirectory',
        description: '判断是否为目录',
        type: 'sync',
        run: (runtime) => {
            const fs = runtime.getFileSystemManager();
            const dirPath = `${runtime.env.USER_DATA_PATH}/test_dir_stat`;
            try { fs.rmdirSync(dirPath, true); } catch(e) {}
            try { fs.mkdirSync(dirPath); } catch(e) {}
            
            try {
                const stats = fs.statSync(dirPath);
                const isDir = stats.isDirectory();
                fs.rmdirSync(dirPath, true);
                
                if (isDir === true) return 'PASS';
                return 'FAIL: isDirectory returned ' + isDir;
            } catch (e) {
                try { fs.rmdirSync(dirPath, true); } catch(e) {}
                return 'FAIL: ' + e.message;
            }
        },
        expect: 'PASS'
      },
      {
        id: 'Stats.isFile',
        name: 'Stats.isFile',
        description: '判断是否为文件',
        type: 'sync',
        run: (runtime) => {
            const fs = runtime.getFileSystemManager();
            const filePath = `${runtime.env.USER_DATA_PATH}/test_file_stat.txt`;
            try { fs.writeFileSync(filePath, 'test', 'utf8'); } catch(e) {}
            
            try {
                const stats = fs.statSync(filePath);
                const isFile = stats.isFile();
                fs.unlinkSync(filePath);
                
                if (isFile === true) return 'PASS';
                return 'FAIL: isFile returned ' + isFile;
            } catch (e) {
                try { fs.unlinkSync(filePath); } catch(e) {}
                return 'FAIL: ' + e.message;
            }
        },
        expect: 'PASS'
      }
    ]
  }
];
