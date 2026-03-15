/**
 * UI 渲染模块 - 基于 Canvas 2D
 */

// 主题配置
const THEME = {
  // 颜色
  colors: {
    bg: '#0f172a',
    cardBg: '#1e293b',
    cardBgHover: '#334155',
    primary: '#3b82f6',
    primaryDark: '#2563eb',
    success: '#22c55e',
    error: '#ef4444',
    warning: '#f59e0b',
    text: '#f8fafc',
    textSecondary: '#94a3b8',
    textMuted: '#64748b',
    border: '#334155',
    divider: '#475569'
  },
  // 字体
  fonts: {
    title: 'bold 18px "PingFang SC", "Microsoft YaHei", sans-serif',
    subtitle: 'bold 16px "PingFang SC", "Microsoft YaHei", sans-serif',
    body: '14px "PingFang SC", "Microsoft YaHei", sans-serif',
    small: '12px "PingFang SC", "Microsoft YaHei", sans-serif',
    mono: '13px "SF Mono", "Consolas", monospace'
  },
  // 间距
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24
  },
  // 圆角
  radius: {
    sm: 4,
    md: 8,
    lg: 12
  }
};

// API类型图标和颜色
const API_TYPE_CONFIG = {
  sync: { icon: '⚡', color: '#22c55e', label: '同步' },
  async: { icon: '⏳', color: '#3b82f6', label: '异步' },
  render: { icon: '🎨', color: '#a855f7', label: '渲染' },
  audio: { icon: '🔊', color: '#f59e0b', label: '音频' },
  navigate: { icon: '🔗', color: '#06b6d4', label: '跳转' },
  event: { icon: '📡', color: '#ec4899', label: '事件' }
};

// 尺寸常量
const DIMENSIONS = {
  HEADER_HEIGHT: 52,
  CATEGORY_HEADER_HEIGHT: 48,
  CATEGORY_MARGIN_BOTTOM: 8,
  TEST_ITEM_HEIGHT: 52,
  TEST_ITEM_MARGIN_BOTTOM: 4,
  CATEGORY_GROUP_BOTTOM_SPACING: 8,
  
  // 组合高度
  get CATEGORY_TOTAL_HEADER() { return this.CATEGORY_HEADER_HEIGHT + this.CATEGORY_MARGIN_BOTTOM; },
  get TEST_ITEM_TOTAL() { return this.TEST_ITEM_HEIGHT + this.TEST_ITEM_MARGIN_BOTTOM; }
};

export class UI {
  constructor(ctx, width, height, dpr = 1) {
    this.ctx = ctx;
    this.width = width;
    this.height = height;
    this.dpr = dpr;
    
    // 点击区域映射
    this.hitAreas = [];
    
    // Toast 状态
    this.toast = null;
    this.toastTimer = null;
    
    // 固定区域高度（头部）
    this.headerHeight = DIMENSIONS.HEADER_HEIGHT;
    
    // 内容总高度（用于滚动边界计算）
    this.contentHeight = 0;
  }
  
  /**
   * 获取最大滚动距离
   */
  getMaxScrollY() {
    return Math.max(0, this.contentHeight - (this.height - this.headerHeight));
  }
  
  /**
   * 清空点击区域
   */
  clearHitAreas() {
    this.hitAreas = [];
  }

  getResultStatus(result) {
    if (!result) return 'pending';
    if (typeof result.status === 'string' && result.status.length > 0) {
      return result.status;
    }
    return result.passed ? 'passed' : 'failed';
  }

  getResultForTest(resultSource, test) {
    if (!test) return null;
    const expectedKey = `${test.category || 'unknown'}::${test.id || 'unknown'}`;

    if (resultSource instanceof Map) {
      return resultSource.get(expectedKey) || resultSource.get(`legacy::${test.id || 'unknown'}`) || null;
    }

    if (!Array.isArray(resultSource)) return null;
    return resultSource.find((result) => {
      const key = result.resultKey || `${result.category || 'unknown'}::${result.testId || 'unknown'}`;
      if (key === expectedKey) return true;
      return result.testId === test.id && result.category === test.category;
    }) || null;
  }

