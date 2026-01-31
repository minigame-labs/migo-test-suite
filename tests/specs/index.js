/**
 * 测试用例索引
 */

import baseSpecs from './base/index.js';
import canvasSpecs from './canvas.js';
import audioSpecs from './audio.js';
import fileSpecs from './file.js';
import networkSpecs from './network.js';
import timerSpecs from './timer.js';
import inputSpecs from './input.js';
import performanceSpecs from './performance.js';

import uiSpecs from './ui/index.js'

export const testSpecs = [
  // ...baseSpecs,
  ...uiSpecs
  // ...canvasSpecs,
  // ...audioSpecs,
  // ...fileSpecs,
  // ...networkSpecs,
  // ...timerSpecs,
  // ...inputSpecs,
  // ...performanceSpecs
];
