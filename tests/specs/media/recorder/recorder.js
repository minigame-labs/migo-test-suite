export default [
    {
        name: 'migo.getRecorderManager',
        category: 'recorder',
        tests: [
            {
                id: 'recorder.get',
                name: '获取 RecorderManager',
                description: '验证 getRecorderManager 接口',
                type: 'sync',
                run: (runtime) => ({
                    exists: typeof runtime.getRecorderManager === 'function'
                }),
                expect: {
                    exists: true
                }
            },
            {
                id: 'recorder.methods',
                name: 'RecorderManager 方法',
                description: '验证 RecorderManager 包含必要方法',
                type: 'sync',
                run: (runtime) => {
                    if (typeof runtime.getRecorderManager !== 'function') return { apiNotFound: true };
                    const recorder = runtime.getRecorderManager();
                    
                    return {
                        hasStart: typeof recorder.start === 'function',
                        hasPause: typeof recorder.pause === 'function',
                        hasResume: typeof recorder.resume === 'function',
                        hasStop: typeof recorder.stop === 'function',
                        hasOnStart: typeof recorder.onStart === 'function',
                        hasOnStop: typeof recorder.onStop === 'function',
                        hasOnPause: typeof recorder.onPause === 'function',
                        hasOnResume: typeof recorder.onResume === 'function',
                        hasOnFrameRecorded: typeof recorder.onFrameRecorded === 'function',
                        hasOnError: typeof recorder.onError === 'function',
                        hasOnInterruptionBegin: typeof recorder.onInterruptionBegin === 'function',
                        hasOnInterruptionEnd: typeof recorder.onInterruptionEnd === 'function'
                    };
                },
                expect: {
                    hasStart: true,
                    hasPause: true,
                    hasResume: true,
                    hasStop: true,
                    hasOnStart: true,
                    hasOnStop: true,
                    hasOnPause: true,
                    hasOnResume: true,
                    hasOnFrameRecorded: true,
                    hasOnError: true,
                    hasOnInterruptionBegin: true,
                    hasOnInterruptionEnd: true
                }
            }
        ]
    }
];
