#!/usr/bin/env python3
"""
Migo Test Suite - 测试结果收集服务器（新版：platform/deviceId/category/testId.json）
新增能力：同一机型（brand+model）跨平台对比（migo vs others），主要对比 latest.actual。

目录结构（固定）：
  baselines/
    {platform}/
      {deviceId}/
        _summary.json
        {category}/
          {testId}.json

API：
  POST /report            上传测试结果并落盘到新目录结构
  GET  /catalog           读取 baselines 目录，返回平台/机型/分类/用例索引（含 deviceKeys、testsAll）
  GET  /case              原能力：同 platform 下不同 deviceId 对比（保留）
      /case?platform=...&category=...&testId=...
  GET  /xcase             新能力：同机型（deviceKey）跨 platform 对比
      /xcase?deviceKey=...&category=...&testId=...&basePlatform=migo
      可选：&platforms=migo,weixin,unknown（不传则自动遍历所有平台）
  GET  /summaries         返回所有设备的 _summary.json（按时间倒序）
  GET  /health            健康检查
  POST /log               远程 console.log
  GET  /                 Web UI：同机型跨平台对比 actual（默认参考平台 migo）

用法：
  python server.py --port 8765 --baseline-dir ../baselines
"""

import argparse
import json
import os
from datetime import datetime
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs
import unicodedata

DEFAULT_PORT = 8765
DEFAULT_BASELINE_DIR = os.path.join(os.path.dirname(__file__), "..", "baselines")


def _now_ms() -> int:
    return int(datetime.now().timestamp() * 1000)


def _iso_from_ms(ts_ms):
    try:
        return datetime.fromtimestamp(ts_ms / 1000).isoformat()
    except Exception:
        return None


def _safe_read_json(path):
    try:
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return None


def _safe_write_json(path, obj):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(obj, f, ensure_ascii=False, indent=2)


def _mk_device_key(device: dict) -> str:
    """跨平台识别同一机型：brand-model 小写。"""
    if not isinstance(device, dict):
        return "unknown-unknown"
    brand = (device.get("brand") or "unknown").strip()
    model = (device.get("model") or "unknown").strip()
    return f"{brand}-{model}".lower()


