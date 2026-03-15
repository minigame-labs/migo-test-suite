import { getEndpoint } from '../../config.js';
import {
  isObject,
  isString,
  isFiniteNumber,
  isThenable,
  normalizeRaw,
  formatError
} from '../_shared/runtime-helpers.js';
import {
  createRuntimeInstance,
  destroyInstanceSafely,
  runCreateInstanceContract,
  runCreateInstanceScenarioMatrix,
  runInstanceMethodReturnContract,
  runOnListenerContract,
  runOffListenerContract
} from '../_shared/instance-contract-helpers.js';

const CREATE_API_NAME = 'createUDPSocket';

const UDP_REQUIRED_METHODS = [
  'bind',
  'setTTL',
  'send',
  'connect',
  'write',
  'close',
  'onClose',
  'offClose',
  'onError',
  'offError',
  'onListening',
  'offListening',
  'onMessage',
  'offMessage'
];

const UDP_TYPE_VALUES = new Set(['udp4', 'udp6']);
const UDP_HOST_ENV_KEYS = ['MIGO_UDP_HOST', 'UDP_HOST', 'WX_UDP_HOST'];
const UDP_PORT_ENV_KEYS = ['MIGO_UDP_PORT', 'UDP_PORT', 'WX_UDP_PORT'];
const UDP_DEFAULT_PORT = 8769;

function getRuntimeEnv(runtime) {
  return runtime && isObject(runtime.env) ? runtime.env : {};
}

function pickRuntimeEnvValue(runtime, keys) {
  const env = getRuntimeEnv(runtime);
  for (const key of keys) {
    const value = env[key];
    if (typeof value !== 'undefined' && value !== null) {
      return value;
    }
  }
  return null;
}

function parsePort(value) {
  if (isFiniteNumber(value)) {
    return value >= 1 && value <= 65535 ? value : null;
  }

  if (isString(value) && value.trim().length > 0) {
    const parsed = Number(value);
    if (Number.isFinite(parsed) && parsed >= 1 && parsed <= 65535) {
      return parsed;
    }
  }

  return null;
}

function parseEndpointToHostPort(endpoint, fallbackPort = null) {
  if (!isString(endpoint) || endpoint.trim().length === 0) {
    return null;
  }

  const text = endpoint.trim();

  if (typeof URL === 'function') {
    try {
      const parsed = new URL(text);
      const host = parsed.hostname;
      const port = parsePort(parsed.port || fallbackPort);
      if (isString(host) && host.length > 0 && isFiniteNumber(port)) {
        return { address: host, port };
      }
    } catch (e) {
      // fallback to regex parser
    }
  }

  const match = text.match(/^(?:[a-z]+:\/\/)?([^/:]+)(?::(\d+))?/i);
  if (!match) {
    return null;
  }

  const address = match[1];
  const port = parsePort(match[2] ? Number(match[2]) : fallbackPort);
  if (!isString(address) || address.length === 0 || !isFiniteNumber(port)) {
    return null;
  }

  return { address, port };
}

function resolveUdpTarget(runtime) {
  const envAddress = pickRuntimeEnvValue(runtime, UDP_HOST_ENV_KEYS);
  const envPort = parsePort(pickRuntimeEnvValue(runtime, UDP_PORT_ENV_KEYS));

  if (isString(envAddress) && envAddress.trim().length > 0 && isFiniteNumber(envPort)) {
    return {
      address: envAddress.trim(),
      port: envPort,
      source: 'runtime.env'
    };
  }

  const udpEndpoint = getEndpoint('udp');
  const parsedUdp = parseEndpointToHostPort(udpEndpoint, null);
  if (parsedUdp) {
    return {
      ...parsedUdp,
      source: 'config.endpoints.udp'
    };
  }

  const httpEndpoint = getEndpoint('http');
  const parsedHttp = parseEndpointToHostPort(httpEndpoint, UDP_DEFAULT_PORT);
  if (parsedHttp) {
    return {
      ...parsedHttp,
      source: 'config.endpoints.http+udpDefaultPort'
    };
  }

  return null;
}

function isUdpTypeValidOrMissing(value) {
  return typeof value === 'undefined' || (isString(value) && UDP_TYPE_VALUES.has(value));
}

function isUdpFamilyValidOrMissing(value) {
  return typeof value === 'undefined' || value === 'IPv4' || value === 'IPv6';
}

function isSocketAddressInfoValidOrMissing(value, requireSize = false) {
  if (typeof value === 'undefined') {
    return !requireSize;
  }

  if (!isObject(value)) {
    return false;
  }

  const addressValid = isString(value.address);
  const familyValidOrMissing = isUdpFamilyValidOrMissing(value.family);
  const portValid = isFiniteNumber(value.port);
  const sizeValidOrMissing = !requireSize || isFiniteNumber(value.size);

  return addressValid && familyValidOrMissing && portValid && sizeValidOrMissing;
}

function validateErrorPayload(payload) {
  if (isString(payload)) {
    return payload.length > 0;
  }

  if (!isObject(payload)) {
    return false;
  }

  return typeof payload.errMsg === 'undefined' || isString(payload.errMsg);
}

function validateMessagePayload(payload) {
  if (!isObject(payload)) {
    return false;
  }

  const message = payload.message;
  const messageValid = message instanceof ArrayBuffer || ArrayBuffer.isView(message) || isString(message);
  const remoteInfoValid = isSocketAddressInfoValidOrMissing(payload.remoteInfo, true);
  const localInfoValidOrMissing = isSocketAddressInfoValidOrMissing(payload.localInfo, false);

  return messageValid && remoteInfoValid && localInfoValidOrMissing;
}

function encodeTextToBytes(text) {
  if (typeof TextEncoder === 'function') {
    return new TextEncoder().encode(text);
  }

  const arr = new Uint8Array(text.length);
  for (let i = 0; i < text.length; i += 1) {
    arr[i] = text.charCodeAt(i) & 0xff;
  }
  return arr;
}

function toByteArray(value) {
  if (value instanceof ArrayBuffer) {
    return new Uint8Array(value);
  }

  if (ArrayBuffer.isView(value)) {
    return new Uint8Array(value.buffer, value.byteOffset, value.byteLength);
  }

  if (isString(value)) {
    return encodeTextToBytes(value);
  }

  return null;
}

function bytesEqual(a, b) {
  if (!(a instanceof Uint8Array) || !(b instanceof Uint8Array)) {
    return false;
  }

  if (a.byteLength !== b.byteLength) {
    return false;
  }

  for (let i = 0; i < a.byteLength; i += 1) {
    if (a[i] !== b[i]) {
      return false;
    }
  }

  return true;
}

