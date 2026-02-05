export default [
    {
        name: 'migo.createMediaAudioPlayer',
        category: 'audio',
        tests: [
            {
                id: 'audio.player.create',
                name: '创建 MediaAudioPlayer',
                description: '验证 createMediaAudioPlayer 接口',
                type: 'sync',
                run: (runtime) => ({
                    exists: typeof runtime.createMediaAudioPlayer === 'function'
                }),
                expect: {
                    exists: true
                }
            },
            {
                id: 'audio.player.methods',
                name: 'MediaAudioPlayer 方法',
                description: '验证 MediaAudioPlayer 包含必要方法',
                type: 'sync',
                run: (runtime) => {
                    if (typeof runtime.createMediaAudioPlayer !== 'function') return { apiNotFound: true };
                    const player = runtime.createMediaAudioPlayer();
                    
                    const res = {
                        hasStart: typeof player.start === 'function',
                        hasStop: typeof player.stop === 'function',
                        hasDestroy: typeof player.destroy === 'function',
                        hasAddSource: typeof player.addAudioSource === 'function',
                        hasRemoveSource: typeof player.removeAudioSource === 'function',
                        hasVolume: 'volume' in player
                    };
                    
                    try { player.destroy(); } catch(e) {}
                    return res;
                },
                expect: {
                    hasStart: true,
                    hasStop: true,
                    hasDestroy: true,
                    hasAddSource: true,
                    hasRemoveSource: true,
                    hasVolume: true
                }
            }
        ]
    }
];
