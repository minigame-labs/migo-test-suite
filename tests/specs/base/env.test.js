/**
 * migo.env API 测试
 */
export default {
  name: 'migo.env',
  category: 'base',

  tests: [
    {
      id: 'env-001',
      name: 'migo.env should exist',
      run: () => ({
        exists: typeof migo.env === 'object',
        notNull: migo.env !== null
      }),
      expect: {
        exists: true,
        notNull: true
      }
    },

    {
      id: 'env-002',
      name: 'migo.env.USER_DATA_PATH should be string',
      run: () => ({
        type: typeof migo.env.USER_DATA_PATH,
        notEmpty: migo.env.USER_DATA_PATH && migo.env.USER_DATA_PATH.length > 0
      }),
      expect: {
        type: 'string',
        notEmpty: true
      }
    },

    {
      id: 'env-003',
      name: 'migo.env.USER_DATA_PATH should be valid path',
      run: () => {
        const path = migo.env.USER_DATA_PATH;
        return {
          isValidFormat: path.startsWith('/') || path.startsWith('file://'),
          containsUserData: path.includes('usr') || path.includes('files')
        };
      },
      expect: {
        isValidFormat: true,
        containsUserData: true
      },
      // 允许的差异 - 路径格式可以不同
      allowVariance: ['containsUserData']
    }
  ]
};
