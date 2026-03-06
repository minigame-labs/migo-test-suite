/**
 * 测试管理器
 * 负责运行测试并收集结果
 */

const MANUAL_HINT_RE = /人工|手动|观察|请听|请观察|需触发|需点击|需按键|manual/i;
const UNSUPPORTED_HINT_RE = /not supported|api missing|not found|不存在|缺失|unsupported|_error/i;

const DEFAULT_PROFILE = {
  name: 'full',
  includeAutomation: ['ci', 'device_lab', 'manual'],
  includeSeverity: ['P0', 'P1', 'P2'],
  includeTypes: ['sync', 'async', 'render', 'audio', 'event', 'navigate'],
  includeManual: true,
  runManualTests: true,
  defaultTimeoutMs: 10000,
  defaultRetries: 0,
  maxRetries: 1
};

export class TestManager {
  constructor(runtime, specs, options = {}) {
    this.runtime = runtime;
    this.specs = Array.isArray(specs) ? specs : [];
    this.profile = this.resolveProfile(options.profile);
    this.categories = this.buildCategories();
  }

  resolveProfile(profile) {
    if (!profile || typeof profile !== 'object') {
      return { ...DEFAULT_PROFILE };
    }

    const merged = {
      ...DEFAULT_PROFILE,
      ...profile,
      includeAutomation: Array.isArray(profile.includeAutomation)
        ? [...profile.includeAutomation]
        : [...DEFAULT_PROFILE.includeAutomation],
      includeSeverity: Array.isArray(profile.includeSeverity)
        ? [...profile.includeSeverity]
        : [...DEFAULT_PROFILE.includeSeverity],
      includeTypes: Array.isArray(profile.includeTypes)
        ? [...profile.includeTypes]
        : [...DEFAULT_PROFILE.includeTypes]
    };

    return merged;
  }

  getProfileInfo() {
    return { ...this.profile };
  }

  normalizeCategory(categoryId) {
    if (!categoryId || typeof categoryId !== 'string') {
      return 'unknown';
    }
    return categoryId.split('/')[0];
  }

  inferSeverity(categoryId = 'unknown') {
    if (/^(base|file|network|timer|input|render|worker|storage|performance|canvas|audio)/.test(categoryId)) {
      return 'P0';
    }
    if (/^(device|ui|media|ext|util|data-analysis)/.test(categoryId)) {
      return 'P1';
    }
    return 'P2';
  }

  inferAutomation(type, testName, description) {
    const hint = `${testName || ''} ${description || ''}`;
    if (MANUAL_HINT_RE.test(hint)) {
      return 'manual';
    }

    if (type === 'event' || type === 'navigate') {
      return 'device_lab';
    }

    if (type === 'audio' && /听|观察|loop|seek|playbackRate/i.test(hint)) {
      return 'manual';
    }

    return 'ci';
  }

  inferRequires(categoryId, type, description = '') {
    const requires = [];

    if (type === 'render') {
      requires.push('render_canvas');
    }
    if (type === 'audio') {
      requires.push('audio_output');
    }
    if (type === 'event') {
      requires.push('event_loop');
    }
    if (type === 'navigate') {
      requires.push('platform_navigation');
    }

    if (categoryId.startsWith('network/request')) {
      requires.push('network_http');
    } else if (categoryId.startsWith('network/websocket')) {
      requires.push('network_ws');
    } else if (categoryId.startsWith('network/upload') || categoryId.startsWith('network/download')) {
      requires.push('network_file_transfer');
    } else if (categoryId.startsWith('network/tcp') || categoryId.startsWith('network/udp')) {
      requires.push('network_socket');
    }

    if (categoryId.startsWith('worker')) {
      requires.push('worker_runtime');
    }
    if (categoryId.startsWith('device')) {
      requires.push('device_capability');
    }

    if (MANUAL_HINT_RE.test(description || '')) {
      requires.push('human_interaction');
    }

    return requires;
  }

