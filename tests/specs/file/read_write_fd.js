
export default [
  {
    name: 'FileSystemManager.write/read (FD)',
    category: 'file',
    tests: [
      {
        id: 'fs.write_read_fd',
        name: '文件描述符读写',
        description: '验证 write 和 read 接口 (使用 fd)',
        type: 'async',
        run: (runtime) => new Promise((resolve) => {
            const fs = runtime.getFileSystemManager();
            const path = `${runtime.env.USER_DATA_PATH}/fd_test.txt`;
            
            try { fs.writeFileSync(path, '', 'utf8'); } catch(e) {}
            
            fs.open({
                filePath: path,
                flag: 'a+',
                success: (res) => {
                    const fd = res.fd;
                    const content = 'FD Test';
                    
                    fs.write({
                        fd: fd,
                        data: content,
                        encoding: 'utf8',
                        success: () => {
                            fs.closeSync({fd: fd});
                            
                            const fdRead = fs.openSync({ filePath: path, flag: 'r' });
                            const buffer = new ArrayBuffer(100);
                            
                            fs.read({
                                fd: fdRead,
                                arrayBuffer: buffer,
                                length: 100,
                                success: (readRes) => {
                                    fs.closeSync({fd: fdRead});
                                    try { fs.unlinkSync(path); } catch(e) {}
                                    
                                    if (readRes.bytesRead > 0) resolve('PASS');
                                    else resolve('FAIL: 0 bytes read');
                                },
                                fail: () => {
                                    fs.closeSync({fd: fdRead});
                                    try { fs.unlinkSync(path); } catch(e) {}
                                    resolve('FAIL: read failed');
                                }
                            });
                        },
                        fail: () => {
                            fs.closeSync({fd: fd});
                            try { fs.unlinkSync(path); } catch(e) {}
                            resolve('FAIL: write failed');
                        }
                    });
                },
                fail: () => resolve('FAIL: open failed')
            });
        }),
        expect: 'PASS'
      },
      {
        id: 'fs.writeSync_readSync_fd',
        name: '同步文件描述符读写',
        description: '验证 writeSync 和 readSync 接口 (使用 fd)',
        type: 'sync',
        run: (runtime) => {
            const fs = runtime.getFileSystemManager();
            const path = `${runtime.env.USER_DATA_PATH}/fd_sync_test.txt`;
            
            try {
                fs.writeFileSync(path, '', 'utf8');
                const fd = fs.openSync({ filePath: path, flag: 'a+' });
                
                // WX Standard: writeSync(fd, data, encoding)
                fs.writeSync(fd, 'Sync FD', 'utf8');
                
                fs.closeSync({fd: fd});
                
                const fdRead = fs.openSync({ filePath: path, flag: 'r' });
                const buffer = new ArrayBuffer(100);
                
                // WX Standard: readSync(fd, arrayBuffer, offset, length, position)
                const res = fs.readSync(fdRead, buffer, 0, 100);
                
                fs.closeSync({fd: fdRead});
                fs.unlinkSync(path);
                
                // res could be number or object depending on implementation, handling both
                const bytes = (typeof res === 'number') ? res : (res ? res.bytesRead : 0);
                
                return bytes > 0 ? 'PASS' : 'FAIL';
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
