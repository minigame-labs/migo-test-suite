export default [
    {
        name: 'VoIP Chat',
        category: 'media',
        tests: [
            {
                id: 'media.voip.methods',
                name: 'VoIP 基础接口',
                description: '验证 VoIP 相关接口存在性',
                type: 'sync',
                run: (runtime) => ({
                    hasJoin: typeof runtime.joinVoIPChat === 'function',
                    hasExit: typeof runtime.exitVoIPChat === 'function',
                    hasUpdateMute: typeof runtime.updateVoIPChatMuteConfig === 'function'
                }),
                expect: {
                    hasJoin: true,
                    hasExit: true,
                    hasUpdateMute: true
                }
            },
            {
                id: 'media.voip.events',
                name: 'VoIP 事件监听',
                description: '验证 VoIP 事件监听方法 (on/off)',
                type: 'sync',
                run: (runtime) => {
                    const events = [
                        'VoIPChatStateChanged',
                        'VoIPChatInterrupted',
                        'VoIPChatMembersChanged',
                        'VoIPChatSpeakersChanged'
                    ];
                    
                    const res = {};
                    events.forEach(evt => {
                        res[`hasOn${evt}`] = typeof runtime[`on${evt}`] === 'function';
                        res[`hasOff${evt}`] = typeof runtime[`off${evt}`] === 'function';
                    });
                    
                    return res;
                },
                expect: {
                    hasOnVoIPChatStateChanged: true, hasOffVoIPChatStateChanged: true,
                    hasOnVoIPChatInterrupted: true, hasOffVoIPChatInterrupted: true,
                    hasOnVoIPChatMembersChanged: true, hasOffVoIPChatMembersChanged: true,
                    hasOnVoIPChatSpeakersChanged: true, hasOffVoIPChatSpeakersChanged: true
                }
            }
        ]
    }
];
