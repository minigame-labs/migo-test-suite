/**
 * 测试用例索引
 */

import baseSpecs from './base/index.js';
import canvasSpecs from './canvas.js';
import mediaSpecs from './media/index.js';
import fileSpecs from './file/index.js';
import timerSpecs from './timer.js';
import inputSpecs from './input.js';
import performanceSpecs from './performance.js';

// import uiSpecs from './ui/index.js'
import networkSpecs from './network/index.js'
import deviceSpecs from './device/index.js'

export const testSpecs = [
  // ...baseSpecs,
  // ...uiSpecs
  // ...networkSpecs,
  ...deviceSpecs,
  // ...canvasSpecs,
  ...mediaSpecs,
  ...fileSpecs,
  // ...networkSpecs,
  // ...timerSpecs,
  // ...inputSpecs,
  // ...performanceSpecs
];