  normalizeMetadata(spec, test) {
    const type = test.type || 'sync';
    const category = spec.category || 'unknown';

    const meta = {
      automation: test.automation || this.inferAutomation(type, test.name, test.description),
      severity: test.severity || this.inferSeverity(category),
      unsupportedPolicy: test.unsupportedPolicy,
      timeoutMs: Number.isFinite(test.timeoutMs) ? test.timeoutMs : (Number.isFinite(test.timeout) ? test.timeout : this.profile.defaultTimeoutMs),
      retries: Number.isInteger(test.retries) ? test.retries : this.profile.defaultRetries,
      requires: Array.isArray(test.requires) ? [...test.requires] : [],
      manualRequired: Boolean(test.manualRequired) || MANUAL_HINT_RE.test(`${test.name || ''} ${test.description || ''}`)
    };

    meta.requires = [...new Set([...meta.requires, ...this.inferRequires(category, type, test.description || '')])];

    if (!meta.unsupportedPolicy) {
      meta.unsupportedPolicy = (meta.automation === 'ci' && meta.severity === 'P0') ? 'fail' : 'skip';
    }

    if (meta.automation === 'manual') {
      meta.manualRequired = true;
    }

    const maxRetries = Number.isFinite(this.profile.maxRetries) ? this.profile.maxRetries : meta.retries;
    meta.retries = Math.max(0, Math.min(meta.retries, maxRetries));

    return meta;
  }

  shouldIncludeTest(type, metadata) {
    const includeTypes = new Set(this.profile.includeTypes || []);
    if (includeTypes.size > 0 && !includeTypes.has(type)) {
      return false;
    }

    const includeAutomation = new Set(this.profile.includeAutomation || []);
    if (includeAutomation.size > 0 && !includeAutomation.has(metadata.automation)) {
      return false;
    }

    const includeSeverity = new Set(this.profile.includeSeverity || []);
    if (includeSeverity.size > 0 && !includeSeverity.has(metadata.severity)) {
      return false;
    }

    if (!this.profile.includeManual && metadata.automation === 'manual') {
      return false;
    }

    return true;
  }

  /**
   * 构建分类结构
   */
  buildCategories() {
    const categoryMap = new Map();

    for (const spec of this.specs) {
      if (!spec || !Array.isArray(spec.tests)) {
        continue;
      }

      for (const test of spec.tests) {
        if (!test || typeof test !== 'object') {
          continue;
        }

        const type = test.type || 'sync';
        const metadata = this.normalizeMetadata(spec, test);

        if (!this.shouldIncludeTest(type, metadata)) {
          continue;
        }

        const categoryId = spec.category || 'unknown';
        if (!categoryMap.has(categoryId)) {
          categoryMap.set(categoryId, {
            id: categoryId,
            normalizedId: this.normalizeCategory(categoryId),
            name: this.getCategoryName(categoryId),
            tests: []
          });
        }

        const category = categoryMap.get(categoryId);
        category.tests.push({
          ...test,
          specName: spec.name,
          category: categoryId,
          categoryNormalized: this.normalizeCategory(categoryId),
          metadata
        });
      }
    }

    return Array.from(categoryMap.values());
  }

  /**
   * 获取分类名称
   */
  getCategoryName(categoryId) {
    const names = {
      base: '基础 API',
      canvas: '画布 Canvas',
      audio: '音频 Audio',
      file: '文件系统',
      network: '网络请求',
      input: '输入事件',
      timer: '定时器',
      performance: '性能',
      device: '设备信息',
      worker: 'Worker',
      storage: '存储',
      render: '渲染',
      ui: '界面',
      media: '媒体'
    };
    const normalized = this.normalizeCategory(categoryId);
    return names[categoryId] || names[normalized] || categoryId;
  }

  /**
   * 获取所有分类
   */
  getCategories() {
    return this.categories;
  }

