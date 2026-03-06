/**
 * Migo API 兼容性测试套件 - 主入口
 * 支持在 wx/migo/quickgame 等平台运行
 */

import { UI } from './src/ui.js';
import { TestManager } from './tests/test-manager.js';
import { testSpecs } from './tests/specs/index.js';
import { getTestProfile } from './tests/profiles/index.js';
import { getRuntimeConfig, applyGlobalEndpoints } from './tests/config.js';

// 兼容不同平台的全局对象
const runtime = (typeof migo !== 'undefined') ? migo
  : (typeof wx !== 'undefined') ? wx
    : (typeof qg !== 'undefined') ? qg
      : null;

if (!runtime) {
  throw new Error('未检测到支持的小游戏运行时环境');
}

const runtimeConfig = getRuntimeConfig(runtime);
const endpoints = applyGlobalEndpoints(runtimeConfig);

const CONFIG = {
  version: runtimeConfig.version || '1.1.0',
  remoteLog: runtimeConfig.remoteLog !== false,
  profile: runtimeConfig.profile || 'smoke',
  runManualTests: Boolean(runtimeConfig.runManualTests),
  autoRun: Boolean(runtimeConfig.autoRun),
  autoUpload: Boolean(runtimeConfig.autoUpload),
  exitOnComplete: Boolean(runtimeConfig.exitOnComplete),
  exitDelayMs: Number.isFinite(runtimeConfig.exitDelayMs) ? runtimeConfig.exitDelayMs : 800,
  runId: (typeof runtimeConfig.runId === 'string' && runtimeConfig.runId.trim()) ? runtimeConfig.runId.trim() : null,
  defaultTimeoutMs: Number.isFinite(runtimeConfig.defaultTimeoutMs) ? runtimeConfig.defaultTimeoutMs : 8000,
  defaultRetries: Number.isInteger(runtimeConfig.defaultRetries) ? runtimeConfig.defaultRetries : 1,
  maxRetries: Number.isInteger(runtimeConfig.maxRetries) ? runtimeConfig.maxRetries : 1,
  serverUrl: endpoints.report,
  requestEndpoint: endpoints.http,
  wsEndpoint: endpoints.ws
};

// ============ 远程日志桥接 ============
if (CONFIG.remoteLog) {
  const originalConsole = {
    log: console.log.bind(console),
    info: console.info.bind(console),
    warn: console.warn.bind(console),
    error: console.error.bind(console),
    debug: console.debug.bind(console)
  };

  const sendLog = (level, args) => {
    const serializedArgs = args.map((arg) => {
      if (arg === undefined) return 'undefined';
      if (arg === null) return 'null';
      if (typeof arg === 'object') {
        try {
          return JSON.stringify(arg);
        } catch (e) {
          return String(arg);
        }
      }
      return String(arg);
    });

    runtime.request({
      url: `${CONFIG.serverUrl}/log`,
      method: 'POST',
      header: { 'content-type': 'application/json' },
      data: {
        level,
        args: serializedArgs,
        timestamp: Date.now()
      },
      success: () => {},
      fail: () => {}
    });
  };

  ['log', 'info', 'warn', 'error', 'debug'].forEach((level) => {
    console[level] = (...args) => {
      originalConsole[level](...args);
      sendLog(level, args);
    };
  });
}
// ======================================

class TestApp {
  constructor() {
    this._initCanvas();
    this._initState();
    this._initModules();
    this._bindEvents();
    this._startRenderLoop();

    console.log('[migo-test-suite] profile=', CONFIG.profile);
    console.log('[migo-test-suite] endpoints=', {
      report: CONFIG.serverUrl,
      http: CONFIG.requestEndpoint,
      ws: CONFIG.wsEndpoint
    });

    this.runId = CONFIG.runId || this._createRunId();

    if (CONFIG.autoRun) {
      setTimeout(() => {
        this._runAutomationFlow().catch((e) => {
          console.error('[automation] failed:', e);
        });
      }, 100);
    }
  }

  // ==================== 初始化 ====================

