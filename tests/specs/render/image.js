import {
  isObject,
  isString,
  isFiniteNumber,
  isThenable,
  normalizeRaw,
  formatError
} from '../_shared/runtime-helpers.js';

const REQUIRED_IMAGE_PROPERTIES = ['src', 'width', 'height', 'onload', 'onerror'];

function hasImageProperties(image) {
  return REQUIRED_IMAGE_PROPERTIES.every((key) => key in image);
}

function isUint8ClampedArrayValue(value) {
  return typeof Uint8ClampedArray !== 'undefined' && value instanceof Uint8ClampedArray;
}

function validateImageDataObject(imageData, expectedWidth, expectedHeight) {
  if (!isObject(imageData)) {
    return false;
  }

  const widthValid = imageData.width === expectedWidth;
  const heightValid = imageData.height === expectedHeight;
  const dataTypeValid = isUint8ClampedArrayValue(imageData.data);
  const dataLengthValid = dataTypeValid && imageData.data.length === (expectedWidth * expectedHeight * 4);
  const dataRangeValid = dataTypeValid
    && imageData.data.every((item) => isFiniteNumber(item) && item >= 0 && item <= 255);

  return widthValid && heightValid && dataTypeValid && dataLengthValid && dataRangeValid;
}

function createImageSafely(runtime) {
  if (typeof runtime.createImage !== 'function') {
    return {
      image: null,
      raw: null,
      errorResult: { _error: 'createImage 不存在' }
    };
  }

  try {
    const image = runtime.createImage();
    return {
      image,
      raw: normalizeRaw(image),
      errorResult: null
    };
  } catch (e) {
    return {
      image: null,
      raw: null,
      errorResult: {
        apiExists: true,
        threw: true,
        raw: null,
        error: formatError(e)
      }
    };
  }
}

function createImageDataSafely(runtime, ...args) {
  if (typeof runtime.createImageData !== 'function') {
    return {
      imageData: null,
      raw: null,
      errorResult: { _error: 'createImageData 不存在' }
    };
  }

  try {
    const imageData = runtime.createImageData(...args);
    return {
      imageData,
      raw: normalizeRaw(imageData),
      errorResult: null
    };
  } catch (e) {
    return {
      imageData: null,
      raw: null,
      errorResult: {
        apiExists: true,
        threw: true,
        raw: null,
        error: formatError(e)
      }
    };
  }
}

