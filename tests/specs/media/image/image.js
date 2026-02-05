export default [
    {
        name: 'Image APIs',
        category: 'image',
        tests: [
            {
                id: 'image.api.check',
                name: '图片相关 API 存在性',
                description: '验证图片处理相关 API 是否存在',
                type: 'sync',
                run: (runtime) => ({
                    hasChooseImage: typeof runtime.chooseImage === 'function',
                    hasChooseMessageFile: typeof runtime.chooseMessageFile === 'function',
                    hasCompressImage: typeof runtime.compressImage === 'function',
                    hasPreviewImage: typeof runtime.previewImage === 'function',
                    hasPreviewMedia: typeof runtime.previewMedia === 'function',
                    hasSaveImage: typeof runtime.saveImageToPhotosAlbum === 'function'
                }),
                expect: {
                    hasChooseImage: true,
                    hasChooseMessageFile: true,
                    hasCompressImage: true,
                    hasPreviewImage: true,
                    hasPreviewMedia: true,
                    hasSaveImage: true
                }
            }
        ]
    }
];
