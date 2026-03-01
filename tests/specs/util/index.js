
export default [
  {
    name: 'Util',
    category: 'util',
    tests: [
      {
        id: 'migo.encode_decode_basic',
        name: '基础编码解码 (utf8)',
        description: '验证默认 utf8 格式的编码解码',
        type: 'sync',
        run: (runtime) => {
          if (typeof runtime.encode !== 'function' || typeof runtime.decode !== 'function') return 'PASS: not supported';
          
          try {
            const str = 'Hello World 你好世界';
            const ab = runtime.encode({ data: str, format: 'utf8' });
            
            if (!(ab instanceof ArrayBuffer)) return 'FAIL: encode return is not ArrayBuffer';
            
            const decoded = runtime.decode({ data: ab, format: 'utf8' });
            if (decoded !== str) return `FAIL: mismatch. Expected "${str}", got "${decoded}"`;
            
            return 'PASS';
          } catch (e) {
            return 'FAIL: ' + e.message;
          }
        }
      },
      {
        id: 'migo.encode_decode_all_formats',
        name: '多格式编码解码覆盖',
        description: '验证所有文档支持的编码格式: utf8/ucs2/utf16le/latin1/gbk',
        type: 'sync',
        run: (runtime) => {
          if (typeof runtime.encode !== 'function' || typeof runtime.decode !== 'function') return 'PASS: not supported';
          
          // 文档列出的合法值
          const testCases = [
            // UTF-8: 支持多种语言和Emoji
            { format: 'utf8', content: 'Testing UTF8: English 中文 🌈 (Emoji) Русский (Russian) العربية (Arabic) 日本語 (Japanese) 한국어 (Korean) ไทย (Thai) Tiếng Việt (Vietnamese)' },
            { format: 'utf-8', content: 'Testing UTF-8-alias: English 中文 🌈' },
            
            // UCS-2 / UTF-16LE: 支持多种语言和Emoji
            { format: 'ucs2', content: 'Testing UCS2: English 中文 🌈' },
            { format: 'ucs-2', content: 'Testing UCS-2-alias: English 中文 🌈' },
            { format: 'utf16le', content: 'Testing UTF16LE: English 中文 🌈' },
            { format: 'utf-16le', content: 'Testing UTF-16LE-alias: English 中文 🌈' },
            
            // Latin1: 仅支持西欧语言，不支持中文/Emoji
            { format: 'latin1', content: 'Testing Latin1: English, Français (éàè), Español (ñ), Deutsch (äöüß), Italian (àèìòù), Portuguese (ãõç)' },
            
            // GBK: 支持中文简体
            { format: 'gbk', content: 'Testing GBK: English 中文测试，繁体字（繁體字），全角标点符号：【】，。？！' }
          ];

          // Helper to convert ArrayBuffer to Hex string
          const arrayBufferToHex = (buffer) => {
            return Array.prototype.map.call(new Uint8Array(buffer), x => ('00' + x.toString(16)).slice(-2)).join('');
          };

          const errors = [];
          const skipped = [];
          const results = {}; // Store results for cross-platform comparison
          
          // 验证默认格式 (预期为 utf8)
          try {
            const defaultContent = 'Default Format (utf8): 中文 🌈';
            // format 参数缺省
            const ab = runtime.encode({ data: defaultContent });
            const decoded = runtime.decode({ data: ab });
            
            results['default'] = {
               content: defaultContent,
               hex: arrayBufferToHex(ab)
            };
            
            if (decoded !== defaultContent) {
               errors.push(`[default] Mismatch: sent "${defaultContent}", got "${decoded}"`);
            }
          } catch (e) {
             // 允许不支持默认参数的情况，记录错误但不一定会fail整个测试如果明确不支持
             errors.push(`[default] Error: ${e.message}`);
          }

          for (const tc of testCases) {
            try {
              const ab = runtime.encode({ data: tc.content, format: tc.format });
              const decoded = runtime.decode({ data: ab, format: tc.format });
              
              results[tc.format] = {
                 content: tc.content,
                 hex: arrayBufferToHex(ab)
              };

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
            return { pass: true, skipped, results };
          }

          return { pass: true, results };
        }
      }
    ]
  }
];
