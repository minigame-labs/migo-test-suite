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
    this.headerHeight = 52;
    
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
    const passed = testResults.filter(r => r.passed).length;
    const failed = testResults.filter(r => !r.passed).length;
    const total = testResults.length;
    
    if (total > 0) {
      y = this.renderStats(y, passed, failed, total);
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
    for (const category of categories) {
      if (y > this.height + 100) break; // 超出可视区域跳过
      if (y > -100) { // 在可视区域内才绘制
        y = this.renderCategory(y, category, selectedCategory === category.id, testResults);
      } else {
        // 估算高度跳过
        y += 56;
        if (selectedCategory === category.id) {
          y += category.tests.length * 60;
        }
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
  renderStats(y, passed, failed, total) {
    const ctx = this.ctx;
    const sp = THEME.spacing;
    
    // 背景卡片
    ctx.fillStyle = THEME.colors.cardBg;
    this.roundRect(sp.lg, y, this.width - sp.lg * 2, 70, THEME.radius.md);
    ctx.fill();
    
    const cardX = sp.lg;
    const cardW = this.width - sp.lg * 2;
    const colW = cardW / 3;
    
    // 通过
    this.drawStatItem(cardX + colW * 0.5, y + 35, passed.toString(), '通过', THEME.colors.success);
    // 失败
    this.drawStatItem(cardX + colW * 1.5, y + 35, failed.toString(), '失败', THEME.colors.error);
    // 总计
    const passRate = total > 0 ? Math.round((passed / total) * 100) + '%' : '-';
    this.drawStatItem(cardX + colW * 2.5, y + 35, passRate, '通过率', THEME.colors.primary);
    
    return y + 70 + sp.md;
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
  renderCategory(y, category, expanded, testResults) {
    const ctx = this.ctx;
    const sp = THEME.spacing;
    
    // 分类头部
    ctx.fillStyle = THEME.colors.cardBg;
    this.roundRect(sp.lg, y, this.width - sp.lg * 2, 48, THEME.radius.md);
    ctx.fill();
    
    // 展开图标
    ctx.fillStyle = THEME.colors.textSecondary;
    ctx.font = THEME.fonts.body;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(expanded ? '▼' : '▶', sp.lg + sp.md, y + 24);
    
    // 分类名称
    ctx.fillStyle = THEME.colors.text;
    ctx.font = THEME.fonts.subtitle;
    ctx.fillText(category.name, sp.lg + sp.xl + sp.sm, y + 24);
    
    // 测试数量
    const categoryResults = testResults.filter(r => 
      category.tests.some(t => t.id === r.testId)
    );
    const passedCount = categoryResults.filter(r => r.passed).length;
    
    ctx.fillStyle = THEME.colors.textMuted;
    ctx.font = THEME.fonts.small;
    ctx.textAlign = 'right';
    ctx.fillText(
      `${passedCount}/${category.tests.length}`, 
      this.width - sp.lg - sp.md, 
      y + 24
    );
    
    // 注册点击区域
    this.registerHitArea(sp.lg, y, this.width - sp.lg * 2, 48, 'category', category.id);
    
    y += 48 + sp.sm;
    
    // 展开的测试列表
    if (expanded) {
      for (const test of category.tests) {
        y = this.renderTestItem(y, test, testResults);
      }
    }
    
    return y + sp.sm;
  }
  
  /**
   * 渲染测试项
   */
  renderTestItem(y, test, testResults) {
    const ctx = this.ctx;
    const sp = THEME.spacing;
    
    const x = sp.lg + sp.md;
    const w = this.width - sp.lg * 2 - sp.md * 2;
    
    // 背景
    ctx.fillStyle = THEME.colors.cardBgHover;
    this.roundRect(x, y, w, 52, THEME.radius.sm);
    ctx.fill();
    
    // 状态指示
    const result = testResults.find(r => r.testId === test.id);
    const status = result ? (result.passed ? 'passed' : 'failed') : 'pending';
    this.drawBadge(x + sp.md + 6, y + 26, status);
    
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
    ctx.fillText('›', x + w - sp.md, y + 26);
    
    // 注册点击区域
    this.registerHitArea(x, y, w, 52, 'test', test);
    
    return y + 52 + sp.xs;
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
    
    // 期望值
    if (test.expect) {
      y = this.renderCodeBlock(y, '期望值', JSON.stringify(test.expect, null, 2));
    }
    
    // 运行结果
    if (result) {
      y = this.renderResultBlock(y, result);
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
    this.drawButton(sp.lg, btnY, btnWidth, 50, 
      isRunning ? '运行中...' : '运行测试', {
      type: result?.passed ? 'success' : 'primary',
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
  renderCodeBlock(y, title, code) {
    const ctx = this.ctx;
    const sp = THEME.spacing;
    
    // 标题
    ctx.fillStyle = THEME.colors.textSecondary;
    ctx.font = THEME.fonts.small;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(title, sp.lg, y);
    
    y += 20;
    
    // 代码背景
    const lines = code.split('\n');
    const lineHeight = 18;
    const blockHeight = Math.min(lines.length * lineHeight + sp.md * 2, 150);
    
    ctx.fillStyle = '#0d1117';
    this.roundRect(sp.lg, y, this.width - sp.lg * 2, blockHeight, THEME.radius.sm);
    ctx.fill();
    
    // 代码文字
    ctx.fillStyle = '#7ee787';
    ctx.font = THEME.fonts.mono;
    
    let codeY = y + sp.md;
    for (let i = 0; i < lines.length && codeY < y + blockHeight - sp.md; i++) {
      let line = lines[i];
      if (ctx.measureText(line).width > this.width - sp.lg * 2 - sp.md * 2) {
        line = line.substring(0, 40) + '...';
      }
      ctx.fillText(line, sp.lg + sp.md, codeY);
      codeY += lineHeight;
    }
    
    return y + blockHeight + sp.md;
  }
  
  /**
   * 渲染结果块
   */
  renderResultBlock(y, result) {
    const ctx = this.ctx;
    const sp = THEME.spacing;
    
    // 状态标题
    ctx.fillStyle = result.passed ? THEME.colors.success : THEME.colors.error;
    ctx.font = THEME.fonts.subtitle;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(result.passed ? '✓ 测试通过' : '✗ 测试失败', sp.lg, y);
    
    y += 28;
    
    // 实际值
    if (result.actual !== undefined) {
      y = this.renderCodeBlock(y, '实际值', JSON.stringify(result.actual, null, 2));
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
