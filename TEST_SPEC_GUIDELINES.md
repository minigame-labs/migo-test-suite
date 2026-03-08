# Test Spec 编写规范

本文档定义 `tests/specs/**` 的统一标准，目标是：

- 对齐 wx API 行为
- 保证同机型跨平台可比对（migo / weixin / quickgame）
- 保证 CI 稳定、manual 场景可追踪
- 避免重复造轮子，统一复用公共 helper

## 1. 适用范围

- 适用于所有新增/修改的 spec（尤其 base、ad、camera、storage）
- 适用于 server 对比链路（`/xcase` 优先比对 `actual.raw`）

## 2. 基础结构

每个 spec 文件导出数组，每个分组结构如下：

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

## 3. 公共 helper 复用（强制）

### 3.1 统一 helper 来源

- 通用运行时 helper：`tests/specs/_shared/runtime-helpers.js`
- 通用实例契约 helper：`tests/specs/_shared/instance-contract-helpers.js`
- 领域 helper 放在分类目录（例如：`tests/specs/ad/_helpers.js`）

### 3.2 禁止重复定义

以下能力禁止在每个 spec 文件重复手写，应优先从 helper 导入：

- 类型判断：`isObject/isString/isFiniteNumber/isThenable`
- 结果归一：`normalizeRaw`
- 错误格式化：`formatError`
- Promise 探测：`probePromiseSupport`
- options 回调契约：`runOptionApiContract`
- create API 契约：`runCreateInstanceContract`
- create 参数矩阵：`runCreateInstanceScenarioMatrix`
- 实例方法契约：`runInstanceMethodReturnContract`
- Promise 结果契约：`runPromiseMethodOutcome`
- 监听注册/反注册契约：`runOnListenerContract/runOffListenerContract`
- 全局 on/off 契约：`runGlobalOnRegisterContract/runGlobalOffContract`

### 3.3 新增通用逻辑时的要求

- 先放 helper，再在具体 spec 调用
- helper 需保持无业务副作用
- helper 参数命名要语义化（`timeoutMs`、`validateSuccessPayload` 等）
- 一段逻辑如果会被 2 个以上分类复用（如 ad + camera），应放入 `_shared`，不要继续放在单个分类目录

## 4. raw 对比标准（强制）

为了跨平台稳定比对，核心 API 用例必须返回 `raw`：

- `raw` 应为 API 原始返回值或原始回调 payload
- 不要对 `raw` 做重命名、裁剪、重新组装
- `undefined` 必须归一为 `null`（便于落盘）

推荐模式（sync）：

```js
run: (runtime) => {
  const raw = runtime.getWindowInfo();
  return {
    raw,
    payloadValid: raw && typeof raw === 'object'
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

## 5. 覆盖维度清单（按 API 类型）

写 spec 时至少检查下列维度，避免只测“调用不报错”。

### 5.1 createXxx / 构造类 API

- API 存在性
- 返回值类型（对象 / 非 Promise）
- 实例方法集合是否完整
- `raw` 输出
- 参数矩阵（不同参数组合）

参数矩阵建议覆盖：

- 默认参数
- 文档中的关键枚举值
- 边界合法值（如最小刷新间隔、不同主题/模式）

### 5.2 options-style API（success/fail/complete）

至少覆盖：

- 是否触发 outcome（`success` 或 `fail`）
- `complete` 是否触发，且顺序是否在 outcome 之后
- `success` 与 `fail` 不可同时触发
- success payload 结构校验
- Promise 风格支持与否（单独用例）

说明：Promise 支持探测和 callback 契约校验不要混在一个用例里。

### 5.3 Promise API

至少覆盖：

- 调用返回 thenable
- 结果单一（不能同时 resolve/reject）
- `resolved/rejected` payload 结构合法
- 超时可回收（避免卡死）
- `raw` 输出（返回值或 settle payload）

### 5.4 on/off 监听 API

必须拆分两层：

- 注册/反注册契约（on/off 可调用，支持传 listener 或不传）
- 真实触发用例（通常 `type: 'event'` + `automation: 'manual'`）

真实触发用例要求：

- 断言 `eventReceived: true` 与业务标记（如 `triggered: true`）
- 校验 payload 结构
- 输出 `raw`
- 在 `cleanup` 清理监听器

### 5.5 正向/反向双轨（必须）

对用户可感知效果 API（如 `save*`、`preview*`、`open*`、媒体选择器），**必须同时具备两类用例**：

- 反向/异常用例（通常自动化）：使用无效参数，验证 fail/complete 契约与错误结构
- 正向功能用例（通常 manual）：使用有效参数，验证 success 路径与真实能力生效

注意：仅有 invalid 场景只能证明“接口契约没坏”，不能证明“功能可用”。

正向功能用例最低要求：

- 明确有效输入来源（例如先 `chooseImage` 拿到本地路径，再调用 `saveImageToPhotosAlbum`）
- 断言 `successCalled: true`、`failCalled: false`、`completeCalled: true`
- 记录 `raw`
- `description` 中写明人工确认动作（例如“关闭预览页后返回”“确认图片已保存到系统相册”）
- 主 API 用例（`id: 'migo.xxx'`）应优先对应正向功能验证；仅契约/异常场景放到独立子用例 id

广告类补充要求（依赖真实 adUnitId）：

- 真实展示/加载用例需使用有效 adUnitId（建议从 `runtime.env` 注入）
- 若运行环境未配置真实 adUnitId，用例应返回带 `not supported` 的 `_error`，并设置 `unsupportedPolicy: 'skip'`
- 配置真实 adUnitId 后，正向用例应断言 `showResolved: true`（或等价成功标记）

## 6. 字段断言策略

- 必填字段：严格断言类型/范围
- 可选字段：使用 `xxxValidOrMissing`
- 枚举字段：使用白名单校验

示例命名：

- `statusValidOrMissing`
- `errCodeValidOrMissing`
- `referrerInfoValidOrMissing`

## 7. manual 用例规范

- 涉及授权弹窗、前后台切换、人工观察时必须标记：
  - `automation: 'manual'`
  - `manualRequired: true`
- `description` 必须写清触发动作
- 涉及“功能是否真的生效”的能力，manual 用例需写清人工确认点（看到了什么/完成了什么）
- 必须设置合理 `timeout`
- 必须提供 `cleanup`，避免污染后续 case

## 8. 错误与兼容语义

- API 缺失统一返回：`{ _error: 'xxx 不存在' }`
- 运行异常不要吞掉，返回 `error` 字段便于排查
- 不支持能力应通过 profile 策略进入 skipped/failed，避免“假通过”

## 9. allowVariance 使用规则

- 仅用于预期波动字段（时间戳、动态状态等）
- 不要放开整个 `raw`
- 保持最小路径粒度

## 10. 命名与可读性

- `id` 应稳定、可追溯，主 API 用例优先使用 `migo.xxx`
- `description` 写清“测什么 + 怎么触发 + 输出什么”
- 新增 helper 时，命名应体现契约语义（如 `runOptionApiContract`）

## 11. 提交前检查（必做）

1) 语法检查

```bash
node --check tests/specs/<category>/<file>.js
```

2) 静态校验

```bash
node scripts/validate-specs.mjs
```

3) 至少跑一轮对应 profile

- 自动化改动：`smoke` / `regression`
- 手动链路改动：`manual`

## 12. 与 server 对齐要求

- server 对比优先使用 `actual.raw`，否则回退 `actual`
- 结论：spec 应统一输出 `raw`，并尽量保持原始 payload

---

如无特殊原因，新增用例必须遵循本规范；若需要偏离，需在 PR 说明原因与替代保障。
