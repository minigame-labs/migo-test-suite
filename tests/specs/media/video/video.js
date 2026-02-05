export default [
    {
        name: 'Video',
        category: 'media',
        tests: [
            {
                id: 'media.video.create',
                name: '创建 Video',
                description: '验证 createVideo 接口',
                type: 'sync',
                run: (runtime) => {
                    const exists = typeof runtime.createVideo === 'function';
                    if (!exists) return { exists: false };
                    
                    const video = runtime.createVideo({
                        x: 0, y: 0, width: 300, height: 150
                    });
                    
                    const res = {
                        exists: true,
                        isObject: typeof video === 'object' && video !== null
                    };
                    
                    try { video.destroy(); } catch(e) {}
                    return res;
                },
                expect: {
                    exists: true,
                    isObject: true
                }
            },
            {
                id: 'media.video.methods',
                name: 'Video 方法',
                description: '验证 Video 实例方法',
                type: 'sync',
                run: (runtime) => {
                    if (typeof runtime.createVideo !== 'function') return { apiNotFound: true };
                    const video = runtime.createVideo();
                    
                    const res = {
                        hasPlay: typeof video.play === 'function',
                        hasPause: typeof video.pause === 'function',
                        hasStop: typeof video.stop === 'function',
                        hasSeek: typeof video.seek === 'function',
                        hasRequestFullScreen: typeof video.requestFullScreen === 'function',
                        hasExitFullScreen: typeof video.exitFullScreen === 'function',
                        hasDestroy: typeof video.destroy === 'function'
                    };
                    
                    try { video.destroy(); } catch(e) {}
                    return res;
                },
                expect: {
                    hasPlay: true,
                    hasPause: true,
                    hasStop: true,
                    hasSeek: true,
                    hasRequestFullScreen: true,
                    hasExitFullScreen: true,
                    hasDestroy: true
                }
            },
            {
                id: 'media.video.events',
                name: 'Video 事件监听',
                description: '验证 Video 事件监听方法 (on/off)',
                type: 'sync',
                run: (runtime) => {
                    if (typeof runtime.createVideo !== 'function') return { apiNotFound: true };
                    const video = runtime.createVideo();
                    
                    const events = [
                        'Play', 'Pause', 'Ended', 'Error', 
                        'TimeUpdate', 'Waiting', 'Progress'
                    ];
                    
                    const res = {};
                    events.forEach(evt => {
                        res[`hasOn${evt}`] = typeof video[`on${evt}`] === 'function';
                        res[`hasOff${evt}`] = typeof video[`off${evt}`] === 'function';
                    });
                    
                    try { video.destroy(); } catch(e) {}
                    return res;
                },
                expect: {
                    hasOnPlay: true, hasOffPlay: true,
                    hasOnPause: true, hasOffPause: true,
                    hasOnEnded: true, hasOffEnded: true,
                    hasOnError: true, hasOffError: true,
                    hasOnTimeUpdate: true, hasOffTimeUpdate: true,
                    hasOnWaiting: true, hasOffWaiting: true,
                    hasOnProgress: true, hasOffProgress: true
                }
            },
            {
                id: 'media.video.choose',
                name: 'wx.chooseMedia',
                description: '验证 chooseMedia 接口存在',
                type: 'sync',
                run: (runtime) => ({
                    exists: typeof runtime.chooseMedia === 'function'
                }),
                expect: {
                    exists: true
                }
            },
            {
                id: 'media.video.options',
                name: '创建参数 (autoplay/muted/loop)',
                description: '创建 Video 并设置参数，需人工观察行为',
                type: 'async',
                timeout: 3000,
                run: (runtime, done) => {
                    if (typeof runtime.createVideo !== 'function') {
                        done({ apiNotFound: true });
                        return;
                    }
                    const video = runtime.createVideo({
                        x: 10, y: 10, width: 320, height: 180,
                        src: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
                        autoplay: true,
                        muted: true,
                        loop: true
                    });
                    setTimeout(() => {
                        const res = {
                            created: !!video,
                            autoplaySet: video.autoplay === true,
                            mutedSet: video.muted === true,
                            loopSet: video.loop === true,
                            manualRequired: true,
                            note: '请观察自动播放、静音与循环是否生效'
                        };
                        try { video.destroy(); } catch(e) {}
                        done(res);
                    }, 2000);
                },
                expect: {
                    created: true,
                    autoplaySet: true,
                    mutedSet: true,
                    loopSet: true
                }
            },
            {
                id: 'media.video.seek',
                name: 'seek 参数',
                description: '调用 seek 到指定时间，需人工观察跳转',
                type: 'async',
                timeout: 3000,
                run: (runtime, done) => {
                    const video = runtime.createVideo({
                        x: 10, y: 200, width: 320, height: 180,
                        src: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
                        autoplay: true,
                        muted: true
                    });
                    let timeObserved = 0;
                    video.onTimeUpdate((e) => {
                        if (typeof video.currentTime === 'number') timeObserved = video.currentTime;
                    });
                    setTimeout(() => {
                        try { video.seek(2); } catch(e) {}
                    }, 800);
                    setTimeout(() => {
                        const res = {
                            seekCalled: true,
                            currentTimeObserved: timeObserved,
                            manualRequired: true,
                            note: '请观察是否跳转到约2秒位置'
                        };
                        try { video.destroy(); } catch(e) {}
                        done(res);
                    }, 2000);
                },
                expect: {
                    seekCalled: true
                }
            },
            {
                id: 'media.video.fullscreen',
                name: '全屏参数',
                description: '请求全屏并退出，需人工观察方向与状态',
                type: 'async',
                timeout: 4000,
                run: (runtime, done) => {
                    const video = runtime.createVideo({
                        x: 10, y: 400, width: 320, height: 180,
                        src: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
                        muted: true
                    });
                    try { video.requestFullScreen({ direction: 0 }); } catch(e) {}
                    setTimeout(() => {
                        try { video.exitFullScreen(); } catch(e) {}
                        const res = {
                            requested: true,
                            exited: true,
                            manualRequired: true,
                            note: '请观察进入/退出全屏是否正常'
                        };
                        try { video.destroy(); } catch(e) {}
                        done(res);
                    }, 2000);
                },
                expect: {
                    requested: true,
                    exited: true
                }
            }
        ]
    }
];
