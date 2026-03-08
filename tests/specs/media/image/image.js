import {
  isObject,
  isString,
  isFiniteNumber,
  runOptionApiContract,
  probePromiseSupport
} from '../../_shared/runtime-helpers.js';

const MEDIA_TYPE_VALUES = new Set(['image', 'video']);
const MESSAGE_FILE_TYPE_VALUES = new Set(['all', 'video', 'image', 'file']);
const CHOOSE_IMAGE_SIZE_TYPE_VALUES = new Set(['original', 'compressed']);
const CHOOSE_IMAGE_SOURCE_TYPE_VALUES = new Set(['album', 'camera']);

const INVALID_IMAGE_PATH = 'wxfile://__migo_spec_invalid_image__.jpg';

function isValidErrorPayload(payload) {
  return typeof payload === 'undefined'
    || payload === null
    || isString(payload)
    || isObject(payload);
}

function validateChooseImageSuccessPayload(payload) {
  if (!isObject(payload)) {
    return false;
  }

  if (!Array.isArray(payload.tempFilePaths) || !payload.tempFilePaths.every(isString)) {
    return false;
  }

  if (typeof payload.tempFiles === 'undefined') {
    return true;
  }

  if (!Array.isArray(payload.tempFiles)) {
    return false;
  }

  return payload.tempFiles.every((item) => isObject(item)
    && isString(item.path)
    && isFiniteNumber(item.size));
}

function validateChooseMessageFileSuccessPayload(payload) {
  if (!isObject(payload) || !Array.isArray(payload.tempFiles)) {
    return false;
  }

  return payload.tempFiles.every((item) => {
    if (!isObject(item)) {
      return false;
    }

    const typeValid = isString(item.type) && MESSAGE_FILE_TYPE_VALUES.has(item.type);
    const timeValidOrMissing = typeof item.time === 'undefined' || isFiniteNumber(item.time);

    return isString(item.path)
      && isFiniteNumber(item.size)
      && isString(item.name)
      && typeValid
      && timeValidOrMissing;
  });
}

function validateCompressImageSuccessPayload(payload) {
  return isObject(payload) && isString(payload.tempFilePath);
}

function validatePreviewMediaArgs(args) {
  if (!isObject(args) || !Array.isArray(args.sources) || args.sources.length === 0) {
    return false;
  }

  const sourcesValid = args.sources.every((source) => {
    if (!isObject(source) || !isString(source.url)) {
      return false;
    }

    const typeValidOrMissing = typeof source.type === 'undefined'
      || (isString(source.type) && MEDIA_TYPE_VALUES.has(source.type));
    const posterValidOrMissing = typeof source.poster === 'undefined' || isString(source.poster);

    return typeValidOrMissing && posterValidOrMissing;
  });

  const currentValidOrMissing = typeof args.current === 'undefined' || isFiniteNumber(args.current);
  const showmenuValidOrMissing = typeof args.showmenu === 'undefined' || typeof args.showmenu === 'boolean';
  const referrerPolicyValidOrMissing = typeof args.referrerPolicy === 'undefined' || isString(args.referrerPolicy);

  return sourcesValid && currentValidOrMissing && showmenuValidOrMissing && referrerPolicyValidOrMissing;
}

function validatePreviewImageArgs(args) {
  if (!isObject(args) || !Array.isArray(args.urls) || args.urls.length === 0 || !args.urls.every(isString)) {
    return false;
  }

  const currentValidOrMissing = typeof args.current === 'undefined' || isString(args.current);
  const showmenuValidOrMissing = typeof args.showmenu === 'undefined' || typeof args.showmenu === 'boolean';
  const referrerPolicyValidOrMissing = typeof args.referrerPolicy === 'undefined' || isString(args.referrerPolicy);

  return currentValidOrMissing && showmenuValidOrMissing && referrerPolicyValidOrMissing;
}

function validateChooseMessageFileArgs(args) {
  if (!isObject(args) || !isFiniteNumber(args.count) || args.count < 0 || args.count > 100) {
    return false;
  }

  const typeValidOrMissing = typeof args.type === 'undefined'
    || (isString(args.type) && MESSAGE_FILE_TYPE_VALUES.has(args.type));
  const extensionValidOrMissing = typeof args.extension === 'undefined'
    || (Array.isArray(args.extension) && args.extension.every((item) => isString(item) && item.length > 0));

  return typeValidOrMissing && extensionValidOrMissing;
}