class TestResultHandler(BaseHTTPRequestHandler):
    baseline_dir = os.path.abspath(DEFAULT_BASELINE_DIR)

    # -----------------------
    # HTTP utils
    # -----------------------
    def _set_headers(self, status=200, content_type="application/json"):
        self.send_response(status)
        self.send_header("Content-Type", content_type)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def _send_json(self, data, status=200):
        self._set_headers(status, "application/json")
        self.wfile.write(json.dumps(data, ensure_ascii=False, indent=2).encode("utf-8"))

    def _read_body(self):
        n = int(self.headers.get("Content-Length", 0))
        if n <= 0:
            return {}
        raw = self.rfile.read(n)
        return json.loads(raw.decode("utf-8"))

    def do_OPTIONS(self):
        self._set_headers(204)

    # -----------------------
    # Router
    # -----------------------
    def do_GET(self):
        parsed = urlparse(self.path)
        path = parsed.path

        if path == "/" or path == "/index.html":
            self._serve_web_ui()
        elif path == "/health":
            self._send_json({"status": "ok"})
        elif path == "/catalog":
            self._handle_catalog()
        elif path == "/case":
            self._handle_case(parsed)        # 保留：同平台不同 deviceId
        elif path == "/xcase":
            self._handle_xcase(parsed)       # 新增：同机型跨平台
        elif path == "/summaries":
            self._handle_summaries()
        else:
            self._send_json({"error": "Not found"}, 404)

    def do_POST(self):
        parsed = urlparse(self.path)
        path = parsed.path

        if path == "/report":
            self._handle_report()
        elif path == "/log":
            self._handle_log()
        else:
            self._send_json({"error": "Not found"}, 404)

    # -----------------------
    # Filesystem helpers
    # -----------------------
    def _platform_root(self, platform: str) -> str:
        return os.path.join(self.baseline_dir, platform)

    def _device_root(self, platform: str, device_id: str) -> str:
        return os.path.join(self.baseline_dir, platform, device_id)

    def _case_file(self, platform: str, device_id: str, category: str, test_id: str) -> str:
        return os.path.join(self.baseline_dir, platform, device_id, category, f"{test_id}.json")

    def _iter_case_files(self, d_root: str):
        for root, dirs, files in os.walk(d_root):
            rel = os.path.relpath(root, d_root)
            if rel == ".":
                rel = ""
            if rel.startswith("_"):
                continue
            dirs[:] = [d for d in dirs if not d.startswith("_")]
            for fn in files:
                if not fn.endswith(".json"):
                    continue
                if fn.startswith("_"):
                    continue
                fp = os.path.join(root, fn)
                if os.path.basename(fp) == "_summary.json" and rel == "":
                    continue
                cat = rel.replace("\\", "/") if rel else ""
                if not cat:
                    continue
                yield (cat, fn[:-5], fp)

    def _get_device_info(self, platform: str, device_id: str) -> dict:
        """
        优先读 {platform}/{deviceId}/_summary.json 的 device 字段
        如果没有 summary，则尝试读取该 deviceId 下任意一个 case 的 latest.device
        """
        d_root = self._device_root(platform, device_id)
        if not os.path.isdir(d_root):
            return {}

        summary_fp = os.path.join(d_root, "_summary.json")
        s = _safe_read_json(summary_fp)
        if isinstance(s, dict) and isinstance(s.get("device"), dict):
            return s["device"]

        # fallback: 找一个 case 文件
        try:
            for _, _, fp in self._iter_case_files(d_root):
                data = _safe_read_json(fp)
                if isinstance(data, dict) and isinstance(data.get("latest"), dict):
                    dev = data["latest"].get("device")
                    if isinstance(dev, dict):
                        return dev
        except Exception:
            pass

        return {}

    def _scan_catalog(self):
        """
        读取 baselines/{platform}/{deviceId}/{category}/{testId}.json

        返回结构：
        {
          platforms: [..],
          deviceIds: {platform: [..]},
          categories: {platform: [..]},
          tests: {platform: {category: [..]}},
          testsAll: {category: [..]},                # 全平台 union
          deviceKeys: [..],                           # 全平台 union
          deviceKeyInfo: {deviceKey: {brand,model,platforms:[..]}},
          stats: {...}
        }
        """
        root = self.baseline_dir
        platforms = []
        device_ids = {}
        categories = {}
        tests = {}
        tests_all = {}  # category -> set(testId)

        device_keys_set = set()
        device_key_info = {}  # deviceKey -> {brand, model, platforms:set}

        file_count = 0

        if not os.path.isdir(root):
            return {
                "platforms": [],
                "deviceIds": {},
                "categories": {},
                "tests": {},
                "testsAll": {},
                "deviceKeys": [],
                "deviceKeyInfo": {},
                "stats": {"files": 0, "platforms": 0, "devices": 0, "categories": 0, "tests": 0},
            }

        for platform in sorted(os.listdir(root)):
            p_root = os.path.join(root, platform)
            if not os.path.isdir(p_root):
                continue
            platforms.append(platform)
            device_ids[platform] = []
            categories[platform] = set()
            tests.setdefault(platform, {})

            for device_id in sorted(os.listdir(p_root)):
                d_root = os.path.join(p_root, device_id)
                if not os.path.isdir(d_root):
                    continue
                device_ids[platform].append(device_id)

                dev = self._get_device_info(platform, device_id)
                dkey = _mk_device_key(dev)
                device_keys_set.add(dkey)
                info = device_key_info.get(dkey)
                if not info:
                    info = {"brand": (dev.get("brand") if isinstance(dev, dict) else None),
                            "model": (dev.get("model") if isinstance(dev, dict) else None),
                            "platforms": set()}
                    device_key_info[dkey] = info
                info["platforms"].add(platform)

                for cat, test_id, _ in self._iter_case_files(d_root):
                    categories[platform].add(cat)
                    tests[platform].setdefault(cat, set())
                    tests_all.setdefault(cat, set())
                    tests[platform][cat].add(test_id)
                    tests_all[cat].add(test_id)
                    file_count += 1

        categories_out = {p: sorted(list(s)) for p, s in categories.items()}
        tests_out = {p: {c: sorted(list(v)) for c, v in cats.items()} for p, cats in tests.items()}
        tests_all_out = {c: sorted(list(v)) for c, v in tests_all.items()}

        device_keys = sorted(list(device_keys_set))
        device_key_info_out = {}
        for k, v in device_key_info.items():
            device_key_info_out[k] = {
                "brand": v.get("brand"),
                "model": v.get("model"),
                "platforms": sorted(list(v.get("platforms", set()))),
            }

        stats = {
            "files": file_count,
            "platforms": len(platforms),
            "devices": sum(len(v) for v in device_ids.values()),
            "categories": sum(len(v) for v in categories_out.values()),
            "tests": sum(len(v) for cats in tests_out.values() for v in cats.values()),
            "deviceKeys": len(device_keys),
        }

        return {
            "platforms": platforms,
            "deviceIds": device_ids,
            "categories": categories_out,
            "tests": tests_out,
            "testsAll": tests_all_out,
            "deviceKeys": device_keys,
            "deviceKeyInfo": device_key_info_out,
            "stats": stats,
        }

    def _load_case_across_devices(self, platform: str, category: str, test_id: str):
        """保留旧能力：同 platform 下不同 deviceId 的 latest 记录"""
        p_root = self._platform_root(platform)
        if not os.path.isdir(p_root):
            return []

        rows = []
        for device_id in sorted(os.listdir(p_root)):
            d_root = os.path.join(p_root, device_id)
            if not os.path.isdir(d_root):
                continue
            fp = self._case_file(platform, device_id, category, test_id)
            if not os.path.exists(fp):
                continue

            data = _safe_read_json(fp)
            if not isinstance(data, dict):
                continue
            latest = data.get("latest")
            if not isinstance(latest, dict):
                continue

            ts = latest.get("timestamp")
            rows.append(
                {
                    "platform": platform,
                    "category": category,
                    "testId": test_id,
                    "deviceId": device_id,
                    "device": latest.get("device") or {},
                    "deviceKey": _mk_device_key(latest.get("device") or {}),
                    "timestamp": ts,
                    "datetime": _iso_from_ms(ts) if isinstance(ts, (int, float)) else None,
                    "name": latest.get("name"),
                    "actual": latest.get("actual"),
                    "passed": latest.get("passed"),
                    "duration": latest.get("duration"),
                    "type": latest.get("type"),
                }
            )

        rows.sort(key=lambda x: (x.get("deviceId") or ""))
        return rows

    def _load_xcase_across_platforms(self, device_key: str, category: str, test_id: str, platforms=None):
        """
        新能力：同一机型 deviceKey 跨 platform 对比

        返回：
          [
            {platform, deviceId, deviceKey, device, timestamp, datetime, actual, passed, duration, type, name},
            ...
          ]
        """
        root = self.baseline_dir
        if not os.path.isdir(root):
            return []

        if platforms is None:
            platforms = [p for p in os.listdir(root) if os.path.isdir(os.path.join(root, p))]

        rows = []
        for platform in sorted(platforms):
            p_root = os.path.join(root, platform)
            if not os.path.isdir(p_root):
                continue

            best = None  # 同 platform 可能有多个 deviceId 但同机型，选 timestamp 最新的那条
            for device_id in os.listdir(p_root):
                d_root = os.path.join(p_root, device_id)
                if not os.path.isdir(d_root):
                    continue

                dev = self._get_device_info(platform, device_id)
                dkey = _mk_device_key(dev)
                if dkey != device_key:
                    continue

                fp = self._case_file(platform, device_id, category, test_id)
                if not os.path.exists(fp):
                    continue

                data = _safe_read_json(fp)
                if not isinstance(data, dict):
                    continue
                latest = data.get("latest")
                if not isinstance(latest, dict):
                    continue

                ts = latest.get("timestamp") or 0
                item = {
                    "platform": platform,
                    "category": category,
                    "testId": test_id,
                    "deviceId": device_id,
                    "deviceKey": device_key,
                    "device": latest.get("device") or dev or {},
                    "timestamp": ts,
                    "datetime": _iso_from_ms(ts) if isinstance(ts, (int, float)) else None,
                    "name": latest.get("name"),
                    "actual": latest.get("actual"),
                    "passed": latest.get("passed"),
                    "duration": latest.get("duration"),
                    "type": latest.get("type"),
                }
                if best is None or (item["timestamp"] or 0) > (best["timestamp"] or 0):
                    best = item

            if best is not None:
                rows.append(best)

        # 默认按 platform 排序
        rows.sort(key=lambda x: (x.get("platform") or ""))
        return rows

    # -----------------------
    # Handlers
    # -----------------------
    def _handle_catalog(self):
        try:
            catalog = self._scan_catalog()
            self._send_json(catalog)
        except Exception as e:
            self._send_json({"error": str(e)}, 500)

    def _handle_case(self, parsed):
        """保留：同 platform 下不同 deviceId 对比"""
        try:
            qs = parse_qs(parsed.query)
            platform = (qs.get("platform", [""])[0] or "").strip()
            category = (qs.get("category", [""])[0] or "").strip()
            test_id = (qs.get("testId", [""])[0] or "").strip()

            if not platform or not category or not test_id:
                self._send_json({"error": "Missing query params: platform/category/testId"}, 400)
                return

            rows = self._load_case_across_devices(platform, category, test_id)
            if not rows:
                self._send_json({"error": "Case not found", "platform": platform, "category": category, "testId": test_id}, 404)
                return

            self._send_json({"platform": platform, "category": category, "testId": test_id, "count": len(rows), "devices": rows})
        except Exception as e:
            self._send_json({"error": str(e)}, 500)

    def _handle_xcase(self, parsed):
        """新增：同机型跨平台对比"""
        try:
            qs = parse_qs(parsed.query)
            device_key = (qs.get("deviceKey", [""])[0] or "").strip().lower()
            category = (qs.get("category", [""])[0] or "").strip()
            test_id = (qs.get("testId", [""])[0] or "").strip()
            base_platform = (qs.get("basePlatform", ["migo"])[0] or "migo").strip()

            platforms_str = (qs.get("platforms", [""])[0] or "").strip()
            platforms = None
            if platforms_str:
                platforms = [p.strip() for p in platforms_str.split(",") if p.strip()]

            if not device_key or not category or not test_id:
                self._send_json({"error": "Missing query params: deviceKey/category/testId"}, 400)
                return

            rows = self._load_xcase_across_platforms(device_key, category, test_id, platforms=platforms)
            if not rows:
                self._send_json(
                    {"error": "Case not found for this deviceKey", "deviceKey": device_key, "category": category, "testId": test_id},
                    404,
                )
                return

            # 让 basePlatform 排在前面，方便 UI 默认参考
            rows.sort(key=lambda x: (0 if x.get("platform") == base_platform else 1, x.get("platform") or ""))

            self._send_json(
                {
                    "deviceKey": device_key,
                    "category": category,
                    "testId": test_id,
                    "basePlatform": base_platform,
                    "count": len(rows),
                    "platforms": rows,
                }
            )
        except Exception as e:
            self._send_json({"error": str(e)}, 500)

    def _handle_summaries(self):
        """读取 baselines/{platform}/{deviceId}/_summary.json"""
        try:
            out = []
            root = self.baseline_dir
            if not os.path.isdir(root):
                self._send_json({"summaries": []})
                return

            for platform in os.listdir(root):
                p_root = os.path.join(root, platform)
                if not os.path.isdir(p_root):
                    continue
                for device_id in os.listdir(p_root):
                    d_root = os.path.join(p_root, device_id)
                    if not os.path.isdir(d_root):
                        continue
                    fp = os.path.join(d_root, "_summary.json")
                    if not os.path.exists(fp):
                        continue
                    s = _safe_read_json(fp)
                    if isinstance(s, dict):
                        out.append(s)

            out.sort(key=lambda x: x.get("timestamp", 0), reverse=True)
            self._send_json({"summaries": out})
        except Exception as e:
            self._send_json({"error": str(e)}, 500)

    def _handle_log(self):
        """处理远程 console.log"""
        try:
            data = self._read_body()
            level = data.get("level", "log")
            args = data.get("args", [])

            colors = {
                "log": "\033[0m",
                "info": "\033[36m",
                "warn": "\033[33m",
                "error": "\033[31m",
                "debug": "\033[90m",
            }
            reset = "\033[0m"
            color = colors.get(level, colors["log"])

            prefix = f"[{level.upper()}]"
            message = " ".join(str(a) for a in args)
            print(f"{color}{prefix}{reset} {message}")

            self._send_json({"success": True})
        except Exception as e:
            self._send_json({"error": str(e)}, 500)

    def _handle_report(self):
        """POST /report：新结构落盘"""
        try:
            data = self._read_body()

            platform = data.get("platform", "unknown")
            device_id = data.get("deviceId", "unknown")
            device = data.get("device") or {}
            results = data.get("results") or []
            timestamp = data.get("timestamp", _now_ms())

            if not platform or not device_id:
                self._send_json({"error": "platform/deviceId required"}, 400)
                return

            saved = 0
            for r in results:
                test_id = r.get("testId")
                if not test_id:
                    continue
                category = r.get("category", "uncategorized")

                baseline = {
                    "testId": test_id,
                    "name": r.get("name"),
                    "category": category,
                    "platform": platform,
                    "deviceId": device_id,
                    "device": device,
                    "timestamp": timestamp,
                    "actual": r.get("actual"),
                    "passed": r.get("passed"),
                    "duration": r.get("duration"),
                    "type": r.get("type", "sync"),
                    "deviceKey": _mk_device_key(device),
                }

                fp = self._case_file(platform, device_id, category, test_id)
                existing = _safe_read_json(fp)
                if not isinstance(existing, dict):
                    existing = {"history": [], "latest": None}

                if existing.get("latest"):
                    hist = existing.get("history", [])
                    if not isinstance(hist, list):
                        hist = []
                    hist.append(existing["latest"])
                    if len(hist) > 10:
                        hist = hist[-10:]
                    existing["history"] = hist

                existing["latest"] = baseline
                _safe_write_json(fp, existing)
                saved += 1

            summary = {
                "platform": platform,
                "deviceId": device_id,
                "device": device,
                "deviceKey": _mk_device_key(device),
                "timestamp": timestamp,
                "datetime": _iso_from_ms(timestamp) or datetime.now().isoformat(),
                "totalTests": len(results),
                "passed": sum(1 for r in results if r.get("passed")),
                "failed": sum(1 for r in results if not r.get("passed")),
            }
            summary["passRate"] = (
                f"{(summary['passed'] / summary['totalTests'] * 100):.1f}%"
                if summary["totalTests"] > 0
                else "0%"
            )
            _safe_write_json(os.path.join(self._device_root(platform, device_id), "_summary.json"), summary)

            print(f"[{datetime.now().isoformat()}] 收到报告: {platform}/{device_id}, 保存 {saved} 条 case")

            self._send_json({"success": True, "saved": saved, "platform": platform, "deviceId": device_id, "summary": summary})
        except Exception as e:
            self._send_json({"error": str(e)}, 500)

    # -----------------------
    # Web UI (cross-platform diff by deviceKey)
    # -----------------------
    def _serve_web_ui(self):
        html = r"""<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>Migo Test Suite - 同机型跨平台 actual 对比</title>
<style>
  *{box-sizing:border-box}
  body{margin:0;padding:20px;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;background:#0f172a;color:#f8fafc}
  .container{max-width:1600px;margin:0 auto}
  h1{margin:0 0 14px 0;font-size:22px;display:flex;align-items:center;gap:10px}
  h1:before{content:"🧪"}
  .card{background:#1e293b;border:1px solid rgba(148,163,184,.15);border-radius:12px;padding:16px;margin-bottom:14px}
  .row{display:flex;gap:12px;flex-wrap:wrap;align-items:flex-end}
  label{display:block;font-size:12px;color:#94a3b8;margin-bottom:6px}
  select,button{border:none;border-radius:10px;padding:10px 12px;font-size:14px;outline:none}
  select{min-width:240px;background:#0b1220;color:#f8fafc;border:1px solid rgba(148,163,184,.25)}
  button{background:#3b82f6;color:#fff;font-weight:800;cursor:pointer}
  button.secondary{background:#334155}
  button:disabled{opacity:.55;cursor:not-allowed}
  .hint{margin-top:10px;color:#94a3b8;font-size:12px;line-height:1.5}
  .pill{display:inline-flex;gap:8px;align-items:center;padding:6px 10px;border-radius:999px;background:#0b1220;border:1px solid rgba(148,163,184,.25);font-size:12px;color:#cbd5e1}
  .pill b{color:#f8fafc}
  .tableWrap{overflow:auto;border-radius:12px;border:1px solid rgba(148,163,184,.18);background:#0b1220}
  table{border-collapse:collapse;width:max-content;min-width:100%}
  th,td{border-bottom:1px solid rgba(148,163,184,.12);padding:10px 12px;vertical-align:top;font-size:13px}
  th{position:sticky;top:0;background:#0d1526;color:#cbd5e1;text-align:left;z-index:1}
  tr:hover td{background:rgba(59,130,246,.07)}
  .path{font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;color:#93c5fd;white-space:nowrap}
  .val{font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;white-space:pre-wrap;word-break:break-word;max-width:520px;color:#e2e8f0}
  .diff{outline:2px solid rgba(239,68,68,.28);background:rgba(239,68,68,.08)}
  .ref{outline:2px solid rgba(34,197,94,.22);background:rgba(34,197,94,.06)}
  .grid2{display:grid;grid-template-columns:1fr 1fr;gap:12px}
  .jsonbox{background:#0b1220;border:1px solid rgba(148,163,184,.18);border-radius:12px;padding:12px;max-height:360px;overflow:auto;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;font-size:12px;white-space:pre;color:#cbd5e1}
  .muted{color:#94a3b8}
  @media(max-width:980px){
    select{min-width:200px}
    .grid2{grid-template-columns:1fr}
    .val{max-width:320px}
  }
</style>
</head>
<body>
<div class="container">
  <h1>Migo Test Suite - 同机型跨平台 actual 对比</h1>

  <div class="card">
    <div class="row">
      <div>
        <label>机型（deviceKey = brand-model）</label>
        <select id="deviceKey"></select>
      </div>
      <div>
        <label>Category</label>
        <select id="category"></select>
      </div>
      <div>
        <label>Test ID（文件名）</label>
        <select id="testId"></select>
      </div>
      <div>
        <label>参考平台（默认 migo）</label>
        <select id="basePlatform"></select>
      </div>
      <div>
        <label>&nbsp;</label>
        <button id="btnCompare" onclick="compareX()" disabled>对比 actual</button>
      </div>
      <div>
        <label>&nbsp;</label>
        <button class="secondary" onclick="reloadCatalog()">刷新索引</button>
      </div>
    </div>
    <div class="hint" id="stats"></div>
  </div>

  <div class="card" id="result" style="display:none">
    <div class="row" style="justify-content:space-between;align-items:center">
      <div class="row" style="align-items:center">
        <span class="pill">平台数 <b id="platCount">0</b></span>
        <span class="pill">差异字段数 <b id="diffCount">0</b></span>
      </div>
      <div>
        <label>参考平台（其他平台相对它高亮差异）</label>
        <select id="refPlat" onchange="renderTable()"></select>
      </div>
    </div>

    <div class="hint">对比策略：将 actual 扁平化为 dot-path（数组使用 [i]），以“稳定序列化”后字符串做相等判断。</div>

    <div style="margin-top:12px" class="tableWrap">
      <table id="diffTable"></table>
    </div>

    <div style="margin-top:14px" class="muted">各平台 latest.actual 原文：</div>
    <div style="margin-top:10px" class="grid2" id="rawJson"></div>
  </div>

  <div class="card" id="err" style="display:none">
    <div style="color:#fecaca;font-weight:900;margin-bottom:8px">加载失败</div>
    <div class="muted" id="errMsg"></div>
  </div>
</div>

<script>
(function(){
  let CATALOG = null;
  let CASEDATA = null;

  function esc(s){
    if (s === null || s === undefined) return '';
    return String(s)
      .replaceAll('&','&amp;')
      .replaceAll('<','&lt;')
      .replaceAll('>','&gt;')
      .replaceAll('"','&quot;')
  }

  function stableStringify(v){
    if (v === null) return 'null';
    const t = typeof v;
    if (t === 'string') return JSON.stringify(v);
    if (t === 'number' || t === 'boolean') return String(v);
    if (Array.isArray(v)) return '[' + v.map(stableStringify).join(',') + ']';
    if (t === 'object'){
      const keys = Object.keys(v).sort();
      return '{' + keys.map(k => JSON.stringify(k)+':'+stableStringify(v[k])).join(',') + '}';
    }
    return JSON.stringify(v);
  }

  function flatten(obj, prefix='', out={}){
    if (obj === null || obj === undefined){
      out[prefix || '(root)'] = obj;
      return out;
    }
    if (Array.isArray(obj)){
      if (obj.length === 0){
        out[prefix || '(root)'] = [];
        return out;
      }
      obj.forEach((v,i)=>{
        const p = prefix ? `${prefix}[${i}]` : `[${i}]`;
        flatten(v, p, out);
      });
      return out;
    }
    if (typeof obj === 'object'){
      const keys = Object.keys(obj);
      if (keys.length === 0){
        out[prefix || '(root)'] = {};
        return out;
      }
      keys.forEach(k=>{
        const p = prefix ? `${prefix}.${k}` : k;
        flatten(obj[k], p, out);
      });
      return out;
    }
    out[prefix || '(root)'] = obj;
    return out;
  }

  function showErr(msg){
    document.getElementById('err').style.display = 'block';
    document.getElementById('errMsg').innerText = msg;
    document.getElementById('result').style.display = 'none';
  }

  function hideErr(){
    document.getElementById('err').style.display = 'none';
  }

  function refreshCategoryAndTest(){
    // category 来自 testsAll 的 keys
    const cSel = document.getElementById('category');
    const testsAll = (CATALOG && CATALOG.testsAll) ? CATALOG.testsAll : {};
    const cats = Object.keys(testsAll).sort();
    cSel.innerHTML = cats.map(c=>`<option value="${esc(c)}">${esc(c)}</option>`).join('');
    cSel.onchange = refreshTest;
    refreshTest();
  }

  function refreshTest(){
    const cat = document.getElementById('category').value;
    const tSel = document.getElementById('testId');
    const tests = (CATALOG && CATALOG.testsAll && CATALOG.testsAll[cat]) ? CATALOG.testsAll[cat] : [];
    tSel.innerHTML = tests.map(t=>`<option value="${esc(t)}">${esc(t)}</option>`).join('');
    enableCompare();
  }

  function enableCompare(){
    const dk = document.getElementById('deviceKey').value;
    const cat = document.getElementById('category').value;
    const tid = document.getElementById('testId').value;
    document.getElementById('btnCompare').disabled = !(dk && cat && tid);
  }

  async function reloadCatalog(){
    try{
      hideErr();
      const res = await fetch('/catalog');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'catalog error');
      CATALOG = data;

      const stats = data.stats || {};
      document.getElementById('stats').innerText =
        `索引：platforms=${stats.platforms||0} devices=${stats.devices||0} deviceKeys=${stats.deviceKeys||0} categories=${stats.categories||0} tests=${stats.tests||0} files=${stats.files||0}`;

      // deviceKey 下拉
      const dkSel = document.getElementById('deviceKey');
      const dks = (data.deviceKeys || []).slice().sort();
      dkSel.innerHTML = dks.map(k=>{
        const info = (data.deviceKeyInfo && data.deviceKeyInfo[k]) ? data.deviceKeyInfo[k] : null;
        const hint = info && info.platforms ? ` [${info.platforms.join(',')}]` : '';
        return `<option value="${esc(k)}">${esc(k + hint)}</option>`;
      }).join('');
      dkSel.onchange = enableCompare;

      // basePlatform 下拉（优先 migo）
      const bpSel = document.getElementById('basePlatform');
      const plats = (data.platforms || []).slice().sort();
      const preferred = ['migo'].filter(p=>plats.includes(p));
      const rest = plats.filter(p=>p !== 'migo');
      const bpList = preferred.concat(rest);
      bpSel.innerHTML = bpList.map(p=>`<option value="${esc(p)}">${esc(p)}</option>`).join('');
      bpSel.value = plats.includes('migo') ? 'migo' : (bpList[0] || '');
      bpSel.onchange = enableCompare;

      refreshCategoryAndTest();
      enableCompare();
    }catch(e){
      showErr(e.message || String(e));
    }
  }

  async function compareX(){
    try{
      hideErr();
      const deviceKey = document.getElementById('deviceKey').value;
      const category  = document.getElementById('category').value;
      const testId    = document.getElementById('testId').value;
      const basePlat  = document.getElementById('basePlatform').value || 'migo';

      if (!deviceKey || !category || !testId) return;

      const url = `/xcase?deviceKey=${encodeURIComponent(deviceKey)}&category=${encodeURIComponent(category)}&testId=${encodeURIComponent(testId)}&basePlatform=${encodeURIComponent(basePlat)}`;
      const res = await fetch(url);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'xcase error');

      CASEDATA = data;
      const plats = data.platforms || [];
      if (plats.length === 0) throw new Error('该机型在各平台没有找到此用例数据');

      // ref 平台下拉：默认 basePlatform（若不存在则第一项）
      const refSel = document.getElementById('refPlat');
      refSel.innerHTML = plats.map(p=>{
        const label = `${p.platform}  (deviceId=${p.deviceId})`;
        return `<option value="${esc(p.platform)}">${esc(label)}</option>`;
      }).join('');

      const hasBase = plats.some(p => p.platform === basePlat);
      refSel.value = hasBase ? basePlat : plats[0].platform;

      document.getElementById('platCount').innerText = plats.length;
      document.getElementById('result').style.display = 'block';

      renderTable();
      renderRawJson();
    }catch(e){
      showErr(e.message || String(e));
    }
  }

  function renderRawJson(){
    const wrap = document.getElementById('rawJson');
    const plats = (CASEDATA && CASEDATA.platforms) ? CASEDATA.platforms : [];
    wrap.innerHTML = plats.map(p=>{
      const di = p.device || {};
      const title = `${p.platform}  (deviceId=${p.deviceId})\n${(di.brand||'').trim()} ${(di.model||'').trim()}\n${p.datetime || ''}`;
      const content = JSON.stringify(p.actual, null, 2);
      return `<div class="jsonbox"><div style="color:#93c5fd;margin-bottom:8px;white-space:pre-wrap">${esc(title)}</div>${esc(content)}</div>`;
    }).join('');
  }

  function renderTable(){
    const table = document.getElementById('diffTable');
    const plats = (CASEDATA && CASEDATA.platforms) ? CASEDATA.platforms : [];
    if (plats.length === 0) { table.innerHTML = ''; return; }

    const refPlat = document.getElementById('refPlat').value || plats[0].platform;
    const ref = plats.find(p=>p.platform===refPlat) || plats[0];

    const flatByPlat = {};
    const allPaths = new Set();
    plats.forEach(p=>{
      const flat = flatten(p.actual, '', {});
      flatByPlat[p.platform] = flat;
      Object.keys(flat).forEach(path=>allPaths.add(path));
    });

    const paths = Array.from(allPaths).sort();
    const refFlat = flatByPlat[ref.platform] || {};

    let html = '<tr><th style="min-width:260px">Path</th>';
    plats.forEach(p=>{
      html += `<th style="min-width:360px">${esc(p.platform)}<br><span class="muted">${esc('deviceId='+p.deviceId)}</span></th>`;
    });
    html += '</tr>';

    let diffFieldCount = 0;

    paths.forEach(path=>{
      const refSig = stableStringify(refFlat[path]);
      let rowHasDiff = false;

      plats.forEach(p=>{
        const sig = stableStringify((flatByPlat[p.platform] || {})[path]);
        if (p.platform !== ref.platform && sig !== refSig) rowHasDiff = true;
      });
      if (rowHasDiff) diffFieldCount += 1;

      html += `<tr><td class="path">${esc(path)}</td>`;
      plats.forEach(p=>{
        const v = (flatByPlat[p.platform] || {})[path];
        const sig = stableStringify(v);
        const cls = (p.platform === ref.platform) ? 'val ref' : (sig === refSig ? 'val' : 'val diff');

        let shown;
        if (v === undefined) shown = 'undefined';
        else if (v === null) shown = 'null';
        else if (typeof v === 'object') shown = JSON.stringify(v);
        else shown = String(v);

        html += `<td class="${cls}">${esc(shown)}</td>`;
      });
      html += '</tr>';
    });

    table.innerHTML = html;
    document.getElementById('diffCount').innerText = diffFieldCount;
  }

  // 暴露给 inline onclick
  window.reloadCatalog = reloadCatalog;
  window.compareX = compareX;
  window.renderTable = renderTable;

  window.addEventListener('DOMContentLoaded', () => {
    reloadCatalog().catch(err => showErr(err.message || String(err)));
  });
})();
</script>
</body>
</html>
"""
        self.send_response(200)
        self.send_header("Content-Type", "text/html; charset=utf-8")
        self.end_headers()
        self.wfile.write(html.encode("utf-8"))

    def log_message(self, format, *args):
        try:
            msg = args[0] if args else format
            print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] {msg}")
        except Exception:
            pass

