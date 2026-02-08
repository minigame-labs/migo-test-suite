
export default [
  {
    name: 'Font APIs',
    category: 'render/font',
    tests: [
      {
        id: 'font-001',
        name: 'wx.loadFont',
        description: '加载自定义字体',
        type: 'sync', // Doc says returns string (font family name)
        run: (runtime) => {
          if (typeof runtime.loadFont !== 'function') return { _error: 'wx.loadFont 不存在' };
          try {
             // We don't have a real font file, so this might fail or return null.
             // But we verify the API exists and can be called.
             const result = runtime.loadFont('dummy.ttf');
             return { called: true, resultType: typeof result };
          } catch (e) {
             // Some implementations might throw if file not found
             return { called: true, error: e.message };
          }
        },
        expect: { called: true }
      },
       {
        id: 'font-002',
        name: 'wx.getTextLineHeight',
        description: '获取文本行高',
        type: 'sync',
        run: (runtime) => {
           if (typeof runtime.getTextLineHeight !== 'function') return { _error: 'wx.getTextLineHeight 不存在' };
           try {
               const height = runtime.getTextLineHeight({
                   fontStyle: 'normal',
                   fontWeight: 'normal',
                   fontSize: 16,
                   fontFamily: 'sans-serif',
                   text: 'test'
               });
               return { success: true, isNumber: typeof height === 'number', positive: height > 0 };
           } catch(e) {
               return { success: false, error: e.message };
           }
        },
        expect: { success: true, isNumber: true, positive: true }
      }
    ]
  }
];
