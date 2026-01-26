/**
 * 文件系统 API 测试用例
 */

export default [
  {
    name: 'migo.getFileSystemManager',
    category: 'file',
    tests: [
      {
        id: 'file-001',
        name: 'getFileSystemManager 存在',
        description: '验证获取文件系统管理器 API',
        type: 'sync',
        run: (runtime) => ({
          exists: typeof runtime.getFileSystemManager === 'function'
        }),
        expect: {
          exists: true
        }
      },
      {
        id: 'file-002',
        name: 'FileSystemManager 方法',
        description: '验证文件系统管理器包含必要方法',
        type: 'sync',
        run: (runtime) => {
          if (typeof runtime.getFileSystemManager !== 'function') {
            return { apiNotFound: true };
          }
          const fs = runtime.getFileSystemManager();
          return {
            hasAccess: typeof fs.access === 'function',
            hasAccessSync: typeof fs.accessSync === 'function',
            hasReadFile: typeof fs.readFile === 'function',
            hasReadFileSync: typeof fs.readFileSync === 'function',
            hasWriteFile: typeof fs.writeFile === 'function',
            hasWriteFileSync: typeof fs.writeFileSync === 'function',
            hasMkdir: typeof fs.mkdir === 'function',
            hasMkdirSync: typeof fs.mkdirSync === 'function',
            hasReaddir: typeof fs.readdir === 'function',
            hasReaddirSync: typeof fs.readdirSync === 'function',
            hasUnlink: typeof fs.unlink === 'function',
            hasUnlinkSync: typeof fs.unlinkSync === 'function',
            hasStat: typeof fs.stat === 'function',
            hasStatSync: typeof fs.statSync === 'function'
          };
        },
        expect: {
          hasAccess: true,
          hasAccessSync: true,
          hasReadFile: true,
          hasReadFileSync: true,
          hasWriteFile: true,
          hasWriteFileSync: true,
          hasMkdir: true,
          hasMkdirSync: true,
          hasReaddir: true,
          hasReaddirSync: true,
          hasUnlink: true,
          hasUnlinkSync: true,
          hasStat: true,
          hasStatSync: true
        }
      },
      {
        id: 'file-003',
        name: 'writeFileSync/readFileSync',
        description: '验证同步写入和读取文件',
        type: 'sync',
        run: (runtime) => {
          if (typeof runtime.getFileSystemManager !== 'function') {
            return { apiNotFound: true };
          }
          const fs = runtime.getFileSystemManager();
          const userPath = runtime.env?.USER_DATA_PATH || '';
          const testPath = `${userPath}/test-${Date.now()}.txt`;
          const testContent = 'Hello Migo Test';
          
          try {
            // 写入文件
            fs.writeFileSync({
              filePath: testPath,
              data: testContent,
              encoding: 'utf8'
            });
            
            // 读取文件
            const content = fs.readFileSync({
              filePath: testPath,
              encoding: 'utf8'
            });
            
            // 清理
            try { fs.unlinkSync({ filePath: testPath }); } catch (e) {}
            
            return {
              writeSuccess: true,
              readSuccess: true,
              contentMatch: content === testContent
            };
          } catch (e) {
            return {
              writeSuccess: false,
              error: e.message || String(e)
            };
          }
        },
        expect: {
          writeSuccess: true,
          readSuccess: true,
          contentMatch: true
        }
      },
      {
        id: 'file-004',
        name: 'mkdirSync/readdirSync',
        description: '验证同步创建和读取目录',
        type: 'sync',
        run: (runtime) => {
          if (typeof runtime.getFileSystemManager !== 'function') {
            return { apiNotFound: true };
          }
          const fs = runtime.getFileSystemManager();
          const userPath = runtime.env?.USER_DATA_PATH || '';
          const testDir = `${userPath}/testdir-${Date.now()}`;
          
          try {
            // 创建目录
            fs.mkdirSync({
              dirPath: testDir,
              recursive: true
            });
            
            // 读取目录
            const files = fs.readdirSync({
              dirPath: testDir
            });
            
            // 清理
            try { fs.rmdirSync({ dirPath: testDir }); } catch (e) {}
            
            return {
              mkdirSuccess: true,
              readdirSuccess: true,
              isArray: Array.isArray(files)
            };
          } catch (e) {
            return {
              mkdirSuccess: false,
              error: e.message || String(e)
            };
          }
        },
        expect: {
          mkdirSuccess: true,
          readdirSuccess: true,
          isArray: true
        }
      },
      {
        id: 'file-005',
        name: 'readFile 异步',
        description: '验证异步读取文件',
        type: 'async',
        timeout: 5000,
        run: (runtime, done) => {
          if (typeof runtime.getFileSystemManager !== 'function') {
            done({ apiNotFound: true });
            return;
          }
          const fs = runtime.getFileSystemManager();
          const userPath = runtime.env?.USER_DATA_PATH || '';
          const testPath = `${userPath}/async-test-${Date.now()}.txt`;
          const testContent = 'Async Test Content';
          
          // 先同步写入
          try {
            fs.writeFileSync({
              filePath: testPath,
              data: testContent,
              encoding: 'utf8'
            });
          } catch (e) {
            done({ writeError: e.message });
            return;
          }
          
          // 异步读取
          fs.readFile({
            filePath: testPath,
            encoding: 'utf8',
            success: (res) => {
              // 清理
              try { fs.unlinkSync({ filePath: testPath }); } catch (e) {}
              done({
                success: true,
                contentMatch: res.data === testContent
              });
            },
            fail: (err) => {
              // 清理
              try { fs.unlinkSync({ filePath: testPath }); } catch (e) {}
              done({
                success: false,
                error: err.errMsg
              });
            }
          });
        },
        expect: {
          success: true,
          contentMatch: true
        }
      },
      {
        id: 'file-006',
        name: 'statSync 文件信息',
        description: '验证获取文件状态',
        type: 'sync',
        run: (runtime) => {
          if (typeof runtime.getFileSystemManager !== 'function') {
            return { apiNotFound: true };
          }
          const fs = runtime.getFileSystemManager();
          const userPath = runtime.env?.USER_DATA_PATH || '';
          const testPath = `${userPath}/stat-test-${Date.now()}.txt`;
          
          try {
            // 创建测试文件
            fs.writeFileSync({
              filePath: testPath,
              data: 'stat test',
              encoding: 'utf8'
            });
            
            // 获取文件信息
            const stat = fs.statSync({
              path: testPath
            });
            
            // 清理
            try { fs.unlinkSync({ filePath: testPath }); } catch (e) {}
            
            return {
              statSuccess: true,
              hasSize: typeof stat.size === 'number',
              hasIsFile: typeof stat.isFile === 'function',
              hasIsDirectory: typeof stat.isDirectory === 'function',
              isFile: stat.isFile()
            };
          } catch (e) {
            return {
              statSuccess: false,
              error: e.message || String(e)
            };
          }
        },
        expect: {
          statSuccess: true,
          hasSize: true,
          hasIsFile: true,
          hasIsDirectory: true,
          isFile: true
        }
      }
    ]
  }
];
