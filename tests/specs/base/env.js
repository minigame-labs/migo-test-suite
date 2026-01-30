/**
 * wx.env 环境变量测试
 */

export default [
  {
    name: 'migo.env',
    category: 'base',
    tests: [
      {
        id: 'env-001',
        name: '获取 env 内容',
        description: '获取 env 环境变量完整内容，用于平台对比',
        type: 'sync',
        run: (runtime) => runtime.env,
        expect: {}
      }
    ]
  }
];
