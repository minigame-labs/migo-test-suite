#!/usr/bin/env python3
"""
Migo Test Suite - 测试结果收集服务器

接收来自小游戏的测试结果，保存为 baseline 或进行对比。

用法:
    python server.py [--port 8765] [--baseline-dir ../baselines]

功能:
    POST /report     - 接收测试结果，保存为 baseline
    GET  /baselines  - 获取所有 baseline 列表
    POST /compare    - 对比测试结果与 baseline
"""

import json
import os
import sys
import argparse
from datetime import datetime
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs

# 默认配置
DEFAULT_PORT = 8765
DEFAULT_BASELINE_DIR = os.path.join(os.path.dirname(__file__), '..', 'baselines')


class TestResultHandler(BaseHTTPRequestHandler):
    """处理测试结果的 HTTP 请求处理器"""
    
    baseline_dir = DEFAULT_BASELINE_DIR
    
    def _set_headers(self, status=200, content_type='application/json'):
        self.send_response(status)
        self.send_header('Content-Type', content_type)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
    
    def _send_json(self, data, status=200):
        self._set_headers(status)
        self.wfile.write(json.dumps(data, ensure_ascii=False, indent=2).encode('utf-8'))
    
    def _read_body(self):
        content_length = int(self.headers.get('Content-Length', 0))
        if content_length > 0:
            body = self.rfile.read(content_length)
            return json.loads(body.decode('utf-8'))
        return {}
    
    def do_OPTIONS(self):
        """处理 CORS 预检请求"""
        self._set_headers(204)
    
    def do_GET(self):
        """处理 GET 请求"""
        parsed = urlparse(self.path)
        
        if parsed.path == '/' or parsed.path == '/index.html':
            self._serve_web_ui()
        elif parsed.path == '/baselines':
            self._handle_list_baselines()
        elif parsed.path.startswith('/baseline/'):
            test_id = parsed.path.split('/baseline/')[1]
            self._handle_get_baseline(test_id)
        elif parsed.path == '/health':
            self._send_json({'status': 'ok'})
        elif parsed.path == '/summaries':
            self._handle_summaries()
        else:
            self._send_json({'error': 'Not found'}, 404)
    
    def do_POST(self):
        """处理 POST 请求"""
        parsed = urlparse(self.path)

        if parsed.path == '/report':
            self._handle_report()
        elif parsed.path == '/compare':
            self._handle_compare()
        elif parsed.path == '/log':
            self._handle_log()
        else:
            self._send_json({'error': 'Not found'}, 404)

    def _handle_log(self):
        """处理远程 console.log"""
        try:
            data = self._read_body()
            level = data.get('level', 'log')
            args = data.get('args', [])
            timestamp = data.get('timestamp', '')

            # 颜色代码
            colors = {
                'log': '\033[0m',      # 默认
                'info': '\033[36m',    # 青色
                'warn': '\033[33m',    # 黄色
                'error': '\033[31m',   # 红色
                'debug': '\033[90m',   # 灰色
            }
            reset = '\033[0m'
            color = colors.get(level, colors['log'])

            # 格式化输出
            prefix = f"[{level.upper()}]"
            message = ' '.join(str(arg) for arg in args)
            print(f"{color}{prefix}{reset} {message}")

            self._send_json({'success': True})
        except Exception as e:
            self._send_json({'error': str(e)}, 500)
    
    def _handle_report(self):
        """处理测试报告上传，保存为 baseline"""
        try:
            data = self._read_body()
            
            platform = data.get('platform', 'unknown')
            device_id = data.get('deviceId', 'unknown')
            device = data.get('device', {})
            results = data.get('results', [])
            timestamp = data.get('timestamp', int(datetime.now().timestamp() * 1000))
            
            # 确保 baseline 目录存在
            platform_dir = os.path.join(self.baseline_dir, platform)
            os.makedirs(platform_dir, exist_ok=True)
            
            saved_count = 0
            
            # 按 test 保存 baseline
            for result in results:
                test_id = result.get('testId')
                if not test_id:
                    continue
                
                # 获取 category
                category = result.get('category', 'uncategorized')

                # 构建 baseline 数据
                baseline = {
                    'testId': test_id,
                    'name': result.get('name'),
                    'category': category,
                    'platform': platform,
                    'deviceId': device_id,
                    'device': device,
                    'timestamp': timestamp,
                    'actual': result.get('actual'),
                    'passed': result.get('passed'),
                    'duration': result.get('duration'),
                    'type': result.get('type', 'sync')
                }

                # 保存到文件: baselines/{platform}/{category}/{test_id}.json
                category_dir = os.path.join(platform_dir, category)
                os.makedirs(category_dir, exist_ok=True)
                baseline_file = os.path.join(category_dir, f'{test_id}.json')
                
                # 如果文件已存在，追加到历史记录
                existing_data = {'history': [], 'latest': None}
                if os.path.exists(baseline_file):
                    try:
                        with open(baseline_file, 'r', encoding='utf-8') as f:
                            existing_data = json.load(f)
                    except:
                        pass
                
                # 更新 latest，保留历史
                if existing_data.get('latest'):
                    history = existing_data.get('history', [])
                    # 只保留最近 10 条历史
                    history.append(existing_data['latest'])
                    if len(history) > 10:
                        history = history[-10:]
                    existing_data['history'] = history
                
                existing_data['latest'] = baseline
                
                # 写入文件
                with open(baseline_file, 'w', encoding='utf-8') as f:
                    json.dump(existing_data, f, ensure_ascii=False, indent=2)
                
                saved_count += 1
            
            # 生成汇总报告
            summary_file = os.path.join(platform_dir, f'_summary_{device_id}.json')
            os.makedirs(os.path.dirname(summary_file), exist_ok=True)
            summary = {
                'platform': platform,
                'deviceId': device_id,
                'device': device,
                'timestamp': timestamp,
                'datetime': datetime.fromtimestamp(timestamp / 1000).isoformat(),
                'totalTests': len(results),
                'passed': sum(1 for r in results if r.get('passed')),
                'failed': sum(1 for r in results if not r.get('passed'))
            }
            summary['passRate'] = f"{(summary['passed'] / summary['totalTests'] * 100):.1f}%" if summary['totalTests'] > 0 else '0%'
            
            with open(summary_file, 'w', encoding='utf-8') as f:
                json.dump(summary, f, ensure_ascii=False, indent=2)
            
            print(f"[{datetime.now().isoformat()}] 收到报告: {platform}/{device_id}, {saved_count} 条测试结果")
            
            self._send_json({
                'success': True,
                'saved': saved_count,
                'platform': platform,
                'deviceId': device_id,
                'summary': summary
            })
            
        except Exception as e:
            print(f"Error: {e}")
            self._send_json({'error': str(e)}, 500)
    
    def _handle_list_baselines(self):
        """列出所有 baseline"""
        try:
            baselines = {}

            if os.path.exists(self.baseline_dir):
                for platform in os.listdir(self.baseline_dir):
                    platform_path = os.path.join(self.baseline_dir, platform)
                    if os.path.isdir(platform_path):
                        baselines[platform] = {}
                        for item in os.listdir(platform_path):
                            item_path = os.path.join(platform_path, item)
                            # 跳过 summary 文件
                            if item.startswith('_'):
                                continue
                            # 如果是目录，则为 category
                            if os.path.isdir(item_path):
                                category = item
                                baselines[platform][category] = []
                                for filename in os.listdir(item_path):
                                    if filename.endswith('.json'):
                                        test_id = filename[:-5]
                                        baselines[platform][category].append(test_id)

            total = sum(
                len(tests)
                for categories in baselines.values()
                for tests in categories.values()
            )

            self._send_json({
                'baselines': baselines,
                'total': total
            })

        except Exception as e:
            self._send_json({'error': str(e)}, 500)
    
    def _handle_get_baseline(self, test_id):
        """获取指定测试的 baseline"""
        try:
            results = {}

            if os.path.exists(self.baseline_dir):
                for platform in os.listdir(self.baseline_dir):
                    platform_path = os.path.join(self.baseline_dir, platform)
                    if not os.path.isdir(platform_path):
                        continue
                    # 遍历 category 目录
                    for category in os.listdir(platform_path):
                        category_path = os.path.join(platform_path, category)
                        if not os.path.isdir(category_path):
                            continue
                        baseline_file = os.path.join(category_path, f'{test_id}.json')
                        if os.path.exists(baseline_file):
                            with open(baseline_file, 'r', encoding='utf-8') as f:
                                results[platform] = json.load(f)
                            break  # 找到后跳出 category 循环

            if results:
                self._send_json({'testId': test_id, 'baselines': results})
            else:
                self._send_json({'error': 'Baseline not found'}, 404)

        except Exception as e:
            self._send_json({'error': str(e)}, 500)
    
    def _find_baseline_file(self, platform, test_id):
        """在 category 子目录中查找 baseline 文件"""
        platform_path = os.path.join(self.baseline_dir, platform)
        if not os.path.exists(platform_path):
            return None
        for category in os.listdir(platform_path):
            category_path = os.path.join(platform_path, category)
            if os.path.isdir(category_path):
                baseline_file = os.path.join(category_path, f'{test_id}.json')
                if os.path.exists(baseline_file):
                    return baseline_file
        return None

    def _handle_compare(self):
        """对比测试结果与 baseline"""
        try:
            data = self._read_body()

            platform = data.get('platform', 'unknown')
            results = data.get('results', [])
            compare_with = data.get('compareWith', platform)  # 对比目标平台

            comparisons = []

            for result in results:
                test_id = result.get('testId')
                if not test_id:
                    continue

                baseline_file = self._find_baseline_file(compare_with, test_id)

                comparison = {
                    'testId': test_id,
                    'current': result.get('actual'),
                    'baseline': None,
                    'match': None,
                    'diff': None
                }

                if baseline_file:
                    with open(baseline_file, 'r', encoding='utf-8') as f:
                        baseline_data = json.load(f)
                        baseline_actual = baseline_data.get('latest', {}).get('actual')
                        comparison['baseline'] = baseline_actual
                        comparison['match'] = self._deep_compare(result.get('actual'), baseline_actual)
                        if not comparison['match']:
                            comparison['diff'] = self._compute_diff(result.get('actual'), baseline_actual)
                else:
                    comparison['match'] = None  # 无 baseline 可比

                comparisons.append(comparison)
            
            matched = sum(1 for c in comparisons if c['match'] is True)
            mismatched = sum(1 for c in comparisons if c['match'] is False)
            no_baseline = sum(1 for c in comparisons if c['match'] is None)
            
            self._send_json({
                'platform': platform,
                'compareWith': compare_with,
                'summary': {
                    'total': len(comparisons),
                    'matched': matched,
                    'mismatched': mismatched,
                    'noBaseline': no_baseline
                },
                'comparisons': comparisons
            })
            
        except Exception as e:
            self._send_json({'error': str(e)}, 500)
    
    def _handle_summaries(self):
        """获取所有设备的测试汇总"""
        try:
            summaries = []
            
            if os.path.exists(self.baseline_dir):
                for platform in os.listdir(self.baseline_dir):
                    platform_path = os.path.join(self.baseline_dir, platform)
                    if os.path.isdir(platform_path):
                        for filename in os.listdir(platform_path):
                            if filename.startswith('_summary_') and filename.endswith('.json'):
                                filepath = os.path.join(platform_path, filename)
                                with open(filepath, 'r', encoding='utf-8') as f:
                                    summary = json.load(f)
                                    summaries.append(summary)
            
            # 按时间排序
            summaries.sort(key=lambda x: x.get('timestamp', 0), reverse=True)
            
            self._send_json({'summaries': summaries})
            
        except Exception as e:
            self._send_json({'error': str(e)}, 500)
    
    def _serve_web_ui(self):
        """提供 Web UI 页面"""
        html = '''<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Migo Test Suite - Baseline Viewer</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            background: #0f172a;
            color: #f8fafc;
            min-height: 100vh;
            padding: 20px;
        }
        .container { max-width: 1200px; margin: 0 auto; }
        h1 { 
            font-size: 24px; 
            margin-bottom: 20px;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        h1::before { content: "🧪"; }
        .section { margin-bottom: 30px; }
        .section-title { 
            font-size: 16px; 
            color: #94a3b8; 
            margin-bottom: 12px;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        .card {
            background: #1e293b;
            border-radius: 8px;
            padding: 16px;
            margin-bottom: 12px;
        }
        .card-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 12px;
        }
        .platform-badge {
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: 600;
        }
        .platform-weixin { background: #07c160; }
        .platform-migo { background: #3b82f6; }
        .platform-quickgame { background: #f59e0b; }
        .platform-unknown { background: #64748b; }
        .device-info { color: #94a3b8; font-size: 14px; }
        .stats {
            display: flex;
            gap: 20px;
            margin-top: 12px;
        }
        .stat {
            text-align: center;
        }
        .stat-value {
            font-size: 24px;
            font-weight: 700;
        }
        .stat-label {
            font-size: 12px;
            color: #64748b;
        }
        .stat-passed .stat-value { color: #22c55e; }
        .stat-failed .stat-value { color: #ef4444; }
        .stat-rate .stat-value { color: #3b82f6; }
        .test-list { margin-top: 20px; }
        .test-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 8px 12px;
            background: #334155;
            border-radius: 4px;
            margin-bottom: 4px;
            cursor: pointer;
            transition: background 0.2s;
        }
        .test-item:hover { background: #475569; }
        .test-id { font-family: monospace; color: #94a3b8; }
        .test-status {
            width: 8px;
            height: 8px;
            border-radius: 50%;
        }
        .status-passed { background: #22c55e; }
        .status-failed { background: #ef4444; }
        .empty { color: #64748b; text-align: center; padding: 40px; }
        .tabs {
            display: flex;
            gap: 8px;
            margin-bottom: 20px;
        }
        .tab {
            padding: 8px 16px;
            background: #334155;
            border: none;
            border-radius: 6px;
            color: #f8fafc;
            cursor: pointer;
            font-size: 14px;
        }
        .tab.active { background: #3b82f6; }
        .baseline-detail {
            background: #0d1117;
            border-radius: 8px;
            padding: 16px;
            margin-top: 12px;
            font-family: monospace;
            font-size: 13px;
            white-space: pre-wrap;
            word-break: break-all;
            max-height: 400px;
            overflow: auto;
        }
        .compare-view {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
        }
        .compare-column h4 {
            margin-bottom: 8px;
            color: #94a3b8;
        }
        .loading { text-align: center; padding: 40px; color: #64748b; }
        @media (max-width: 768px) {
            .compare-view { grid-template-columns: 1fr; }
            .stats { flex-wrap: wrap; }
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Migo Test Suite - Baseline Viewer</h1>
        
        <div class="tabs">
            <button class="tab active" onclick="showTab('summaries')">测试汇总</button>
            <button class="tab" onclick="showTab('baselines')">Baseline 列表</button>
            <button class="tab" onclick="showTab('compare')">跨平台对比</button>
        </div>
        
        <div id="summaries" class="section">
            <div class="section-title">最近测试记录</div>
            <div id="summaries-content" class="loading">加载中...</div>
        </div>
        
        <div id="baselines" class="section" style="display:none">
            <div class="section-title">所有 Baseline</div>
            <div id="baselines-content" class="loading">加载中...</div>
        </div>
        
        <div id="compare" class="section" style="display:none">
            <div class="section-title">选择测试进行跨平台对比</div>
            <div id="compare-content"></div>
        </div>
    </div>

    <script>
        let currentTab = 'summaries';
        let baselinesData = {};
        
        function showTab(tab) {
            document.querySelectorAll('.section').forEach(s => s.style.display = 'none');
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            document.getElementById(tab).style.display = 'block';
            event.target.classList.add('active');
            currentTab = tab;
            
            if (tab === 'baselines') loadBaselines();
            if (tab === 'summaries') loadSummaries();
        }
        
        async function loadSummaries() {
            const container = document.getElementById('summaries-content');
            try {
                const res = await fetch('/summaries');
                const data = await res.json();
                
                if (!data.summaries || data.summaries.length === 0) {
                    container.innerHTML = '<div class="empty">暂无测试记录，请先在小游戏中运行测试</div>';
                    return;
                }
                
                container.innerHTML = data.summaries.map(s => `
                    <div class="card">
                        <div class="card-header">
                            <span class="platform-badge platform-${s.platform}">${s.platform}</span>
                            <span class="device-info">${s.device?.brand || ''} ${s.device?.model || ''}</span>
                        </div>
                        <div class="device-info">${s.datetime || new Date(s.timestamp).toLocaleString()}</div>
                        <div class="stats">
                            <div class="stat stat-passed">
                                <div class="stat-value">${s.passed}</div>
                                <div class="stat-label">通过</div>
                            </div>
                            <div class="stat stat-failed">
                                <div class="stat-value">${s.failed}</div>
                                <div class="stat-label">失败</div>
                            </div>
                            <div class="stat stat-rate">
                                <div class="stat-value">${s.passRate}</div>
                                <div class="stat-label">通过率</div>
                            </div>
                        </div>
                    </div>
                `).join('');
            } catch (e) {
                container.innerHTML = '<div class="empty">加载失败: ' + e.message + '</div>';
            }
        }
        
        async function loadBaselines() {
            const container = document.getElementById('baselines-content');
            try {
                const res = await fetch('/baselines');
                const data = await res.json();
                baselinesData = data.baselines;
                
                if (!data.baselines || Object.keys(data.baselines).length === 0) {
                    container.innerHTML = '<div class="empty">暂无 Baseline 数据</div>';
                    return;
                }
                
                let html = '';
                for (const [platform, tests] of Object.entries(data.baselines)) {
                    html += `
                        <div class="card">
                            <div class="card-header">
                                <span class="platform-badge platform-${platform}">${platform}</span>
                                <span class="device-info">${tests.length} 个测试</span>
                            </div>
                            <div class="test-list">
                                ${tests.slice(0, 20).map(t => `
                                    <div class="test-item" onclick="showBaseline('${t}')">
                                        <span class="test-id">${t}</span>
                                        <span>›</span>
                                    </div>
                                `).join('')}
                                ${tests.length > 20 ? `<div class="device-info" style="padding:8px">还有 ${tests.length - 20} 个...</div>` : ''}
                            </div>
                        </div>
                    `;
                }
                container.innerHTML = html;
                
                // 更新对比选择
                updateCompareSelect();
            } catch (e) {
                container.innerHTML = '<div class="empty">加载失败: ' + e.message + '</div>';
            }
        }
        
        async function showBaseline(testId) {
            try {
                const res = await fetch('/baseline/' + testId);
                const data = await res.json();
                
                let html = `<h3 style="margin:20px 0">${testId}</h3><div class="compare-view">`;
                for (const [platform, baseline] of Object.entries(data.baselines || {})) {
                    html += `
                        <div class="compare-column">
                            <h4>${platform}</h4>
                            <div class="baseline-detail">${JSON.stringify(baseline.latest?.actual, null, 2)}</div>
                        </div>
                    `;
                }
                html += '</div>';
                
                document.getElementById('compare-content').innerHTML = html;
                showTab('compare');
            } catch (e) {
                alert('加载失败: ' + e.message);
            }
        }
        
        function updateCompareSelect() {
            const allTests = new Set();
            for (const tests of Object.values(baselinesData)) {
                tests.forEach(t => allTests.add(t));
            }
            
            if (allTests.size === 0) {
                document.getElementById('compare-content').innerHTML = '<div class="empty">请先在 Baseline 列表中选择测试进行对比</div>';
                return;
            }
            
            document.getElementById('compare-content').innerHTML = `
                <select id="test-select" onchange="showBaseline(this.value)" style="padding:8px;margin-bottom:16px;background:#334155;color:#f8fafc;border:none;border-radius:4px;width:100%">
                    <option value="">选择一个测试...</option>
                    ${[...allTests].sort().map(t => `<option value="${t}">${t}</option>`).join('')}
                </select>
                <div id="compare-result"></div>
            `;
        }
        
        // 初始加载
        loadSummaries();
    </script>
</body>
</html>'''
        self.send_response(200)
        self.send_header('Content-Type', 'text/html; charset=utf-8')
        self.end_headers()
        self.wfile.write(html.encode('utf-8'))
    
    def _deep_compare(self, a, b):
        """深度比较两个值"""
        if type(a) != type(b):
            return False
        if isinstance(a, dict):
            if set(a.keys()) != set(b.keys()):
                return False
            return all(self._deep_compare(a[k], b[k]) for k in a)
        if isinstance(a, list):
            if len(a) != len(b):
                return False
            return all(self._deep_compare(x, y) for x, y in zip(a, b))
        return a == b
    
    def _compute_diff(self, current, baseline):
        """计算差异"""
        diff = {}
        
        if not isinstance(current, dict) or not isinstance(baseline, dict):
            return {'current': current, 'baseline': baseline}
        
        all_keys = set(current.keys()) | set(baseline.keys())
        
        for key in all_keys:
            curr_val = current.get(key)
            base_val = baseline.get(key)
            
            if curr_val != base_val:
                diff[key] = {
                    'current': curr_val,
                    'baseline': base_val
                }
        
        return diff
    
    def log_message(self, format, *args):
        """自定义日志格式"""
        print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] {args[0]}")


