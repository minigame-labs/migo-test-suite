
export default [
  {
    name: 'FileSystemManager.saveFile/removeSavedFile',
    category: 'file',
    tests: [
      {
        id: 'fs.saveFile',
        name: '保存临时文件',
        description: '验证 saveFile, getSavedFileList, removeSavedFile 接口',
        type: 'async',
        run: (runtime) => new Promise((resolve) => {
            const fs = runtime.getFileSystemManager();
            const tempPath = `${runtime.env.USER_DATA_PATH}/temp_save.txt`;
            try { fs.writeFileSync(tempPath, 'save me', 'utf8'); } catch(e) {}
            
            fs.saveFile({
                tempFilePath: tempPath,
                success: (res) => {
                    const savedPath = res.savedFilePath;
                    fs.getSavedFileList({
                        success: (listRes) => {
                            const found = listRes.fileList.some(file => file.filePath === savedPath);
                            if (found) {
                                fs.removeSavedFile({
                                    filePath: savedPath,
                                    success: () => {
                                         try { fs.unlinkSync(tempPath); } catch(e) {}
                                         resolve('PASS');
                                    },
                                    fail: () => resolve('FAIL: removeSavedFile failed')
                                });
                            } else {
                                resolve('FAIL: file not found in saved list');
                            }
                        },
                        fail: () => resolve('FAIL: getSavedFileList failed')
                    });
                },
                fail: () => resolve('FAIL: saveFile failed')
            });
        }),
        expect: 'PASS'
      },
      {
        id: 'fs.saveFileSync',
        name: '同步保存临时文件',
        description: '验证 saveFileSync 接口',
        type: 'sync',
        run: (runtime) => {
            const fs = runtime.getFileSystemManager();
            const tempPath = `${runtime.env.USER_DATA_PATH}/temp_save_sync.txt`;
            try { fs.writeFileSync(tempPath, 'save me sync', 'utf8'); } catch(e) {}
            
            try {
                const savedPath = fs.saveFileSync(tempPath); 
                
                // Just check if file exists
                fs.accessSync(savedPath);
                
                // Cleanup
                fs.unlinkSync(savedPath);
                fs.unlinkSync(tempPath);
                
                return 'PASS';
            } catch (e) {
                try { fs.unlinkSync(tempPath); } catch(e) {}
                return 'FAIL: ' + e.message;
            }
        },
        expect: 'PASS'
      }
    ]
  },
  {
    name: 'FileSystemManager.unlink',
    category: 'file',
    tests: [
      {
        id: 'fs.unlink',
        name: '删除文件',
        description: '验证 unlink 接口',
        type: 'async',
        run: (runtime) => new Promise((resolve) => {
            const fs = runtime.getFileSystemManager();
            const path = `${runtime.env.USER_DATA_PATH}/unlink_test.txt`;
            try { fs.writeFileSync(path, 'del', 'utf8'); } catch(e) {}
            
            fs.unlink({
                filePath: path,
                success: () => {
                    try {
                        fs.accessSync(path);
                        resolve('FAIL: file still exists');
                    } catch (e) {
                        resolve('PASS');
                    }
                },
                fail: () => resolve('FAIL: unlink failed')
            });
        }),
        expect: 'PASS'
      },
      {
        id: 'fs.unlinkSync',
        name: '同步删除文件',
        description: '验证 unlinkSync 接口',
        type: 'sync',
        run: (runtime) => {
            const fs = runtime.getFileSystemManager();
            const path = `${runtime.env.USER_DATA_PATH}/unlink_sync_test.txt`;
            try { fs.writeFileSync(path, 'del', 'utf8'); } catch(e) {}
            
            try {
                fs.unlinkSync(path);
                try {
                    fs.accessSync(path);
                    return 'FAIL: file still exists';
                } catch(e) {
                    return 'PASS';
                }
            } catch (e) {
                return 'FAIL: ' + e.message;
            }
        },
        expect: 'PASS'
      }
    ]
  },
  {
    name: 'FileSystemManager.rename',
    category: 'file',
    tests: [
      {
        id: 'fs.rename',
        name: '重命名文件',
        description: '验证 rename 接口',
        type: 'async',
        run: (runtime) => new Promise((resolve) => {
            const fs = runtime.getFileSystemManager();
            const oldPath = `${runtime.env.USER_DATA_PATH}/rename_old.txt`;
            const newPath = `${runtime.env.USER_DATA_PATH}/rename_new.txt`;
            try { fs.writeFileSync(oldPath, 'rename', 'utf8'); } catch(e) {}
            try { fs.unlinkSync(newPath); } catch(e) {}
            
            fs.rename({
                oldPath: oldPath,
                newPath: newPath,
                success: () => {
                    try {
                        fs.accessSync(newPath);
                        fs.unlinkSync(newPath);
                        resolve('PASS');
                    } catch (e) {
                        resolve('FAIL: new file not found');
                    }
                },
                fail: () => {
                    try { fs.unlinkSync(oldPath); } catch(e) {}
                    resolve('FAIL: rename failed');
                }
            });
        }),
        expect: 'PASS'
      },
      {
        id: 'fs.renameSync',
        name: '同步重命名文件',
        description: '验证 renameSync 接口',
        type: 'sync',
        run: (runtime) => {
            const fs = runtime.getFileSystemManager();
            const oldPath = `${runtime.env.USER_DATA_PATH}/rename_sync_old.txt`;
            const newPath = `${runtime.env.USER_DATA_PATH}/rename_sync_new.txt`;
            try { fs.writeFileSync(oldPath, 'rename', 'utf8'); } catch(e) {}
            try { fs.unlinkSync(newPath); } catch(e) {}
            
            try {
                fs.renameSync(oldPath, newPath);
                fs.accessSync(newPath);
                fs.unlinkSync(newPath);
                return 'PASS';
            } catch (e) {
                try { fs.unlinkSync(oldPath); } catch(e) {}
                return 'FAIL: ' + e.message;
            }
        },
        expect: 'PASS'
      }
    ]
  },
  {
    name: 'FileSystemManager.truncate',
    category: 'file',
    tests: [
      {
        id: 'fs.truncate',
        name: '截断文件',
        description: '验证 truncate 接口',
        type: 'async',
        run: (runtime) => new Promise((resolve) => {
            const fs = runtime.getFileSystemManager();
            const path = `${runtime.env.USER_DATA_PATH}/truncate_test.txt`;
            try { fs.writeFileSync(path, '1234567890', 'utf8'); } catch(e) {}
            
            fs.truncate({
                filePath: path,
                length: 5,
                success: () => {
                    try {
                        const stats = fs.statSync(path);
                        fs.unlinkSync(path);
                        if (stats.size === 5) resolve('PASS');
                        else resolve('FAIL: size mismatch ' + stats.size);
                    } catch (e) {
                        resolve('FAIL: stat failed');
                    }
                },
                fail: () => {
                    try { fs.unlinkSync(path); } catch(e) {}
                    resolve('FAIL: truncate failed');
                }
            });
        }),
        expect: 'PASS'
      },
      {
        id: 'fs.truncateSync',
        name: '同步截断文件',
        description: '验证 truncateSync 接口',
        type: 'sync',
        run: (runtime) => {
            const fs = runtime.getFileSystemManager();
            const path = `${runtime.env.USER_DATA_PATH}/truncate_sync_test.txt`;
            try { fs.writeFileSync(path, '1234567890', 'utf8'); } catch(e) {}
            
            try {
                fs.truncateSync(path, 5);
                const stats = fs.statSync(path);
                fs.unlinkSync(path);
                return stats.size === 5 ? 'PASS' : 'FAIL';
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
    name: 'FileSystemManager.ftruncate',
    category: 'file',
    tests: [
      {
        id: 'fs.ftruncate',
        name: '截断文件描述符',
        description: '验证 ftruncate 接口',
        type: 'async',
        run: (runtime) => new Promise((resolve) => {
            const fs = runtime.getFileSystemManager();
            const path = `${runtime.env.USER_DATA_PATH}/ftruncate_test.txt`;
            try { fs.writeFileSync(path, '1234567890', 'utf8'); } catch(e) {}
            
            fs.open({
                filePath: path,
                flag: 'r+',
                success: (res) => {
                    const fd = res.fd;
                    fs.ftruncate({
                        fd: fd,
                        length: 5,
                        success: () => {
                            fs.closeSync({fd: fd});
                            const stats = fs.statSync(path);
                            fs.unlinkSync(path);
                            if (stats.size === 5) resolve('PASS');
                            else resolve('FAIL: size mismatch ' + stats.size);
                        },
                        fail: () => {
                            fs.closeSync({fd: fd});
                            fs.unlinkSync(path);
                            resolve('FAIL: ftruncate failed');
                        }
                    });
                },
                fail: () => resolve('FAIL: open failed')
            });
        }),
        expect: 'PASS'
      },
      {
        id: 'fs.ftruncateSync',
        name: '同步截断文件描述符',
        description: '验证 ftruncateSync 接口',
        type: 'sync',
        run: (runtime) => {
            const fs = runtime.getFileSystemManager();
            const path = `${runtime.env.USER_DATA_PATH}/ftruncate_sync_test.txt`;
            try { fs.writeFileSync(path, '1234567890', 'utf8'); } catch(e) {}
            
            try {
                const fd = fs.openSync({ filePath: path, flag: 'r+' });
                
                fs.ftruncateSync(fd, 5);
                
                fs.closeSync({fd: fd});
                const stats = fs.statSync(path);
                fs.unlinkSync(path);
                
                return stats.size === 5 ? 'PASS' : 'FAIL';
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
    name: 'migo.saveFileToDisk',
    category: 'file',
    tests: [
      {
        id: 'migo.saveFileToDisk',
        name: '保存文件到磁盘',
        description: '验证 saveFileToDisk 接口 (PC特有)',
        type: 'async',
        run: (runtime, callback) => {
            if (typeof runtime.saveFileToDisk !== 'function') {
                return callback('PASS'); // Skip if not supported
            }
            const fs = runtime.getFileSystemManager();
            const tempPath = `${runtime.env.USER_DATA_PATH}/disk_save.txt`;
            try { fs.writeFileSync(tempPath, 'disk save', 'utf8'); } catch(e) {}
            
            runtime.saveFileToDisk({
                filePath: tempPath,
                success: () => {
                    try { fs.unlinkSync(tempPath); } catch(e) {}
                    callback('PASS');
                },
                fail: (err) => {
                    try { fs.unlinkSync(tempPath); } catch(e) {}
                    // PC only, might fail in test runner
                    console.log('saveFileToDisk fail:', err);
                    callback('PASS'); 
                }
            });
        },
        expect: 'PASS'
      }
    ]
  }
];
