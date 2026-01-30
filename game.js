/**
 * Migo API 兼容性测试套件 - 主入口
 * 支持在 wx/migo/quickgame 等平台运行
 */

// ============ 配置 ============
const CONFIG = {
  // 测试结果上报服务器地址（真机测试时改为电脑局域网 IP）
  serverUrl: 'http://10.246.1.239:8765',
  // 报告版本
  version: '1.0.0',
  // 是否启用远程日志
  remoteLog: true
};
// ==============================

// 兼容不同平台的全局对象
const runtime = (typeof migo !== 'undefined') ? migo :
  (typeof wx !== 'undefined') ? wx :
    (typeof qg !== 'undefined') ? qg : null;

if (!runtime) {
  throw new Error('未检测到支持的小游戏运行时环境');
}

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
    // 序列化参数
    const serializedArgs = args.map(arg => {
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
      success: () => { },
      fail: () => { }
    });
  };

  ['log', 'info', 'warn', 'error', 'debug'].forEach(level => {
    console[level] = (...args) => {
      originalConsole[level](...args);
      sendLog(level, args);
    };
  });
}
// ======================================

// 导入模块
import { UI } from './src/ui.js';
import { TestManager } from './tests/test-manager.js';
import { testSpecs } from './tests/specs/index.js';

/**
 * 主应用类
 */
class TestApp {
  constructor() {
    this._initCanvas();
    this._initState();
    this._initModules();
    this._bindEvents();
    this._startRenderLoop();
  }

  // ==================== 初始化 ====================

  _initCanvas() {
    this.windowInfo = runtime.getWindowInfo();
    this.deviceInfo = runtime.getDeviceInfo();
    this.appBaseInfo = runtime.getAppBaseInfo();

    console.log('windowInfo: ', JSON.stringify(this.windowInfo), JSON.stringify(this.deviceInfo))

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
    this.testManager = new TestManager(runtime, testSpecs);
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
    // 点击区域已经是屏幕坐标，不需要转换
    const hitElement = this.ui.hitTest(x, y);
    if (!hitElement) return;

    const actions = {
      'category': () => this._toggleCategory(hitElement.data),
      'test': () => this._selectTest(hitElement.data),
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
    this.state.selectedCategory =
      this.state.selectedCategory === categoryId ? null : categoryId;
  }

  _selectTest(test) {
    this.state.selectedTest = test;
    this.state.page = 'detail';
    this.state.scrollY = 0; // 重置滚动位置
  }

  _goBack() {
    if (this.state.page === 'detail') {
      this.state.page = 'list';
      this.state.selectedTest = null;
      this.state.currentResult = null;
      this.state.scrollY = 0; // 重置滚动位置
    }
  }

  _clearResults() {
    this.state.testResults = [];
    this.state.currentResult = null;
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
        error: e.message,
        passed: false,
        testId: this.state.selectedTest.id
      };
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
      if(allTests[i].type !== 'sync') continue;

      try {
        const result = await this.testManager.runTest(allTests[i]);
        this._updateTestResult(result);
      } catch (e) {
        this._updateTestResult({
          testId: allTests[i].id,
          error: e.message,
          passed: false
        });
      }
    }

    this.state.isRunning = false;
    this.state.runProgress = { current: 0, total: 0, currentTestName: '' };
  }

  _updateTestResult(result) {
    const existingIndex = this.state.testResults.findIndex(r => r.testId === result.testId);
    if (existingIndex >= 0) {
      this.state.testResults[existingIndex] = result;
    } else {
      this.state.testResults.push(result);
    }
  }

  // ==================== 数据上传 ====================

  /**
   * 上传当前单个测试结果
   */
  uploadCurrentResult() {
    if (!this.state.currentResult) {
      this.ui.showToast('请先运行测试');
      return;
    }
    this._uploadResults([this.state.currentResult], '上传中...');
  }

  /**
   * 上传所有测试结果
   */
  uploadAllResults() {
    if (this.state.testResults.length === 0) {
      this.ui.showToast('暂无测试结果');
      return;
    }
    this._uploadResults(this.state.testResults, '正在上传...');
  }

  /**
   * 通用上传方法
   */
  _uploadResults(results, loadingMsg) {
    const payload = this._buildReportPayload(results);

    this.ui.showToast(loadingMsg);

    runtime.request({
      url: `${CONFIG.serverUrl}/report`,
      method: 'POST',
      header: { 'content-type': 'application/json' },
      data: payload,
      success: (res) => {
        if (res.statusCode === 200) {
          const response = typeof res.data === 'string' ? JSON.parse(res.data) : res.data;
          this.ui.showToast(`上传成功: ${response.saved || results.length} 条 ✓`);
        } else {
          this.ui.showToast(`上传失败: ${res.statusCode}`);
        }
      },
      fail: (err) => {
        console.error('上传失败:', err);
        this.ui.showToast('上传失败，请检查服务器');
        // 降级输出到控制台
        console.log('=== TEST RESULTS ===');
        console.log(JSON.stringify(payload, null, 2));
        console.log('=== END ===');
      }
    });
  }

  /**
   * 构建上报数据
   */
  _buildReportPayload(results) {
    const platform = this._detectPlatform();
    const device = this._getDeviceInfo();
    const deviceId = this._generateDeviceId(platform, device);

    return {
      version: CONFIG.version,
      timestamp: Date.now(),
      platform,
      deviceId,
      device,
      results: results.map(r => ({
        testId: r.testId,
        name: r.name,
        category: r.category,
        passed: r.passed,
        actual: r.actual,
        expected: r.expected,
        error: r.error || null,
        duration: r.duration || 0,
        type: r.type || 'sync'
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
    }
  }
}

// 启动应用
new TestApp();
