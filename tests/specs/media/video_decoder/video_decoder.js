export default [
    {
        name: 'migo.createVideoDecoder',
        category: 'media',
        tests: [
            {
                id: 'media.videodecoder.create',
                name: '创建 VideoDecoder',
                description: '验证 createVideoDecoder 接口',
                type: 'sync',
                run: (runtime) => {
                    const exists = typeof runtime.createVideoDecoder === 'function';
                    if (!exists) return { exists: false };
                    
                    const decoder = runtime.createVideoDecoder();
                    return {
                        exists: true,
                        isObject: typeof decoder === 'object' && decoder !== null
                    };
                },
                expect: {
                    exists: true,
                    isObject: true
                }
            },
            {
                id: 'media.videodecoder.methods',
                name: 'VideoDecoder 方法',
                description: '验证 VideoDecoder 包含必要方法',
                type: 'sync',
                run: (runtime) => {
                    if (typeof runtime.createVideoDecoder !== 'function') return { apiNotFound: true };
                    const decoder = runtime.createVideoDecoder();
                    
                    const res = {
                        hasStart: typeof decoder.start === 'function',
                        hasStop: typeof decoder.stop === 'function',
                        hasSeek: typeof decoder.seek === 'function',
                        hasRemove: typeof decoder.remove === 'function',
                        hasGetFrameData: typeof decoder.getFrameData === 'function',
                        hasOn: typeof decoder.on === 'function',
                        hasOff: typeof decoder.off === 'function'
                    };
                    
                    // Cleanup if possible (though remove is async usually)
                    try { decoder.remove(); } catch(e) {}
                    
                    return res;
                },
                expect: {
                    hasStart: true,
                    hasStop: true,
                    hasSeek: true,
                    hasRemove: true,
                    hasGetFrameData: true,
                    hasOn: true,
                    hasOff: true
                }
            }
        ]
    }
];