function closeUdpSafely(socket) {
  if (!isObject(socket) || typeof socket.close !== 'function') {
    return;
  }

  try {
    socket.close();
  } catch (e) {
    // ignore cleanup error
  }
}

function removeUdpListenerSafely(socket, offMethodName, listener) {
  if (!isObject(socket) || typeof socket[offMethodName] !== 'function' || typeof listener !== 'function') {
    return;
  }

  try {
    socket[offMethodName](listener);
  } catch (e) {
    // ignore cleanup error
  }
}

function cleanupSocketState(state) {
  if (!state || !isObject(state.socket)) {
    return;
  }

  if (Array.isArray(state.listeners)) {
    for (const item of state.listeners) {
      removeUdpListenerSafely(state.socket, item.offMethodName, item.listener);
    }
  }

  closeUdpSafely(state.socket);
}

function runCreateSocketScenarioMatrix(runtime) {
  const matrix = runCreateInstanceScenarioMatrix(runtime, {
    createApiName: CREATE_API_NAME,
    requiredMethods: UDP_REQUIRED_METHODS,
    scenarios: [
      {
        caseId: 'default',
        options: undefined
      },
      {
        caseId: 'udp4',
        options: 'udp4'
      },
      {
        caseId: 'udp6',
        options: 'udp6'
      }
    ]
  });

  if (matrix && matrix._error) {
    return matrix;
  }

  const scenarios = Array.isArray(matrix?.scenarios) ? matrix.scenarios : [];
  const scenarioMap = new Map(scenarios.map((item) => [item.caseId, item]));
  const defaultCase = scenarioMap.get('default');
  const udp4Case = scenarioMap.get('udp4');
  const udp6Case = scenarioMap.get('udp6');

  return {
    ...matrix,
    scenarioCountValid: scenarios.length === 3,
    defaultCaseSucceeded: Boolean(defaultCase)
      && defaultCase.createThrew === false
      && defaultCase.instanceObjectValid === true
      && defaultCase.requiredMethodsValid === true,
    udp4CaseSucceeded: Boolean(udp4Case)
      && udp4Case.createThrew === false
      && udp4Case.instanceObjectValid === true
      && udp4Case.requiredMethodsValid === true,
    udp6CaseCovered: Boolean(udp6Case),
    typeArgsValid: isUdpTypeValidOrMissing('udp4') && isUdpTypeValidOrMissing('udp6')
  };
}

function runBindContract(runtime, bindPortArg, caseId) {
  const created = createRuntimeInstance(runtime, CREATE_API_NAME, 'udp4');
  if (created.errorResult) {
    return created.errorResult;
  }

  const socket = created.instance;
  if (!isObject(socket) || typeof socket.bind !== 'function') {
    destroyInstanceSafely(socket);
    return { _error: 'UDPSocket.bind 不存在' };
  }

  let returned;
  let invocationThrew = false;
  let error = null;

  try {
    if (typeof bindPortArg === 'undefined') {
      returned = socket.bind();
    } else {
      returned = socket.bind(bindPortArg);
    }
  } catch (e) {
    invocationThrew = true;
    error = formatError(e);
  }

  const bindPortValid = isFiniteNumber(returned) && returned >= 1 && returned <= 65535;
  closeUdpSafely(socket);

  return {
    methodExists: true,
    caseId,
    bindArgValid: typeof bindPortArg === 'undefined' || (isFiniteNumber(bindPortArg) && bindPortArg >= 0 && bindPortArg <= 65535),
    invocationThrew,
    invocationSucceeded: !invocationThrew,
    returnThenable: isThenable(returned),
    bindPortValid,
    raw: invocationThrew ? null : normalizeRaw(returned),
    error
  };
}

function runSetTtlBoundaryMatrix(runtime) {
  const created = createRuntimeInstance(runtime, CREATE_API_NAME, 'udp4');
  if (created.errorResult) {
    return created.errorResult;
  }

  const socket = created.instance;
  if (!isObject(socket) || typeof socket.setTTL !== 'function') {
    destroyInstanceSafely(socket);
    return { _error: 'UDPSocket.setTTL 不存在' };
  }

  const result = {
    apiExists: true,
    methodExists: true,
    bindSucceeded: false,
    caseCount: 0,
    allInvoked: true,
    allSucceeded: true,
    allReturnNonPromise: true,
    raw: [],
    cases: []
  };

  try {
    const bindReturn = socket.bind();
    result.bindSucceeded = isFiniteNumber(bindReturn) && bindReturn >= 1 && bindReturn <= 65535;
  } catch (e) {
    closeUdpSafely(socket);
    return {
      ...result,
      bindSucceeded: false,
      error: formatError(e)
    };
  }

  const ttlValues = [0, 64, 255];
  const cases = ttlValues.map((ttl) => {
    let returned;
    let invocationThrew = false;
    let error = null;

    try {
      returned = socket.setTTL(ttl);
    } catch (e) {
      invocationThrew = true;
      error = formatError(e);
    }

    return {
      ttl,
      ttlArgValid: isFiniteNumber(ttl) && ttl >= 0 && ttl <= 255,
      invocationThrew,
      returnThenable: isThenable(returned),
      raw: invocationThrew ? null : normalizeRaw(returned),
      error
    };
  });

  closeUdpSafely(socket);

  return {
    ...result,
    caseCount: cases.length,
    allInvoked: cases.length === ttlValues.length,
    allSucceeded: cases.every((item) => item.invocationThrew === false),
    allReturnNonPromise: cases.every((item) => item.returnThenable === false),
    raw: cases.map((item) => item.raw),
    cases
  };
}

function runConnectMethodReturnContract(runtime) {
  const target = resolveUdpTarget(runtime) || {
    address: '127.0.0.1',
    port: UDP_DEFAULT_PORT,
    source: 'fallback'
  };

  const result = runInstanceMethodReturnContract(runtime, {
    createApiName: CREATE_API_NAME,
    createOptions: 'udp4',
    methodName: 'connect',
    invoke: (socket) => {
      if (typeof socket.bind === 'function') {
        socket.bind();
      }
      return socket.connect({
        address: target.address,
        port: target.port
      });
    },
    afterInvoke: (socket) => {
      closeUdpSafely(socket);
    }
  });

  return {
    ...result,
    targetSource: target.source,
    targetAddressValid: isString(target.address) && target.address.length > 0,
    targetPortValid: isFiniteNumber(target.port) && target.port >= 1 && target.port <= 65535,
    invocationHandled: !result.invocationThrew || isString(result.error)
  };
}

