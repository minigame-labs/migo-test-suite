/**
 * 基础 API 测试用例索引
 */

import envSpecs from './env.js';
import systemSpecs from './system.js';
import updateSpecs from './update.js';
import lifecycleSpecs from './lifecycle.js';
import appEventSpecs from './app-event.js';
import debugSpecs from './debug.js';
import cryptoSpecs from './crypto.js';
import utilitySpecs from './utility.js';
import subpackageSpecs from './subpackage.js';
import performanceSpecs from './performance.js';
import batterySpecs from './battery.js';
import clipboardSpecs from './clipboard.js';

export default [
  // ...envSpecs,
  // ...systemSpecs,
  // ...updateSpecs,
  // ...lifecycleSpecs,
  // ...appEventSpecs,
  ...batterySpecs,
  ...clipboardSpecs,
  // ...debugSpecs,
  // ...cryptoSpecs,
  // ...utilitySpecs,
  // ...subpackageSpecs,
  // ...performanceSpecs
];
