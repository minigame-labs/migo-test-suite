
export default [
    {
        name: 'Image Render APIs',
        category: 'render/image',
        tests: [
             {
                id: 'render-image-001',
                name: 'wx.createImage',
                description: '创建图片对象',
                type: 'sync',
                run: (runtime) => {
                    if (typeof runtime.createImage !== 'function') return { _error: 'createImage 不存在' };
                    try {
                        const img = runtime.createImage();
                        return { 
                            isImage: !!img,
                            hasSrc: 'src' in img,
                            hasOnLoad: 'onload' in img
                        };
                    } catch (e) {
                        return { success: false, error: e.message };
                    }
                },
                expect: { isImage: true, hasSrc: true, hasOnLoad: true }
             },
             {
                id: 'render-image-002',
                name: 'Image Constructor',
                description: '全局 Image 构造函数',
                type: 'sync',
                run: (runtime) => {
                     // Check if global Image is available
                     const hasGlobalImage = typeof Image !== 'undefined';
                     if (!hasGlobalImage) return { hasGlobalImage: false };
                     try {
                         const img = new Image();
                         return { hasGlobalImage: true, created: !!img };
                     } catch (e) {
                         return { hasGlobalImage: true, created: false, error: e.message };
                     }
                },
                expect: { hasGlobalImage: true, created: true }
             },
             {
                id: 'render-image-003',
                name: 'ImageData',
                description: 'ImageData 对象支持',
                type: 'sync',
                run: (runtime) => {
                     // Check if global ImageData is available
                     const hasGlobalImageData = typeof ImageData !== 'undefined';
                     if (!hasGlobalImageData) return { hasGlobalImageData: false };
                     try {
                         const data = new Uint8ClampedArray(4);
                         const imgData = new ImageData(data, 1, 1);
                         return { hasGlobalImageData: true, created: !!imgData };
                     } catch (e) {
                         return { hasGlobalImageData: true, created: false, error: e.message };
                     }
                },
                expect: { hasGlobalImageData: true, created: true }
             },
             {
                id: 'render-image-004',
                name: 'wx.createImageData',
                description: '创建图片数据',
                type: 'sync',
                run: (runtime) => {
                    if (typeof runtime.createImageData !== 'function') return { _error: 'wx.createImageData 不存在' };
                    try {
                        const data = new Uint8ClampedArray([255, 0, 0, 255]);
                        const imageData = runtime.createImageData(data.buffer, 1, 1);
                        return { 
                            success: true, 
                            width: imageData.width, 
                            height: imageData.height,
                            dataLen: imageData.data.length
                        };
                    } catch (e) {
                         return { success: false, error: e.message };
                    }
                },
                expect: { success: true, width: 1, height: 1, dataLen: 4 }
             }
        ]
    }
];