function runSendMethodReturnContract(runtime) {
  const target = resolveUdpTarget(runtime) || {
    address: '127.0.0.1',
    port: UDP_DEFAULT_PORT,
    source: 'fallback'
  };
  const payload = 'migo-udp-send-contract';

  const result = runInstanceMethodReturnContract(runtime, {
    createApiName: CREATE_API_NAME,
    createOptions: 'udp4',
    methodName: 'send',
    invoke: (socket) => {
      if (typeof socket.bind === 'function') {
        socket.bind();
      }
      return socket.send({
        address: target.address,
        port: target.port,
        message: payload
      });
    },
    afterInvoke: (socket) => {
      closeUdpSafely(socket);
    }
  });

  return {
    ...result,
    targetSource: target.source,
    targetAddressValid: isString(target.address) && target.address.length > 0,
    targetPortValid: isFiniteNumber(target.port) && target.port >= 1 && target.port <= 65535,
    messageArgValid: isString(payload) && payload.length > 0,
    invocationHandled: !result.invocationThrew || isString(result.error)
  };
}

function runWriteMethodReturnContract(runtime) {
  const target = resolveUdpTarget(runtime) || {
    address: '127.0.0.1',
    port: UDP_DEFAULT_PORT,
    source: 'fallback'
  };
  const payload = new Uint8Array([109, 105, 103, 111]).buffer;

  const result = runInstanceMethodReturnContract(runtime, {
    createApiName: CREATE_API_NAME,
    createOptions: 'udp4',
    methodName: 'write',
    invoke: (socket) => {
      if (typeof socket.bind === 'function') {
        socket.bind();
      }
      if (typeof socket.connect === 'function') {
        socket.connect({
          address: target.address,
          port: target.port
        });
      }
      return socket.write({
        address: target.address,
        port: target.port,
        message: payload
      });
    },
    afterInvoke: (socket) => {
      closeUdpSafely(socket);
    }
  });

  return {
    ...result,
    targetSource: target.source,
    targetAddressValid: isString(target.address) && target.address.length > 0,
    targetPortValid: isFiniteNumber(target.port) && target.port >= 1 && target.port <= 65535,
    messageArgValid: payload instanceof ArrayBuffer,
    invocationHandled: !result.invocationThrew || isString(result.error)
  };
}

function runCloseMethodReturnContract(runtime) {
  const result = runInstanceMethodReturnContract(runtime, {
    createApiName: CREATE_API_NAME,
    createOptions: 'udp4',
    methodName: 'close',
    invoke: (socket) => {
      if (typeof socket.bind === 'function') {
        socket.bind();
      }
      return socket.close();
    }
  });

  return {
    ...result,
    invocationHandled: !result.invocationThrew || isString(result.error)
  };
}

function runUdpOnListener(runtime, onMethodName, offMethodName) {
  return runOnListenerContract(runtime, {
    createApiName: CREATE_API_NAME,
    createOptions: 'udp4',
    onMethodName,
    offMethodName
  });
}

function runUdpOffListener(runtime, onMethodName, offMethodName) {
  return runOffListenerContract(runtime, {
    createApiName: CREATE_API_NAME,
    createOptions: 'udp4',
    onMethodName,
    offMethodName
  });
}

function runUdpEchoFlow(runtime, options = {}) {
  const {
    methodName = 'send',
    requireConnect = false,
    timeoutMs = 9000,
    payloadText = `migo-udp-${methodName}-echo`
  } = options;

  return new Promise((resolve) => {
    const target = resolveUdpTarget(runtime);
    if (!target) {
      resolve({
        _error: `UDPSocket.${methodName} not supported: udp target not configured in runtime.env or tests config endpoints`
      });
      return;
    }

    const created = createRuntimeInstance(runtime, CREATE_API_NAME, 'udp4');
    if (created.errorResult) {
      resolve(created.errorResult);
      return;
    }

    const socket = created.instance;
    if (!isObject(socket)) {
      destroyInstanceSafely(socket);
      resolve({ _error: 'createUDPSocket 返回值无效' });
      return;
    }
    if (typeof socket.bind !== 'function') {
      destroyInstanceSafely(socket);
      resolve({ _error: 'UDPSocket.bind 不存在（UDP 通信用例依赖）' });
      return;
    }
    if (typeof socket[methodName] !== 'function') {
      destroyInstanceSafely(socket);
      resolve({ _error: `UDPSocket.${methodName} 不存在` });
      return;
    }
    if (typeof socket.onMessage !== 'function') {
      destroyInstanceSafely(socket);
      resolve({ _error: 'UDPSocket.onMessage 不存在（UDP 通信用例依赖）' });
      return;
    }
    if (typeof socket.onError !== 'function') {
      destroyInstanceSafely(socket);
      resolve({ _error: 'UDPSocket.onError 不存在（UDP 通信用例依赖）' });
      return;
    }

    const state = { socket, listeners: [] };

    const result = {
      apiExists: true,
      targetResolved: true,
      targetSource: target.source,
      addressValid: isString(target.address) && target.address.length > 0,
      portValid: isFiniteNumber(target.port) && target.port >= 1 && target.port <= 65535,
      bindInvoked: false,
      bindPortValid: false,
      connectInvoked: false,
      connectInvocationThrew: false,
      connectReturnThenable: false,
      methodInvoked: false,
      methodInvocationThrew: false,
      methodReturnThenable: false,
      messagePayloadTextValid: isString(payloadText) && payloadText.length > 0,
      messageEventReceived: false,
      messagePayloadValid: false,
      messageEchoMatched: false,
      errorEventReceived: false,
      errorPayloadValidOrMissing: true,
      timeout: false,
      outcomeSingle: true,
      workSucceeded: false,
      raw: null,
      error: null
    };

    const expectedBytes = toByteArray(payloadText);

    let settled = false;
    let timer = null;

    const finish = () => {
      if (settled) {
        return;
      }

      settled = true;
      if (timer) {
        clearTimeout(timer);
      }

      result.outcomeSingle = !(result.messageEventReceived && result.errorEventReceived);
      result.workSucceeded = result.bindInvoked
        && result.bindPortValid
        && result.methodInvoked
        && !result.methodInvocationThrew
        && result.messageEventReceived
        && result.messagePayloadValid
        && result.messageEchoMatched
        && !result.errorEventReceived
        && !result.timeout
        && (!requireConnect || (result.connectInvoked && !result.connectInvocationThrew));

      cleanupSocketState(state);
      resolve(result);
    };

    const onMessage = (res) => {
      result.messageEventReceived = true;
      result.messagePayloadValid = validateMessagePayload(res);
      result.raw = normalizeRaw(res);

      const receivedBytes = toByteArray(res?.message);
      result.messageEchoMatched = bytesEqual(receivedBytes, expectedBytes);
      finish();
    };

    const onError = (err) => {
      result.errorEventReceived = true;
      result.errorPayloadValidOrMissing = validateErrorPayload(err);
      result.raw = normalizeRaw(err);
      finish();
    };

    try {
      socket.onMessage(onMessage);
      state.listeners.push({ offMethodName: 'offMessage', listener: onMessage });
      socket.onError(onError);
      state.listeners.push({ offMethodName: 'offError', listener: onError });
    } catch (e) {
      result.error = formatError(e);
      finish();
      return;
    }

    timer = setTimeout(() => {
      result.timeout = true;
      finish();
    }, timeoutMs);

    try {
      result.bindInvoked = true;
      const boundPort = socket.bind();
      result.bindPortValid = isFiniteNumber(boundPort) && boundPort >= 1 && boundPort <= 65535;
      result.raw = normalizeRaw(boundPort);
    } catch (e) {
      result.error = formatError(e);
      finish();
      return;
    }

    if (requireConnect) {
      result.connectInvoked = true;
      try {
        const connectReturned = socket.connect({
          address: target.address,
          port: target.port
        });
        result.connectReturnThenable = isThenable(connectReturned);
        result.raw = normalizeRaw(connectReturned);
      } catch (e) {
        result.connectInvocationThrew = true;
        result.error = formatError(e);
        finish();
        return;
      }
    }

    result.methodInvoked = true;
    try {
      const args = {
        address: target.address,
        port: target.port,
        message: payloadText
      };
      console.log(`[UDP] Invoking ${methodName} with:`, args);
      const returned = socket[methodName](args);
      console.log(`[UDP] ${methodName} returned:`, returned);
      result.methodReturnThenable = isThenable(returned);
      result.raw = normalizeRaw(returned);
    } catch (e) {
      console.error(`[UDP] ${methodName} threw:`, e);
      result.methodInvocationThrew = true;
      result.error = formatError(e);
      finish();
    }
  });
}