function validateChooseImageArgs(args) {
  if (!isObject(args)) {
    return false;
  }

  const countValidOrMissing = typeof args.count === 'undefined'
    || (isFiniteNumber(args.count) && args.count >= 1 && args.count <= 9);
  const sizeTypeValidOrMissing = typeof args.sizeType === 'undefined'
    || (Array.isArray(args.sizeType) && args.sizeType.every((item) => isString(item) && CHOOSE_IMAGE_SIZE_TYPE_VALUES.has(item)));
  const sourceTypeValidOrMissing = typeof args.sourceType === 'undefined'
    || (Array.isArray(args.sourceType)
      && args.sourceType.every((item) => isString(item) && CHOOSE_IMAGE_SOURCE_TYPE_VALUES.has(item)));

  return countValidOrMissing && sizeTypeValidOrMissing && sourceTypeValidOrMissing;
}

function validateSaveImageArgs(args) {
  return isObject(args) && isString(args.filePath) && args.filePath.length > 0;
}

function validateCompressImageArgs(args) {
  if (!isObject(args) || !isString(args.src) || args.src.length === 0) {
    return false;
  }

  const qualityValidOrMissing = typeof args.quality === 'undefined'
    || (isFiniteNumber(args.quality) && args.quality >= 0 && args.quality <= 100);
  const compressedWidthValidOrMissing = typeof args.compressedWidth === 'undefined' || isFiniteNumber(args.compressedWidth);
  const compressedHeightValidOrMissing = typeof args.compressedHeight === 'undefined' || isFiniteNumber(args.compressedHeight);

  return qualityValidOrMissing && compressedWidthValidOrMissing && compressedHeightValidOrMissing;
}

function runImageOptionApiContract(runtime, apiName, options = {}) {
  const {
    args = {},
    timeoutMs = 7000,
    idleWaitMs = 2500,
    settleDelayMs = 260,
    validateSuccessPayload,
    autoSettleAfterInvoke = false
  } = options;

  return runOptionApiContract(runtime, apiName, {
    args,
    timeoutMs,
    idleWaitMs,
    settleDelayMs,
    autoSettleAfterInvoke,
    validateSuccessPayload
  }).then((result) => ({
    ...result,
    successPayloadValidOrNoSuccess: !result.successCalled || result.successPayloadValid,
    failPayloadValidOrNoFail: !result.failCalled || isValidErrorPayload(result.failPayload)
  }));
}

async function pickSingleImagePath(runtime, chooseImageArgs = {}) {
  const args = {
    count: 1,
    sourceType: ['album'],
    ...chooseImageArgs
  };

  const chooseResult = await runImageOptionApiContract(runtime, 'chooseImage', {
    args,
    timeoutMs: 22000,
    idleWaitMs: 22000,
    validateSuccessPayload: validateChooseImageSuccessPayload
  });

  if (chooseResult._error) {
    return {
      ok: false,
      chooseResult,
      selectedPath: null
    };
  }

  const selectedPath = chooseResult.successPayload?.tempFilePaths?.[0];
  const ok = chooseResult.successCalled && isString(selectedPath) && selectedPath.length > 0;

  return {
    ok,
    chooseResult,
    selectedPath: ok ? selectedPath : null
  };
}

async function runManualPositiveImageFlow(runtime, config) {
  const {
    apiName,
    buildArgs,
    validateArgs,
    timeoutMs = 30000,
    idleWaitMs = 30000,
    validateSuccessPayload
  } = config;

  const picked = await pickSingleImagePath(runtime);
  if (picked.chooseResult?._error) {
    return {
      ...picked.chooseResult,
      preparationSucceeded: false,
      selectedFilePathValid: false,
      preparationRaw: picked.chooseResult?.raw || null
    };
  }

  const args = buildArgs(picked.selectedPath);
  if (!picked.ok) {
    return {
      preparationSucceeded: false,
      selectedFilePathValid: false,
      argsValid: validateArgs(args),
      chooseImageSuccessCalled: picked.chooseResult.successCalled,
      chooseImageFailCalled: picked.chooseResult.failCalled,
      chooseImageRaw: picked.chooseResult.raw,
      raw: picked.chooseResult.raw || null
    };
  }

  const result = await runImageOptionApiContract(runtime, apiName, {
    args,
    timeoutMs,
    idleWaitMs,
    validateSuccessPayload
  });

  return {
    ...result,
    preparationSucceeded: true,
    selectedFilePathValid: isString(picked.selectedPath) && picked.selectedPath.length > 0,
    argsValid: validateArgs(args),
    preparationRaw: picked.chooseResult.raw
  };
}