def _disp_width(s: str) -> int:
    """Display width: treat East Asian Wide/Fullwidth as 2, others as 1."""
    w = 0
    for ch in s:
        w += 2 if unicodedata.east_asian_width(ch) in ("W", "F") else 1
    return w


def _rpad_display(s: str, width: int) -> str:
    """Pad on the right to reach display width."""
    pad = max(0, width - _disp_width(s))
    return s + (" " * pad)


def _lpad_display(s: str, width: int) -> str:
    """Pad on the left to reach display width (right-align)."""
    pad = max(0, width - _disp_width(s))
    return (" " * pad) + s


def print_migo_banner(
    port: int,
    baseline_dir: str,
    *,
    align: str = "left",        # "left" or "right"
    inner_width: int = 68,      # inside width between the two vertical bars
) -> None:
    if align not in ("left", "right"):
        raise ValueError('align must be "left" or "right"')

    pad = _lpad_display if align == "right" else _rpad_display

    def line(text: str = "") -> str:
        return "║" + pad(text, inner_width) + "║"

    top = "╔" + ("═" * inner_width) + "╗"
    mid = "╠" + ("═" * inner_width) + "╣"
    bot = "╚" + ("═" * inner_width) + "╝"

    lines = [
        top,
        line("         Migo Test Suite - 测试结果收集服务器（跨平台对比）      "),
        mid,
        line(f"  服务地址: http://localhost:{port}"),
        mid,
        line("  Web UI:"),
        line("    GET  /                 - 同机型跨平台 actual 对比页面"),
        line("  API:"),
        line("    POST /report           - 上传测试结果（新目录结构落盘）"),
        line("    GET  /catalog          - 索引(含 deviceKeys、testsAll)"),
        line("    GET  /xcase            - 同机型跨平台对比 (核心)"),
        line("    GET  /case             - 同平台多 deviceId (保留)"),
        line("    GET  /summaries        - 所有设备 summary"),
        line("    GET  /health           - 健康检查"),
        line("    POST /log              - 远程 console.log"),
        bot,
    ]
    print("\n".join(lines))

def run_server(port=DEFAULT_PORT, baseline_dir=DEFAULT_BASELINE_DIR):
    TestResultHandler.baseline_dir = os.path.abspath(baseline_dir)
    os.makedirs(TestResultHandler.baseline_dir, exist_ok=True)

    server = HTTPServer(("0.0.0.0", port), TestResultHandler)

    print_migo_banner(port, baseline_dir)

    print("等待测试结果...\n")

    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n服务器已停止")
        server.shutdown()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Migo Test Suite 测试结果收集服务器（跨平台同机型对比）")
    parser.add_argument("--port", "-p", type=int, default=DEFAULT_PORT, help=f"服务端口 (默认: {DEFAULT_PORT})")
    parser.add_argument("--baseline-dir", "-d", type=str, default=DEFAULT_BASELINE_DIR, help="Baseline 保存目录")
    args = parser.parse_args()
    run_server(port=args.port, baseline_dir=args.baseline_dir)