function runUdpNegativeFlow(runtime, options = {}) {
  const {
    methodName,
    invalidArgs,
    timeoutMs = 3000,
    requireBind = true
  } = options;

  return new Promise((resolve) => {
    const created = createRuntimeInstance(runtime, CREATE_API_NAME, 'udp4');
    if (created.errorResult) {
      resolve(created.errorResult);
      return;
    }

    const socket = created.instance;
    if (!isObject(socket) || typeof socket[methodName] !== 'function') {
      destroyInstanceSafely(socket);
      resolve({ _error: `UDPSocket.${methodName} 不存在` });
      return;
    }

    const state = { socket, listeners: [] };

    const result = {
      apiExists: true,
      methodExists: true,
      methodInvoked: false,
      methodInvocationThrew: false,
      methodReturnThenable: false,
      errorEventReceived: false,
      errorPayloadValidOrMissing: true,
      timeout: false,
      negativeOutcomeObserved: false,
      outcomeSingle: true,
      raw: null,
      error: null
    };

    let settled = false;
    let timer = null;

    const finish = () => {
      if (settled) {
        return;
      }
      settled = true;
      if (timer) {
        clearTimeout(timer);
      }

      result.negativeOutcomeObserved = result.methodInvocationThrew || result.errorEventReceived;
      result.outcomeSingle = true;

      cleanupSocketState(state);
      resolve(result);
    };

    if (typeof socket.onError === 'function') {
      const onError = (err) => {
        result.errorEventReceived = true;
        result.errorPayloadValidOrMissing = validateErrorPayload(err);
        result.raw = normalizeRaw(err);
        finish();
      };

      try {
        socket.onError(onError);
        state.listeners.push({ offMethodName: 'offError', listener: onError });
      } catch (e) {
        result.error = formatError(e);
      }
    }

    timer = setTimeout(() => {
      result.timeout = true;
      finish();
    }, timeoutMs);

    try {
      if (requireBind && typeof socket.bind === 'function') {
        socket.bind();
      }
    } catch (e) {
      result.error = formatError(e);
      finish();
      return;
    }

    result.methodInvoked = true;
    try {
      const returned = socket[methodName](invalidArgs);
      result.methodReturnThenable = isThenable(returned);
      result.raw = normalizeRaw(returned);
    } catch (e) {
      result.methodInvocationThrew = true;
      result.error = formatError(e);
      finish();
    }
  });
}

function runUdpClosePositiveFlow(runtime) {
  return new Promise((resolve) => {
    const created = createRuntimeInstance(runtime, CREATE_API_NAME, 'udp4');
    if (created.errorResult) {
      resolve(created.errorResult);
      return;
    }

    const socket = created.instance;
    if (!isObject(socket)) {
      destroyInstanceSafely(socket);
      resolve({ _error: 'createUDPSocket 返回值无效' });
      return;
    }
    if (typeof socket.bind !== 'function' || typeof socket.close !== 'function') {
      destroyInstanceSafely(socket);
      resolve({ _error: 'UDPSocket.bind/close 不存在' });
      return;
    }
    if (typeof socket.onClose !== 'function') {
      destroyInstanceSafely(socket);
      resolve({ _error: 'UDPSocket.onClose 不存在（close 正向验证依赖）' });
      return;
    }

    const state = { socket, listeners: [] };

    const result = {
      apiExists: true,
      bindInvoked: false,
      bindPortValid: false,
      closeInvoked: false,
      closeInvocationThrew: false,
      closeReturnThenable: false,
      closeEventReceived: false,
      closePayloadValidOrMissing: true,
      errorEventReceived: false,
      errorPayloadValidOrMissing: true,
      timeout: false,
      outcomeSingle: true,
      workSucceeded: false,
      raw: null,
      error: null
    };

    let settled = false;
    let timer = null;

    const finish = () => {
      if (settled) {
        return;
      }
      settled = true;
      if (timer) {
        clearTimeout(timer);
      }

      result.outcomeSingle = !(result.closeEventReceived && result.errorEventReceived);
      result.workSucceeded = result.bindInvoked
        && result.bindPortValid
        && result.closeInvoked
        && !result.closeInvocationThrew
        && result.closeEventReceived
        && !result.errorEventReceived
        && !result.timeout;

      cleanupSocketState(state);
      resolve(result);
    };

    const onClose = (res) => {
      result.closeEventReceived = true;
      result.closePayloadValidOrMissing = typeof res === 'undefined' || isObject(res);
      result.raw = normalizeRaw(res);
      finish();
    };

    try {
      socket.onClose(onClose);
      state.listeners.push({ offMethodName: 'offClose', listener: onClose });

      if (typeof socket.onError === 'function') {
        const onError = (err) => {
          result.errorEventReceived = true;
          result.errorPayloadValidOrMissing = validateErrorPayload(err);
          result.raw = normalizeRaw(err);
          finish();
        };

        socket.onError(onError);
        state.listeners.push({ offMethodName: 'offError', listener: onError });
      }
    } catch (e) {
      result.error = formatError(e);
      finish();
      return;
    }

    timer = setTimeout(() => {
      result.timeout = true;
      finish();
    }, 4000);

    try {
      result.bindInvoked = true;
      const boundPort = socket.bind();
      result.bindPortValid = isFiniteNumber(boundPort) && boundPort >= 1 && boundPort <= 65535;
      result.raw = normalizeRaw(boundPort);
    } catch (e) {
      result.error = formatError(e);
      finish();
      return;
    }

    result.closeInvoked = true;
    try {
      const returned = socket.close();
      result.closeReturnThenable = isThenable(returned);
      result.raw = normalizeRaw(returned);
    } catch (e) {
      result.closeInvocationThrew = true;
      result.error = formatError(e);
      finish();
    }
  });
}