  _initCanvas() {
    this.windowInfo = runtime.getWindowInfo();
    this.deviceInfo = runtime.getDeviceInfo();
    this.appBaseInfo = runtime.getAppBaseInfo();

    this.canvas = runtime.createCanvas();
    this.ctx = this.canvas.getContext('2d');
    this.canvas.width = this.windowInfo.windowWidth;
    this.canvas.height = this.windowInfo.windowHeight;
    this.dpr = this.windowInfo.pixelRatio || 1;
  }

  _initState() {
    this.state = {
      page: 'list',
      selectedCategory: null,
      selectedTest: null,
      scrollY: 0,
      testResults: [],
      isRunning: false,
      currentResult: null,
      runProgress: { current: 0, total: 0, currentTestName: '' }
    };
    this.lastTouchY = undefined;
  }

  _initModules() {
    this.ui = new UI(this.ctx, this.canvas.width, this.canvas.height, this.dpr);

    const profile = getTestProfile(CONFIG.profile);
    profile.runManualTests = CONFIG.runManualTests || profile.runManualTests;
    profile.defaultTimeoutMs = CONFIG.defaultTimeoutMs || profile.defaultTimeoutMs;
    profile.defaultRetries = CONFIG.defaultRetries;
    profile.maxRetries = CONFIG.maxRetries;

    this.testManager = new TestManager(runtime, testSpecs, { profile });
  }

  _bindEvents() {
    runtime.onTouchStart((e) => {
      if (e.touches.length > 0) {
        this._handleTouch(e.touches[0].clientX, e.touches[0].clientY);
      }
    });

    runtime.onTouchMove((e) => {
      if (e.touches.length > 0 && this.lastTouchY !== undefined) {
        const deltaY = this.lastTouchY - e.touches[0].clientY;
        const maxScrollY = this.ui.getMaxScrollY();
        this.state.scrollY = Math.max(0, Math.min(maxScrollY, this.state.scrollY + deltaY));
        this.lastTouchY = e.touches[0].clientY;
      }
    });

    runtime.onTouchEnd(() => {
      this.lastTouchY = undefined;
    });
  }

  _startRenderLoop() {
    const render = () => {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this._renderCurrentPage();
      requestAnimationFrame(render);
    };
    render();
  }

  // ==================== 事件处理 ====================

  _handleTouch(x, y) {
    this.lastTouchY = y;
    const hitElement = this.ui.hitTest(x, y);
    if (!hitElement) return;

    const actions = {
      category: () => this._toggleCategory(hitElement.data),
      test: () => this._selectTest(hitElement.data),
      'run-btn': () => this.runSelectedTest(),
      'upload-single-btn': () => this.uploadCurrentResult(),
      'run-all-btn': () => this.runAllTests(),
      'export-btn': () => this.uploadAllResults(),
      'back-btn': () => this._goBack(),
      'clear-btn': () => this._clearResults()
    };

    const action = actions[hitElement.type];
    if (action) action();
  }

  _toggleCategory(categoryId) {
    this.state.selectedCategory = this.state.selectedCategory === categoryId ? null : categoryId;
  }

  _selectTest(test) {
    this.state.selectedTest = test;
    this.state.page = 'detail';
    this.state.scrollY = 0;
  }

  _goBack() {
    if (this.state.page === 'detail') {
      this.state.page = 'list';
      this.state.selectedTest = null;
      this.state.currentResult = null;
      this.state.scrollY = 0;
    }
  }

  _clearResults() {
    this.state.testResults = [];
    this.state.currentResult = null;
  }

  _resultKey(testId, category) {
    return `${category || 'unknown'}::${testId || 'unknown'}`;
  }

  _createRunId() {
    return `run-${Date.now()}`;
  }

  async _runAutomationFlow() {
    if (this.state.isRunning) {
      return;
    }

    this.ui.showToast('自动化模式：执行全部测试');
    await this.runAllTests();

    if (CONFIG.autoUpload) {
      const upload = await this._uploadResults(this.state.testResults, '自动化上传中...');
      if (!upload.success) {
        console.error('[automation] upload failed:', upload.error || upload.statusCode || 'unknown');
      }
    }

    if (CONFIG.exitOnComplete && typeof runtime.exitMiniProgram === 'function') {
      setTimeout(() => {
        try {
          runtime.exitMiniProgram({
            success: () => {},
            fail: () => {}
          });
        } catch (e) {
          console.warn('[automation] exitMiniProgram failed:', e);
        }
      }, CONFIG.exitDelayMs);
    }
  }