  /**
   * 获取所有测试
   */
  getAllTests() {
    const tests = [];
    for (const category of this.categories) {
      tests.push(...category.tests);
    }
    return tests;
  }

  /**
   * 运行单个测试
   */
  async runTest(test) {
    const result = {
      testId: test.id,
      name: test.specName,
      category: test.category,
      categoryNormalized: test.categoryNormalized || this.normalizeCategory(test.category),
      passed: false,
      status: 'failed',
      skipped: false,
      manualPending: false,
      flaky: false,
      actual: null,
      expected: test.expect,
      error: null,
      duration: 0,
      type: test.type || 'sync',
      metadata: test.metadata || null,
      attempts: [],
      executionMeta: null
    };

    const start = Date.now();
    const metadata = test.metadata || this.normalizeMetadata({ category: test.category || 'unknown' }, test);

    if (metadata.automation === 'manual' && !this.profile.runManualTests) {
      result.status = 'manual_pending';
      result.manualPending = true;
      result.skipped = true;
      result.error = 'manual test skipped by profile';
      result.duration = Math.round(Date.now() - start);
      return result;
    }

    const maxAttempts = 1 + Math.max(0, metadata.retries || 0);
    for (let i = 0; i < maxAttempts; i++) {
      const attemptNo = i + 1;
      const attemptStart = Date.now();

      try {
        const execution = await this.executeTestByType(test, metadata.timeoutMs);
        const evaluation = this.evaluateResult(execution.actual, test, metadata);

        const attempt = {
          attempt: attemptNo,
          status: evaluation.status,
          passed: evaluation.status === 'passed',
          skipped: evaluation.status === 'skipped' || evaluation.status === 'manual_pending',
          reason: evaluation.reason || null,
          duration: Math.round(Date.now() - attemptStart)
        };

        result.attempts.push(attempt);

        result.actual = execution.actual;
        result.executionMeta = execution.meta || null;
        result.error = evaluation.error || null;
        result.status = evaluation.status;
        result.passed = evaluation.status === 'passed';
        result.skipped = evaluation.status === 'skipped' || evaluation.status === 'manual_pending';
        result.manualPending = evaluation.status === 'manual_pending';

        if (evaluation.status === 'passed' || evaluation.status === 'skipped' || evaluation.status === 'manual_pending') {
          break;
        }
      } catch (e) {
        const errMsg = e && e.message ? e.message : String(e);
        result.attempts.push({
          attempt: attemptNo,
          status: 'failed',
          passed: false,
          skipped: false,
          reason: errMsg,
          duration: Math.round(Date.now() - attemptStart)
        });

        result.status = 'failed';
        result.error = errMsg;
        result.passed = false;
      } finally {
        if (typeof test.cleanup === 'function') {
          try {
            test.cleanup(this.runtime);
          } catch (cleanupErr) {
            console.warn(`[cleanup] ${test.id} failed:`, cleanupErr);
          }
        }
      }
    }

    result.flaky = this.isFlaky(result.attempts);
    result.duration = Math.round(Date.now() - start);
    return result;
  }

  isFlaky(attempts) {
    if (!Array.isArray(attempts) || attempts.length < 2) {
      return false;
    }
    const hasFailed = attempts.some((a) => a.status === 'failed');
    const hasPassed = attempts.some((a) => a.status === 'passed');
    return hasFailed && hasPassed;
  }

  evaluateResult(actual, test, metadata) {
    const unsupportedReason = this.getUnsupportedReason(actual);
    if (unsupportedReason) {
      if (metadata.unsupportedPolicy === 'skip') {
        return { status: 'skipped', reason: unsupportedReason, error: unsupportedReason };
      }
      return { status: 'failed', reason: unsupportedReason, error: unsupportedReason };
    }

    if (metadata.automation === 'manual' && actual && typeof actual === 'object' && actual.timeout === true) {
      return { status: 'manual_pending', reason: 'manual verification pending' };
    }

    if (typeof actual === 'string') {
      if (/^PASS\b/.test(actual)) {
        return { status: 'passed' };
      }
      if (/^FAIL\b/.test(actual)) {
        return { status: 'failed', error: actual };
      }
    }

    if (typeof test.expect === 'undefined') {
      return { status: 'passed' };
    }

    const ok = this.compare(actual, test.expect, test.allowVariance || []);
    if (!ok) {
      return { status: 'failed', error: 'actual does not match expected' };
    }

    return { status: 'passed' };
  }

