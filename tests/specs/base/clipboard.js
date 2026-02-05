export default [
  {
    name: 'migo.setClipboardData',
    category: 'base',
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
    category: 'base',
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
        run: (runtime) => {
          const value = 'migo_clip_' + Date.now();
          return runtime.setClipboardData({ data: value })
            .then(() => runtime.getClipboardData({}))
            .then((res) => (res && res.data === value) ? 'PASS' : 'FAIL')
            .catch(() => 'FAIL');
        },
        expect: 'PASS'
      }
    ]
  }
];
