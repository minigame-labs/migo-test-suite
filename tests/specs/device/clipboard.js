export default [
  {
    name: 'migo.setClipboardData',
    category: 'device',
    tests: [
      {
        id: 'migo.setClipboardData-exists',
        name: 'setClipboardData 存在',
        description: '验证 setClipboardData API 是否存在',
        type: 'sync',
        run: (runtime) => ({ exists: typeof runtime.setClipboardData === 'function' }),
        expect: { exists: true }
      }
    ]
  },
  {
    name: 'migo.getClipboardData',
    category: 'device',
    tests: [
      {
        id: 'migo.getClipboardData-exists',
        name: 'getClipboardData 存在',
        description: '验证 getClipboardData API 是否存在',
        type: 'sync',
        run: (runtime) => ({ exists: typeof runtime.getClipboardData === 'function' }),
        expect: { exists: true }
      },
      {
        id: 'migo.clipboard-roundtrip',
        name: '剪贴板读写回环',
        description: '通过 setClipboardData 写入后，getClipboardData 读取到一致内容',
        type: 'async',
        run: (runtime) => new Promise((resolve) => {
          const value = 'migo_clip_' + Date.now();
          runtime.setClipboardData({
            data: value,
            success: () => {
              runtime.getClipboardData({
                success: (res) => {
                  resolve((res && res.data === value) ? 'PASS' : 'FAIL');
                },
                fail: () => resolve('FAIL')
              });
            },
            fail: () => resolve('FAIL')
          });
        }),
        expect: 'PASS'
      }
    ]
  }
];