  // ==================== 测试运行 ====================

  async runSelectedTest() {
    if (this.state.isRunning || !this.state.selectedTest) return;

    this.state.isRunning = true;

    try {
      const result = await this.testManager.runTest(this.state.selectedTest);
      this.state.currentResult = result;
      this._updateTestResult(result);
    } catch (e) {
      this.state.currentResult = {
        testId: this.state.selectedTest.id,
        category: this.state.selectedTest.category,
        resultKey: this._resultKey(this.state.selectedTest.id, this.state.selectedTest.category),
        status: 'failed',
        passed: false,
        skipped: false,
        error: e.message || String(e)
      };
      this._updateTestResult(this.state.currentResult);
    }

    this.state.isRunning = false;
  }

  async runAllTests() {
    if (this.state.isRunning) return;

    this.state.isRunning = true;
    this.state.testResults = [];

    const allTests = this.testManager.getAllTests();
    this.state.runProgress = { current: 0, total: allTests.length, currentTestName: '' };

    for (let i = 0; i < allTests.length; i++) {
      this.state.runProgress.current = i + 1;
      this.state.runProgress.currentTestName = allTests[i].name;

      try {
        const result = await this.testManager.runTest(allTests[i]);
        this._updateTestResult(result);
      } catch (e) {
        this._updateTestResult({
          testId: allTests[i].id,
          category: allTests[i].category,
          resultKey: this._resultKey(allTests[i].id, allTests[i].category),
          status: 'failed',
          passed: false,
          skipped: false,
          error: e.message || String(e)
        });
      }
    }

    this.state.isRunning = false;
    this.state.runProgress = { current: 0, total: 0, currentTestName: '' };
  }

  _updateTestResult(result) {
    const key = result.resultKey || this._resultKey(result.testId, result.category);
    result.resultKey = key;
    const existingIndex = this.state.testResults.findIndex((r) => {
      const currentKey = r.resultKey || this._resultKey(r.testId, r.category);
      return currentKey === key;
    });
    if (existingIndex >= 0) {
      this.state.testResults[existingIndex] = result;
    } else {
      this.state.testResults.push(result);
    }
  }

  // ==================== 数据上传 ====================

  uploadCurrentResult() {
    if (!this.state.currentResult) {
      this.ui.showToast('请先运行测试');
      return;
    }
    this._uploadResults([this.state.currentResult], '上传中...');
  }

  uploadAllResults() {
    if (this.state.testResults.length === 0) {
      this.ui.showToast('暂无测试结果');
      return;
    }
    this._uploadResults(this.state.testResults, '正在上传...');
  }

  _uploadResults(results, loadingMsg) {
    if (!Array.isArray(results) || results.length === 0) {
      return Promise.resolve({ success: false, error: 'empty results' });
    }

    const payload = this._buildReportPayload(results);
    this.ui.showToast(loadingMsg);

    return new Promise((resolve) => {
      runtime.request({
        url: `${CONFIG.serverUrl}/report`,
        method: 'POST',
        header: { 'content-type': 'application/json' },
        data: payload,
        success: (res) => {
          if (res.statusCode === 200) {
            let response = res.data;
            if (typeof response === 'string') {
              try {
                response = JSON.parse(response);
              } catch (e) {
                response = { raw: res.data };
              }
            }
            this.ui.showToast(`上传成功: ${(response && response.saved) || results.length} 条 ✓`);
            resolve({ success: true, response });
          } else {
            this.ui.showToast(`上传失败: ${res.statusCode}`);
            resolve({ success: false, statusCode: res.statusCode, response: res.data });
          }
        },
        fail: (err) => {
          console.error('上传失败:', err);
          this.ui.showToast('上传失败，请检查服务器');
          console.log('=== TEST RESULTS ===');
          console.log(JSON.stringify(payload, null, 2));
          console.log('=== END ===');
          resolve({ success: false, error: err, payload });
        }
      });
    });
  }