export default [
  {
    name: 'migo.createImage',
    category: 'render/image',
    tests: [
      {
        id: 'migo.createImage',
        name: '创建 Image 对象',
        description: '验证 createImage 返回 Image 对象、非 Promise，且具备 src/width/height/onload/onerror 属性',
        type: 'sync',
        run: (runtime) => {
          const created = createImageSafely(runtime);
          if (created.errorResult) {
            return created.errorResult;
          }

          return {
            apiExists: true,
            threw: false,
            returnThenable: isThenable(created.image),
            imageObjectValid: isObject(created.image),
            hasRequiredProperties: hasImageProperties(created.image),
            raw: created.raw
          };
        },
        expect: {
          apiExists: true,
          threw: false,
          returnThenable: false,
          imageObjectValid: true,
          hasRequiredProperties: true,
          raw: '@exists'
        }
      }
    ]
  },

  {
    name: 'Image',
    category: 'render/image',
    tests: [
      {
        id: 'Image',
        name: 'Image 对象属性契约',
        description: '验证 Image.src/width/height/onload/onerror 可访问和可赋值（不触发真实加载）',
        type: 'sync',
        run: (runtime) => {
          const created = createImageSafely(runtime);
          if (created.errorResult) {
            return created.errorResult;
          }

          const image = created.image;
          let onloadAssignable = false;
          let onerrorAssignable = false;
          let srcAssignable = false;
          let assignmentThrew = false;
          let assignmentError = null;

          try {
            image.onload = () => {};
            image.onerror = () => {};
            image.src = 'https://example.com/migo-render-image.png';
            onloadAssignable = typeof image.onload === 'function';
            onerrorAssignable = typeof image.onerror === 'function';
            srcAssignable = isString(image.src);
          } catch (e) {
            assignmentThrew = true;
            assignmentError = formatError(e);
          }

          return {
            imageObjectValid: isObject(image),
            hasSrcProperty: 'src' in image,
            hasWidthProperty: 'width' in image,
            hasHeightProperty: 'height' in image,
            hasOnloadProperty: 'onload' in image,
            hasOnerrorProperty: 'onerror' in image,
            widthNumberOrUndefined: typeof image.width === 'number' || typeof image.width === 'undefined',
            heightNumberOrUndefined: typeof image.height === 'number' || typeof image.height === 'undefined',
            assignmentThrew,
            onloadAssignable,
            onerrorAssignable,
            srcAssignable,
            assignmentError,
            raw: created.raw
          };
        },
        expect: {
          imageObjectValid: true,
          hasSrcProperty: true,
          hasWidthProperty: true,
          hasHeightProperty: true,
          hasOnloadProperty: true,
          hasOnerrorProperty: true,
          widthNumberOrUndefined: true,
          heightNumberOrUndefined: true,
          assignmentThrew: false,
          onloadAssignable: true,
          onerrorAssignable: true,
          srcAssignable: true,
          raw: '@exists'
        }
      }
    ]
  },

  {
    name: 'migo.createImageData',
    category: 'render/image',
    tests: [
      {
        id: 'migo.createImageData',
        name: '按宽高创建 ImageData',
        description: '验证 createImageData(width, height) 返回合法 ImageData 对象并输出 raw',
        type: 'sync',
        run: (runtime) => {
          const created = createImageDataSafely(runtime, 2, 3);
          if (created.errorResult) {
            return created.errorResult;
          }

          return {
            apiExists: true,
            threw: false,
            imageDataObjectValid: validateImageDataObject(created.imageData, 2, 3),
            raw: created.raw
          };
        },
        expect: {
          apiExists: true,
          threw: false,
          imageDataObjectValid: true,
          raw: '@exists'
        }
      },
      {
        id: 'render-createImageData-from-typed-array',
        name: '使用像素数据创建 ImageData',
        description: '验证 createImageData(Uint8ClampedArray, width, height) 形态可用并保持像素数据长度正确',
        type: 'sync',
        run: (runtime) => {
          const source = new Uint8ClampedArray([
            255, 0, 0, 255,
            0, 255, 0, 255
          ]);

          const created = createImageDataSafely(runtime, source, 2, 1);
          if (created.errorResult) {
            return created.errorResult;
          }

          return {
            apiExists: true,
            threw: false,
            imageDataObjectValid: validateImageDataObject(created.imageData, 2, 1),
            firstPixelRed: created.imageData?.data?.[0] === 255,
            secondPixelGreen: created.imageData?.data?.[5] === 255,
            raw: created.raw
          };
        },
        expect: {
          apiExists: true,
          threw: false,
          imageDataObjectValid: true,
          firstPixelRed: true,
          secondPixelGreen: true,
          raw: '@exists'
        }
      }
    ]
  },

  {
    name: 'ImageData',
    category: 'render/image',
    tests: [
      {
        id: 'ImageData',
        name: 'ImageData 对象属性契约',
        description: '验证 ImageData 对象具备 width/height/data 属性，且 data 为 Uint8ClampedArray',
        type: 'sync',
        run: (runtime) => {
          const created = createImageDataSafely(runtime, 1, 1);
          if (created.errorResult) {
            return created.errorResult;
          }

          const imageData = created.imageData;
          return {
            imageDataObjectValid: isObject(imageData),
            hasWidthProperty: 'width' in imageData,
            hasHeightProperty: 'height' in imageData,
            hasDataProperty: 'data' in imageData,
            widthEqualsOne: imageData?.width === 1,
            heightEqualsOne: imageData?.height === 1,
            dataIsUint8ClampedArray: isUint8ClampedArrayValue(imageData?.data),
            dataLengthEqualsFour: imageData?.data?.length === 4,
            raw: created.raw
          };
        },
        expect: {
          imageDataObjectValid: true,
          hasWidthProperty: true,
          hasHeightProperty: true,
          hasDataProperty: true,
          widthEqualsOne: true,
          heightEqualsOne: true,
          dataIsUint8ClampedArray: true,
          dataLengthEqualsFour: true,
          raw: '@exists'
        }
      }
    ]
  }
];
