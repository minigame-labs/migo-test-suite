/**
 * Migo API 测试运行器
 */
class TestRunner {
  constructor() {
    this.results = [];
  }

  /**
   * 运行所有测试套件
   */
  async runAll(specs) {
    const report = {
      timestamp: Date.now(),
      platform: this.detectPlatform(),
      device: this.getDeviceInfo(),
      suites: [],
      summary: { total: 0, passed: 0, failed: 0, skipped: 0 }
    };

    for (const spec of specs) {
      const suiteResult = await this.runSuite(spec);
      report.suites.push(suiteResult);

      // 更新统计
      for (const test of suiteResult.tests) {
        report.summary.total++;
        if (test.passed) report.summary.passed++;
        else if (test.skipped) report.summary.skipped++;
        else report.summary.failed++;
      }
    }

    report.summary.passRate =
      ((report.summary.passed / report.summary.total) * 100).toFixed(1) + '%';

    return report;
  }

  /**
   * 运行单个测试套件
   */
  async runSuite(spec) {
    const suite = {
      name: spec.name,
      category: spec.category,
      tests: [],
      passed: 0,
      failed: 0
    };

    for (const test of spec.tests) {
      const result = await this.runTest(test);
      suite.tests.push(result);
      if (result.passed) suite.passed++;
      else suite.failed++;
    }

    return suite;
  }

  /**
   * 运行单个测试
   */
  async runTest(test) {
    const result = {
      id: test.id,
      name: test.name,
      passed: false,
      skipped: false,
      actual: null,
      expected: test.expect,
      error: null,
      duration: 0
    };

    const start = performance.now();

    try {
      if (test.skip) {
        result.skipped = true;
        result.passed = true;
        return result;
      }

      if (test.async) {
        result.actual = await this.runAsync(test.run, test.timeout || 5000);
      } else {
        result.actual = test.run();
      }

      result.passed = this.compare(result.actual, result.expected, test.allowVariance);
    } catch (e) {
      result.error = e.message || String(e);
      result.passed = false;
    }

    result.duration = Math.round(performance.now() - start);
    return result;
  }

  /**
   * 运行异步测试
   */
  runAsync(fn, timeout) {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error(`Test timeout after ${timeout}ms`));
      }, timeout);

      try {
        fn((result) => {
          clearTimeout(timer);
          resolve(result);
        });
      } catch (e) {
        clearTimeout(timer);
        reject(e);
      }
    });
  }

  /**
   * 比较实际结果与期望值
   */
  compare(actual, expected, allowVariance = []) {
    if (actual === null || actual === undefined) return false;

    for (const key in expected) {
      // 跳过允许差异的字段
      if (allowVariance.includes(key)) continue;

      // 通配符
      if (expected[key] === '*') continue;

      // 严格比较
      if (actual[key] !== expected[key]) {
        return false;
      }
    }
    return true;
  }

  /**
   * 检测运行平台
   */
  detectPlatform() {
    if (typeof migo !== 'undefined') {
      // 检查是否是 Migo 环境
      if (migo.__migo__ || (typeof __migo_version__ !== 'undefined')) {
        return 'migo';
      }
      return 'reference';
    }
    return 'unknown';
  }

  /**
   * 获取设备信息
   */
  getDeviceInfo() {
    try {
      const info = migo.getSystemInfoSync();
      return {
        brand: info.brand || 'unknown',
        model: info.model || 'unknown',
        system: info.system || 'unknown',
        platform: info.platform || 'unknown',
        SDKVersion: info.SDKVersion || 'unknown'
      };
    } catch (e) {
      return { error: e.message };
    }
  }

  /**
   * 生成 JSON 报告
   */
  toJSON(report) {
    return JSON.stringify(report, null, 2);
  }

  /**
   * 生成控制台摘要
   */
  printSummary(report) {
    console.log('\n========== Test Report ==========');
    console.log(`Platform: ${report.platform}`);
    console.log(`Device: ${report.device.brand} ${report.device.model}`);
    console.log(`Time: ${new Date(report.timestamp).toISOString()}`);
    console.log('');
    console.log(`Total: ${report.summary.total}`);
    console.log(`Passed: ${report.summary.passed} ✅`);
    console.log(`Failed: ${report.summary.failed} ❌`);
    console.log(`Skipped: ${report.summary.skipped} ⏭️`);
    console.log(`Pass Rate: ${report.summary.passRate}`);
    console.log('==================================\n');

    // 打印失败的测试
    for (const suite of report.suites) {
      for (const test of suite.tests) {
        if (!test.passed && !test.skipped) {
          console.log(`❌ ${suite.name} > ${test.name}`);
          console.log(`   Expected: ${JSON.stringify(test.expected)}`);
          console.log(`   Actual: ${JSON.stringify(test.actual)}`);
          if (test.error) console.log(`   Error: ${test.error}`);
        }
      }
    }
  }
}

export default TestRunner;
