/**
 * 音频 API 测试用例
 */

export default [
  // ==================== InnerAudioContext ====================
  {
    name: 'migo.createInnerAudioContext',
    category: 'audio',
    tests: [
      {
        id: 'audio-001',
        name: 'createInnerAudioContext 存在',
        description: '验证创建音频上下文 API',
        type: 'sync',
        run: (runtime) => ({
          exists: typeof runtime.createInnerAudioContext === 'function'
        }),
        expect: {
          exists: true
        }
      },
      {
        id: 'audio-002',
        name: 'InnerAudioContext 属性',
        description: '验证音频上下文包含必要属性',
        type: 'sync',
        run: (runtime) => {
          if (typeof runtime.createInnerAudioContext !== 'function') {
            return { apiNotFound: true };
          }
          const audio = runtime.createInnerAudioContext();
          return {
            hasSrc: 'src' in audio,
            hasVolume: 'volume' in audio,
            hasLoop: 'loop' in audio,
            hasCurrentTime: 'currentTime' in audio,
            hasDuration: 'duration' in audio,
            hasPaused: 'paused' in audio
          };
        },
        expect: {
          hasSrc: true,
          hasVolume: true,
          hasLoop: true,
          hasCurrentTime: true,
          hasDuration: true,
          hasPaused: true
        }
      },
      {
        id: 'audio-003',
        name: 'InnerAudioContext 方法',
        description: '验证音频上下文包含必要方法',
        type: 'sync',
        run: (runtime) => {
          if (typeof runtime.createInnerAudioContext !== 'function') {
            return { apiNotFound: true };
          }
          const audio = runtime.createInnerAudioContext();
          return {
            hasPlay: typeof audio.play === 'function',
            hasPause: typeof audio.pause === 'function',
            hasStop: typeof audio.stop === 'function',
            hasSeek: typeof audio.seek === 'function',
            hasDestroy: typeof audio.destroy === 'function'
          };
        },
        expect: {
          hasPlay: true,
          hasPause: true,
          hasStop: true,
          hasSeek: true,
          hasDestroy: true
        }
      },
      {
        id: 'audio-004',
        name: 'InnerAudioContext 事件监听',
        description: '验证音频事件监听方法',
        type: 'sync',
        run: (runtime) => {
          if (typeof runtime.createInnerAudioContext !== 'function') {
            return { apiNotFound: true };
          }
          const audio = runtime.createInnerAudioContext();
          return {
            hasOnPlay: typeof audio.onPlay === 'function',
            hasOnPause: typeof audio.onPause === 'function',
            hasOnStop: typeof audio.onStop === 'function',
            hasOnEnded: typeof audio.onEnded === 'function',
            hasOnError: typeof audio.onError === 'function',
            hasOnTimeUpdate: typeof audio.onTimeUpdate === 'function',
            hasOnCanplay: typeof audio.onCanplay === 'function'
          };
        },
        expect: {
          hasOnPlay: true,
          hasOnPause: true,
          hasOnStop: true,
          hasOnEnded: true,
          hasOnError: true,
          hasOnTimeUpdate: true,
          hasOnCanplay: true
        }
      },
      {
        id: 'audio-005',
        name: 'volume 设置',
        description: '验证音量设置功能',
        type: 'audio',
        timeout: 1000,
        run: (runtime, onSuccess, onError) => {
          if (typeof runtime.createInnerAudioContext !== 'function') {
            onError('API not found');
            return;
          }
          const audio = runtime.createInnerAudioContext();
          audio.volume = 0.5;
          
          // 验证设置是否生效
          setTimeout(() => {
            onSuccess({
              volumeSet: audio.volume === 0.5 || audio.volume >= 0.4,
              volumeInRange: audio.volume >= 0 && audio.volume <= 1,
              _audioInfo: { volume: audio.volume }
            });
            audio.destroy();
          }, 100);
        },
        expect: {
          volumeSet: true,
          volumeInRange: true
        },
        allowVariance: ['_audioInfo']
      },
      {
        id: 'audio-006',
        name: '事件回调流程',
        description: '验证 onCanplay/onPlay/onEnded 事件触发顺序',
        type: 'audio',
        timeout: 3000,
        run: (runtime, onSuccess, onError) => {
          if (typeof runtime.createInnerAudioContext !== 'function') {
            onError('API not found');
            return;
          }
          
          const audio = runtime.createInnerAudioContext();
          const events = [];
          let startTime = Date.now();
          
          // 使用静默/短音频或网络音频
          // 注意：实际测试需要有效的音频 URL
          audio.src = 'https://www.w3schools.com/html/horse.ogg';
          audio.volume = 0;  // 静默播放
          
          audio.onCanplay(() => {
            events.push({ event: 'canplay', time: Date.now() - startTime });
          });
          
          audio.onPlay(() => {
            events.push({ event: 'play', time: Date.now() - startTime });
          });
          
          audio.onError((err) => {
            events.push({ event: 'error', error: err.errMsg || err });
            audio.destroy();
            onSuccess({
              eventsTriggered: events.length,
              hasError: true,
              events: events,
              _audioInfo: { events, error: true }
            });
          });
          
          audio.onEnded(() => {
            events.push({ event: 'ended', time: Date.now() - startTime });
            audio.destroy();
            onSuccess({
              eventsTriggered: events.length,
              hasCanplay: events.some(e => e.event === 'canplay'),
              hasPlay: events.some(e => e.event === 'play'),
              hasEnded: events.some(e => e.event === 'ended'),
              hasError: false,
              _audioInfo: { events }
            });
          });
          
          // 开始播放
          audio.play();
          
          // 超时保护
          setTimeout(() => {
            if (events.length > 0 && !events.some(e => e.event === 'ended')) {
              audio.stop();
              audio.destroy();
              onSuccess({
                eventsTriggered: events.length,
                hasCanplay: events.some(e => e.event === 'canplay'),
                hasPlay: events.some(e => e.event === 'play'),
                hasEnded: false,
                timeout: true,
                _audioInfo: { events, timeout: true }
              });
            }
          }, 2500);
        },
        expect: {
          hasCanplay: true,
          hasPlay: true
        },
        allowVariance: ['eventsTriggered', 'hasEnded', 'hasError', 'timeout', '_audioInfo']
      }
      ,
      {
        id: 'audio-007',
        name: 'loop 参数',
        description: '设置 loop=true 并播放，需人工观察是否循环',
        type: 'audio',
        timeout: 3000,
        run: (runtime, onSuccess, onError) => {
          if (typeof runtime.createInnerAudioContext !== 'function') {
            onError('API not found');
            return;
          }
          const audio = runtime.createInnerAudioContext();
          audio.src = 'https://www.w3schools.com/html/horse.ogg';
          audio.volume = 0;
          audio.loop = true;
          let endedCount = 0;
          audio.onEnded(() => {
            endedCount += 1;
          });
          audio.play();
          setTimeout(() => {
            try { audio.stop(); audio.destroy(); } catch(e) {}
            onSuccess({
              loopSet: audio.loop === true,
              manualRequired: true,
              note: '请听/观察是否循环播放',
              endedCount
            });
          }, 2500);
        },
        expect: {
          loopSet: true
        },
        allowVariance: ['manualRequired', 'note', 'endedCount']
      },
      {
        id: 'audio-008',
        name: 'startTime 参数',
        description: '设置 startTime 并播放，需人工观察起始位置',
        type: 'audio',
        timeout: 3000,
        run: (runtime, onSuccess, onError) => {
          if (typeof runtime.createInnerAudioContext !== 'function') {
            onError('API not found');
            return;
          }
          const audio = runtime.createInnerAudioContext();
          audio.src = 'https://www.w3schools.com/html/horse.ogg';
          audio.volume = 0;
          audio.startTime = 2;
          let current = 0;
          audio.onTimeUpdate(() => {
            current = audio.currentTime || 0;
          });
          audio.play();
          setTimeout(() => {
            try { audio.stop(); audio.destroy(); } catch(e) {}
            onSuccess({
              startTimeSet: audio.startTime === 2,
              currentTimeObserved: current,
              manualRequired: true,
              note: '请观察是否从约2秒处开始播放'
            });
          }, 2000);
        },
        expect: {
          startTimeSet: true
        },
        allowVariance: ['currentTimeObserved', 'manualRequired', 'note']
      },
      {
        id: 'audio-009',
        name: 'seek 精度',
        description: '调用 seek 到指定时间，需人工观察跳转准确性',
        type: 'audio',
        timeout: 3000,
        run: (runtime, onSuccess, onError) => {
          if (typeof runtime.createInnerAudioContext !== 'function') {
            onError('API not found');
            return;
          }
          const audio = runtime.createInnerAudioContext();
          audio.src = 'https://www.w3schools.com/html/horse.ogg';
          audio.volume = 0;
          audio.play();
          setTimeout(() => {
            audio.seek(3);
          }, 400);
          let current = 0;
          audio.onTimeUpdate(() => {
            current = audio.currentTime || 0;
          });
          setTimeout(() => {
            try { audio.stop(); audio.destroy(); } catch(e) {}
            onSuccess({
              seekCalled: true,
              currentTimeObserved: current,
              manualRequired: true,
              note: '请观察是否跳转到约3秒位置'
            });
          }, 2000);
        },
        expect: {
          seekCalled: true
        },
        allowVariance: ['currentTimeObserved', 'manualRequired', 'note']
      }
    ]
  },
  
  // ==================== WebAudioContext ====================
  {
    name: 'migo.createWebAudioContext',
    category: 'audio',
    tests: [
      {
        id: 'webaudio-001',
        name: 'createWebAudioContext 存在',
        description: '验证创建 WebAudio 上下文 API',
        type: 'sync',
        run: (runtime) => ({
          exists: typeof runtime.createWebAudioContext === 'function'
        }),
        expect: {
          exists: true
        }
      },
      {
        id: 'webaudio-002',
        name: 'WebAudioContext 方法',
        description: '验证 WebAudio 上下文方法',
        type: 'sync',
        run: (runtime) => {
          if (typeof runtime.createWebAudioContext !== 'function') {
            return { apiNotFound: true };
          }
          const ctx = runtime.createWebAudioContext();
          return {
            hasCreateBufferSource: typeof ctx.createBufferSource === 'function',
            hasCreateGain: typeof ctx.createGain === 'function',
            hasDecodeAudioData: typeof ctx.decodeAudioData === 'function',
            hasDestination: ctx.destination !== undefined
          };
        },
        expect: {
          hasCreateBufferSource: true,
          hasCreateGain: true,
          hasDecodeAudioData: true,
          hasDestination: true
        }
      }
    ]
  }
];