function runUdpListeningTriggerFlow(runtime) {
  return new Promise((resolve) => {
    const created = createRuntimeInstance(runtime, CREATE_API_NAME, 'udp4');
    if (created.errorResult) {
      resolve(created.errorResult);
      return;
    }

    const socket = created.instance;
    if (!isObject(socket)) {
      destroyInstanceSafely(socket);
      resolve({ _error: 'createUDPSocket 返回值无效' });
      return;
    }
    if (typeof socket.bind !== 'function' || typeof socket.onListening !== 'function') {
      destroyInstanceSafely(socket);
      resolve({ _error: 'UDPSocket.bind/onListening 不存在' });
      return;
    }

    const state = { socket, listeners: [] };
    const result = {
      triggered: false,
      bindInvoked: false,
      bindPortValid: false,
      payloadValidOrMissing: true,
      timeout: false,
      raw: null,
      error: null
    };

    let settled = false;
    let timer = null;

    const finish = () => {
      if (settled) {
        return;
      }
      settled = true;
      if (timer) {
        clearTimeout(timer);
      }
      cleanupSocketState(state);
      resolve(result);
    };

    const onListening = (res) => {
      result.triggered = true;
      result.payloadValidOrMissing = typeof res === 'undefined' || isObject(res);
      result.raw = normalizeRaw(res);
      finish();
    };

    try {
      socket.onListening(onListening);
      state.listeners.push({ offMethodName: 'offListening', listener: onListening });
    } catch (e) {
      result.error = formatError(e);
      finish();
      return;
    }

    timer = setTimeout(() => {
      result.timeout = true;
      finish();
    }, 4000);

    try {
      result.bindInvoked = true;
      const boundPort = socket.bind();
      result.bindPortValid = isFiniteNumber(boundPort) && boundPort >= 1 && boundPort <= 65535;
      result.raw = normalizeRaw(boundPort);
    } catch (e) {
      result.error = formatError(e);
      finish();
    }
  });
}

function runUdpErrorTriggerFlow(runtime) {
  return new Promise((resolve) => {
    const created = createRuntimeInstance(runtime, CREATE_API_NAME, 'udp4');
    if (created.errorResult) {
      resolve(created.errorResult);
      return;
    }

    const socket = created.instance;
    if (!isObject(socket)) {
      destroyInstanceSafely(socket);
      resolve({ _error: 'createUDPSocket 返回值无效' });
      return;
    }
    if (typeof socket.bind !== 'function' || typeof socket.close !== 'function' || typeof socket.send !== 'function') {
      destroyInstanceSafely(socket);
      resolve({ _error: 'UDPSocket.bind/close/send 不存在' });
      return;
    }
    if (typeof socket.onError !== 'function') {
      destroyInstanceSafely(socket);
      resolve({ _error: 'UDPSocket.onError 不存在' });
      return;
    }

    const state = { socket, listeners: [] };
    const result = {
      triggered: false,
      sendAfterCloseInvoked: false,
      sendAfterCloseThrew: false,
      payloadValid: true,
      timeout: false,
      raw: null,
      error: null
    };

    let settled = false;
    let timer = null;

    const finish = () => {
      if (settled) {
        return;
      }
      settled = true;
      if (timer) {
        clearTimeout(timer);
      }
      cleanupSocketState(state);
      resolve(result);
    };

    const onError = (err) => {
      result.triggered = true;
      result.payloadValid = validateErrorPayload(err);
      result.raw = normalizeRaw(err);
      finish();
    };

    try {
      socket.onError(onError);
      state.listeners.push({ offMethodName: 'offError', listener: onError });
    } catch (e) {
      result.error = formatError(e);
      finish();
      return;
    }

    timer = setTimeout(() => {
      result.timeout = true;
      finish();
    }, 4000);

    try {
      socket.bind();
      socket.close();
    } catch (e) {
      result.error = formatError(e);
      finish();
      return;
    }

    result.sendAfterCloseInvoked = true;
    try {
      const returned = socket.send({
        address: '127.0.0.1',
        port: UDP_DEFAULT_PORT,
        message: 'migo-udp-error-trigger'
      });
      result.raw = normalizeRaw(returned);
    } catch (e) {
      result.sendAfterCloseThrew = true;
      result.triggered = true;
      result.payloadValid = true;
      result.error = formatError(e);
      result.raw = normalizeRaw(result.error);
      finish();
    }
  });
}