  buildStats(testResults) {
    const stats = {
      total: Array.isArray(testResults) ? testResults.length : 0,
      passed: 0,
      failed: 0,
      skipped: 0,
      manualPending: 0,
      flaky: 0
    };

    for (const result of (testResults || [])) {
      const status = this.getResultStatus(result);
      if (status === 'passed') stats.passed += 1;
      else if (status === 'skipped') stats.skipped += 1;
      else if (status === 'manual_pending') stats.manualPending += 1;
      else if (status === 'failed') stats.failed += 1;
      else stats.failed += 1;

      if (result && result.flaky) {
        stats.flaky += 1;
      }
    }

    return stats;
  }

  buildResultIndex(testResults) {
    const index = new Map();
    for (const result of (testResults || [])) {
      if (!result || typeof result !== 'object') continue;
      const key = result.resultKey || `${result.category || 'unknown'}::${result.testId || 'unknown'}`;
      index.set(key, result);

      if (result.testId && !index.has(`legacy::${result.testId}`)) {
        index.set(`legacy::${result.testId}`, result);
      }
    }
    return index;
  }

  buildCategoryPassIndex(testResults) {
    const index = new Map();
    for (const result of (testResults || [])) {
      if (!result || typeof result !== 'object') continue;
      if (this.getResultStatus(result) !== 'passed') continue;
      if (typeof result.category !== 'string' || result.category.length === 0) continue;
      index.set(result.category, (index.get(result.category) || 0) + 1);
    }
    return index;
  }
  
  /**
   * 注册点击区域
   * @param {boolean} isFixed - 是否是固定区域（不受滚动裁剪影响）
   */
  registerHitArea(x, y, w, h, type, data, isFixed = false) {
    // 检查是否在可见区域内
    if (!isFixed) {
      // 非固定元素：检查是否在头部以下且在屏幕内
      if (y + h < this.headerHeight || y > this.height) {
        return; // 完全不可见，不注册
      }
      // 如果部分被头部遮挡，调整点击区域
      if (y < this.headerHeight) {
        const visibleH = h - (this.headerHeight - y);
        if (visibleH <= 0) return;
        y = this.headerHeight;
        h = visibleH;
      }
    }
    this.hitAreas.push({ x, y, w, h, type, data });
  }
  
  /**
   * 点击测试
   */
  hitTest(x, y) {
    for (let i = this.hitAreas.length - 1; i >= 0; i--) {
      const area = this.hitAreas[i];
      if (x >= area.x && x <= area.x + area.w &&
          y >= area.y && y <= area.y + area.h) {
        return { type: area.type, data: area.data };
      }
    }
    return null;
  }
  
