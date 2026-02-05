export default [
    {
        name: 'migo.createWebAudioContext',
        category: 'audio',
        tests: [
            {
                id: 'audio.web.create',
                name: '创建 WebAudioContext',
                description: '验证 createWebAudioContext 接口',
                type: 'sync',
                run: (runtime) => ({
                    exists: typeof runtime.createWebAudioContext === 'function',
                    context: runtime.createWebAudioContext ? !!runtime.createWebAudioContext() : false
                }),
                expect: {
                    exists: true,
                    context: true
                }
            },
            {
                id: 'audio.web.methods',
                name: 'WebAudioContext 方法',
                description: '验证 WebAudioContext 包含必要方法',
                type: 'sync',
                run: (runtime) => {
                    if (typeof runtime.createWebAudioContext !== 'function') return { apiNotFound: true };
                    const ctx = runtime.createWebAudioContext();
                    return {
                        createBuffer: typeof ctx.createBuffer === 'function',
                        createBufferSource: typeof ctx.createBufferSource === 'function',
                        createGain: typeof ctx.createGain === 'function',
                        createAnalyser: typeof ctx.createAnalyser === 'function',
                        createBiquadFilter: typeof ctx.createBiquadFilter === 'function',
                        createChannelMerger: typeof ctx.createChannelMerger === 'function',
                        createChannelSplitter: typeof ctx.createChannelSplitter === 'function',
                        createConstantSource: typeof ctx.createConstantSource === 'function',
                        createDelay: typeof ctx.createDelay === 'function',
                        createDynamicsCompressor: typeof ctx.createDynamicsCompressor === 'function',
                        createIIRFilter: typeof ctx.createIIRFilter === 'function',
                        createOscillator: typeof ctx.createOscillator === 'function',
                        createPanner: typeof ctx.createPanner === 'function',
                        createPeriodicWave: typeof ctx.createPeriodicWave === 'function',
                        createScriptProcessor: typeof ctx.createScriptProcessor === 'function',
                        createWaveShaper: typeof ctx.createWaveShaper === 'function',
                        decodeAudioData: typeof ctx.decodeAudioData === 'function',
                        resume: typeof ctx.resume === 'function',
                        suspend: typeof ctx.suspend === 'function',
                        close: typeof ctx.close === 'function'
                    };
                },
                expect: {
                    createBuffer: true,
                    createBufferSource: true,
                    createGain: true,
                    createAnalyser: true,
                    createBiquadFilter: true,
                    createChannelMerger: true,
                    createChannelSplitter: true,
                    createConstantSource: true,
                    createDelay: true,
                    createDynamicsCompressor: true,
                    createIIRFilter: true,
                    createOscillator: true,
                    createPanner: true,
                    createPeriodicWave: true,
                    createScriptProcessor: true,
                    createWaveShaper: true,
                    decodeAudioData: true,
                    resume: true,
                    suspend: true,
                    close: true
                }
            }
        ]
    },
    {
        name: 'AudioBuffer',
        category: 'audio',
        tests: [
            {
                id: 'audio.buffer.methods',
                name: 'AudioBuffer 方法',
                description: '验证 AudioBuffer 接口 (copyFromChannel, copyToChannel, getChannelData)',
                type: 'sync',
                run: (runtime) => {
                    if (typeof runtime.createWebAudioContext !== 'function') return { apiNotFound: true };
                    const ctx = runtime.createWebAudioContext();
                    // Create a buffer: 2 channels, 100 frames, 44100Hz
                    const buffer = ctx.createBuffer(2, 100, 44100);
                    
                    return {
                        hasCopyFrom: typeof buffer.copyFromChannel === 'function',
                        hasCopyTo: typeof buffer.copyToChannel === 'function',
                        hasGetData: typeof buffer.getChannelData === 'function',
                        channels: buffer.numberOfChannels,
                        length: buffer.length,
                        sampleRate: buffer.sampleRate
                    };
                },
                expect: {
                    hasCopyFrom: true,
                    hasCopyTo: true,
                    hasGetData: true,
                    channels: 2,
                    length: 100,
                    sampleRate: 44100
                }
            },
            {
                id: 'audio.buffer.data',
                name: 'AudioBuffer 数据操作',
                description: '验证 AudioBuffer 数据读写',
                type: 'sync',
                run: (runtime) => {
                    const ctx = runtime.createWebAudioContext();
                    const buffer = ctx.createBuffer(1, 10, 44100);
                    
                    // Test copyToChannel
                    const input = new Float32Array([0.1, 0.2, 0.3, 0.4, 0.5]);
                    buffer.copyToChannel(input, 0, 0);
                    
                    // Test getChannelData
                    const channelData = buffer.getChannelData(0);
                    
                    // Test copyFromChannel
                    const output = new Float32Array(5);
                    buffer.copyFromChannel(output, 0, 0);
                    
                    return {
                        writeSuccess: channelData[0] > 0.09 && channelData[0] < 0.11, // float precision
                        readSuccess: output[0] > 0.09 && output[0] < 0.11
                    };
                },
                expect: {
                    writeSuccess: true,
                    readSuccess: true
                }
            }
        ]
    },
    {
        name: 'BufferSourceNode',
        category: 'audio',
        tests: [
            {
                id: 'audio.source.methods',
                name: 'BufferSourceNode 方法',
                description: '验证 BufferSourceNode 接口 (start, stop, connect, disconnect)',
                type: 'sync',
                run: (runtime) => {
                    const ctx = runtime.createWebAudioContext();
                    const source = ctx.createBufferSource();
                    
                    return {
                        hasStart: typeof source.start === 'function',
                        hasStop: typeof source.stop === 'function',
                        hasConnect: typeof source.connect === 'function',
                        hasDisconnect: typeof source.disconnect === 'function',
                        hasBuffer: 'buffer' in source,
                        hasLoop: 'loop' in source,
                        hasOnEnded: 'onended' in source
                    };
                },
                expect: {
                    hasStart: true,
                    hasStop: true,
                    hasConnect: true,
                    hasDisconnect: true,
                    hasBuffer: true,
                    hasLoop: true,
                    hasOnEnded: true
                }
            },
            {
                id: 'audio.source.start.params',
                name: 'start 参数 (offset/duration)',
                description: '调用 start(when, offset, duration)，需人工观察裁剪播放',
                type: 'audio',
                timeout: 3000,
                run: (runtime, onSuccess, onError) => {
                    const ctx = runtime.createWebAudioContext();
                    const source = ctx.createBufferSource();
                    const buffer = ctx.createBuffer(1, 44100, 44100);
                    const data = buffer.getChannelData(0);
                    for (let i = 0; i < data.length; i++) data[i] = Math.sin(2 * Math.PI * i / 100);
                    source.buffer = buffer;
                    source.connect(ctx.destination);
                    const offset = 0.5;
                    const duration = 0.8;
                    try {
                        source.start(0, offset, duration);
                    } catch (e) {
                        onError(e.message || e);
                        return;
                    }
                    setTimeout(() => {
                        try { source.stop(); } catch(e) {}
                        onSuccess({
                            offsetSet: offset,
                            durationSet: duration,
                            manualRequired: true,
                            note: '请观察是否从约0.5s开始播放并持续约0.8s'
                        });
                    }, 1500);
                },
                expect: {
                    offsetSet: 0.5,
                    durationSet: 0.8
                },
                allowVariance: ['manualRequired', 'note']
            },
            {
                id: 'audio.source.loop.params',
                name: 'loop 参数 (loopStart/loopEnd)',
                description: '设置 loop=true, loopStart/loopEnd，需人工观察循环段',
                type: 'audio',
                timeout: 3000,
                run: (runtime, onSuccess, onError) => {
                    const ctx = runtime.createWebAudioContext();
                    const source = ctx.createBufferSource();
                    const buffer = ctx.createBuffer(1, 44100, 44100);
                    const data = buffer.getChannelData(0);
                    for (let i = 0; i < data.length; i++) data[i] = Math.sin(2 * Math.PI * i / 100);
                    source.buffer = buffer;
                    source.loop = true;
                    source.loopStart = 0.2;
                    source.loopEnd = 0.5;
                    source.connect(ctx.destination);
                    try { source.start(0); } catch(e) { onError(e.message || e); return; }
                    setTimeout(() => {
                        try { source.stop(); } catch(e) {}
                        onSuccess({
                            loopSet: source.loop === true,
                            loopStartSet: source.loopStart,
                            loopEndSet: source.loopEnd,
                            manualRequired: true,
                            note: '请观察是否在0.2s-0.5s区间循环'
                        });
                    }, 1500);
                },
                expect: {
                    loopSet: true
                },
                allowVariance: ['loopStartSet', 'loopEndSet', 'manualRequired', 'note']
            },
            {
                id: 'audio.source.playbackRate',
                name: 'playbackRate 参数',
                description: '设置 playbackRate.value，需人工观察速度/音高变化',
                type: 'audio',
                timeout: 3000,
                run: (runtime, onSuccess, onError) => {
                    const ctx = runtime.createWebAudioContext();
                    const source = ctx.createBufferSource();
                    const buffer = ctx.createBuffer(1, 44100, 44100);
                    const data = buffer.getChannelData(0);
                    for (let i = 0; i < data.length; i++) data[i] = Math.sin(2 * Math.PI * i / 100);
                    source.buffer = buffer;
                    source.playbackRate.value = 1.5;
                    source.connect(ctx.destination);
                    try { source.start(0); } catch(e) { onError(e.message || e); return; }
                    setTimeout(() => {
                        try { source.stop(); } catch(e) {}
                        onSuccess({
                            playbackRateSet: source.playbackRate.value,
                            manualRequired: true,
                            note: '请观察是否加速播放/音高升高'
                        });
                    }, 1500);
                },
                expect: {
                    playbackRateSet: 1.5
                },
                allowVariance: ['manualRequired', 'note']
            }
        ]
    },
    {
        name: 'AudioListener',
        category: 'audio',
        tests: [
            {
                id: 'audio.listener.methods',
                name: 'AudioListener 属性与方法',
                description: '验证 AudioListener 接口',
                type: 'sync',
                run: (runtime) => {
                    const ctx = runtime.createWebAudioContext();
                    const listener = ctx.listener;
                    
                    return {
                        hasSetPos: typeof listener.setPosition === 'function',
                        hasSetOri: typeof listener.setOrientation === 'function',
                        // Check some properties (implementation dependent if they are enumerable)
                        // But we can check if we can access them or they exist on prototype
                        validObject: !!listener
                    };
                },
                expect: {
                    hasSetPos: true,
                    hasSetOri: true,
                    validObject: true
                }
            }
        ]
    },
    {
        name: 'AudioParam',
        category: 'audio',
        tests: [
            {
                id: 'audio.param.methods',
                name: 'AudioParam 属性与方法',
                description: '验证 AudioParam 接口 (value, setValueAtTime, linearRampToValueAtTime, etc)',
                type: 'sync',
                run: (runtime) => {
                    const ctx = runtime.createWebAudioContext();
                    const gainNode = ctx.createGain();
                    const param = gainNode.gain;
                    
                    return {
                        hasValue: 'value' in param,
                        hasSetValueAtTime: typeof param.setValueAtTime === 'function',
                        hasLinearRamp: typeof param.linearRampToValueAtTime === 'function',
                        hasExponentialRamp: typeof param.exponentialRampToValueAtTime === 'function',
                        hasSetTarget: typeof param.setTargetAtTime === 'function',
                        hasSetValueCurve: typeof param.setValueCurveAtTime === 'function',
                        hasCancelScheduled: typeof param.cancelScheduledValues === 'function'
                    };
                },
                expect: {
                    hasValue: true,
                    hasSetValueAtTime: true,
                    hasLinearRamp: true,
                    hasExponentialRamp: true,
                    hasSetTarget: true,
                    hasSetValueCurve: true,
                    hasCancelScheduled: true
                }
            }
        ]
    }
];