export default [
  {
    name: 'migo.createUDPSocket',
    category: 'network/udp',
    tests: [
      {
        id: 'migo.createUDPSocket',
        name: '创建 UDPSocket 实例',
        description: '验证 createUDPSocket 返回对象实例、非 Promise 且方法集合完整，并输出 raw',
        type: 'sync',
        run: (runtime) => runCreateInstanceContract(runtime, {
          createApiName: CREATE_API_NAME,
          createOptions: undefined,
          requiredMethods: UDP_REQUIRED_METHODS
        }),
        expect: {
          apiExists: true,
          createThrew: false,
          returnThenable: false,
          instanceObjectValid: true,
          requiredMethodsValid: true,
          raw: '@exists'
        },
        allowVariance: ['error']
      },
      {
        id: 'udp-createUDPSocket-scenario-matrix',
        name: 'create 参数矩阵（default/udp4/udp6）',
        description: '验证 createUDPSocket 默认参数与关键 type 枚举参数覆盖，并输出矩阵 raw',
        type: 'sync',
        run: (runtime) => runCreateSocketScenarioMatrix(runtime),
        expect: {
          scenarioCount: 3,
          scenarioCountValid: true,
          defaultCaseSucceeded: true,
          udp4CaseSucceeded: true,
          udp6CaseCovered: true,
          typeArgsValid: true,
          raw: '@array',
          scenarios: '@array'
        }
      }
    ]
  },

  {
    name: 'UDPSocket.bind',
    category: 'network/udp',
    tests: [
      {
        id: 'UDPSocket.bind',
        name: '绑定端口（默认分配）',
        description: '验证 bind 默认参数可返回可用端口号并输出 raw 返回值',
        type: 'sync',
        run: (runtime) => runBindContract(runtime, undefined, 'default-bind'),
        expect: {
          methodExists: true,
          invocationThrew: false,
          invocationSucceeded: true,
          returnThenable: false,
          bindArgValid: true,
          bindPortValid: true,
          raw: '@exists'
        },
        allowVariance: ['caseId', 'error']
      },
      {
        id: 'udp-bind-with-port-arg',
        name: '绑定端口（显式参数）',
        description: '验证 bind(0) 参数路径可调用并返回有效端口号',
        type: 'sync',
        run: (runtime) => runBindContract(runtime, 0, 'bind-port-0'),
        expect: {
          methodExists: true,
          invocationThrew: false,
          invocationSucceeded: true,
          returnThenable: false,
          bindArgValid: true,
          bindPortValid: true,
          raw: '@exists'
        },
        allowVariance: ['caseId', 'error']
      }
    ]
  },

  {
    name: 'UDPSocket.setTTL',
    category: 'network/udp',
    tests: [
      {
        id: 'UDPSocket.setTTL',
        name: 'TTL 边界值设置',
        description: '验证 setTTL 在 0/64/255 边界值下均可调用，返回值非 Promise，并输出 raw',
        type: 'sync',
        run: (runtime) => runSetTtlBoundaryMatrix(runtime),
        expect: {
          apiExists: true,
          methodExists: true,
          bindSucceeded: true,
          caseCount: 3,
          allInvoked: true,
          allSucceeded: true,
          allReturnNonPromise: true,
          raw: '@array',
          cases: '@array'
        }
      }
    ]
  },

  {
    name: 'UDPSocket.connect',
    category: 'network/udp',
    tests: [
      {
        id: 'UDPSocket.connect',
        name: '连接目标地址与端口',
        description: '验证 connect 参数结构可调用、返回值非 Promise，并记录 raw',
        type: 'sync',
        run: (runtime) => runConnectMethodReturnContract(runtime),
        expect: {
          methodExists: true,
          returnThenable: false,
          targetAddressValid: true,
          targetPortValid: true,
          invocationHandled: true,
          raw: '@exists'
        },
        allowVariance: ['invocationThrew', 'invocationSucceeded', 'targetSource', 'error', 'afterInvokeError']
      },
      {
        id: 'udp-connect-invalid-options-negative',
        name: '反向异常验证（无效参数）',
        description: '使用无效 address/port 调用 connect，验证异常路径可观测（抛错或 onError）并输出 raw',
        type: 'async',
        timeout: 5000,
        run: (runtime) => runUdpNegativeFlow(runtime, {
          methodName: 'connect',
          invalidArgs: {
            address: '256.256.256.256',
            port: 70000
          },
          timeoutMs: 3000,
          requireBind: true
        }),
        expect: {
          apiExists: true,
          methodExists: true,
          methodInvoked: true,
          negativeOutcomeObserved: true,
          outcomeSingle: true,
          errorPayloadValidOrMissing: true,
          raw: '@exists'
        },
        allowVariance: ['methodInvocationThrew', 'methodReturnThenable', 'errorEventReceived', 'timeout', 'error']
      }
    ]
  },

  {
    name: 'UDPSocket.send',
    category: 'network/udp',
    tests: [
      {
        id: 'UDPSocket.send',
        name: '正向功能验证（发送并回包）',
        description: '使用 udp 测试服务验证 send 可发送数据并触发 onMessage，校验 payload 结构与回包一致性',
        type: 'async',
        timeout: 12000,
        unsupportedPolicy: 'skip',
        run: (runtime) => runUdpEchoFlow(runtime, {
          methodName: 'send',
          timeoutMs: 9000
        }),
        expect: {
          apiExists: true,
          targetResolved: true,
          addressValid: true,
          portValid: true,
          bindInvoked: true,
          bindPortValid: true,
          methodInvoked: true,
          methodInvocationThrew: false,
          messagePayloadTextValid: true,
          messageEventReceived: true,
          messagePayloadValid: true,
          messageEchoMatched: true,
          errorEventReceived: false,
          errorPayloadValidOrMissing: true,
          timeout: false,
          outcomeSingle: true,
          workSucceeded: true,
          raw: '@exists'
        },
        allowVariance: ['targetSource', 'methodReturnThenable', 'error', 'connectInvoked', 'connectInvocationThrew', 'connectReturnThenable']
      },
      {
        id: 'udp-send-invalid-options-negative',
        name: '反向异常验证（无效参数）',
        description: '使用无效 send 参数验证错误路径（抛错或 onError）并输出 raw',
        type: 'async',
        timeout: 5000,
        run: (runtime) => runUdpNegativeFlow(runtime, {
          methodName: 'send',
          invalidArgs: {
            address: '256.256.256.256',
            port: 70000,
            message: 'invalid-send'
          },
          timeoutMs: 3000,
          requireBind: true
        }),
        expect: {
          apiExists: true,
          methodExists: true,
          methodInvoked: true,
          negativeOutcomeObserved: true,
          outcomeSingle: true,
          errorPayloadValidOrMissing: true,
          raw: '@exists'
        },
        allowVariance: ['methodInvocationThrew', 'methodReturnThenable', 'errorEventReceived', 'timeout', 'error']
      },
      {
        id: 'udp-send-method-return-contract',
        name: '方法返回契约',
        description: '验证 send 参数类型契约与返回值非 Promise，并记录 raw',
        type: 'sync',
        run: (runtime) => runSendMethodReturnContract(runtime),
        expect: {
          methodExists: true,
          returnThenable: false,
          targetAddressValid: true,
          targetPortValid: true,
          messageArgValid: true,
          invocationHandled: true,
          raw: '@exists'
        },
        allowVariance: ['invocationThrew', 'invocationSucceeded', 'targetSource', 'error', 'afterInvokeError']
      }
    ]
  },

  {
    name: 'UDPSocket.write',
    category: 'network/udp',
    tests: [
      {
        id: 'UDPSocket.write',
        name: '正向功能验证（connect + write）',
        description: '先 connect 再 write 发送数据，验证 onMessage 回包触发与 payload 一致性，并输出 raw',
        type: 'async',
        timeout: 12000,
        unsupportedPolicy: 'skip',
        run: (runtime) => runUdpEchoFlow(runtime, {
          methodName: 'write',
          requireConnect: true,
          timeoutMs: 9000
        }),
        expect: {
          apiExists: true,
          targetResolved: true,
          addressValid: true,
          portValid: true,
          bindInvoked: true,
          bindPortValid: true,
          connectInvoked: true,
          connectInvocationThrew: false,
          methodInvoked: true,
          methodInvocationThrew: false,
          messagePayloadTextValid: true,
          messageEventReceived: true,
          messagePayloadValid: true,
          messageEchoMatched: true,
          errorEventReceived: false,
          errorPayloadValidOrMissing: true,
          timeout: false,
          outcomeSingle: true,
          workSucceeded: true,
          raw: '@exists'
        },
        allowVariance: ['targetSource', 'connectReturnThenable', 'methodReturnThenable', 'error']
      },
      {
        id: 'udp-write-invalid-options-negative',
        name: '反向异常验证（无效参数）',
        description: '使用无效 write 参数验证错误路径（抛错或 onError）并输出 raw',
        type: 'async',
        timeout: 5000,
        run: (runtime) => runUdpNegativeFlow(runtime, {
          methodName: 'write',
          invalidArgs: {
            address: 'invalid-host',
            port: 70000,
            message: 'invalid-write'
          },
          timeoutMs: 3000,
          requireBind: true
        }),
        expect: {
          apiExists: true,
          methodExists: true,
          methodInvoked: true,
          negativeOutcomeObserved: true,
          outcomeSingle: true,
          errorPayloadValidOrMissing: true,
          raw: '@exists'
        },
        allowVariance: ['methodInvocationThrew', 'methodReturnThenable', 'errorEventReceived', 'timeout', 'error']
      },
      {
        id: 'udp-write-method-return-contract',
        name: '方法返回契约',
        description: '验证 write 支持 ArrayBuffer message 与返回值非 Promise，并记录 raw',
        type: 'sync',
        run: (runtime) => runWriteMethodReturnContract(runtime),
        expect: {
          methodExists: true,
          returnThenable: false,
          targetAddressValid: true,
          targetPortValid: true,
          messageArgValid: true,
          invocationHandled: true,
          raw: '@exists'
        },
        allowVariance: ['invocationThrew', 'invocationSucceeded', 'targetSource', 'error', 'afterInvokeError']
      }
    ]
  },

  {
    name: 'UDPSocket.close',
    category: 'network/udp',
    tests: [
      {
        id: 'UDPSocket.close',
        name: '正向功能验证（关闭触发 onClose）',
        description: '绑定端口后调用 close，验证 onClose 回调触发与异常路径互斥，并输出 raw',
        type: 'async',
        timeout: 6000,
        run: (runtime) => runUdpClosePositiveFlow(runtime),
        expect: {
          apiExists: true,
          bindInvoked: true,
          bindPortValid: true,
          closeInvoked: true,
          closeInvocationThrew: false,
          closeEventReceived: true,
          closePayloadValidOrMissing: true,
          errorEventReceived: false,
          errorPayloadValidOrMissing: true,
          timeout: false,
          outcomeSingle: true,
          workSucceeded: true,
          raw: '@exists'
        },
        allowVariance: ['closeReturnThenable', 'error']
      },
      {
        id: 'udp-close-method-return-contract',
        name: '方法返回契约',
        description: '验证 close 返回值非 Promise，并记录 raw',
        type: 'sync',
        run: (runtime) => runCloseMethodReturnContract(runtime),
        expect: {
          methodExists: true,
          returnThenable: false,
          invocationHandled: true,
          raw: '@exists'
        },
        allowVariance: ['invocationThrew', 'invocationSucceeded', 'error', 'afterInvokeError']
      }
    ]
  },

  {
    name: 'UDPSocket.onListening',
    category: 'network/udp',
    tests: [
      {
        id: 'UDPSocket.onListening',
        name: 'onListening 注册契约',
        description: '验证 onListening 可注册监听、可配套 offListening 解除并输出 raw',
        type: 'sync',
        run: (runtime) => runUdpOnListener(runtime, 'onListening', 'offListening'),
        expect: {
          methodExists: true,
          registerThrew: false,
          registerSucceeded: true,
          registerReturnThenable: false,
          unregisterWorkedOrUnsupported: true,
          unregisterReturnThenable: false,
          raw: '@exists'
        },
        allowVariance: ['error']
      },
      {
        id: 'udp-onListening-trigger',
        name: 'onListening 真实触发',
        description: '调用 bind 后验证 onListening 事件触发并输出 raw payload',
        type: 'event',
        timeout: 6000,
        run: (runtime, callback) => {
          runUdpListeningTriggerFlow(runtime).then((result) => {
            callback(result);
          });
        },
        expect: {
          eventReceived: true,
          triggered: true,
          bindInvoked: true,
          bindPortValid: true,
          payloadValidOrMissing: true,
          timeout: false,
          raw: '@exists'
        },
        allowVariance: ['error']
      }
    ]
  },

  {
    name: 'UDPSocket.offListening',
    category: 'network/udp',
    tests: [
      {
        id: 'UDPSocket.offListening',
        name: 'offListening 取消监听契约',
        description: '验证 offListening 支持传 listener 与不传 listener 两种反注册方式',
        type: 'sync',
        run: (runtime) => runUdpOffListener(runtime, 'onListening', 'offListening'),
        expect: {
          offWithListenerThrew: false,
          offWithoutListenerThrew: false,
          registerSucceededOrOffSupported: true,
          offWithListenerReturnThenable: false,
          offWithoutListenerReturnThenable: false,
          raw: '@exists'
        },
        allowVariance: ['registerThrew', 'error']
      }
    ]
  },

  {
    name: 'UDPSocket.onMessage',
    category: 'network/udp',
    tests: [
      {
        id: 'UDPSocket.onMessage',
        name: 'onMessage 注册契约',
        description: '验证 onMessage 可注册监听、可配套 offMessage 解除并输出 raw',
        type: 'sync',
        run: (runtime) => runUdpOnListener(runtime, 'onMessage', 'offMessage'),
        expect: {
          methodExists: true,
          registerThrew: false,
          registerSucceeded: true,
          registerReturnThenable: false,
          unregisterWorkedOrUnsupported: true,
          unregisterReturnThenable: false,
          raw: '@exists'
        },
        allowVariance: ['error']
      },
      {
        id: 'udp-onMessage-trigger',
        name: 'onMessage 真实触发',
        description: '使用 udp 测试服务触发 onMessage，验证 payload 结构和消息一致性',
        type: 'event',
        timeout: 12000,
        unsupportedPolicy: 'skip',
        run: (runtime, callback) => {
          runUdpEchoFlow(runtime, {
            methodName: 'send',
            timeoutMs: 9000,
            payloadText: 'migo-udp-onMessage-trigger'
          }).then((result) => {
            callback({
              ...result,
              triggered: result.messageEventReceived,
              payloadValid: result.messagePayloadValid
            });
          });
        },
        expect: {
          eventReceived: true,
          triggered: true,
          payloadValid: true,
          messageEchoMatched: true,
          errorEventReceived: false,
          timeout: false,
          raw: '@exists'
        },
        allowVariance: ['targetSource', 'methodReturnThenable', 'error', 'connectInvoked', 'connectInvocationThrew', 'connectReturnThenable', 'workSucceeded']
      }
    ]
  },

  {
    name: 'UDPSocket.offMessage',
    category: 'network/udp',
    tests: [
      {
        id: 'UDPSocket.offMessage',
        name: 'offMessage 取消监听契约',
        description: '验证 offMessage 支持传 listener 与不传 listener 两种反注册方式',
        type: 'sync',
        run: (runtime) => runUdpOffListener(runtime, 'onMessage', 'offMessage'),
        expect: {
          offWithListenerThrew: false,
          offWithoutListenerThrew: false,
          registerSucceededOrOffSupported: true,
          offWithListenerReturnThenable: false,
          offWithoutListenerReturnThenable: false,
          raw: '@exists'
        },
        allowVariance: ['registerThrew', 'error']
      }
    ]
  },

  {
    name: 'UDPSocket.onError',
    category: 'network/udp',
    tests: [
      {
        id: 'UDPSocket.onError',
        name: 'onError 注册契约',
        description: '验证 onError 可注册监听、可配套 offError 解除并输出 raw',
        type: 'sync',
        run: (runtime) => runUdpOnListener(runtime, 'onError', 'offError'),
        expect: {
          methodExists: true,
          registerThrew: false,
          registerSucceeded: true,
          registerReturnThenable: false,
          unregisterWorkedOrUnsupported: true,
          unregisterReturnThenable: false,
          raw: '@exists'
        },
        allowVariance: ['error']
      },
      {
        id: 'udp-onError-trigger',
        name: 'onError 真实触发',
        description: '先 close 再 send，验证 onError 被触发（或同步抛错）并记录 raw',
        type: 'event',
        timeout: 6000,
        run: (runtime, callback) => {
          runUdpErrorTriggerFlow(runtime).then((result) => {
            callback({
              ...result,
              errorObserved: result.triggered
            });
          });
        },
        expect: {
          eventReceived: true,
          triggered: true,
          errorObserved: true,
          sendAfterCloseInvoked: true,
          payloadValid: true,
          timeout: false,
          raw: '@exists'
        },
        allowVariance: ['sendAfterCloseThrew', 'error']
      }
    ]
  },

  {
    name: 'UDPSocket.offError',
    category: 'network/udp',
    tests: [
      {
        id: 'UDPSocket.offError',
        name: 'offError 取消监听契约',
        description: '验证 offError 支持传 listener 与不传 listener 两种反注册方式',
        type: 'sync',
        run: (runtime) => runUdpOffListener(runtime, 'onError', 'offError'),
        expect: {
          offWithListenerThrew: false,
          offWithoutListenerThrew: false,
          registerSucceededOrOffSupported: true,
          offWithListenerReturnThenable: false,
          offWithoutListenerReturnThenable: false,
          raw: '@exists'
        },
        allowVariance: ['registerThrew', 'error']
      }
    ]
  },

  {
    name: 'UDPSocket.onClose',
    category: 'network/udp',
    tests: [
      {
        id: 'UDPSocket.onClose',
        name: 'onClose 注册契约',
        description: '验证 onClose 可注册监听、可配套 offClose 解除并输出 raw',
        type: 'sync',
        run: (runtime) => runUdpOnListener(runtime, 'onClose', 'offClose'),
        expect: {
          methodExists: true,
          registerThrew: false,
          registerSucceeded: true,
          registerReturnThenable: false,
          unregisterWorkedOrUnsupported: true,
          unregisterReturnThenable: false,
          raw: '@exists'
        },
        allowVariance: ['error']
      },
      {
        id: 'udp-onClose-trigger',
        name: 'onClose 真实触发',
        description: '调用 close 后验证 onClose 事件触发并输出 raw payload',
        type: 'event',
        timeout: 6000,
        run: (runtime, callback) => {
          runUdpClosePositiveFlow(runtime).then((result) => {
            callback({
              ...result,
              triggered: result.closeEventReceived
            });
          });
        },
        expect: {
          eventReceived: true,
          triggered: true,
          closeInvoked: true,
          closeInvocationThrew: false,
          closeEventReceived: true,
          closePayloadValidOrMissing: true,
          timeout: false,
          raw: '@exists'
        },
        allowVariance: ['closeReturnThenable', 'error', 'workSucceeded']
      }
    ]
  },

  {
    name: 'UDPSocket.offClose',
    category: 'network/udp',
    tests: [
      {
        id: 'UDPSocket.offClose',
        name: 'offClose 取消监听契约',
        description: '验证 offClose 支持传 listener 与不传 listener 两种反注册方式',
        type: 'sync',
        run: (runtime) => runUdpOffListener(runtime, 'onClose', 'offClose'),
        expect: {
          offWithListenerThrew: false,
          offWithoutListenerThrew: false,
          registerSucceededOrOffSupported: true,
          offWithListenerReturnThenable: false,
          offWithoutListenerReturnThenable: false,
          raw: '@exists'
        },
        allowVariance: ['registerThrew', 'error']
      }
    ]
  }
];
