
export default [
  {
    name: 'FileSystemManager.writeFile/readFile',
    category: 'file',
    tests: [
      {
        id: 'fs.writeFile',
        name: '写入并读取文件',
        description: '验证 writeFile 和 readFile 接口',
        type: 'async',
        run: (runtime) => new Promise((resolve) => {
            const fs = runtime.getFileSystemManager();
            const path = `${runtime.env.USER_DATA_PATH}/rw_test.txt`;
            const content = 'Hello Migo';
            
            fs.writeFile({
                filePath: path,
                data: content,
                encoding: 'utf8',
                success: () => {
                    fs.readFile({
                        filePath: path,
                        encoding: 'utf8',
                        success: (res) => {
                            try { fs.unlinkSync(path); } catch(e) {}
                            if (res.data === content) resolve('PASS');
                            else resolve('FAIL: content mismatch');
                        },
                        fail: () => {
                            try { fs.unlinkSync(path); } catch(e) {}
                            resolve('FAIL: readFile failed');
                        }
                    });
                },
                fail: (res) => resolve('FAIL: writeFile failed ' + (res.errMsg || ''))
            });
        }),
        expect: 'PASS'
      },
      {
        id: 'fs.writeFileSync',
        name: '同步写入并读取文件',
        description: '验证 writeFileSync 和 readFileSync 接口',
        type: 'sync',
        run: (runtime) => {
            const fs = runtime.getFileSystemManager();
            const path = `${runtime.env.USER_DATA_PATH}/rw_sync_test.txt`;
            const content = 'Hello Migo Sync';
            
            try {
                fs.writeFileSync(path, content, 'utf8');
                
                const data = fs.readFileSync(path, 'utf8');
                
                try { fs.unlinkSync(path); } catch(e) {}
                
                return data === content ? 'PASS' : 'FAIL: content mismatch';
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
    name: 'FileSystemManager.appendFile',
    category: 'file',
    tests: [
      {
        id: 'fs.appendFile',
        name: '追加文件内容',
        description: '验证 appendFile 接口',
        type: 'async',
        run: (runtime) => new Promise((resolve) => {
            const fs = runtime.getFileSystemManager();
            const path = `${runtime.env.USER_DATA_PATH}/append_test.txt`;
            
            try { fs.writeFileSync(path, 'Hello', 'utf8'); } catch(e) {}
            
            fs.appendFile({
                filePath: path,
                data: ' World',
                encoding: 'utf8',
                success: () => {
                    try {
                        const content = fs.readFileSync(path, 'utf8');
                        fs.unlinkSync(path);
                        resolve(content === 'Hello World' ? 'PASS' : 'FAIL');
                    } catch(e) {
                        try { fs.unlinkSync(path); } catch(e) {}
                        resolve('FAIL: read failed');
                    }
                },
                fail: () => {
                    try { fs.unlinkSync(path); } catch(e) {}
                    resolve('FAIL: append failed');
                }
            });
        }),
        expect: 'PASS'
      },
      {
        id: 'fs.appendFileSync',
        name: '同步追加文件内容',
        description: '验证 appendFileSync 接口',
        type: 'sync',
        run: (runtime) => {
            const fs = runtime.getFileSystemManager();
            const path = `${runtime.env.USER_DATA_PATH}/append_sync_test.txt`;
            
            try {
                fs.writeFileSync(path, 'Hello', 'utf8');
                
                fs.appendFileSync(path, ' World Sync', 'utf8');
                const content = fs.readFileSync(path, 'utf8');
                fs.unlinkSync(path);
                return content === 'Hello World Sync' ? 'PASS' : 'FAIL';
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
    name: 'FileSystemManager.copyFile',
    category: 'file',
    tests: [
      {
        id: 'fs.copyFile',
        name: '复制文件',
        description: '验证 copyFile 接口',
        type: 'async',
        run: (runtime) => new Promise((resolve) => {
            const fs = runtime.getFileSystemManager();
            const srcPath = `${runtime.env.USER_DATA_PATH}/copy_src.txt`;
            const destPath = `${runtime.env.USER_DATA_PATH}/copy_dest.txt`;
            
            try { fs.writeFileSync(srcPath, 'Copy Me', 'utf8'); } catch(e) {}
            
            fs.copyFile({
                srcPath: srcPath,
                destPath: destPath,
                success: () => {
                    let result = 'FAIL';
                    try {
                        const content = fs.readFileSync(destPath, 'utf8');
                        if (content === 'Copy Me') result = 'PASS';
                    } catch (e) {}
                    
                    try { fs.unlinkSync(srcPath); fs.unlinkSync(destPath); } catch(e) {}
                    resolve(result);
                },
                fail: () => {
                    try { fs.unlinkSync(srcPath); } catch(e) {}
                    resolve('FAIL');
                }
            });
        }),
        expect: 'PASS'
      },
      {
        id: 'fs.copyFileSync',
        name: '同步复制文件',
        description: '验证 copyFileSync 接口',
        type: 'sync',
        run: (runtime) => {
            const fs = runtime.getFileSystemManager();
            const srcPath = `${runtime.env.USER_DATA_PATH}/copy_sync_src.txt`;
            const destPath = `${runtime.env.USER_DATA_PATH}/copy_sync_dest.txt`;
            
            try {
                fs.writeFileSync(srcPath, 'Copy Me Sync', 'utf8');
                fs.copyFileSync(srcPath, destPath);
                const content = fs.readFileSync(destPath, 'utf8');
                fs.unlinkSync(srcPath);
                fs.unlinkSync(destPath);
                return content === 'Copy Me Sync' ? 'PASS' : 'FAIL';
            } catch (e) {
                try { fs.unlinkSync(srcPath); fs.unlinkSync(destPath); } catch(e) {}
                return 'FAIL: ' + e.message;
            }
        },
        expect: 'PASS'
      }
    ]
  }
];
