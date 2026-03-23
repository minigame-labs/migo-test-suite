/**
 * Concurrent deferred API tests
 * Verifies that requestId-based matching works for simultaneous async calls.
 * Tests both callback style and Promise style concurrency.
 */
import { normalizeRaw } from '../_shared/runtime-helpers.js';

const spec = {
  name: 'concurrent deferred APIs',
  category: 'base',
  tests: [
    // --- Callback style: two concurrent setStorage ---
    {
      id: 'concurrent-storage-cb',
      name: 'two concurrent setStorage (callback) both complete',
      type: 'async',
      timeoutMs: 8000,
      run: (runtime, done) => {
        if (typeof runtime.setStorage !== 'function') {
          return done({ _error: 'setStorage not found' });
        }
        let completed = 0;
        const results = [];
        function check() {
          completed++;
          if (completed >= 2) {
            done({
              bothCompleted: true,
              resultCount: results.length,
              allSuccess: results.every((r) => r.success),
              results: results
            });
          }
        }
        runtime.setStorage({
          key: '__conc_a__', data: 'a',
          success: () => { results.push({ key: 'a', success: true }); check(); },
          fail: (e) => { results.push({ key: 'a', success: false, error: normalizeRaw(e && e.errMsg) }); check(); }
        });
        runtime.setStorage({
          key: '__conc_b__', data: 'b',
          success: () => { results.push({ key: 'b', success: true }); check(); },
          fail: (e) => { results.push({ key: 'b', success: false, error: normalizeRaw(e && e.errMsg) }); check(); }
        });
      },
      expect: { bothCompleted: true, resultCount: 2, allSuccess: true },
      cleanup: (rt) => {
        try { rt.removeStorageSync('__conc_a__'); } catch (e) { /* ignore */ }
        try { rt.removeStorageSync('__conc_b__'); } catch (e) { /* ignore */ }
      }
    },

    // --- Promise style: concurrent setStorage via Promise.all ---
    {
      id: 'concurrent-storage-promise',
      name: 'two concurrent setStorage (Promise.all) both resolve',
      type: 'async',
      timeoutMs: 8000,
      run: (runtime) => {
        if (typeof runtime.setStorage !== 'function') {
          return Promise.resolve({ _error: 'setStorage not found' });
        }
        const p1 = new Promise((resolve) => {
          runtime.setStorage({
            key: '__conc_pa__', data: 'pa',
            success: () => resolve({ key: 'pa', success: true }),
            fail: (e) => resolve({ key: 'pa', success: false, error: normalizeRaw(e && e.errMsg) })
          });
        });
        const p2 = new Promise((resolve) => {
          runtime.setStorage({
            key: '__conc_pb__', data: 'pb',
            success: () => resolve({ key: 'pb', success: true }),
            fail: (e) => resolve({ key: 'pb', success: false, error: normalizeRaw(e && e.errMsg) })
          });
        });
        return Promise.all([p1, p2]).then((results) => ({
          bothCompleted: true,
          resultCount: results.length,
          allSuccess: results.every((r) => r.success),
          results: results
        }));
      },
      expect: { bothCompleted: true, resultCount: 2, allSuccess: true },
      cleanup: (rt) => {
        try { rt.removeStorageSync('__conc_pa__'); } catch (e) { /* ignore */ }
        try { rt.removeStorageSync('__conc_pb__'); } catch (e) { /* ignore */ }
      }
    },

    // --- Three concurrent getSystemInfo ---
    {
      id: 'concurrent-sysinfo',
      name: 'three concurrent getSystemInfo all resolve consistently',
      type: 'async',
      timeoutMs: 8000,
      run: (runtime, done) => {
        if (typeof runtime.getSystemInfo !== 'function') {
          return done({ _error: 'getSystemInfo not found' });
        }
        let completed = 0;
        const results = [];
        function check() {
          completed++;
          if (completed >= 3) {
            const allHavePlatform = results.every((r) => typeof r.platform === 'string');
            const platformsConsistent = allHavePlatform && results.every((r) => r.platform === results[0].platform);
            done({
              allCompleted: true,
              resultCount: results.length,
              allHavePlatform: allHavePlatform,
              platformsConsistent: platformsConsistent
            });
          }
        }
        for (let i = 0; i < 3; i++) {
          runtime.getSystemInfo({
            success: (res) => { results.push({ platform: res.platform }); check(); },
            fail: () => { results.push({ platform: null }); check(); }
          });
        }
      },
      expect: { allCompleted: true, resultCount: 3, allHavePlatform: true, platformsConsistent: true }
    },

    // --- Two concurrent getNetworkType ---
    {
      id: 'concurrent-network',
      name: 'two concurrent getNetworkType both resolve same type',
      type: 'async',
      timeoutMs: 8000,
      run: (runtime, done) => {
        if (typeof runtime.getNetworkType !== 'function') {
          return done({ _error: 'getNetworkType not found' });
        }
        let completed = 0;
        const types = [];
        function check() {
          completed++;
          if (completed >= 2) {
            done({
              bothCompleted: true,
              resultCount: types.length,
              typesMatch: types.length >= 2 && types[0] === types[1],
              networkTypes: types
            });
          }
        }
        runtime.getNetworkType({
          success: (res) => { types.push(normalizeRaw(res.networkType)); check(); },
          fail: () => { types.push(null); check(); }
        });
        runtime.getNetworkType({
          success: (res) => { types.push(normalizeRaw(res.networkType)); check(); },
          fail: () => { types.push(null); check(); }
        });
      },
      expect: { bothCompleted: true, resultCount: 2, typesMatch: true }
    }
  ]
};

export default [spec];
