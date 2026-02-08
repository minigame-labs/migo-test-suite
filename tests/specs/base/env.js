/**
 * runtime.env 环境变量测试
 */

export default [
  {
    name: 'migo.env',
    category: 'base',
    tests: [
      {
        id: 'migo.env',
        name: '获取 env 内容',
        description: '获取 env 环境变量完整内容，用于平台对比',
        type: 'sync',
        run: (runtime) => runtime.env,
        expect: {
          USER_DATA_PATH: '@string'
        }
      }
    ]
  }
];