  /**
   * 显示 Toast
   */
  showToast(message, duration = 2000) {
    this.toast = { message, alpha: 1 };
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => {
      this.toast = null;
    }, duration);
  }
  
  /**
   * 绘制圆角矩形
   */
  roundRect(x, y, w, h, r) {
    const ctx = this.ctx;
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }
  
  /**
   * 绘制按钮
   */
  drawButton(x, y, w, h, text, options = {}) {
    const ctx = this.ctx;
    const {
      type = 'primary',
      disabled = false,
      hitType = null,
      hitData = null,
      isFixed = false
    } = options;
    
    // 背景颜色
    let bgColor = THEME.colors.primary;
    if (type === 'success') bgColor = THEME.colors.success;
    else if (type === 'error') bgColor = THEME.colors.error;
    else if (type === 'secondary') bgColor = THEME.colors.cardBg;
    
    if (disabled) bgColor = THEME.colors.textMuted;
    
    // 绘制背景
    ctx.fillStyle = bgColor;
    this.roundRect(x, y, w, h, THEME.radius.md);
    ctx.fill();
    
    // 绘制文字
    ctx.fillStyle = THEME.colors.text;
    ctx.font = THEME.fonts.body;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, x + w / 2, y + h / 2);
    
    // 注册点击区域
    if (hitType && !disabled) {
      this.registerHitArea(x, y, w, h, hitType, hitData, isFixed);
    }
  }
  
  /**
   * 绘制状态徽章
   */
  drawBadge(x, y, status, size = 'normal') {
    const ctx = this.ctx;
    const r = size === 'small' ? 4 : 6;
    
    let color = THEME.colors.textMuted;
    if (status === 'passed') color = THEME.colors.success;
    else if (status === 'failed') color = THEME.colors.error;
    else if (status === 'running') color = THEME.colors.warning;
    else if (status === 'skipped' || status === 'manual_pending') color = THEME.colors.textSecondary;
    
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  
  /**
   * 渲染列表页面
   */
  renderListPage(categories, selectedCategory, testResults, scrollY, isRunning, runProgress = null) {
    const ctx = this.ctx;
    const sp = THEME.spacing;
    
    this.clearHitAreas();
    
    // 背景
    ctx.fillStyle = THEME.colors.bg;
    ctx.fillRect(0, 0, this.width, this.height);
    
    // 保存上下文，准备设置裁剪区域
    ctx.save();
    
    // 设置内容区域裁剪（头部以下）
    ctx.beginPath();
    ctx.rect(0, this.headerHeight, this.width, this.height - this.headerHeight);
    ctx.clip();
    
    // 滚动起始位置（头部下方 + 间距）
    let y = this.headerHeight + sp.sm - scrollY;
    
    // 统计信息
    const stats = this.buildStats(testResults);
    const total = stats.total;
    const resultIndex = this.buildResultIndex(testResults);
    const categoryPassIndex = this.buildCategoryPassIndex(testResults);
    
    if (total > 0) {
      y = this.renderStats(y, stats);
    }
    
    // 运行进度条（运行时显示）
    if (isRunning && runProgress && runProgress.total > 0) {
      y += sp.sm;
      y = this.renderProgressBar(y, runProgress);
    }
    
    // 操作按钮区
    y += sp.md;
    const btnWidth = (this.width - sp.lg * 3) / 2;
    
    const btnText = isRunning && runProgress 
      ? `运行中 ${runProgress.current}/${runProgress.total}` 
      : '运行全部';
    
    this.drawButton(sp.lg, y, btnWidth, 40, btnText, {
      type: 'primary',
      disabled: isRunning,
      hitType: 'run-all-btn'
    });
    
    this.drawButton(sp.lg * 2 + btnWidth, y, btnWidth, 40, '导出结果', {
      type: 'success',
      disabled: total === 0,
      hitType: 'export-btn'
    });
    
    y += 40 + sp.lg;
    
    // 分类列表
    const buffer = 200; // 预渲染区域

    for (const category of categories) {
      const isExpanded = selectedCategory === category.id;
      let categoryHeight = DIMENSIONS.CATEGORY_TOTAL_HEADER + DIMENSIONS.CATEGORY_GROUP_BOTTOM_SPACING;
      
      if (isExpanded) {
        // 折叠状态高度 + 测试项高度
        categoryHeight = DIMENSIONS.CATEGORY_TOTAL_HEADER + 
                         category.tests.length * DIMENSIONS.TEST_ITEM_TOTAL + 
                         DIMENSIONS.CATEGORY_GROUP_BOTTOM_SPACING;
      }
      
      // 检查可见性 (Intersection Check)
      // 只要有一部分在 [ -buffer, this.height + buffer ] 范围内就绘制
      if (y + categoryHeight > -buffer && y < this.height + buffer) {
        y = this.renderCategory(y, category, isExpanded, resultIndex, categoryPassIndex);
      } else {
        y += categoryHeight;
      }
    }
    
    // 清除按钮
    if (total > 0) {
      this.drawButton(sp.lg, y + sp.md, this.width - sp.lg * 2, 36, '清除所有结果', {
        type: 'secondary',
        hitType: 'clear-btn'
      });
      y += 36 + sp.lg;
    }
    
    // 记录内容总高度（加上 scrollY 得到逻辑高度）
    this.contentHeight = y + scrollY + sp.xl;
    
    // 恢复裁剪状态
    ctx.restore();
    
    // 头部（在裁剪区域外绘制，始终可见）
    this.renderHeader('Migo API 测试套件', scrollY);
    
    // Toast
    this.renderToast();
  }
  
  /**
   * 渲染头部
   */
  renderHeader(title, scrollY = 0, showBack = false) {
    const ctx = this.ctx;
    const sp = THEME.spacing;
    
    // 头部背景
    ctx.fillStyle = THEME.colors.cardBg;
    ctx.fillRect(0, 0, this.width, 52);
    
    // 底部边线
    ctx.strokeStyle = THEME.colors.border;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, 52);
    ctx.lineTo(this.width, 52);
    ctx.stroke();
    
    // 返回按钮
    if (showBack) {
      ctx.fillStyle = THEME.colors.primary;
      ctx.font = THEME.fonts.subtitle;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText('‹ 返回', sp.lg, 26);
      this.registerHitArea(0, 0, 80, 52, 'back-btn', null, true); // 固定区域
    }
    
    // 标题
    ctx.fillStyle = THEME.colors.text;
    ctx.font = THEME.fonts.title;
    ctx.textAlign = showBack ? 'center' : 'left';
    ctx.fillText(title, showBack ? this.width / 2 : sp.lg, 26);
  }
  
  /**
   * 渲染统计信息
   */
  renderStats(y, stats) {
    const ctx = this.ctx;
    const sp = THEME.spacing;
    const passed = stats.passed;
    const failed = stats.failed;
    const executed = passed + failed;
    
    const skipped = stats.skipped;
    const manualPending = stats.manualPending;
    const flaky = stats.flaky;

    // 背景卡片
    ctx.fillStyle = THEME.colors.cardBg;
    this.roundRect(sp.lg, y, this.width - sp.lg * 2, 88, THEME.radius.md);
    ctx.fill();
    
    const cardX = sp.lg;
    const cardW = this.width - sp.lg * 2;
    const colW = cardW / 3;
    
    // 通过
    this.drawStatItem(cardX + colW * 0.5, y + 30, passed.toString(), '通过', THEME.colors.success);
    // 失败
    this.drawStatItem(cardX + colW * 1.5, y + 30, failed.toString(), '失败', THEME.colors.error);
    // 总计
    const passRate = executed > 0 ? Math.round((passed / executed) * 100) + '%' : '-';
    this.drawStatItem(cardX + colW * 2.5, y + 30, passRate, '通过率', THEME.colors.primary);

    ctx.fillStyle = THEME.colors.textMuted;
    ctx.font = THEME.fonts.small;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`跳过 ${skipped} · 待人工 ${manualPending} · 波动 ${flaky}`, cardX + cardW / 2, y + 72);
    
    return y + 88 + sp.md;
  }
  
  /**
   * 渲染进度条
   */
  renderProgressBar(y, progress) {
    const ctx = this.ctx;
    const sp = THEME.spacing;
    
    const barX = sp.lg;
    const barW = this.width - sp.lg * 2;
    const barH = 6;
    
    // 背景
    ctx.fillStyle = THEME.colors.cardBg;
    this.roundRect(barX, y, barW, barH, 3);
    ctx.fill();
    
    // 进度
    const progressWidth = (progress.current / progress.total) * barW;
    if (progressWidth > 0) {
      ctx.fillStyle = THEME.colors.primary;
      this.roundRect(barX, y, progressWidth, barH, 3);
      ctx.fill();
    }
    
    y += barH + sp.xs;
    
    // 当前测试名称
    if (progress.currentTestName) {
      ctx.fillStyle = THEME.colors.textMuted;
      ctx.font = THEME.fonts.small;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      
      let testName = progress.currentTestName;
      if (ctx.measureText(testName).width > barW) {
        while (ctx.measureText(testName + '...').width > barW && testName.length > 0) {
          testName = testName.slice(0, -1);
        }
        testName += '...';
      }
      ctx.fillText(`正在测试: ${testName}`, barX, y);
      y += 16;
    }
    
    return y + sp.sm;
  }
  
  /**
   * 绘制统计项
   */
  drawStatItem(x, y, value, label, color) {
    const ctx = this.ctx;
    
    ctx.fillStyle = color;
    ctx.font = 'bold 22px "PingFang SC", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillText(value, x, y);
    
    ctx.fillStyle = THEME.colors.textSecondary;
    ctx.font = THEME.fonts.small;
    ctx.textBaseline = 'top';
    ctx.fillText(label, x, y + 4);
  }
  
  /**
   * 渲染分类
   */
  renderCategory(y, category, expanded, resultIndex, categoryPassIndex) {
    const ctx = this.ctx;
    const sp = THEME.spacing;
    
    // 分类头部
    ctx.fillStyle = THEME.colors.cardBg;
    this.roundRect(sp.lg, y, this.width - sp.lg * 2, DIMENSIONS.CATEGORY_HEADER_HEIGHT, THEME.radius.md);
    ctx.fill();
    
    // 展开图标
    ctx.fillStyle = THEME.colors.textSecondary;
    ctx.font = THEME.fonts.body;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(expanded ? '▼' : '▶', sp.lg + sp.md, y + DIMENSIONS.CATEGORY_HEADER_HEIGHT / 2);
    
    // 分类名称
    ctx.fillStyle = THEME.colors.text;
    ctx.font = THEME.fonts.subtitle;
    ctx.fillText(category.name, sp.lg + sp.xl + sp.sm, y + DIMENSIONS.CATEGORY_HEADER_HEIGHT / 2);
    
    // 测试数量
    const passedCount = categoryPassIndex.get(category.id) || 0;
    
    ctx.fillStyle = THEME.colors.textMuted;
    ctx.font = THEME.fonts.small;
    ctx.textAlign = 'right';
    ctx.fillText(
      `${passedCount}/${category.tests.length}`, 
      this.width - sp.lg - sp.md, 
      y + DIMENSIONS.CATEGORY_HEADER_HEIGHT / 2
    );
    
    // 注册点击区域
    this.registerHitArea(sp.lg, y, this.width - sp.lg * 2, DIMENSIONS.CATEGORY_HEADER_HEIGHT, 'category', category.id);
    
    y += DIMENSIONS.CATEGORY_TOTAL_HEADER;
    
    // 展开的测试列表
    if (expanded) {
      for (const test of category.tests) {
        // 内部可见性优化
        if (y + DIMENSIONS.TEST_ITEM_TOTAL > -100 && y < this.height + 100) {
          y = this.renderTestItem(y, test, resultIndex);
        } else {
          y += DIMENSIONS.TEST_ITEM_TOTAL;
        }
      }
    }
    
    return y + DIMENSIONS.CATEGORY_GROUP_BOTTOM_SPACING;
  }
  
  /**
   * 渲染测试项
   */
  renderTestItem(y, test, resultIndex) {
    const ctx = this.ctx;
    const sp = THEME.spacing;
    
    const x = sp.lg + sp.md;
    const w = this.width - sp.lg * 2 - sp.md * 2;
    const h = DIMENSIONS.TEST_ITEM_HEIGHT;
    
    // 背景
    ctx.fillStyle = THEME.colors.cardBgHover;
    this.roundRect(x, y, w, h, THEME.radius.sm);
    ctx.fill();
    
    // 状态指示
    const result = this.getResultForTest(resultIndex, test);
    const status = this.getResultStatus(result);
    this.drawBadge(x + sp.md + 6, y + h / 2, status);
    
    // 测试名称
    ctx.fillStyle = THEME.colors.text;
    ctx.font = THEME.fonts.body;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    
    const maxNameWidth = w - 100;
    let displayName = test.name;
    if (ctx.measureText(displayName).width > maxNameWidth) {
      while (ctx.measureText(displayName + '...').width > maxNameWidth && displayName.length > 0) {
        displayName = displayName.slice(0, -1);
      }
      displayName += '...';
    }
    ctx.fillText(displayName, x + sp.xl + sp.md, y + 20);
    
    // API 类型标签
    const typeConfig = API_TYPE_CONFIG[test.type] || API_TYPE_CONFIG.sync;
    ctx.fillStyle = typeConfig.color;
    ctx.font = THEME.fonts.small;
    ctx.fillText(`${typeConfig.icon} ${typeConfig.label}`, x + sp.xl + sp.md, y + 38);
    
    // 箭头
    ctx.fillStyle = THEME.colors.textMuted;
    ctx.font = THEME.fonts.body;
    ctx.textAlign = 'right';
    ctx.fillText('›', x + w - sp.md, y + h / 2);
    
    // 注册点击区域
    this.registerHitArea(x, y, w, h, 'test', test);
    
    return y + DIMENSIONS.TEST_ITEM_TOTAL;
  }
  
  /**
   * 渲染详情页面
   */
  renderDetailPage(test, result, isRunning, scrollY = 0) {
    const ctx = this.ctx;
    const sp = THEME.spacing;
    
    this.clearHitAreas();
    
    // 背景
    ctx.fillStyle = THEME.colors.bg;
    ctx.fillRect(0, 0, this.width, this.height);
    
    // 保存上下文，设置裁剪区域
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, this.headerHeight, this.width, this.height - this.headerHeight);
    ctx.clip();
    
    let y = this.headerHeight + sp.md - scrollY;
    
    // 测试信息卡片
    ctx.fillStyle = THEME.colors.cardBg;
    this.roundRect(sp.lg, y, this.width - sp.lg * 2, 120, THEME.radius.md);
    ctx.fill();
    
    // 测试ID
    ctx.fillStyle = THEME.colors.textMuted;
    ctx.font = THEME.fonts.small;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(`ID: ${test.id}`, sp.lg + sp.md, y + sp.md);
    
    // API类型
    const typeConfig = API_TYPE_CONFIG[test.type] || API_TYPE_CONFIG.sync;
    ctx.fillStyle = typeConfig.color;
    ctx.fillText(`类型: ${typeConfig.icon} ${typeConfig.label}`, sp.lg + sp.md, y + sp.md + 20);
    
    // 描述
    ctx.fillStyle = THEME.colors.textSecondary;
    ctx.font = THEME.fonts.body;
    const desc = test.description || '暂无描述';
    this.wrapText(desc, sp.lg + sp.md, y + sp.md + 48, this.width - sp.lg * 2 - sp.md * 2, 18);
    
    y += 120 + sp.lg;
    
    // 运行结果
    if (result) {
      y = this.renderResultBlock(y, result, test.expect);
    }
    
    // 期望值
    if (test.expect) {
      y = this.renderCodeBlock(y, '期望值', JSON.stringify(test.expect, null, 2));
    }
    
    // 记录内容高度
    this.contentHeight = y + scrollY + sp.xl + 70; // 70 是底部按钮区高度
    
    // 恢复裁剪状态
    ctx.restore();
    
    // 头部（固定，在裁剪区域外）
    this.renderHeader(test.name, 0, true);
    
    // 底部按钮区（固定在底部）
    const btnY = this.height - 60 - sp.sm;
    const btnWidth = (this.width - sp.lg * 3) / 2;
    
    // 底部按钮背景（遮挡滚动内容）
    ctx.fillStyle = THEME.colors.bg;
    ctx.fillRect(0, this.height - 80, this.width, 80);
    
    // 运行按钮
    const resultStatus = this.getResultStatus(result);
    const runButtonType = resultStatus === 'passed'
      ? 'success'
      : (resultStatus === 'skipped' || resultStatus === 'manual_pending')
        ? 'secondary'
        : 'primary';

    this.drawButton(sp.lg, btnY, btnWidth, 50, 
      isRunning ? '运行中...' : '运行测试', {
      type: runButtonType,
      disabled: isRunning,
      hitType: 'run-btn',
      isFixed: true
    });
    
    // 上传按钮（有结果时才可用）
    this.drawButton(sp.lg * 2 + btnWidth, btnY, btnWidth, 50, 
      '上传结果', {
      type: 'secondary',
      disabled: !result,
      hitType: 'upload-single-btn',
      isFixed: true
    });
    
    // Toast
    this.renderToast();
  }
  
  /**
   * 渲染代码块
   */
  renderCodeBlock(y, title, code, highlightIndices = null) {
    const ctx = this.ctx;
    const sp = THEME.spacing;
    const lineHeight = 18;
    const padding = sp.md;
    const maxWidth = this.width - sp.lg * 2 - padding * 2;
    
    // 标题
    ctx.fillStyle = THEME.colors.textSecondary;
    ctx.font = THEME.fonts.small;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(title, sp.lg, y);
    
    y += 20;
    
    // 预处理行（支持自动换行），保留原始行索引用于高亮
    ctx.font = THEME.fonts.mono;
    const rawLines = code.split('\n');
    const processedLines = [];

    for (let lineIndex = 0; lineIndex < rawLines.length; lineIndex++) {
      const rawLine = rawLines[lineIndex];
      let currentLine = '';
      const chars = rawLine.split('');
      
      // 如果该行本来就为空（换行符），保留空行
      if (chars.length === 0) {
        processedLines.push({ text: '', originalIndex: lineIndex });
        continue;
      }

      for (let i = 0; i < chars.length; i++) {
        const char = chars[i];
        const testLine = currentLine + char;
        const metrics = ctx.measureText(testLine);
        
        if (metrics.width > maxWidth && currentLine.length > 0) {
          processedLines.push({ text: currentLine, originalIndex: lineIndex });
          currentLine = char;
        } else {
          currentLine = testLine;
        }
      }
      if (currentLine.length > 0) {
        processedLines.push({ text: currentLine, originalIndex: lineIndex });
      }
    }
    
    // 计算总高度（不再限制最大高度）
    const blockHeight = processedLines.length * lineHeight + padding * 2;
    
    // 代码背景
    ctx.fillStyle = '#0d1117';
    this.roundRect(sp.lg, y, this.width - sp.lg * 2, blockHeight, THEME.radius.sm);
    ctx.fill();
    
    let codeY = y + padding;
    for (const lineObj of processedLines) {
      // 决定颜色
      if (highlightIndices && highlightIndices.has(lineObj.originalIndex)) {
        ctx.fillStyle = '#ef4444'; // 红色高亮
      } else {
        ctx.fillStyle = '#7ee787'; // 默认绿色
      }
      
      ctx.fillText(lineObj.text, sp.lg + padding, codeY);
      codeY += lineHeight;
    }
    
    return y + blockHeight + sp.md;
  }
  
  /**
   * 渲染结果块
   */
  renderResultBlock(y, result, expect) {
    const ctx = this.ctx;
    const sp = THEME.spacing;
    
    // 状态标题
    const status = this.getResultStatus(result);
    const isPassed = status === 'passed';
    const title = status === 'manual_pending'
      ? '⏳ 待人工确认'
      : status === 'skipped'
        ? '⏭ 已跳过'
        : isPassed
          ? '✓ 测试通过'
          : '✗ 测试失败';

    ctx.fillStyle = isPassed ? THEME.colors.success : (status === 'skipped' || status === 'manual_pending' ? THEME.colors.warning : THEME.colors.error);
    ctx.font = THEME.fonts.subtitle;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(title, sp.lg, y);
    
    y += 28;
    
    // 实际值
    if (result.actual !== undefined) {
      let highlightIndices = null;
      
      // 如果测试失败且有期望值，尝试计算差异
      if (!isPassed && expect !== undefined) {
        highlightIndices = this.findDiffLines(result.actual, expect);
      }
      
      y = this.renderCodeBlock(y, '实际值', JSON.stringify(result.actual, null, 2), highlightIndices);
    }
    
    // 错误信息
    if (result.error) {
      ctx.fillStyle = THEME.colors.error;
      ctx.font = THEME.fonts.small;
      ctx.fillText('错误: ' + result.error, sp.lg, y);
      y += 24;
    }
    
    // 耗时
    if (result.duration !== undefined) {
      ctx.fillStyle = THEME.colors.textMuted;
      ctx.font = THEME.fonts.small;
      ctx.fillText(`耗时: ${result.duration}ms`, sp.lg, y);
      y += 20;
    }
    
    return y;
  }

  /**
   * 查找差异行（简单实现）
   */
  findDiffLines(actual, expected) {
    const diffLines = new Set();
    const actualJson = JSON.stringify(actual, null, 2);
    const actualLines = actualJson.split('\n');
    
    // 基础类型对比
    if (typeof actual !== 'object' || actual === null || typeof expected !== 'object' || expected === null) {
      if (JSON.stringify(actual) !== JSON.stringify(expected)) {
        for(let i=0; i<actualLines.length; i++) diffLines.add(i);
      }
      return diffLines;
    }

    // 对象/数组字段对比
    // 修改逻辑：遍历 expected 的 keys，去 actual 中查找对应的值
    for (const key in expected) {
      if (key === 'raw') continue;

      const expectedVal = expected[key];
      const actualVal = actual[key]; // actual 中可能不存在该 key，此时为 undefined
      
      // 如果不匹配（值不同，或者 actual 中缺失该 key）
      if (JSON.stringify(actualVal) !== JSON.stringify(expectedVal)) {
        // 查找这一行在 actualJson 中的位置
        // 使用简单的字符串匹配： "key": 或 "key":
        // 注意：这可能会误判相同名称的子字段，但在简单展示场景下可以接受
        const keyStr = Array.isArray(actual) ? '' : `"${key}":`; 
        
        for (let i = 0; i < actualLines.length; i++) {
          const line = actualLines[i].trim();
          
          // 对象属性匹配
          if (keyStr && line.startsWith(keyStr)) {
            diffLines.add(i);
            // 简单的将该行标记，不再深入标记子对象（太复杂）
          }
          // 数组元素匹配（简单假设顺序一致，基于索引）
          else if (Array.isArray(actual) && i === parseInt(key) + 1) { // +1 也是估算，通常第一行是 [
             // 数组渲染比较麻烦，这里暂时只支持对象属性名的精确匹配
          }
        }
      }
    }
    return diffLines;
  }
  
  /**
   * 文字换行
   */
  wrapText(text, x, y, maxWidth, lineHeight) {
    const ctx = this.ctx;
    const words = text.split('');
    let line = '';
    let currentY = y;
    
    for (let i = 0; i < words.length; i++) {
      const testLine = line + words[i];
      const metrics = ctx.measureText(testLine);
      
      if (metrics.width > maxWidth && i > 0) {
        ctx.fillText(line, x, currentY);
        line = words[i];
        currentY += lineHeight;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, x, currentY);
  }
  
  /**
   * 渲染Toast
   */
  renderToast() {
    if (!this.toast) return;
    
    const ctx = this.ctx;
    const message = this.toast.message;
    
    ctx.font = THEME.fonts.body;
    const textWidth = ctx.measureText(message).width;
    const padding = 16;
    const toastW = textWidth + padding * 2;
    const toastH = 40;
    const toastX = (this.width - toastW) / 2;
    const toastY = this.height - 100;
    
    // 背景
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    this.roundRect(toastX, toastY, toastW, toastH, THEME.radius.md);
    ctx.fill();
    
    // 文字
    ctx.fillStyle = THEME.colors.text;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(message, this.width / 2, toastY + toastH / 2);
  }
}