  _buildSummary(results) {
    const summary = {
      total: results.length,
      passed: 0,
      failed: 0,
      skipped: 0,
      manualPending: 0,
      unknown: 0,
      executed: 0,
      flaky: 0,
      passRate: '0.0%',
      statusCounts: {
        passed: 0,
        failed: 0,
        skipped: 0,
        manual_pending: 0,
        unknown: 0
      },
      byAutomation: {},
      bySeverity: {}
    };

    for (const result of results) {
      const status = result.status || (result.passed ? 'passed' : 'failed');

      if (status === 'passed') summary.passed += 1;
      else if (status === 'failed') summary.failed += 1;
      else if (status === 'skipped') summary.skipped += 1;
      else if (status === 'manual_pending') summary.manualPending += 1;
      else summary.unknown += 1;

      if (status in summary.statusCounts) {
        summary.statusCounts[status] += 1;
      } else {
        summary.statusCounts.unknown += 1;
      }

      if (result.flaky) summary.flaky += 1;

      const automation = result.metadata && result.metadata.automation ? result.metadata.automation : 'unknown';
      const severity = result.metadata && result.metadata.severity ? result.metadata.severity : 'unknown';

      summary.byAutomation[automation] = (summary.byAutomation[automation] || 0) + 1;
      summary.bySeverity[severity] = (summary.bySeverity[severity] || 0) + 1;
    }

    summary.executed = summary.passed + summary.failed;

    summary.passRate = summary.executed > 0
      ? `${((summary.passed / summary.executed) * 100).toFixed(1)}%`
      : '0.0%';

    return summary;
  }

  _buildReportPayload(results) {
    const platform = this._detectPlatform();
    const device = this._getDeviceInfo();
    const deviceId = this._generateDeviceId(platform, device);

    const summary = this._buildSummary(results);

    return {
      version: CONFIG.version,
      runId: this.runId,
      timestamp: Date.now(),
      platform,
      deviceId,
      device,
      environment: {
        profile: this.testManager.getProfileInfo(),
        endpoints: {
          report: CONFIG.serverUrl,
          http: CONFIG.requestEndpoint,
          ws: CONFIG.wsEndpoint
        }
      },
      summary,
      results: results.map((r) => ({
        testId: r.testId,
        resultKey: r.resultKey || this._resultKey(r.testId, r.category),
        runId: this.runId,
        name: r.name,
        category: r.category,
        categoryNormalized: r.categoryNormalized,
        passed: r.passed,
        status: r.status || (r.passed ? 'passed' : 'failed'),
        skipped: Boolean(r.skipped),
        manualPending: Boolean(r.manualPending),
        flaky: Boolean(r.flaky),
        metadata: r.metadata || null,
        actual: r.actual,
        expected: r.expected,
        error: r.error || null,
        duration: r.duration || 0,
        type: r.type || 'sync',
        attempts: Array.isArray(r.attempts) ? r.attempts : [],
        executionMeta: r.executionMeta || null
      }))
    };
  }

  _getDeviceInfo() {
    return {
      brand: this.deviceInfo.brand || 'unknown',
      model: this.deviceInfo.model || 'unknown',
      system: this.deviceInfo.system || 'unknown',
      platform: this.deviceInfo.platform || 'unknown',
      SDKVersion: this.appBaseInfo.SDKVersion || 'unknown'
    };
  }

  _generateDeviceId(platform, device) {
    return `${platform}-${device.brand}-${device.model}`.replace(/\s+/g, '_').toLowerCase();
  }

  _detectPlatform() {
    if (typeof migo !== 'undefined') return 'migo';
    if (typeof wx !== 'undefined') return 'weixin';
    if (typeof qg !== 'undefined') return 'quickgame';
    return 'unknown';
  }

  // ==================== 渲染 ====================

  _renderCurrentPage() {
    switch (this.state.page) {
      case 'list':
        this.ui.renderListPage(
          this.testManager.getCategories(),
          this.state.selectedCategory,
          this.state.testResults,
          this.state.scrollY,
          this.state.isRunning,
          this.state.runProgress
        );
        break;

      case 'detail':
        this.ui.renderDetailPage(
          this.state.selectedTest,
          this.state.currentResult,
          this.state.isRunning,
          this.state.scrollY
        );
        break;

      default:
        break;
    }
  }
}

new TestApp();
