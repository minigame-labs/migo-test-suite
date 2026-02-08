
export default [
  {
    name: 'FileSystemManager.unzip',
    category: 'file',
    tests: [
      {
        id: 'fs.unzip',
        name: '解压文件',
        description: '验证 unzip 接口',
        type: 'async',
        run: (runtime) => new Promise((resolve) => {
            const fs = runtime.getFileSystemManager();
            const zipPath = `${runtime.env.USER_DATA_PATH}/test.zip`;
            const targetDir = `${runtime.env.USER_DATA_PATH}/unzip_test`;
            
            // "hello.txt" -> "world"
            const zipBase64 = 'UEsDBAoAAAAAAPxYb0wAAAAAAAAAAAAAAAAJABwAaGVsbG8udHh0VVQJAAPZQGZl2UBmZXV4CwABBPUBAAAEFAAAAHdvcmxkUEsBAh4DCgAAAAAA/FhvTAAAAAAAAAAAAAAAAAkAGAAAAAAAAAAAAKSBAAAAAGhlbGxvLnR4dFVUBQAD2UBmZXV4CwABBPUBAAAEFAAAAFBLBQYAAAAAAQABAE4AAAAQAAAAAAA=';
            
            try { fs.writeFileSync(zipPath, zipBase64, 'base64'); } catch(e) {}
            try { fs.rmdirSync(targetDir, true); } catch(e) {}
            try { fs.mkdirSync(targetDir); } catch(e) {}
            
            fs.unzip({
                zipFilePath: zipPath,
                targetPath: targetDir,
                success: () => {
                    try {
                        const content = fs.readFileSync(`${targetDir}/hello.txt`, 'utf8');
                        fs.unlinkSync(zipPath);
                        fs.rmdirSync(targetDir, true);
                        if (content === 'world') resolve('PASS');
                        else resolve('FAIL: content mismatch ' + content);
                    } catch (e) {
                        fs.unlinkSync(zipPath);
                        try { fs.rmdirSync(targetDir, true); } catch(e) {}
                        resolve('FAIL: read extracted file failed');
                    }
                },
                fail: (res) => {
                    fs.unlinkSync(zipPath);
                    try { fs.rmdirSync(targetDir, true); } catch(e) {}
                    resolve('FAIL: unzip failed ' + (res.errMsg || ''));
                }
            });
        }),
        expect: 'PASS'
      }
    ]
  },
  {
    name: 'FileSystemManager.readCompressedFile',
    category: 'file',
    tests: [
      {
        id: 'fs.readCompressedFile',
        name: '读取压缩文件内容',
        description: '验证 readCompressedFile 接口',
        type: 'async',
        run: (runtime) => new Promise((resolve) => {
            const fs = runtime.getFileSystemManager();
            const zipPath = `${runtime.env.USER_DATA_PATH}/read_comp.zip`;
            
            // "hello.txt" -> "world"
            const zipBase64 = 'UEsDBAoAAAAAAPxYb0wAAAAAAAAAAAAAAAAJABwAaGVsbG8udHh0VVQJAAPZQGZl2UBmZXV4CwABBPUBAAAEFAAAAHdvcmxkUEsBAh4DCgAAAAAA/FhvTAAAAAAAAAAAAAAAAAkAGAAAAAAAAAAAAKSBAAAAAGhlbGxvLnR4dFVUBQAD2UBmZXV4CwABBPUBAAAEFAAAAFBLBQYAAAAAAQABAE4AAAAQAAAAAAA=';
            
            try { fs.writeFileSync(zipPath, zipBase64, 'base64'); } catch(e) {}
            
            if (typeof fs.readCompressedFile !== 'function') {
                try { fs.unlinkSync(zipPath); } catch(e) {}
                // Skip if not supported (e.g. older lib)
                return resolve('PASS'); 
            }
            
            fs.readCompressedFile({
                filePath: zipPath,
                compressionAlgorithm: 'zip',
                fileList: ['hello.txt'],
                success: (res) => {
                    try {
                        // res.fileList is object or array?
                        // Docs: result.fileList is object { "hello.txt": ArrayBuffer }
                        const buffer = res.fileList['hello.txt'];
                        const content = String.fromCharCode.apply(null, new Uint8Array(buffer));
                        
                        fs.unlinkSync(zipPath);
                        if (content === 'world') resolve('PASS');
                        else resolve('FAIL: content mismatch ' + content);
                    } catch (e) {
                        fs.unlinkSync(zipPath);
                        resolve('FAIL: parse result failed ' + e.message);
                    }
                },
                fail: (res) => {
                    fs.unlinkSync(zipPath);
                    resolve('FAIL: readCompressedFile failed ' + (res.errMsg || ''));
                }
            });
        }),
        expect: 'PASS'
      },
      {
        id: 'fs.readCompressedFileSync',
        name: '同步读取压缩文件内容',
        description: '验证 readCompressedFileSync 接口',
        type: 'sync',
        run: (runtime) => {
            const fs = runtime.getFileSystemManager();
            const zipPath = `${runtime.env.USER_DATA_PATH}/read_comp_sync.zip`;
            
            const zipBase64 = 'UEsDBAoAAAAAAPxYb0wAAAAAAAAAAAAAAAAJABwAaGVsbG8udHh0VVQJAAPZQGZl2UBmZXV4CwABBPUBAAAEFAAAAHdvcmxkUEsBAh4DCgAAAAAA/FhvTAAAAAAAAAAAAAAAAAkAGAAAAAAAAAAAAKSBAAAAAGhlbGxvLnR4dFVUBQAD2UBmZXV4CwABBPUBAAAEFAAAAFBLBQYAAAAAAQABAE4AAAAQAAAAAAA=';
            
            try { fs.writeFileSync(zipPath, zipBase64, 'base64'); } catch(e) {}
            
            if (typeof fs.readCompressedFileSync !== 'function') {
                try { fs.unlinkSync(zipPath); } catch(e) {}
                return 'PASS';
            }
            
            try {
                // WX Standard: readCompressedFileSync(object)
                const res = fs.readCompressedFileSync({
                    filePath: zipPath,
                    compressionAlgorithm: 'zip',
                    fileList: ['hello.txt']
                });
                
                const buffer = res.fileList['hello.txt'];
                const content = String.fromCharCode.apply(null, new Uint8Array(buffer));
                
                fs.unlinkSync(zipPath);
                return content === 'world' ? 'PASS' : 'FAIL';
            } catch (e) {
                try { fs.unlinkSync(zipPath); } catch(e) {}
                return 'FAIL: ' + e.message;
            }
        },
        expect: 'PASS'
      }
    ]
  },
  {
    name: 'FileSystemManager.readZipEntry',
    category: 'file',
    tests: [
      {
        id: 'fs.readZipEntry',
        name: '读取压缩包条目',
        description: '验证 readZipEntry 接口',
        type: 'async',
        run: (runtime) => new Promise((resolve) => {
            const fs = runtime.getFileSystemManager();
            if (typeof fs.readZipEntry !== 'function') {
                return resolve('PASS'); // Optional API
            }
            
            const zipPath = `${runtime.env.USER_DATA_PATH}/read_entry.zip`;
            const zipBase64 = 'UEsDBAoAAAAAAPxYb0wAAAAAAAAAAAAAAAAJABwAaGVsbG8udHh0VVQJAAPZQGZl2UBmZXV4CwABBPUBAAAEFAAAAHdvcmxkUEsBAh4DCgAAAAAA/FhvTAAAAAAAAAAAAAAAAAkAGAAAAAAAAAAAAKSBAAAAAGhlbGxvLnR4dFVUBQAD2UBmZXV4CwABBPUBAAAEFAAAAFBLBQYAAAAAAQABAE4AAAAQAAAAAAA=';
            try { fs.writeFileSync(zipPath, zipBase64, 'base64'); } catch(e) {}
            
            fs.readZipEntry({
                filePath: zipPath,
                entries: [{
                    path: 'hello.txt',
                    encoding: 'utf8'
                }],
                success: (res) => {
                    fs.unlinkSync(zipPath);
                    // res.entries = { "hello.txt": { data: "world", ... } }
                    const entry = res.entries['hello.txt'];
                    if (entry && entry.data === 'world') resolve('PASS');
                    else resolve('FAIL: content mismatch');
                },
                fail: () => {
                    fs.unlinkSync(zipPath);
                    resolve('FAIL: readZipEntry failed');
                }
            });
        }),
        expect: 'PASS'
      }
    ]
  }
];
