/**
 * Canvas API 测试用例
 */

export default [
  // ==================== createCanvas ====================
  {
    name: 'migo.createCanvas',
    category: 'canvas',
    tests: [
      {
        id: 'canvas-001',
        name: 'createCanvas 存在',
        description: '验证创建画布 API',
        type: 'sync',
        run: (runtime) => ({
          exists: typeof runtime.createCanvas === 'function'
        }),
        expect: {
          exists: true
        }
      },
      {
        id: 'canvas-002',
        name: 'createCanvas 返回 Canvas',
        description: '验证返回的画布对象',
        type: 'sync',
        run: (runtime) => {
          const canvas = runtime.createCanvas();
          return {
            hasWidth: typeof canvas.width === 'number',
            hasHeight: typeof canvas.height === 'number',
            hasGetContext: typeof canvas.getContext === 'function'
          };
        },
        expect: {
          hasWidth: true,
          hasHeight: true,
          hasGetContext: true
        }
      },
      {
        id: 'canvas-003',
        name: 'Canvas 2D Context',
        description: '验证获取 2D 上下文',
        type: 'sync',
        run: (runtime) => {
          const canvas = runtime.createCanvas();
          const ctx = canvas.getContext('2d');
          return {
            contextExists: ctx !== null && ctx !== undefined,
            hasFillRect: typeof ctx?.fillRect === 'function',
            hasStrokeRect: typeof ctx?.strokeRect === 'function',
            hasBeginPath: typeof ctx?.beginPath === 'function',
            hasFillText: typeof ctx?.fillText === 'function',
            hasDrawImage: typeof ctx?.drawImage === 'function'
          };
        },
        expect: {
          contextExists: true,
          hasFillRect: true,
          hasStrokeRect: true,
          hasBeginPath: true,
          hasFillText: true,
          hasDrawImage: true
        }
      },
      {
        id: 'canvas-004',
        name: 'Canvas WebGL Context',
        description: '验证获取 WebGL 上下文',
        type: 'sync',
        run: (runtime) => {
          const canvas = runtime.createCanvas();
          const gl = canvas.getContext('webgl');
          return {
            contextExists: gl !== null && gl !== undefined,
            hasCreateProgram: typeof gl?.createProgram === 'function',
            hasCreateShader: typeof gl?.createShader === 'function',
            hasDrawArrays: typeof gl?.drawArrays === 'function'
          };
        },
        expect: {
          contextExists: true,
          hasCreateProgram: true,
          hasCreateShader: true,
          hasDrawArrays: true
        }
      }
    ]
  },
  
  // ==================== Canvas 2D 渲染测试 ====================
  {
    name: 'Canvas2D Render',
    category: 'canvas',
    tests: [
      {
        id: 'canvas2d-001',
        name: 'fillRect 渲染',
        description: '验证填充矩形渲染，捕获渲染特征用于 baseline',
        type: 'render',
        canvasWidth: 100,
        canvasHeight: 100,
        run: (runtime, ctx, canvas) => {
          ctx.fillStyle = '#ff0000';
          ctx.fillRect(10, 10, 80, 80);
          return { rendered: true };
        },
        verify: (ctx, canvas) => {
          try {
            // 采样多个点验证渲染正确性
            const centerPixel = ctx.getImageData(50, 50, 1, 1).data;
            const cornerPixel = ctx.getImageData(5, 5, 1, 1).data;
            const edgePixel = ctx.getImageData(15, 15, 1, 1).data;
            
            return {
              // 验证字段
              centerIsRed: centerPixel[0] > 200 && centerPixel[1] < 50,
              cornerIsEmpty: cornerPixel[3] === 0 || cornerPixel[0] < 50,
              edgeIsRed: edgePixel[0] > 200,
              // baseline 捕获字段（用于跨平台对比）
              _renderInfo: {
                centerRGBA: [centerPixel[0], centerPixel[1], centerPixel[2], centerPixel[3]],
                getImageDataSupported: true
              }
            };
          } catch (e) {
            return { 
              getImageDataSupported: false,
              error: e.message,
              _renderInfo: { getImageDataSupported: false, error: e.message }
            };
          }
        },
        expect: {
          centerIsRed: true,
          edgeIsRed: true
        },
        allowVariance: ['cornerIsEmpty', '_renderInfo']
      },
      {
        id: 'canvas2d-002',
        name: 'arc 圆形渲染',
        description: '验证圆弧渲染',
        type: 'render',
        canvasWidth: 100,
        canvasHeight: 100,
        run: (runtime, ctx, canvas) => {
          ctx.fillStyle = '#00ff00';
          ctx.beginPath();
          ctx.arc(50, 50, 40, 0, Math.PI * 2);
          ctx.fill();
          return { rendered: true };
        },
        verify: (ctx, canvas) => {
          try {
            const imageData = ctx.getImageData(50, 50, 1, 1);
            const pixel = imageData.data;
            return {
              redIsLow: pixel[0] < 50,
              hasGreen: pixel[1] > 200,
              blueIsLow: pixel[2] < 50
            };
          } catch (e) {
            return { verifyError: e.message };
          }
        },
        expect: {
          redIsLow: true,
          hasGreen: true,
          blueIsLow: true
        }
      },
      {
        id: 'canvas2d-003',
        name: 'fillText 文本渲染',
        description: '验证文本渲染',
        type: 'render',
        canvasWidth: 200,
        canvasHeight: 50,
        run: (runtime, ctx, canvas) => {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, 200, 50);
          ctx.fillStyle = '#000000';
          ctx.font = '20px sans-serif';
          ctx.fillText('Hello', 10, 30);
          return { rendered: true };
        },
        verify: (ctx, canvas) => {
          try {
            // 检查文字区域有黑色像素
            const imageData = ctx.getImageData(0, 0, 100, 50);
            let hasBlackPixel = false;
            for (let i = 0; i < imageData.data.length; i += 4) {
              if (imageData.data[i] < 50 && 
                  imageData.data[i + 1] < 50 && 
                  imageData.data[i + 2] < 50 &&
                  imageData.data[i + 3] > 200) {
                hasBlackPixel = true;
                break;
              }
            }
            return { hasText: hasBlackPixel };
          } catch (e) {
            return { verifyError: e.message };
          }
        },
        expect: {
          hasText: true
        }
      },
      {
        id: 'canvas2d-004',
        name: 'save/restore 状态',
        description: '验证画布状态保存与恢复',
        type: 'render',
        canvasWidth: 100,
        canvasHeight: 100,
        run: (runtime, ctx, canvas) => {
          ctx.fillStyle = '#ff0000';
          ctx.save();
          ctx.fillStyle = '#0000ff';
          ctx.fillRect(0, 0, 50, 50);
          ctx.restore();
          ctx.fillRect(50, 50, 50, 50);
          return { rendered: true };
        },
        verify: (ctx, canvas) => {
          try {
            // 检查右下角是红色（restore后的颜色）
            const imageData = ctx.getImageData(75, 75, 1, 1);
            const pixel = imageData.data;
            return {
              restoredCorrectly: pixel[0] > 200 && pixel[2] < 50
            };
          } catch (e) {
            return { verifyError: e.message };
          }
        },
        expect: {
          restoredCorrectly: true
        }
      },
      {
        id: 'canvas2d-005',
        name: 'toDataURL 导出',
        description: '验证 Canvas 导出为 Base64 图片，用于截图 baseline',
        type: 'render',
        canvasWidth: 50,
        canvasHeight: 50,
        run: (runtime, ctx, canvas) => {
          // 绘制一个简单的渐变矩形
          ctx.fillStyle = '#ff0000';
          ctx.fillRect(0, 0, 25, 50);
          ctx.fillStyle = '#0000ff';
          ctx.fillRect(25, 0, 25, 50);
          return { rendered: true };
        },
        verify: (ctx, canvas) => {
          try {
            // 尝试导出为 DataURL
            const hasToDataURL = typeof canvas.toDataURL === 'function';
            let dataURL = null;
            let isValidDataURL = false;
            
            if (hasToDataURL) {
              try {
                dataURL = canvas.toDataURL('image/png');
                isValidDataURL = dataURL && dataURL.startsWith('data:image/');
              } catch (e) {
                dataURL = `error: ${e.message}`;
              }
            }
            
            return {
              hasToDataURL,
              isValidDataURL,
              // 用于 baseline 对比的截图数据
              _renderInfo: {
                toDataURLSupported: hasToDataURL && isValidDataURL,
                // 只保存前100字符作为摘要（完整数据太大）
                dataURLPreview: dataURL ? dataURL.substring(0, 100) : null,
                dataURLLength: dataURL ? dataURL.length : 0
              }
            };
          } catch (e) {
            return { 
              hasToDataURL: false, 
              error: e.message,
              _renderInfo: { error: e.message }
            };
          }
        },
        expect: {
          hasToDataURL: true,
          isValidDataURL: true
        },
        allowVariance: ['_renderInfo']
      }
    ]
  },
  // ==================== Path2D ====================
  {
    name: 'Path2D',
    category: 'canvas',
    tests: [
      {
        id: 'canvas-path2d-001',
        name: 'migo.createPath2D',
        description: '验证创建 Path2D 对象',
        type: 'sync',
        run: (runtime) => {
          if (typeof runtime.createPath2D !== 'function') return { _error: 'runtime.createPath2D 不存在' };
          const path = runtime.createPath2D();
          return {
             isPath2D: !!path,
             hasMoveTo: typeof path.moveTo === 'function',
             hasLineTo: typeof path.lineTo === 'function'
          };
        },
        expect: { isPath2D: true, hasMoveTo: true, hasLineTo: true }
      }
    ]
  },
  // ==================== toTempFilePath ====================
  {
      name: 'Canvas.toTempFilePath',
      category: 'canvas',
      tests: [
          {
              id: 'canvas-temp-001',
              name: 'toTempFilePath',
              description: 'Canvas 转临时文件',
              type: 'async',
              run: (runtime, callback) => {
                  const canvas = runtime.createCanvas();
                  // Draw something
                  const ctx = canvas.getContext('2d');
                  ctx.fillStyle = 'red';
                  ctx.fillRect(0, 0, 10, 10);
                  
                  if (typeof canvas.toTempFilePath !== 'function') return callback({ _error: 'toTempFilePath 不存在' });
                  
                  canvas.toTempFilePath({
                      x: 0, y: 0, width: 10, height: 10,
                      destWidth: 10, destHeight: 10,
                      fileType: 'png',
                      quality: 1.0,
                      success: (res) => {
                          callback({ 
                              success: true, 
                              hasPath: typeof res.tempFilePath === 'string' && res.tempFilePath.length > 0
                          });
                      },
                      fail: (err) => callback({ success: false, error: err.errMsg || err })
                  });
              },
              expect: { success: true, hasPath: true }
          },
          {
              id: 'canvas-temp-002',
              name: 'toTempFilePathSync',
              description: 'Canvas 同步转临时文件',
              type: 'sync',
              run: (runtime) => {
                  const canvas = runtime.createCanvas();
                  const ctx = canvas.getContext('2d');
                  ctx.fillRect(0, 0, 10, 10);

                  if (typeof canvas.toTempFilePathSync !== 'function') return { _error: 'toTempFilePathSync 不存在' };
                  
                  try {
                      const path = canvas.toTempFilePathSync({
                          x: 0, y: 0, width: 10, height: 10,
                          destWidth: 10, destHeight: 10,
                          fileType: 'png'
                      });
                      return { success: true, hasPath: typeof path === 'string' && path.length > 0 };
                  } catch (e) {
                      return { success: false, error: e.message };
                  }
              },
              expect: { success: true, hasPath: true }
          }
      ]
  },
  // ==================== WebGL ====================
  {
      name: 'WebGL Bind',
      category: 'canvas',
      tests: [
          {
              id: 'canvas-webgl-001',
              name: 'BindCanvasTexture',
              description: 'WebGL 绑定 Canvas 纹理',
              type: 'sync',
              run: (runtime) => {
                  const canvas = runtime.createCanvas();
                  const gl = canvas.getContext('webgl');
                  if (!gl) return { _error: 'WebGL context creation failed' };
                  
                  // Check if wxBindCanvasTexture exists
                  // Note: Only supported on iOS or specific versions
                  return { exists: typeof gl.wxBindCanvasTexture === 'function' };
              },
              expect: { exists: '@boolean' } // Allow true or false depending on platform
          }
      ]
  }
];