def run_server(port=DEFAULT_PORT, baseline_dir=DEFAULT_BASELINE_DIR):
    """启动服务器"""
    TestResultHandler.baseline_dir = os.path.abspath(baseline_dir)
    
    # 确保目录存在
    os.makedirs(TestResultHandler.baseline_dir, exist_ok=True)
    
    server = HTTPServer(('0.0.0.0', port), TestResultHandler)
    
    print(f"""
╔══════════════════════════════════════════════════════════════╗
║         Migo Test Suite - 测试结果收集服务器                 ║
╠══════════════════════════════════════════════════════════════╣
║  服务地址: http://localhost:{port}                            
║  Baseline 目录: {TestResultHandler.baseline_dir}
╠══════════════════════════════════════════════════════════════╣
║  API:                                                        ║
║    POST /report     - 上传测试结果                           ║
║    GET  /baselines  - 获取 baseline 列表                     ║
║    GET  /baseline/{{test_id}} - 获取指定测试的 baseline        ║
║    POST /compare    - 对比测试结果                           ║
║    GET  /health     - 健康检查                               ║
╚══════════════════════════════════════════════════════════════╝
    """)
    
    print("等待测试结果...\n")
    
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n服务器已停止")
        server.shutdown()


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Migo Test Suite 测试结果收集服务器')
    parser.add_argument('--port', '-p', type=int, default=DEFAULT_PORT, help=f'服务端口 (默认: {DEFAULT_PORT})')
    parser.add_argument('--baseline-dir', '-d', type=str, default=DEFAULT_BASELINE_DIR, help='Baseline 保存目录')
    
    args = parser.parse_args()
    
    run_server(port=args.port, baseline_dir=args.baseline_dir)
