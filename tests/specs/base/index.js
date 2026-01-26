/**
 * 基础 API 测试用例索引
 * https://developers.weixin.qq.com/minigame/dev/api/base/wx.env.html
 */

import envSpecs from './env.js';
import systemSpecs from './system.js';
import updateSpecs from './update.js';
import lifecycleSpecs from './lifecycle.js';
import debugSpecs from './debug.js';
import cryptoSpecs from './crypto.js';
import utilitySpecs from './utility.js';
import subpackageSpecs from './subpackage.js';
import performanceSpecs from './performance.js';

export default [
  ...envSpecs,
  ...systemSpecs,
  ...updateSpecs,
  ...lifecycleSpecs,
  ...debugSpecs,
  ...cryptoSpecs,
  ...utilitySpecs,
  ...subpackageSpecs,
  ...performanceSpecs
];
