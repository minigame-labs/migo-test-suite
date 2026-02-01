/**
 * 测试管理器
 * 负责运行测试并收集结果
 */

export class TestManager {
  constructor(runtime, specs) {
    this.runtime = runtime;
    this.specs = specs;
    this.categories = this.buildCategories();
  }
  
  /**
   * 构建分类结构
   */
  buildCategories() {
    const categoryMap = new Map();
    
    for (const spec of this.specs) {
      if (!categoryMap.has(spec.category)) {
        categoryMap.set(spec.category, {
          id: spec.category,
          name: this.getCategoryName(spec.category),
          tests: []
        });
      }
      
      const category = categoryMap.get(spec.category);
      
      for (const test of spec.tests) {
        category.tests.push({
          ...test,
          specName: spec.name,
          category: spec.category
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
      device: '设备信息'
    };
    return names[categoryId] || categoryId;
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
      passed: false,
      actual: null,
      expected: test.expect,
      error: null,
      duration: 0,
      type: test.type || 'sync'
    };
    
    const start = Date.now();
    
    try {
      // 根据测试类型执行不同逻辑
      switch (test.type) {
        case 'sync':
          result.actual = test.run(this.runtime);
          break;
          
        case 'async':
          result.actual = await this.runAsync(test, test.timeout || 5000);
          break;
          
        case 'render':
          result.actual = await this.runRenderTest(test);
          break;
          
        case 'audio':
          result.actual = await this.runAudioTest(test);
          break;
          
        case 'navigate':
          result.actual = await this.runNavigateTest(test);
          break;
          
        case 'event':
          result.actual = await this.runEventTest(test, test.timeout || 3000);
          break;
          
        default:
          result.actual = test.run(this.runtime);
      }
      
      // 比较结果
      result.passed = this.compare(result.actual, result.expected, test.allowVariance);
      
    } catch (e) {
      result.error = e.message || String(e);
      result.passed = false;
      console.log(`${test.specName} failed, ${result.error}`)
    }
    
    result.duration = Math.round(Date.now() - start);
    return result;
  }
  
  /**
   * 运行异步测试
   */
  runAsync(test, timeout) {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error(`测试超时 (${timeout}ms)`));
      }, timeout);
      
      try {
        const result = test.run(this.runtime, (res) => {
          clearTimeout(timer);
          resolve(res);
        });
        
        // 如果返回Promise
        if (result && typeof result.then === 'function') {
          result.then((res) => {
            clearTimeout(timer);
            resolve(res);
          }).catch((err) => {
            clearTimeout(timer);
            reject(err);
          });
        }
      } catch (e) {
        clearTimeout(timer);
        reject(e);
      }
    });
  }
  
  /**
   * 运行渲染测试
   */
  async runRenderTest(test) {
    return new Promise((resolve, reject) => {
      try {
        // 创建离屏Canvas进行渲染测试
        const canvas = this.runtime.createCanvas();
        canvas.width = test.canvasWidth || 200;
        canvas.height = test.canvasHeight || 200;
        
        const ctx = canvas.getContext('2d');
        
        // 执行渲染
        const renderResult = test.run(this.runtime, ctx, canvas);
        
        // 等待一帧确保渲染完成
        requestAnimationFrame(() => {
          // 验证渲染结果
          let actual = {};
          
          if (test.verify) {
            actual = test.verify(ctx, canvas);
          } else {
            // 默认验证：检查像素数据
            try {
              const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
              actual = {
                hasPixels: imageData.data.some(v => v !== 0),
                width: canvas.width,
                height: canvas.height
              };
            } catch (e) {
              actual = { rendered: true, verifyError: e.message };
            }
          }
          
          resolve(actual);
        });
      } catch (e) {
        reject(e);
      }
    });
  }
  
  /**
   * 运行音频测试
   */
  async runAudioTest(test) {
    return new Promise((resolve, reject) => {
      const timeout = test.timeout || 5000;
      const timer = setTimeout(() => {
        reject(new Error(`音频测试超时 (${timeout}ms)`));
      }, timeout);
      
      try {
        test.run(this.runtime, (result) => {
          clearTimeout(timer);
          resolve(result);
        }, (error) => {
          clearTimeout(timer);
          reject(new Error(error));
        });
      } catch (e) {
        clearTimeout(timer);
        reject(e);
      }
    });
  }
  
  /**
   * 运行跳转/导航测试
   */
  async runNavigateTest(test) {
    // 跳转类测试通常只验证API是否存在和可调用
    // 不实际执行跳转（避免中断测试流程）
    return new Promise((resolve) => {
      try {
        const result = test.run(this.runtime, {
          dryRun: true, // 告诉测试只做检查不实际跳转
          onSuccess: (res) => resolve({ ...res, executed: false, apiExists: true }),
          onFail: (err) => resolve({ error: err, executed: false, apiExists: true })
        });
        
        if (result) {
          resolve(result);
        }
      } catch (e) {
        resolve({ error: e.message, apiExists: false });
      }
    });
  }
  
  /**
   * 运行事件测试
   */
  async runEventTest(test, timeout) {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        // 事件测试超时可能是正常的（没有触发事件）
        resolve({ timeout: true, eventReceived: false });
      }, timeout);
      
      try {
        test.run(this.runtime, (result) => {
          clearTimeout(timer);
          resolve({ ...result, eventReceived: true });
        });
      } catch (e) {
        clearTimeout(timer);
        reject(e);
      }
    });
  }
  
  /**
   * 比较测试结果
   */
  compare(actual, expected, allowVariance = []) {
    if (actual === null || actual === undefined) return false;
    if (!expected) return true; // 没有期望值则只要不报错就算通过
    
    for (const key in expected) {
      // 跳过允许差异的字段
      if (allowVariance && allowVariance.includes(key)) continue;
      
      // 通配符匹配
      if (expected[key] === '*') continue;
      
      // 类型检查
      if (expected[key] === '@string' && typeof actual[key] === 'string') continue;
      if (expected[key] === '@number' && typeof actual[key] === 'number') continue;
      if (expected[key] === '@boolean' && typeof actual[key] === 'boolean') continue;
      if (expected[key] === '@object' && typeof actual[key] === 'object') continue;
      if (expected[key] === '@function' && typeof actual[key] === 'function') continue;
      if (expected[key] === '@array' && Array.isArray(actual[key])) continue;
      if (expected[key] === '@exists' && actual[key] !== undefined) continue;
      
      // 范围检查
      if (typeof expected[key] === 'object' && expected[key] !== null) {
        if (expected[key].min !== undefined && actual[key] < expected[key].min) return false;
        if (expected[key].max !== undefined && actual[key] > expected[key].max) return false;
        if (expected[key].min !== undefined || expected[key].max !== undefined) continue;
      }
      
      // 严格相等比较
      if (actual[key] !== expected[key]) {
        return false;
      }
    }
    
    return true;
  }
}