  getUnsupportedReason(value) {
    if (value === null || typeof value === 'undefined') {
      return null;
    }

    if (typeof value === 'string') {
      if (UNSUPPORTED_HINT_RE.test(value)) {
        return value;
      }
      return null;
    }

    if (typeof value !== 'object') {
      return null;
    }

    if (typeof value._error === 'string' && value._error.length > 0) {
      return value._error;
    }

    if (typeof value.error === 'string' && UNSUPPORTED_HINT_RE.test(value.error)) {
      return value.error;
    }

    for (const key of Object.keys(value)) {
      const next = value[key];
      const reason = this.getUnsupportedReason(next);
      if (reason) {
        return reason;
      }
    }

    return null;
  }

  async executeTestByType(test, timeoutMs) {
    switch (test.type) {
      case 'sync':
        return { actual: test.run(this.runtime), meta: null };
      case 'async':
        return { actual: await this.runAsync(test, timeoutMs), meta: null };
      case 'render':
        return await this.runRenderTest(test, timeoutMs);
      case 'audio':
        return await this.runAudioTest(test, timeoutMs);
      case 'navigate':
        return { actual: await this.runNavigateTest(test, timeoutMs), meta: null };
      case 'event':
        return { actual: await this.runEventTest(test, timeoutMs), meta: null };
      default:
        return { actual: test.run(this.runtime), meta: null };
    }
  }