export default [
  {
    name: 'migo.saveImageToPhotosAlbum',
    category: 'image',
    tests: [
      {
        id: 'image-saveImageToPhotosAlbum-callback-contract-invalid',
        name: '保存图片到相册（回调契约）',
        description: '使用无效 filePath 验证 saveImageToPhotosAlbum 的 success/fail/complete 契约并输出 raw',
        type: 'async',
        timeout: 9000,
        run: (runtime) => runImageOptionApiContract(runtime, 'saveImageToPhotosAlbum', {
          args: {
            filePath: INVALID_IMAGE_PATH
          },
          timeoutMs: 7000,
          idleWaitMs: 3000,
          validateSuccessPayload: (res) => isObject(res)
            && (typeof res.errMsg === 'undefined' || isString(res.errMsg))
        }).then((result) => ({
          ...result,
          argsValid: validateSaveImageArgs({ filePath: INVALID_IMAGE_PATH })
        })),
        expect: {
          apiExists: true,
          threw: false,
          timeout: false,
          callbackInvoked: true,
          successCalled: false,
          failCalled: true,
          completeCalled: true,
          completeAfterOutcome: true,
          multipleOutcomeCallbacks: false,
          failPayloadValidOrNoFail: true,
          argsValid: true,
          raw: '@exists'
        },
        allowVariance: ['callbackTrace']
      },
      {
        id: 'image-saveImageToPhotosAlbum-promise-support',
        name: 'Promise 风格支持',
        description: '验证 saveImageToPhotosAlbum 支持 Promise 风格调用',
        type: 'sync',
        run: (runtime) => probePromiseSupport(runtime, 'saveImageToPhotosAlbum', {
          filePath: INVALID_IMAGE_PATH
        }),
        expect: {
          apiExists: true,
          threw: false,
          promiseStyleSupported: true
        }
      },
      {
        id: 'migo.saveImageToPhotosAlbum',
        name: '正向功能验证（真实保存）',
        description: '手动场景：先选取一张本地图片，再调用 saveImageToPhotosAlbum，验证 success 回调并人工确认相册内可见',
        type: 'async',
        timeout: 42000,
        automation: 'manual',
        manualRequired: true,
        run: (runtime) => runManualPositiveImageFlow(runtime, {
          apiName: 'saveImageToPhotosAlbum',
          buildArgs: (selectedPath) => ({
            filePath: selectedPath
          }),
          validateArgs: validateSaveImageArgs,
          timeoutMs: 30000,
          idleWaitMs: 30000,
          validateSuccessPayload: (res) => isObject(res)
            && (typeof res.errMsg === 'undefined' || isString(res.errMsg))
        }),
        expect: {
          preparationSucceeded: true,
          selectedFilePathValid: true,
          argsValid: true,
          apiExists: true,
          threw: false,
          timeout: false,
          callbackInvoked: true,
          successCalled: true,
          failCalled: false,
          completeCalled: true,
          completeAfterOutcome: true,
          multipleOutcomeCallbacks: false,
          successPayloadValidOrNoSuccess: true,
          raw: '@exists'
        },
        allowVariance: ['callbackTrace', 'preparationRaw']
      }
    ]
  },

  {
    name: 'migo.previewMedia',
    category: 'image',
    tests: [
      {
        id: 'image-previewMedia-callback-contract',
        name: '预览媒体（回调契约）',
        description: '手动场景：触发 previewMedia，验证回调契约与 raw payload（关闭预览页后完成）',
        type: 'async',
        timeout: 22000,
        automation: 'manual',
        manualRequired: true,
        run: (runtime) => {
          const args = {
            sources: [
              {
                url: 'https://example.com/migo-spec-preview-media.jpg',
                type: 'image'
              }
            ],
            current: 0,
            showmenu: true,
            referrerPolicy: 'no-referrer'
          };

          return runImageOptionApiContract(runtime, 'previewMedia', {
            args,
            timeoutMs: 18000,
            idleWaitMs: 18000,
            validateSuccessPayload: (res) => isObject(res)
              && (typeof res.errMsg === 'undefined' || isString(res.errMsg))
          }).then((result) => ({
            ...result,
            argsValid: validatePreviewMediaArgs(args)
          }));
        },
        expect: {
          apiExists: true,
          threw: false,
          timeout: false,
          callbackInvoked: true,
          completeCalled: true,
          completeAfterOutcome: true,
          multipleOutcomeCallbacks: false,
          successPayloadValidOrNoSuccess: true,
          failPayloadValidOrNoFail: true,
          argsValid: true,
          raw: '@exists'
        },
        allowVariance: ['successCalled', 'failCalled', 'callbackTrace']
      },
      {
        id: 'migo.previewMedia',
        name: '正向功能验证（真实预览）',
        description: '手动场景：先选取本地图片，再调用 previewMedia，关闭预览页后验证 success 回调路径',
        type: 'async',
        timeout: 46000,
        automation: 'manual',
        manualRequired: true,
        run: (runtime) => runManualPositiveImageFlow(runtime, {
          apiName: 'previewMedia',
          buildArgs: (selectedPath) => ({
            sources: [
              {
                url: selectedPath,
                type: 'image'
              }
            ],
            current: 0,
            showmenu: true,
            referrerPolicy: 'no-referrer'
          }),
          validateArgs: validatePreviewMediaArgs,
          timeoutMs: 32000,
          idleWaitMs: 32000,
          validateSuccessPayload: (res) => isObject(res)
            && (typeof res.errMsg === 'undefined' || isString(res.errMsg))
        }),
        expect: {
          preparationSucceeded: true,
          selectedFilePathValid: true,
          argsValid: true,
          apiExists: true,
          threw: false,
          timeout: false,
          callbackInvoked: true,
          successCalled: true,
          failCalled: false,
          completeCalled: true,
          completeAfterOutcome: true,
          multipleOutcomeCallbacks: false,
          successPayloadValidOrNoSuccess: true,
          raw: '@exists'
        },
        allowVariance: ['callbackTrace', 'preparationRaw']
      },
      {
        id: 'image-previewMedia-promise-support',
        name: 'Promise 风格支持',
        description: '手动场景：验证 previewMedia 支持 Promise 风格调用',
        type: 'sync',
        automation: 'manual',
        manualRequired: true,
        run: (runtime) => probePromiseSupport(runtime, 'previewMedia', {
          sources: [
            {
              url: 'https://example.com/migo-spec-preview-media.jpg',
              type: 'image'
            }
          ],
          current: 0
        }),
        expect: {
          apiExists: true,
          threw: false,
          promiseStyleSupported: true
        }
      }
    ]
  },

  {
    name: 'migo.previewImage',
    category: 'image',
    tests: [
      {
        id: 'image-previewImage-callback-contract',
        name: '预览图片（回调契约）',
        description: '手动场景：触发 previewImage，验证回调契约与 raw payload（关闭预览页后完成）',
        type: 'async',
        timeout: 22000,
        automation: 'manual',
        manualRequired: true,
        run: (runtime) => {
          const args = {
            urls: [
              'https://example.com/migo-spec-preview-image.jpg'
            ],
            current: 'https://example.com/migo-spec-preview-image.jpg',
            showmenu: true,
            referrerPolicy: 'no-referrer'
          };

          return runImageOptionApiContract(runtime, 'previewImage', {
            args,
            timeoutMs: 18000,
            idleWaitMs: 18000,
            validateSuccessPayload: (res) => isObject(res)
              && (typeof res.errMsg === 'undefined' || isString(res.errMsg))
          }).then((result) => ({
            ...result,
            argsValid: validatePreviewImageArgs(args)
          }));
        },
        expect: {
          apiExists: true,
          threw: false,
          timeout: false,
          callbackInvoked: true,
          completeCalled: true,
          completeAfterOutcome: true,
          multipleOutcomeCallbacks: false,
          successPayloadValidOrNoSuccess: true,
          failPayloadValidOrNoFail: true,
          argsValid: true,
          raw: '@exists'
        },
        allowVariance: ['successCalled', 'failCalled', 'callbackTrace']
      },
      {
        id: 'migo.previewImage',
        name: '正向功能验证（真实预览）',
        description: '手动场景：先选取本地图片，再调用 previewImage，关闭预览页后验证 success 回调路径',
        type: 'async',
        timeout: 46000,
        automation: 'manual',
        manualRequired: true,
        run: (runtime) => runManualPositiveImageFlow(runtime, {
          apiName: 'previewImage',
          buildArgs: (selectedPath) => ({
            urls: [selectedPath],
            current: selectedPath,
            showmenu: true,
            referrerPolicy: 'no-referrer'
          }),
          validateArgs: validatePreviewImageArgs,
          timeoutMs: 32000,
          idleWaitMs: 32000,
          validateSuccessPayload: (res) => isObject(res)
            && (typeof res.errMsg === 'undefined' || isString(res.errMsg))
        }),
        expect: {
          preparationSucceeded: true,
          selectedFilePathValid: true,
          argsValid: true,
          apiExists: true,
          threw: false,
          timeout: false,
          callbackInvoked: true,
          successCalled: true,
          failCalled: false,
          completeCalled: true,
          completeAfterOutcome: true,
          multipleOutcomeCallbacks: false,
          successPayloadValidOrNoSuccess: true,
          raw: '@exists'
        },
        allowVariance: ['callbackTrace', 'preparationRaw']
      },
      {
        id: 'image-previewImage-promise-support',
        name: 'Promise 风格支持',
        description: '手动场景：验证 previewImage 支持 Promise 风格调用',
        type: 'sync',
        automation: 'manual',
        manualRequired: true,
        run: (runtime) => probePromiseSupport(runtime, 'previewImage', {
          urls: [
            'https://example.com/migo-spec-preview-image.jpg'
          ]
        }),
        expect: {
          apiExists: true,
          threw: false,
          promiseStyleSupported: true
        }
      }
    ]
  },

  {
    name: 'migo.compressImage',
    category: 'image',
    tests: [
      {
        id: 'image-compressImage-callback-contract-invalid',
        name: '压缩图片（回调契约）',
        description: '使用无效 src 验证 compressImage 的 success/fail/complete 契约并输出 raw',
        type: 'async',
        timeout: 9000,
        run: (runtime) => {
          const args = {
            src: INVALID_IMAGE_PATH,
            quality: 80,
            compressedWidth: 120,
            compressedHeight: 120
          };

          return runImageOptionApiContract(runtime, 'compressImage', {
            args,
            timeoutMs: 7000,
            idleWaitMs: 3000,
            validateSuccessPayload: validateCompressImageSuccessPayload
          }).then((result) => ({
            ...result,
            argsValid: validateCompressImageArgs(args)
          }));
        },
        expect: {
          apiExists: true,
          threw: false,
          timeout: false,
          callbackInvoked: true,
          successCalled: false,
          failCalled: true,
          completeCalled: true,
          completeAfterOutcome: true,
          multipleOutcomeCallbacks: false,
          failPayloadValidOrNoFail: true,
          argsValid: true,
          raw: '@exists'
        },
        allowVariance: ['callbackTrace']
      },
      {
        id: 'image-compressImage-promise-support',
        name: 'Promise 风格支持',
        description: '验证 compressImage 支持 Promise 风格调用',
        type: 'sync',
        run: (runtime) => probePromiseSupport(runtime, 'compressImage', {
          src: INVALID_IMAGE_PATH,
          quality: 80
        }),
        expect: {
          apiExists: true,
          threw: false,
          promiseStyleSupported: true
        }
      },
      {
        id: 'migo.compressImage',
        name: '正向功能验证（真实压缩）',
        description: '手动场景：先选取一张本地图片，再调用 compressImage，验证 success 回调与 tempFilePath 字段',
        type: 'async',
        timeout: 42000,
        automation: 'manual',
        manualRequired: true,
        run: (runtime) => runManualPositiveImageFlow(runtime, {
          apiName: 'compressImage',
          buildArgs: (selectedPath) => ({
            src: selectedPath,
            quality: 80,
            compressedWidth: 120,
            compressedHeight: 120
          }),
          validateArgs: validateCompressImageArgs,
          timeoutMs: 30000,
          idleWaitMs: 30000,
          validateSuccessPayload: validateCompressImageSuccessPayload
        }),
        expect: {
          preparationSucceeded: true,
          selectedFilePathValid: true,
          argsValid: true,
          apiExists: true,
          threw: false,
          timeout: false,
          callbackInvoked: true,
          successCalled: true,
          failCalled: false,
          completeCalled: true,
          completeAfterOutcome: true,
          multipleOutcomeCallbacks: false,
          successPayloadValidOrNoSuccess: true,
          raw: '@exists'
        },
        allowVariance: ['callbackTrace', 'preparationRaw']
      }
    ]
  },

  {
    name: 'migo.chooseMessageFile',
    category: 'image',
    tests: [
      {
        id: 'migo.chooseMessageFile',
        name: '会话选文件（正向功能）',
        description: '手动场景：调用 chooseMessageFile 并至少选择 1 个文件，验证 success 回调与 payload 结构',
        type: 'async',
        timeout: 22000,
        automation: 'manual',
        manualRequired: true,
        run: (runtime) => {
          const args = {
            count: 1,
            type: 'image'
          };

          return runImageOptionApiContract(runtime, 'chooseMessageFile', {
            args,
            timeoutMs: 18000,
            idleWaitMs: 18000,
            validateSuccessPayload: validateChooseMessageFileSuccessPayload
          }).then((result) => ({
            ...result,
            argsValid: validateChooseMessageFileArgs(args)
          }));
        },
        expect: {
          apiExists: true,
          threw: false,
          timeout: false,
          callbackInvoked: true,
          successCalled: true,
          failCalled: false,
          completeCalled: true,
          completeAfterOutcome: true,
          multipleOutcomeCallbacks: false,
          successPayloadValidOrNoSuccess: true,
          failPayloadValidOrNoFail: true,
          argsValid: true,
          raw: '@exists'
        },
        allowVariance: ['callbackTrace']
      },
      {
        id: 'image-chooseMessageFile-promise-support',
        name: 'Promise 风格支持',
        description: '手动场景：验证 chooseMessageFile 支持 Promise 风格调用',
        type: 'sync',
        automation: 'manual',
        manualRequired: true,
        run: (runtime) => probePromiseSupport(runtime, 'chooseMessageFile', {
          count: 1,
          type: 'all'
        }),
        expect: {
          apiExists: true,
          threw: false,
          promiseStyleSupported: true
        }
      }
    ]
  },

  {
    name: 'migo.chooseImage',
    category: 'image',
    tests: [
      {
        id: 'migo.chooseImage',
        name: '选图（正向功能）',
        description: '手动场景：调用 chooseImage 并至少选择 1 张图片，验证 success 回调与 payload 结构',
        type: 'async',
        timeout: 22000,
        automation: 'manual',
        manualRequired: true,
        run: (runtime) => {
          const args = {
            count: 1,
            sizeType: ['original', 'compressed'],
            sourceType: ['album', 'camera']
          };

          return runImageOptionApiContract(runtime, 'chooseImage', {
            args,
            timeoutMs: 18000,
            idleWaitMs: 18000,
            validateSuccessPayload: validateChooseImageSuccessPayload
          }).then((result) => ({
            ...result,
            argsValid: validateChooseImageArgs(args)
          }));
        },
        expect: {
          apiExists: true,
          threw: false,
          timeout: false,
          callbackInvoked: true,
          successCalled: true,
          failCalled: false,
          completeCalled: true,
          completeAfterOutcome: true,
          multipleOutcomeCallbacks: false,
          successPayloadValidOrNoSuccess: true,
          failPayloadValidOrNoFail: true,
          argsValid: true,
          raw: '@exists'
        },
        allowVariance: ['callbackTrace']
      },
      {
        id: 'image-chooseImage-promise-support',
        name: 'Promise 风格支持',
        description: '手动场景：验证 chooseImage 支持 Promise 风格调用',
        type: 'sync',
        automation: 'manual',
        manualRequired: true,
        run: (runtime) => probePromiseSupport(runtime, 'chooseImage', {
          count: 1,
          sourceType: ['album']
        }),
        expect: {
          apiExists: true,
          threw: false,
          promiseStyleSupported: true
        }
      }
    ]
  }
];
