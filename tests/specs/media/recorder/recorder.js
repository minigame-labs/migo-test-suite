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
            },
            {
                id: 'recorder.lifecycle',
                name: '录音生命周期测试',
                description: '验证 Start -> Stop 流程及 tempFilePath',
                type: 'async',
                run: (runtime, callback) => {
                    const recorder = runtime.getRecorderManager();
                    let hasStarted = false;
                    
                    console.log('[Recorder] 开始录音生命周期测试...');

                    const onStart = () => {
                        console.log('[Recorder] onStart 触发');
                        hasStarted = true;
                        // 录音 2 秒后停止
                        setTimeout(() => {
                            console.log('[Recorder] 调用 stop()');
                            recorder.stop();
                        }, 2000);
                    };

                    const onStop = (res) => {
                        console.log('[Recorder] onStop 触发', res);
                        if (!hasStarted) {
                            return callback({ success: false, error: 'onStop triggered before onStart' });
                        }
                        if (res && res.tempFilePath) {
                             console.log('[Recorder] 录音文件路径:', res.tempFilePath);
                             console.log('[Recorder] 录音时长:', res.duration);
                             console.log('[Recorder] 文件大小:', res.fileSize);
                             callback({ 
                                 success: true, 
                                 hasTempFilePath: true,
                                 duration: res.duration
                             });
                        } else {
                            callback({ success: false, error: 'No tempFilePath in onStop' });
                        }
                    };

                    const onError = (err) => {
                        console.error('[Recorder] onError 触发', err);
                        callback({ success: false, error: err.errMsg || JSON.stringify(err) });
                    };

                    recorder.onStart(onStart);
                    recorder.onStop(onStop);
                    recorder.onError(onError);

                    const options = {
                        duration: 10000, // 最长 10s
                        sampleRate: 44100,
                        numberOfChannels: 1,
                        encodeBitRate: 192000,
                        format: 'aac'
                    };
                    
                    console.log('[Recorder] 调用 start()', options);
                    try {
                        recorder.start(options);
                    } catch (e) {
                         console.error('[Recorder] start() 异常', e);
                         callback({ success: false, error: e.message });
                    }
                },
                expect: {
                    success: true,
                    hasTempFilePath: true,
                    duration: '@number'
                },
                allowVariance: ['duration']
            },
            {
                id: 'recorder.pauseResumeFrame',
                name: '录音暂停/恢复与分片',
                description: '验证 Pause -> Resume -> FrameRecorded 流程',
                type: 'async',
                run: (runtime, callback) => {
                    const recorder = runtime.getRecorderManager();
                    let state = 'init'; // init -> started -> paused -> resumed -> stopped
                    let frameCount = 0;
                    
                    console.log('[Recorder] 开始暂停/恢复/分片测试...');

                    const onStart = () => {
                        console.log('[Recorder] onStart 触发');
                        state = 'started';
                        
                        setTimeout(() => {
                            console.log('[Recorder] 调用 pause()');
                            recorder.pause();
                        }, 5000);
                    };

                    const onPause = () => {
                        console.log('[Recorder] onPause 触发');
                        if (state !== 'started') {
                             return callback({ success: false, error: `onPause unexpected state: ${state}` });
                        }
                        state = 'paused';
                        
                        setTimeout(() => {
                            console.log('[Recorder] 调用 resume()');
                            recorder.resume();
                        }, 5000);
                    };

                    const onResume = () => {
                        console.log('[Recorder] onResume 触发');
                        if (state !== 'paused') {
                            return callback({ success: false, error: `onResume unexpected state: ${state}` });
                        }
                        state = 'resumed';
                        
                        // 再录一会儿然后停止
                        setTimeout(() => {
                            console.log('[Recorder] 调用 stop()');
                            recorder.stop();
                        }, 5000);
                    };
                    
                    const onFrameRecorded = (res) => {
                         // 不要在分片回调里做太多耗时操作，避免阻塞
                         // console.log('[Recorder] onFrameRecorded', res.byteLength); 
                         frameCount++;
                         if (frameCount === 1) {
                             console.log('[Recorder] 收到第一个分片数据, size:', res.frameBuffer.byteLength, 'isLastFrame:', res.isLastFrame);
                         }
                    };

                    const onStop = (res) => {
                        console.log('[Recorder] onStop 触发, frameCount:', frameCount);
                        state = 'stopped';
                        callback({ 
                            success: true, 
                            hasFrames: frameCount > 0,
                            finalState: state
                        });
                    };

                    const onError = (err) => {
                        console.error('[Recorder] onError 触发', err);
                        callback({ success: false, error: err.errMsg || JSON.stringify(err) });
                    };

                    recorder.onStart(onStart);
                    recorder.onPause(onPause);
                    recorder.onResume(onResume);
                    recorder.onFrameRecorded(onFrameRecorded);
                    recorder.onStop(onStop);
                    recorder.onError(onError);

                    // 设置 frameSize 以触发 onFrameRecorded
                    const options = {
                        duration: 60000,
                        sampleRate: 44100,
                        numberOfChannels: 1,
                        encodeBitRate: 96000,
                        format: 'aac',
                        frameSize: 10 // 10KB 触发一次分片
                    };
                    
                    console.log('[Recorder] 调用 start() with frameSize=10KB');
                    try {
                        recorder.start(options);
                    } catch (e) {
                         console.error('[Recorder] start() 异常', e);
                         callback({ success: false, error: e.message });
                    }
                },
                expect: {
                    success: true,
                    hasFrames: true,
                    finalState: 'stopped'
                }
            }
        ]
    }
];
