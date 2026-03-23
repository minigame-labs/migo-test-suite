/**
 * 测试用例索引
 */

import baseSpecs from './base/index.js';
import renderSpecs from './render/index.js';
import mediaSpecs from './media/index.js';
import fileSpecs from './file/index.js';
import timerSpecs from './timer.js';
import inputSpecs from './input.js';
import performanceSpecs from './performance.js';

import uiSpecs from './ui/index.js';
import networkSpecs from './network/index.js';
import deviceSpecs from './device/index.js';
import shareSpecs from './share/index.js';
import chatToolSpecs from './chat-tool/index.js';
import paymentSpecs from './payment/index.js';
import storageSpecs from './storage/index.js';
import storageTypeSpecs from './storage/type-preservation.js';
import analysisSpecs from './data-analysis/index.js';
import workerSpecs from './worker/index.js';
import extSpecs from './ext/index.js';
import adSpecs from './ad/index.js';
import utilSpecs from './util/index.js';
import bluetoothL2Specs from './device/bluetooth-l2.js';
import openApiSpecs from './open-api/index.js';
import subscribeMessageSpecs from './subscribe-message/index.js';

export const testSpecs = [
  // ...baseSpecs,
  // ...uiSpecs,
  // ...networkSpecs,
  // ...deviceSpecs,
  // ...shareSpecs,
  // ...chatToolSpecs,
  // ...paymentSpecs,
  ...storageSpecs,
  ...storageTypeSpecs,
  // ...analysisSpecs,
  // ...renderSpecs,
  // ...mediaSpecs,
  // ...fileSpecs,
  // ...timerSpecs,
  // ...inputSpecs,
  // ...performanceSpecs,
  // ...workerSpecs,
  // ...extSpecs,
  // ...adSpecs,
  // ...utilSpecs,
  // ...openApiSpecs,
  // ...subscribeMessageSpecs,
  // Note: bluetoothL2Specs is registered in device/index.js
  // Uncomment when running device tests:
  // ...bluetoothL2Specs,
];
