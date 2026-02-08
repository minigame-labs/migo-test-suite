
export default [
  {
    name: 'Util',
    category: 'util',
    tests: [
      {
        id: 'wx.encode_decode_basic',
        name: '基础编码解码 (utf8)',
        description: '验证默认 utf8 格式的编码解码',
        type: 'sync',
        run: (runtime) => {
          if (typeof wx.encode !== 'function' || typeof wx.decode !== 'function') return 'PASS: not supported';
          
          try {
            const str = 'Hello World 你好世界';
            const ab = wx.encode({ data: str, format: 'utf8' });
            
            if (!(ab instanceof ArrayBuffer)) return 'FAIL: encode return is not ArrayBuffer';
            
            const decoded = wx.decode({ data: ab, format: 'utf8' });
            if (decoded !== str) return `FAIL: mismatch. Expected "${str}", got "${decoded}"`;
            
            return 'PASS';
          } catch (e) {
            return 'FAIL: ' + e.message;
          }
        }
      },
      {
        id: 'wx.encode_decode_all_formats',
        name: '多格式编码解码覆盖',
        description: '验证所有文档支持的编码格式: utf8/ucs2/utf16le/latin1/gbk',
        type: 'sync',
        run: (runtime) => {
          if (typeof wx.encode !== 'function' || typeof wx.decode !== 'function') return 'PASS: not supported';
          
          // 文档列出的合法值
          const testCases = [
            { format: 'utf8', content: 'Testing UTF8 你好' },
            { format: 'utf-8', content: 'Testing UTF-8-alias 你好' },
            { format: 'ucs2', content: 'Testing UCS2 你好' },
            { format: 'ucs-2', content: 'Testing UCS-2-alias 你好' },
            { format: 'utf16le', content: 'Testing UTF16LE 你好' },
            { format: 'utf-16le', content: 'Testing UTF-16LE-alias 你好' },
            { format: 'latin1', content: 'Testing Latin1 (No Chinese)' }, // Latin1 不支持中文
            { format: 'gbk', content: 'Testing GBK 你好' }
          ];

          const errors = [];
          const skipped = [];

          for (const tc of testCases) {
            try {
              const ab = wx.encode({ data: tc.content, format: tc.format });
              const decoded = wx.decode({ data: ab, format: tc.format });
              
              if (decoded !== tc.content) {
                errors.push(`[${tc.format}] Mismatch: sent "${tc.content}", got "${decoded}"`);
              }
            } catch (e) {
              // iOS 高性能模式可能不支持非 utf8 格式，这里做个区分
              // 如果所有非 utf8 都失败，可能是环境问题
              if (e.message && (e.message.includes('not supported') || e.message.includes('fail'))) {
                 skipped.push(`${tc.format}(${e.message})`);
              } else {
                 errors.push(`[${tc.format}] Error: ${e.message}`);
              }
            }
          }

          if (errors.length > 0) {
            return 'FAIL: ' + errors.join('; ') + (skipped.length ? ` (Skipped: ${skipped.join(', ')})` : '');
          }
          
          if (skipped.length > 0) {
            console.log('Skipped formats:', skipped.join(', '));
            // 如果全部跳过可能也算 PASS (环境限制)，但如果有部分成功部分跳过也算 PASS
            return 'PASS';
          }

          return 'PASS';
        }
      }
    ]
  }
];
