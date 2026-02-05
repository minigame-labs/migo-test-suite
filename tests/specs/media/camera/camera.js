export default [
    {
        name: 'migo.createCamera',
        category: 'camera',
        tests: [
            {
                id: 'camera.create',
                name: '创建 Camera',
                description: '验证 createCamera 接口',
                type: 'sync',
                run: (runtime) => ({
                    exists: typeof runtime.createCamera === 'function'
                }),
                expect: {
                    exists: true
                }
            },
            {
                id: 'camera.methods',
                name: 'Camera 方法',
                description: '验证 Camera 包含必要方法',
                type: 'sync',
                run: (runtime) => {
                    if (typeof runtime.createCamera !== 'function') return { apiNotFound: true };
                    const camera = runtime.createCamera();
                    
                    const res = {
                        hasTakePhoto: typeof camera.takePhoto === 'function',
                        hasStartRecord: typeof camera.startRecord === 'function',
                        hasStopRecord: typeof camera.stopRecord === 'function',
                        hasOnCameraFrame: typeof camera.onCameraFrame === 'function',
                        hasSetZoom: typeof camera.setZoom === 'function',
                        hasDestroy: typeof camera.destroy === 'function',
                        hasOnAuthCancel: typeof camera.onAuthCancel === 'function',
                        hasOnStop: typeof camera.onStop === 'function',
                        hasOnError: typeof camera.onError === 'function'
                    };
                    
                    try { camera.destroy(); } catch(e) {}
                    return res;
                },
                expect: {
                    hasTakePhoto: true,
                    hasStartRecord: true,
                    hasStopRecord: true,
                    hasOnCameraFrame: true,
                    hasSetZoom: true,
                    hasDestroy: true,
                    hasOnAuthCancel: true,
                    hasOnStop: true,
                    hasOnError: true
                }
            }
        ]
    }
];
