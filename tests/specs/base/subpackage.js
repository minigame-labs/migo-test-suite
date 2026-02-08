/**
 * 分包加载 API 测试
 */

export default [
  {
    name: 'migo.subpackage',
    category: 'base',
    tests: [
      {
        id: 'subpackage-001',
        name: '分包加载 API 检测',
        description: '检测分包加载相关 API 是否存在',
        type: 'sync',
        run: (runtime) => ({
          loadSubpackage: typeof runtime.loadSubpackage === 'function',
          preDownloadSubpackage: typeof runtime.preDownloadSubpackage === 'function'
        }),
        expect: {
          loadSubpackage: true,
          preDownloadSubpackage: true
        }
      }
    ]
  }
];
