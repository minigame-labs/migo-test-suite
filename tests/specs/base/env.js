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
        run: (runtime) => ({
          raw: (runtime && typeof runtime.env !== 'undefined') ? runtime.env : null
        }),
        expect: {
          raw: {
            USER_DATA_PATH: '@string'
          }
        }
      },
      {
        id: 'migo.env.user_data_path_contract',
        name: '校验 USER_DATA_PATH 合约',
        description: '校验 env.USER_DATA_PATH 存在、类型正确且非空字符串',
        type: 'sync',
        run: (runtime) => {
          const env = runtime && runtime.env;
          const userDataPath = env && env.USER_DATA_PATH;
          return {
            raw: typeof env === 'undefined' ? null : env,
            hasEnvObject: !!env && typeof env === 'object',
            hasUserDataPath: typeof userDataPath !== 'undefined',
            userDataPathIsString: typeof userDataPath === 'string',
            userDataPathNonEmpty: typeof userDataPath === 'string' && userDataPath.length > 0
          };
        },
        expect: {
          hasEnvObject: true,
          hasUserDataPath: true,
          userDataPathIsString: true,
          userDataPathNonEmpty: true
        }
      }
    ]
  }
];