  /**
   * 运行异步测试
   */
  runAsync(test, timeoutMs) {
    return new Promise((resolve, reject) => {
      let settled = false;
      const timeout = timeoutMs || 10000;

      const timer = setTimeout(() => {
        if (settled) return;
        settled = true;
        reject(new Error(`测试超时 (${timeout}ms)`));
      }, timeout);

      const doneResolve = (res) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        resolve(res);
      };

      const doneReject = (err) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        reject(err instanceof Error ? err : new Error(String(err)));
      };

      try {
        const maybePromise = test.run(this.runtime, doneResolve);

        if (maybePromise && typeof maybePromise.then === 'function') {
          maybePromise.then(doneResolve).catch(doneReject);
        }
      } catch (e) {
        doneReject(e);
      }
    });
  }

  buildRenderFingerprint(ctx, canvas) {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    const totalPixels = Math.floor(data.length / 4);
    const sampleStep = Math.max(1, Math.floor(totalPixels / 2048));

    let nonZero = 0;
    let sampled = 0;
    let hash = 2166136261;

    for (let px = 0; px < totalPixels; px += sampleStep) {
      const idx = px * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      const a = data[idx + 3];

      sampled += 1;
      if (r !== 0 || g !== 0 || b !== 0 || a !== 0) {
        nonZero += 1;
      }

      hash ^= r;
      hash = Math.imul(hash, 16777619);
      hash ^= g;
      hash = Math.imul(hash, 16777619);
      hash ^= b;
      hash = Math.imul(hash, 16777619);
      hash ^= a;
      hash = Math.imul(hash, 16777619);
    }

    return {
      width: canvas.width,
      height: canvas.height,
      sampledPixels: sampled,
      nonZeroRatio: sampled > 0 ? Number((nonZero / sampled).toFixed(6)) : 0,
      hash: (hash >>> 0).toString(16).padStart(8, '0')
    };
  }

  /**
   * 运行渲染测试
   */
  runRenderTest(test, timeoutMs) {
    return new Promise((resolve, reject) => {
      const timeout = timeoutMs || 10000;
      const timer = setTimeout(() => {
        reject(new Error(`渲染测试超时 (${timeout}ms)`));
      }, timeout);

      try {
        const canvas = this.runtime.createCanvas();
        canvas.width = test.canvasWidth || 200;
        canvas.height = test.canvasHeight || 200;

        const ctx = canvas.getContext('2d');
        test.run(this.runtime, ctx, canvas);

        const raf = (typeof requestAnimationFrame === 'function')
          ? requestAnimationFrame
          : (cb) => setTimeout(cb, 16);

        raf(() => {
          clearTimeout(timer);
          try {
            let actual;
            if (typeof test.verify === 'function') {
              actual = test.verify(ctx, canvas);
            } else {
              const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
              actual = {
                hasPixels: imageData.data.some((v) => v !== 0),
                width: canvas.width,
                height: canvas.height
              };
            }

            let renderFingerprint = null;
            try {
              renderFingerprint = this.buildRenderFingerprint(ctx, canvas);
            } catch (e) {
              renderFingerprint = { error: e.message || String(e) };
            }

            if (actual && typeof actual === 'object' && !Array.isArray(actual)) {
              actual = {
                ...actual,
                _renderFingerprint: renderFingerprint
              };
            }

            resolve({
              actual,
              meta: {
                renderFingerprint
              }
            });
          } catch (e) {
            reject(e);
          }
        });
      } catch (e) {
        clearTimeout(timer);
        reject(e);
      }
    });
  }

  /**
   * 运行音频测试
   */
  runAudioTest(test, timeoutMs) {
    return new Promise((resolve, reject) => {
      const timeout = timeoutMs || 8000;
      const startedAt = Date.now();
      let settled = false;

      const timer = setTimeout(() => {
        if (settled) return;
        settled = true;
        reject(new Error(`音频测试超时 (${timeout}ms)`));
      }, timeout);

      const finish = (ok, payload) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);

        const telemetry = {
          callbackLatencyMs: Date.now() - startedAt,
          finishedBy: ok ? 'success_callback' : 'error_callback'
        };

        if (!ok) {
          reject(payload instanceof Error ? payload : new Error(String(payload)));
          return;
        }

        resolve({
          actual: payload,
          meta: { audioTelemetry: telemetry }
        });
      };

      try {
        const maybePromise = test.run(
          this.runtime,
          (res) => finish(true, res),
          (err) => finish(false, err)
        );

        if (maybePromise && typeof maybePromise.then === 'function') {
          maybePromise
            .then((res) => finish(true, res))
            .catch((err) => finish(false, err));
        }
      } catch (e) {
        finish(false, e);
      }
    });
  }

  /**
   * 运行跳转/导航测试
   */
  runNavigateTest(test, timeoutMs) {
    return new Promise((resolve) => {
      const timeout = timeoutMs || 5000;
      let settled = false;

      const finish = (payload) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        resolve(payload);
      };

      const timer = setTimeout(() => {
        finish({ timeout: true, _error: `navigate test timeout (${timeout}ms)` });
      }, timeout);

      try {
        const result = test.run(this.runtime, {
          dryRun: true,
          onSuccess: (res) => finish({ ...(res || {}), executed: false, apiExists: true }),
          onFail: (err) => finish({ error: err, executed: false, apiExists: true }),
          onError: (err) => finish({ error: err, executed: false, apiExists: true })
        });

        if (result && typeof result.then === 'function') {
          result
            .then((res) => {
              if (typeof res === 'undefined') {
                finish({ apiExists: true, executed: false });
              } else {
                finish(res);
              }
            })
            .catch((err) => {
              const message = err && err.message ? err.message : String(err);
              finish({ error: message, apiExists: false });
            });
          return;
        }

        if (typeof result !== 'undefined') {
          finish(result);
        }
      } catch (e) {
        finish({ error: e.message || String(e), apiExists: false });
      }
    });
  }

  /**
   * 运行事件测试
   */
  runEventTest(test, timeoutMs) {
    return new Promise((resolve, reject) => {
      const timeout = timeoutMs || 3000;
      let settled = false;
      const timer = setTimeout(() => {
        if (settled) return;
        settled = true;
        resolve({ timeout: true, eventReceived: false });
      }, timeout);

      try {
        test.run(this.runtime, (result) => {
          if (settled) return;
          settled = true;
          clearTimeout(timer);
          if (result && typeof result === 'object') {
            resolve({ ...result, eventReceived: true });
          } else {
            resolve({ value: result, eventReceived: true });
          }
        });
      } catch (e) {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        reject(e);
      }
    });
  }

  pathIsVaried(path, allowVarianceSet) {
    if (!path || !allowVarianceSet || allowVarianceSet.size === 0) {
      return false;
    }

    for (const variancePath of allowVarianceSet) {
      if (path === variancePath || path.startsWith(`${variancePath}.`)) {
        return true;
      }
    }
    return false;
  }

  isRangeExpectation(value) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      return false;
    }
    const keys = Object.keys(value);
    if (keys.length === 0) {
      return false;
    }
    return keys.every((k) => k === 'min' || k === 'max');
  }

  matchTypeToken(actual, token) {
    switch (token) {
      case '@string':
        return typeof actual === 'string';
      case '@number':
        return typeof actual === 'number' && Number.isFinite(actual);
      case '@boolean':
        return typeof actual === 'boolean';
      case '@object':
        return typeof actual === 'object' && actual !== null && !Array.isArray(actual);
      case '@function':
        return typeof actual === 'function';
      case '@array':
        return Array.isArray(actual);
      case '@exists':
        return typeof actual !== 'undefined';
      case '@arraybuffer':
      case '@ArrayBuffer':
        return actual instanceof ArrayBuffer;
      case '@typedarray':
        return ArrayBuffer.isView(actual);
      default:
        return false;
    }
  }

  compareValue(actual, expected, allowVarianceSet, path = '') {
    if (this.pathIsVaried(path, allowVarianceSet)) {
      return true;
    }

    if (expected === '*') {
      return true;
    }

    if (typeof expected === 'string' && expected.startsWith('@')) {
      return this.matchTypeToken(actual, expected);
    }

    if (this.isRangeExpectation(expected)) {
      if (typeof actual !== 'number') {
        return false;
      }
      if (typeof expected.min === 'number' && actual < expected.min) {
        return false;
      }
      if (typeof expected.max === 'number' && actual > expected.max) {
        return false;
      }
      return true;
    }

    if (Array.isArray(expected)) {
      if (!Array.isArray(actual)) {
        return false;
      }
      if (actual.length < expected.length) {
        return false;
      }
      for (let i = 0; i < expected.length; i++) {
        const itemPath = path ? `${path}.${i}` : String(i);
        if (!this.compareValue(actual[i], expected[i], allowVarianceSet, itemPath)) {
          return false;
        }
      }
      return true;
    }

    if (expected && typeof expected === 'object') {
      if (!actual || typeof actual !== 'object') {
        return false;
      }
      for (const key of Object.keys(expected)) {
        const childPath = path ? `${path}.${key}` : key;
        if (!this.compareValue(actual[key], expected[key], allowVarianceSet, childPath)) {
          return false;
        }
      }
      return true;
    }

    return actual === expected;
  }

  /**
   * 比较测试结果（支持深层对象、数组、路径级 allowVariance）
   */
  compare(actual, expected, allowVariance = []) {
    if (typeof expected === 'undefined') {
      return true;
    }
    if (actual === null || typeof actual === 'undefined') {
      return false;
    }

    const allowVarianceSet = new Set(
      Array.isArray(allowVariance)
        ? allowVariance
            .filter((v) => typeof v === 'string')
            .map((v) => v.trim())
            .filter(Boolean)
        : []
    );

    return this.compareValue(actual, expected, allowVarianceSet);
  }
}
