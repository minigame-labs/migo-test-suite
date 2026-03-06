# Test Spec 编写规范

本文档定义当前仓库 `tests/specs/**` 的编写标准，目标是：

- 对齐 wx API 行为
- 保证同机型跨平台可比对（migo / weixin / quickgame）
- 兼顾 CI 稳定性与手动验证可追踪性

## 1. 适用范围

- 适用于所有新增/修改的 test spec（尤其 base/system、base/lifecycle）
- 适用于 server 对比链路（`/xcase` 优先比较 `actual.raw`）

## 2. 基础结构规范

每个 spec 结构：

```js
{
  name: 'migo.xxx',
  category: 'base',
  tests: [ ... ]
}
```

每个 test 至少包含：

- `id`：全仓唯一（必须）
- `name`：可读中文名
- `description`：说明测试意图、触发方式、是否手动
- `type`：`sync | async | event | navigate | render | audio`
- `run`：执行函数
- `expect`：断言对象（尽量明确）

可选字段：`timeout`、`automation`、`manualRequired`、`allowVariance`、`cleanup`、`severity`、`unsupportedPolicy`。

## 3. raw 对比标准（强制）

为了跨平台对比一致性，**所有核心 API 用例都应返回 `raw`**：

- `raw` 必须是 API 的原始返回/回调 payload，不做 snapshot/重组
- 不要对字段重命名、裁剪、归一化
- 仅在必要时增加校验标记字段（如 `xxxValidOrMissing`）

推荐模式（sync）：

```js
run: (runtime) => {
  const raw = runtime.getWindowInfo();
  return {
    raw,
    isObject: raw && typeof raw === 'object',
    pixelRatioValid: typeof raw?.pixelRatio === 'number'
  };
}
```

推荐模式（callback/event）：

```js
callback({
  raw: typeof res === 'undefined' ? null : res,
  payloadObjectValid: typeof res === 'object' && res !== null
});
```

注意：`undefined` 无法稳定落盘，建议写入 `null`。

## 4. 字段断言规范

- 必填字段：严格断言类型/范围
- wx 专有或可选字段：使用 `ValidOrMissing` 断言，不要强制必须存在
- 枚举字段：使用白名单校验（如 `chatType/apiCategory/platform`）

示例：

- `chatTypeValidOrMissing`
- `referrerInfoValidOrMissing`
- `apiCategoryValidOrMissing`

## 5. Callback / Promise 契约规范

对 options-style API（`success/fail/complete`）建议至少覆盖：

- 是否触发 outcome 回调（`success` 或 `fail`）
- `complete` 是否触发、顺序是否在 outcome 之后
- 是否出现 `success` 与 `fail` 同时触发（应为 false）
- Promise 风格是否支持（单独测试）

不要把 Promise 支持与 callback 结构校验混在同一个断言里。

## 6. on/off 监听类规范（重点）

仅验证“调用不报错”不够。必须能追踪 `on/off` 逻辑正确性。

### 6.1 主 API 用例必须验证“真实触发”

对 `onShow` / `onHide` 这类事件 API：

- `id: 'migo.onShow'` / `id: 'migo.onHide'` 应用于“真实触发”用例（通常是 `event + manual`）
- `eventReceived` 是 runner 注入的元标记（表示 callback 被调用过），不能单独代表事件语义正确
- 断言里至少包含：`eventReceived: true` 与 `triggered: true`
- 并记录 `raw` 回调原始参数（`undefined` 写 `null`）

注册契约（例如“可注册 listener、返回非 Promise”）应放在单独用例（如 `lifecycle-onShow-register-contract`），不要占用主 API id。

对 `onShow/offShow`、`onHide/offHide` 建议增加“触发序列校验”并输出这些标记：

- `sequenceCompleted`
- `offShowCallSucceeded` / `offHideCallSucceeded`
- `listenerAFirstEventCalled`
- `listenerACalledAfterOff`（关键：应为 `false`）
- `listenerBStillCalledAfterOff`
- `listenerACallCount` / `listenerBCallCount`
- `raw.firstEvent` / `raw.secondEvent`

这类用例通常应标记：

- `automation: 'manual'`
- `manualRequired: true`
- 较长 `timeout`

## 7. manual 用例规范

- 需要前后台切换、系统弹窗、人工观察的用例必须标记 manual
- 描述里写清触发动作（例如“切后台再回前台两次”）
- 支持超时回收，避免阻塞整轮执行
- 在 `cleanup` 中清理监听器，避免影响后续 case

## 8. 错误与兼容语义

- API 缺失请返回 `{ _error: 'xxx 不存在' }`
- 不支持能力按 profile 策略进入 `skipped` 或 `failed`
- 不要吞掉异常，必要时返回 `error` 字段用于排查

## 9. allowVariance 使用规范

- 仅用于时间戳、设备瞬时状态等“预期波动字段”
- 禁止大范围放开（例如整个 `raw`）导致失去校验价值
- 建议最小路径粒度

## 10. 提交前检查（必做）

1. 语法检查

```bash
node --check tests/specs/base/xxx.js
```

2. 静态校验

```bash
node scripts/validate-specs.mjs
```

3. 至少跑一轮对应 profile

- 自动化改动：`smoke` / `regression`
- 手动链路改动：`manual`

## 11. 与 server 对齐要求

- server 对比优先使用 `actual.raw`，否则回退 `actual`
- 因此 spec 中建议统一输出 `raw`，以获得稳定跨平台对比视图

---

如无特殊原因，新增用例应遵循本规范；若需要偏离，请在 PR 说明原因与替代保障。
