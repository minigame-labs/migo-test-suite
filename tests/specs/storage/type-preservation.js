/**
 * Storage type preservation tests
 * Verifies that setStorageSync/getStorageSync preserve value types
 */

const PREFIX = '__migo_type_test_';

function typeTest(label, value, expectedType, validator) {
  return {
    id: `storage-type-${label}`,
    name: `storage preserves ${label} type`,
    type: 'sync',
    run: (rt) => {
      const key = PREFIX + label;
      try {
        rt.setStorageSync(key, value);
        const retrieved = rt.getStorageSync(key);
        rt.removeStorageSync(key);

        return {
          originalType: typeof value,
          retrievedType: typeof retrieved,
          typesMatch: typeof value === typeof retrieved,
          valuesMatch: validator
            ? validator(retrieved)
            : JSON.stringify(retrieved) === JSON.stringify(value),
          retrieved: retrieved
        };
      } catch (e) {
        return { _error: e.message || String(e) };
      }
    },
    expect: {
      typesMatch: true,
      valuesMatch: true
    }
  };
}

const spec = {
  name: 'storage type preservation',
  category: 'storage',
  tests: [
    typeTest('string', 'hello world', 'string', (v) => v === 'hello world'),
    typeTest('number-int', 42, 'number', (v) => v === 42),
    typeTest('number-float', 3.14, 'number', (v) => Math.abs(v - 3.14) < 0.001),
    typeTest('number-zero', 0, 'number', (v) => v === 0),
    typeTest('number-negative', -99, 'number', (v) => v === -99),
    typeTest('boolean-true', true, 'boolean', (v) => v === true),
    typeTest('boolean-false', false, 'boolean', (v) => v === false),
    typeTest('object', { a: 1, b: 'two', c: [3] }, 'object', (v) => v && v.a === 1 && v.b === 'two' && Array.isArray(v.c) && v.c[0] === 3),
    typeTest('array', [1, 'two', true, null], 'object', (v) => Array.isArray(v) && v.length === 4 && v[0] === 1 && v[1] === 'two' && v[2] === true && v[3] === null),
    // null: Migo stores with type tag "x", should retrieve as null or empty string
    // WX may return '' for null. We record actual behavior for cross-platform comparison.
    {
      id: 'storage-type-null',
      name: 'storage handles null',
      type: 'sync',
      run: (rt) => {
        const key = PREFIX + 'null';
        try {
          rt.setStorageSync(key, null);
          const retrieved = rt.getStorageSync(key);
          rt.removeStorageSync(key);
          return {
            noThrow: true,
            retrievedValue: retrieved,
            retrievedType: typeof retrieved,
            isNull: retrieved === null,
            isEmpty: retrieved === '',
            raw: retrieved
          };
        } catch (e) {
          return { _error: e.message || String(e) };
        }
      },
      expect: { noThrow: true }
    },
    typeTest('empty-string', '', 'string', (v) => v === ''),
    // Use actual CJK + special chars to test Unicode preservation
    typeTest('unicode-cjk', '\u4f60\u597d\u4e16\u754c', 'string', (v) => v === '\u4f60\u597d\u4e16\u754c'),
    typeTest('special-chars', 'line1\nline2\ttab\\slash"quote', 'string', (v) => v === 'line1\nline2\ttab\\slash"quote'),
    typeTest('nested-object', { x: { y: { z: 42 } } }, 'object', (v) => v && v.x && v.x.y && v.x.y.z === 42),
    {
      id: 'storage-type-undefined',
      name: 'storage handles undefined gracefully',
      type: 'sync',
      run: (rt) => {
        const key = PREFIX + 'undef';
        try {
          rt.setStorageSync(key, undefined);
          const retrieved = rt.getStorageSync(key);
          rt.removeStorageSync(key);
          return {
            noThrow: true,
            retrievedType: typeof retrieved,
            retrieved: retrieved
          };
        } catch (e) {
          return { noThrow: false, error: e.message || String(e) };
        }
      },
      expect: { noThrow: true }
    }
  ]
};

export default [spec];
