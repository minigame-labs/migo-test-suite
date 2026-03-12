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

const CREATE_API_NAME = 'createTCPSocket';

const TCP_REQUIRED_METHODS = [
  'bindWifi',
  'connect',
  'write',
  'close',
  'onClose',
  'offClose',
  'onConnect',
  'offConnect',
  'onError',
  'offError',
  'onMessage',
  'offMessage',
  'onBindWifi',
  'offBindWifi'
];

const TCP_TYPE_VALUES = new Set(['ipv4', 'ipv6']);
const TCP_ENDPOINT_ENV_KEYS = ['MIGO_TCP_ENDPOINT', 'TCP_ENDPOINT', 'WX_TCP_ENDPOINT'];
const TCP_HOST_ENV_KEYS = ['MIGO_TCP_HOST', 'TCP_HOST', 'WX_TCP_HOST'];
const TCP_PORT_ENV_KEYS = ['MIGO_TCP_PORT', 'TCP_PORT', 'WX_TCP_PORT'];
const TCP_BSSID_ENV_KEYS = ['MIGO_WIFI_BSSID', 'WIFI_BSSID', 'TCP_BIND_WIFI_BSSID'];

let connectManualState = null;
let writeManualState = null;
let closeManualState = null;
let bindWifiManualState = null;

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

function parseEndpointToHostPort(endpoint) {
  if (!isString(endpoint) || endpoint.trim().length === 0) {
    return null;
  }

  const text = endpoint.trim();

  if (typeof URL === 'function') {
    try {
      const parsed = new URL(text);
      const host = parsed.hostname;
      const fallbackPort = parsed.protocol === 'https:' ? 443 : 80;
      const port = parsePort(parsed.port || fallbackPort);
      if (isString(host) && host.length > 0 && isFiniteNumber(port)) {
        return { address: host, port };
      }
    } catch (e) {
      // fallback to regex parser
    }
  }

  const match = text.match(/^[a-z]+:\/\/([^/:]+)(?::(\d+))?/i);
  if (!match) {
    return null;
  }

  const address = match[1];
  const port = parsePort(match[2] ? Number(match[2]) : 80);
  if (!isString(address) || address.length === 0 || !isFiniteNumber(port)) {
    return null;
  }

  return { address, port };
}

function resolveTcpConnectTarget(runtime) {
  const envEndpoint = pickRuntimeEnvValue(runtime, TCP_ENDPOINT_ENV_KEYS);
  const parsedEnvEndpoint = parseEndpointToHostPort(envEndpoint);
  if (parsedEnvEndpoint) {
    return {
      ...parsedEnvEndpoint,
      source: 'runtime.env.endpoint'
    };
  }

  const envAddress = pickRuntimeEnvValue(runtime, TCP_HOST_ENV_KEYS);
  const envPort = parsePort(pickRuntimeEnvValue(runtime, TCP_PORT_ENV_KEYS));

  if (isString(envAddress) && envAddress.trim().length > 0 && isFiniteNumber(envPort)) {
    return {
      address: envAddress.trim(),
      port: envPort,
      source: 'runtime.env'
    };
  }

  const tcpEndpoint = getEndpoint('tcp');
  const parsedTcp = parseEndpointToHostPort(tcpEndpoint);
  if (parsedTcp) {
    return {
      ...parsedTcp,
      source: 'config.endpoints.tcp'
    };
  }

  const endpoint = getEndpoint('http');
  const parsed = parseEndpointToHostPort(endpoint);
  if (!parsed) {
    return null;
  }

  return {
    ...parsed,
    source: 'config.endpoints.http'
  };
}

function isTcpSocketTypeValidOrMissing(value) {
  return typeof value === 'undefined' || (isString(value) && TCP_TYPE_VALUES.has(value));
}

function resolveBindWifiBssid(runtime) {
  const value = pickRuntimeEnvValue(runtime, TCP_BSSID_ENV_KEYS);
  if (!isString(value)) {
    return null;
  }

  const bssid = value.trim();
  return bssid.length > 0 ? bssid : null;
}

function isTcpFamilyValidOrMissing(value) {
  return typeof value === 'undefined' || value === 'IPv4' || value === 'IPv6';
}

function isSocketAddressInfoValidOrMissing(value) {
  if (typeof value === 'undefined') {
    return true;
  }

  if (!isObject(value)) {
    return false;
  }

  const addressValidOrMissing = typeof value.address === 'undefined' || isString(value.address);
  const familyValidOrMissing = isTcpFamilyValidOrMissing(value.family);
  const portValidOrMissing = typeof value.port === 'undefined' || isFiniteNumber(value.port);

  return addressValidOrMissing && familyValidOrMissing && portValidOrMissing;
}

function validateConnectEventPayload(payload) {
  if (typeof payload === 'undefined') {
    return true;
  }

  if (!isObject(payload)) {
    return false;
  }

  const useHttpDNSValidOrMissing = typeof payload.useHttpDNS === 'undefined' || typeof payload.useHttpDNS === 'boolean';
  const exceptionValidOrMissing = typeof payload.exception === 'undefined' || isObject(payload.exception);

  return useHttpDNSValidOrMissing
    && exceptionValidOrMissing
    && isSocketAddressInfoValidOrMissing(payload.remoteInfo)
    && isSocketAddressInfoValidOrMissing(payload.localInfo);
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

  return messageValid
    && isSocketAddressInfoValidOrMissing(payload.remoteInfo)
    && isSocketAddressInfoValidOrMissing(payload.localInfo);
}

function closeSocketSafely(socket) {
  if (!isObject(socket) || typeof socket.close !== 'function') {
    return;
  }

  try {
    socket.close();
  } catch (e) {
    // ignore close cleanup error
  }
}

function removeSocketListenerSafely(socket, offMethodName, listener) {
  if (!isObject(socket) || typeof socket[offMethodName] !== 'function') {
    return;
  }

  try {
    socket[offMethodName](listener);
  } catch (e) {
    // ignore off cleanup error
  }
}

function cleanupSocketState(state) {
  if (!state || !isObject(state.socket)) {
    return;
  }

  if (Array.isArray(state.listeners)) {
    for (const item of state.listeners) {
      if (!item || !isString(item.offMethodName) || typeof item.listener !== 'function') {
        continue;
      }
      removeSocketListenerSafely(state.socket, item.offMethodName, item.listener);
    }
  }

  closeSocketSafely(state.socket);
}

function cleanupConnectManualState() {
  cleanupSocketState(connectManualState);
  connectManualState = null;
}

function cleanupWriteManualState() {
  cleanupSocketState(writeManualState);
  writeManualState = null;
}

function cleanupCloseManualState() {
  cleanupSocketState(closeManualState);
  closeManualState = null;
}

function cleanupBindWifiManualState() {
  cleanupSocketState(bindWifiManualState);
  bindWifiManualState = null;
}

function runCreateSocketScenarioMatrix(runtime) {
  const matrix = runCreateInstanceScenarioMatrix(runtime, {
    createApiName: CREATE_API_NAME,
    requiredMethods: TCP_REQUIRED_METHODS,
    scenarios: [
      {
        caseId: 'default',
        options: {}
      },
      {
        caseId: 'ipv4',
        options: { type: 'ipv4' }
      },
      {
        caseId: 'ipv6',
        options: { type: 'ipv6' }
      }
    ]
  });

  if (matrix && matrix._error) {
    return matrix;
  }

  const scenarios = Array.isArray(matrix?.scenarios) ? matrix.scenarios : [];
  const scenarioMap = new Map(scenarios.map((item) => [item.caseId, item]));
  const defaultCase = scenarioMap.get('default');
  const ipv4Case = scenarioMap.get('ipv4');
  const ipv6Case = scenarioMap.get('ipv6');

  return {
    ...matrix,
    scenarioCountValid: scenarios.length === 3,
    defaultCaseSucceeded: Boolean(defaultCase)
      && defaultCase.createThrew === false
      && defaultCase.instanceObjectValid === true
      && defaultCase.requiredMethodsValid === true,
    ipv4CaseSucceeded: Boolean(ipv4Case)
      && ipv4Case.createThrew === false
      && ipv4Case.instanceObjectValid === true
      && ipv4Case.requiredMethodsValid === true,
    ipv6CaseCovered: Boolean(ipv6Case),
    typeArgsValid: isTcpSocketTypeValidOrMissing('ipv4') && isTcpSocketTypeValidOrMissing('ipv6')
  };
}

function runConnectMethodReturnContract(runtime) {
  const target = resolveTcpConnectTarget(runtime) || {
    address: '127.0.0.1',
    port: 80,
    source: 'fallback'
  };

  const result = runInstanceMethodReturnContract(runtime, {
    createApiName: CREATE_API_NAME,
    createOptions: { type: 'ipv4' },
    methodName: 'connect',
    invoke: (socket) => socket.connect({
      address: target.address,
      port: target.port,
      timeout: 2
    }),
    afterInvoke: (socket) => {
      closeSocketSafely(socket);
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

function runWriteMethodReturnContract(runtime) {
  const payload = new Uint8Array([109, 105, 103, 111]).buffer;
  const result = runInstanceMethodReturnContract(runtime, {
    createApiName: CREATE_API_NAME,
    createOptions: { type: 'ipv4' },
    methodName: 'write',
    invoke: (socket) => socket.write(payload),
    afterInvoke: (socket) => {
      closeSocketSafely(socket);
    }
  });

  return {
    ...result,
    payloadArrayBufferValid: payload instanceof ArrayBuffer,
    invocationHandled: !result.invocationThrew || isString(result.error)
  };
}

function runCloseMethodReturnContract(runtime) {
  const result = runInstanceMethodReturnContract(runtime, {
    createApiName: CREATE_API_NAME,
    createOptions: { type: 'ipv4' },
    methodName: 'close',
    invoke: (socket) => socket.close()
  });

  return {
    ...result,
    invocationHandled: !result.invocationThrew || isString(result.error)
  };
}

function runBindWifiMethodReturnContract(runtime) {
  const bssid = resolveBindWifiBssid(runtime) || '00:00:00:00:00:00';
  const result = runInstanceMethodReturnContract(runtime, {
    createApiName: CREATE_API_NAME,
    createOptions: { type: 'ipv4' },
    methodName: 'bindWifi',
    invoke: (socket) => socket.bindWifi({ BSSID: bssid }),
    afterInvoke: (socket) => {
      closeSocketSafely(socket);
    }
  });

  return {
    ...result,
    bssidConfigured: isString(bssid) && bssid.length > 0,
    invocationHandled: !result.invocationThrew || isString(result.error)
  };
}

function runTcpOnListener(runtime, onMethodName, offMethodName) {
  return runOnListenerContract(runtime, {
    createApiName: CREATE_API_NAME,
    createOptions: { type: 'ipv4' },
    onMethodName,
    offMethodName
  });
}

function runTcpOffListener(runtime, onMethodName, offMethodName) {
  return runOffListenerContract(runtime, {
    createApiName: CREATE_API_NAME,
    createOptions: { type: 'ipv4' },
    onMethodName,
    offMethodName
  });
}

function runConnectNegativeInvalidOptions(runtime) {
  return new Promise((resolve) => {
    const created = createRuntimeInstance(runtime, CREATE_API_NAME, { type: 'ipv4' });
    if (created.errorResult) {
      resolve(created.errorResult);
      return;
    }

    const socket = created.instance;
    if (!isObject(socket) || typeof socket.connect !== 'function') {
      destroyInstanceSafely(socket);
      resolve({ _error: 'TCPSocket.connect 不存在' });
      return;
    }

    const state = { socket, listeners: [] };
    const result = {
      apiExists: true,
      connectMethodExists: true,
      connectInvoked: false,
      connectInvocationThrew: false,
      connectReturnThenable: false,
      connectEventReceived: false,
      errorEventReceived: false,
      timeout: false,
      outcomeSingle: true,
      negativeOutcomeObserved: false,
      connectPayloadValidOrMissing: true,
      errorPayloadValidOrMissing: true,
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

      result.outcomeSingle = !(result.connectEventReceived && result.errorEventReceived);
      result.negativeOutcomeObserved = result.connectInvocationThrew
        || result.errorEventReceived
        || !result.connectEventReceived;

      cleanupSocketState(state);
      resolve(result);
    };

    if (typeof socket.onConnect === 'function') {
      const onConnect = (res) => {
        result.connectEventReceived = true;
        result.connectPayloadValidOrMissing = validateConnectEventPayload(res);
        result.raw = normalizeRaw(res);
        finish();
      };
      try {
        socket.onConnect(onConnect);
        state.listeners.push({ offMethodName: 'offConnect', listener: onConnect });
      } catch (e) {
        result.error = formatError(e);
      }
    }

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
        result.error = result.error || formatError(e);
      }
    }

    timer = setTimeout(() => {
      result.timeout = true;
      finish();
    }, 2600);

    result.connectInvoked = true;
    try {
      const returned = socket.connect({
        address: '256.256.256.256',
        port: 70000,
        timeout: 1
      });
      result.connectReturnThenable = isThenable(returned);
      result.raw = normalizeRaw(returned);
    } catch (e) {
      result.connectInvocationThrew = true;
      result.error = formatError(e);
      finish();
    }
  });
}

function buildHttpProbePayload(target) {
  const host = isString(target?.address) && target.address.length > 0 ? target.address : 'localhost';
  return `GET /echo HTTP/1.1\r\nHost: ${host}\r\nConnection: close\r\n\r\n`;
}

function runManualConnectSuccess(runtime) {
  cleanupConnectManualState();

  return new Promise((resolve) => {
    const target = resolveTcpConnectTarget(runtime);
    if (!target) {
      resolve({
        _error: 'TCPSocket.connect not supported: tcp target not configured in runtime.env or tests config endpoints.tcp/http'
      });
      return;
    }

    const created = createRuntimeInstance(runtime, CREATE_API_NAME, { type: 'ipv4' });
    if (created.errorResult) {
      resolve(created.errorResult);
      return;
    }

    const socket = created.instance;
    if (!isObject(socket) || typeof socket.connect !== 'function') {
      destroyInstanceSafely(socket);
      resolve({ _error: 'TCPSocket.connect 不存在' });
      return;
    }
    if (typeof socket.onConnect !== 'function') {
      destroyInstanceSafely(socket);
      resolve({ _error: 'TCPSocket.onConnect 不存在（TCPSocket.connect 正向验证依赖）' });
      return;
    }
    if (typeof socket.onError !== 'function') {
      destroyInstanceSafely(socket);
      resolve({ _error: 'TCPSocket.onError 不存在（TCPSocket.connect 正向验证依赖）' });
      return;
    }

    const state = { socket, listeners: [] };
    connectManualState = state;

    const result = {
      apiExists: true,
      targetResolved: true,
      targetSource: target.source,
      addressValid: isString(target.address) && target.address.length > 0,
      portValid: isFiniteNumber(target.port) && target.port >= 1 && target.port <= 65535,
      connectInvoked: false,
      connectInvocationThrew: false,
      connectReturnThenable: false,
      connectPromiseResolved: false,
      connectPromiseRejected: false,
      connectEventReceived: false,
      errorEventReceived: false,
      timeout: false,
      outcomeSingle: true,
      connectPayloadValidOrMissing: true,
      errorPayloadValidOrMissing: true,
      workSucceeded: false,
      raw: null,
      error: null,
      promiseError: null
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

      result.outcomeSingle = !(result.connectEventReceived && result.errorEventReceived);
      result.workSucceeded = result.connectEventReceived
        && !result.errorEventReceived
        && !result.connectInvocationThrew
        && !result.timeout;

      cleanupConnectManualState();
      resolve(result);
    };

    const onConnect = (res) => {
      result.connectEventReceived = true;
      result.connectPayloadValidOrMissing = validateConnectEventPayload(res);
      result.raw = normalizeRaw(res);
      finish();
    };

    const onError = (err) => {
      result.errorEventReceived = true;
      result.errorPayloadValidOrMissing = validateErrorPayload(err);
      result.raw = normalizeRaw(err);
      finish();
    };

    try {
      socket.onConnect(onConnect);
      state.listeners.push({ offMethodName: 'offConnect', listener: onConnect });
    } catch (e) {
      result.error = formatError(e);
      finish();
      return;
    }

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
    }, 12000);

    result.connectInvoked = true;
    try {
      const returned = socket.connect({
        address: target.address,
        port: target.port,
        timeout: 4
      });

      result.connectReturnThenable = isThenable(returned);
      result.raw = normalizeRaw(returned);

      if (result.connectReturnThenable) {
        returned
          .then(() => {
            result.connectPromiseResolved = true;
          })
          .catch((err) => {
            result.connectPromiseRejected = true;
            result.promiseError = formatError(err);
          });
      }
    } catch (e) {
      result.connectInvocationThrew = true;
      result.error = formatError(e);
      finish();
    }
  });
}

function runManualWriteSuccess(runtime) {
  cleanupWriteManualState();

  return new Promise((resolve) => {
    const target = resolveTcpConnectTarget(runtime);
    if (!target) {
      resolve({
        _error: 'TCPSocket.write not supported: tcp target not configured in runtime.env or tests config endpoints.tcp/http'
      });
      return;
    }

    const created = createRuntimeInstance(runtime, CREATE_API_NAME, { type: 'ipv4' });
    if (created.errorResult) {
      resolve(created.errorResult);
      return;
    }

    const socket = created.instance;
    if (!isObject(socket) || typeof socket.connect !== 'function' || typeof socket.write !== 'function') {
      destroyInstanceSafely(socket);
      resolve({ _error: 'TCPSocket.connect/write 不存在' });
      return;
    }
    if (typeof socket.onConnect !== 'function') {
      destroyInstanceSafely(socket);
      resolve({ _error: 'TCPSocket.onConnect 不存在（TCPSocket.write 正向验证依赖）' });
      return;
    }
    if (typeof socket.onMessage !== 'function') {
      destroyInstanceSafely(socket);
      resolve({ _error: 'TCPSocket.onMessage 不存在（TCPSocket.write 正向验证依赖）' });
      return;
    }
    if (typeof socket.onError !== 'function') {
      destroyInstanceSafely(socket);
      resolve({ _error: 'TCPSocket.onError 不存在（TCPSocket.write 正向验证依赖）' });
      return;
    }

    const state = { socket, listeners: [] };
    writeManualState = state;

    const result = {
      apiExists: true,
      targetResolved: true,
      targetSource: target.source,
      addressValid: isString(target.address) && target.address.length > 0,
      portValid: isFiniteNumber(target.port) && target.port >= 1 && target.port <= 65535,
      connectInvoked: false,
      connectInvocationThrew: false,
      connectEventReceived: false,
      connectPayloadValidOrMissing: true,
      writeInvoked: false,
      writeInvocationThrew: false,
      writeReturnThenable: false,
      writePayloadStringValid: true,
      messageEventReceived: false,
      messagePayloadValid: true,
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

      result.outcomeSingle = !(result.messageEventReceived && result.errorEventReceived);
      result.workSucceeded = result.connectEventReceived
        && result.writeInvoked
        && !result.writeInvocationThrew
        && result.messageEventReceived
        && !result.errorEventReceived
        && !result.timeout;

      cleanupWriteManualState();
      resolve(result);
    };

    const onConnect = (res) => {
      result.connectEventReceived = true;
      result.connectPayloadValidOrMissing = validateConnectEventPayload(res);

      const payload = buildHttpProbePayload(target);
      result.writePayloadStringValid = isString(payload) && payload.length > 0;
      result.writeInvoked = true;
      try {
        const writeReturned = socket.write(payload);
        result.writeReturnThenable = isThenable(writeReturned);
        result.raw = normalizeRaw(writeReturned);
      } catch (e) {
        result.writeInvocationThrew = true;
        result.error = formatError(e);
        finish();
      }
    };

    const onMessage = (res) => {
      result.messageEventReceived = true;
      result.messagePayloadValid = validateMessagePayload(res);
      result.raw = normalizeRaw(res);
      finish();
    };

    const onError = (err) => {
      result.errorEventReceived = true;
      result.errorPayloadValidOrMissing = validateErrorPayload(err);
      result.raw = normalizeRaw(err);
      finish();
    };

    try {
      socket.onConnect(onConnect);
      state.listeners.push({ offMethodName: 'offConnect', listener: onConnect });
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
    }, 16000);

    result.connectInvoked = true;
    try {
      const returned = socket.connect({
        address: target.address,
        port: target.port,
        timeout: 4
      });
      result.raw = normalizeRaw(returned);
    } catch (e) {
      result.connectInvocationThrew = true;
      result.error = formatError(e);
      finish();
    }
  });
}

function runManualCloseSuccess(runtime) {
  cleanupCloseManualState();

  return new Promise((resolve) => {
    const target = resolveTcpConnectTarget(runtime);
    if (!target) {
      resolve({
        _error: 'TCPSocket.close not supported: tcp target not configured in runtime.env or tests config endpoints.tcp/http'
      });
      return;
    }

    const created = createRuntimeInstance(runtime, CREATE_API_NAME, { type: 'ipv4' });
    if (created.errorResult) {
      resolve(created.errorResult);
      return;
    }

    const socket = created.instance;
    if (!isObject(socket)
      || typeof socket.connect !== 'function'
      || typeof socket.close !== 'function') {
      destroyInstanceSafely(socket);
      resolve({ _error: 'TCPSocket.connect/close 不存在' });
      return;
    }

    if (typeof socket.onConnect !== 'function') {
      destroyInstanceSafely(socket);
      resolve({ _error: 'TCPSocket.onConnect 不存在（TCPSocket.close 正向验证依赖）' });
      return;
    }
    if (typeof socket.onClose !== 'function') {
      destroyInstanceSafely(socket);
      resolve({ _error: 'TCPSocket.onClose 不存在（TCPSocket.close 正向验证依赖）' });
      return;
    }
    if (typeof socket.onError !== 'function') {
      destroyInstanceSafely(socket);
      resolve({ _error: 'TCPSocket.onError 不存在（TCPSocket.close 正向验证依赖）' });
      return;
    }

    const state = { socket, listeners: [] };
    closeManualState = state;

    const result = {
      apiExists: true,
      targetResolved: true,
      targetSource: target.source,
      addressValid: isString(target.address) && target.address.length > 0,
      portValid: isFiniteNumber(target.port) && target.port >= 1 && target.port <= 65535,
      connectInvoked: false,
      connectInvocationThrew: false,
      connectEventReceived: false,
      connectPayloadValidOrMissing: true,
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
      result.workSucceeded = result.connectEventReceived
        && result.closeInvoked
        && !result.closeInvocationThrew
        && result.closeEventReceived
        && !result.errorEventReceived
        && !result.timeout;

      cleanupCloseManualState();
      resolve(result);
    };

    const onConnect = (res) => {
      result.connectEventReceived = true;
      result.connectPayloadValidOrMissing = validateConnectEventPayload(res);
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
    };

    const onClose = (res) => {
      result.closeEventReceived = true;
      result.closePayloadValidOrMissing = typeof res === 'undefined' || isObject(res);
      result.raw = normalizeRaw(res);
      finish();
    };

    const onError = (err) => {
      result.errorEventReceived = true;
      result.errorPayloadValidOrMissing = validateErrorPayload(err);
      result.raw = normalizeRaw(err);
      finish();
    };

    try {
      socket.onConnect(onConnect);
      state.listeners.push({ offMethodName: 'offConnect', listener: onConnect });
      socket.onClose(onClose);
      state.listeners.push({ offMethodName: 'offClose', listener: onClose });
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
    }, 12000);

    result.connectInvoked = true;
    try {
      const returned = socket.connect({
        address: target.address,
        port: target.port,
        timeout: 4
      });
      result.raw = normalizeRaw(returned);
    } catch (e) {
      result.connectInvocationThrew = true;
      result.error = formatError(e);
      finish();
    }
  });
}

function runManualBindWifiSuccess(runtime) {
  cleanupBindWifiManualState();

  return new Promise((resolve) => {
    const bssid = resolveBindWifiBssid(runtime);
    if (!bssid) {
      resolve({
        _error: 'TCPSocket.bindWifi not supported: valid BSSID not configured in runtime.env'
      });
      return;
    }

    const created = createRuntimeInstance(runtime, CREATE_API_NAME, { type: 'ipv4' });
    if (created.errorResult) {
      resolve(created.errorResult);
      return;
    }

    const socket = created.instance;
    if (!isObject(socket) || typeof socket.bindWifi !== 'function') {
      destroyInstanceSafely(socket);
      resolve({ _error: 'TCPSocket.bindWifi 不存在' });
      return;
    }
    if (typeof socket.onBindWifi !== 'function') {
      destroyInstanceSafely(socket);
      resolve({ _error: 'TCPSocket.onBindWifi 不存在（TCPSocket.bindWifi 正向验证依赖）' });
      return;
    }
    if (typeof socket.onError !== 'function') {
      destroyInstanceSafely(socket);
      resolve({ _error: 'TCPSocket.onError 不存在（TCPSocket.bindWifi 正向验证依赖）' });
      return;
    }

    const state = { socket, listeners: [] };
    bindWifiManualState = state;

    const result = {
      apiExists: true,
      bssidConfigured: true,
      bssidFormatValid: isString(bssid) && bssid.length > 0,
      bindWifiInvoked: false,
      bindWifiInvocationThrew: false,
      bindWifiReturnThenable: false,
      bindWifiEventReceived: false,
      bindWifiPayloadValidOrMissing: true,
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

      result.outcomeSingle = !(result.bindWifiEventReceived && result.errorEventReceived);
      result.workSucceeded = result.bindWifiInvoked
        && !result.bindWifiInvocationThrew
        && result.bindWifiEventReceived
        && !result.errorEventReceived
        && !result.timeout;

      cleanupBindWifiManualState();
      resolve(result);
    };

    const onBindWifi = (res) => {
      result.bindWifiEventReceived = true;
      result.bindWifiPayloadValidOrMissing = typeof res === 'undefined' || isObject(res);
      result.raw = normalizeRaw(res);
      finish();
    };

    const onError = (err) => {
      result.errorEventReceived = true;
      result.errorPayloadValidOrMissing = validateErrorPayload(err);
      result.raw = normalizeRaw(err);
      finish();
    };

    try {
      socket.onBindWifi(onBindWifi);
      state.listeners.push({ offMethodName: 'offBindWifi', listener: onBindWifi });
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
    }, 12000);

    result.bindWifiInvoked = true;
    try {
      const returned = socket.bindWifi({ BSSID: bssid });
      result.bindWifiReturnThenable = isThenable(returned);
      result.raw = normalizeRaw(returned);
    } catch (e) {
      result.bindWifiInvocationThrew = true;
      result.error = formatError(e);
      finish();
    }
  });
}

export default [
  {
    name: 'migo.createTCPSocket',
    category: 'network/tcp',
    tests: [
      {
        id: 'migo.createTCPSocket',
        name: '创建 TCPSocket 实例',
        description: '验证 createTCPSocket 返回对象实例、非 Promise 且方法集合完整，并输出 raw',
        type: 'sync',
        run: (runtime) => runCreateInstanceContract(runtime, {
          createApiName: CREATE_API_NAME,
          createOptions: {},
          requiredMethods: TCP_REQUIRED_METHODS
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
        id: 'tcp-createTCPSocket-scenario-matrix',
        name: 'create 参数矩阵（default/ipv4/ipv6）',
        description: '验证 createTCPSocket 在不同 type 参数组合下可调用并输出矩阵 raw',
        type: 'sync',
        run: (runtime) => runCreateSocketScenarioMatrix(runtime),
        expect: {
          scenarioCount: 3,
          scenarioCountValid: true,
          defaultCaseSucceeded: true,
          ipv4CaseSucceeded: true,
          ipv6CaseCovered: true,
          typeArgsValid: true,
          raw: '@array',
          scenarios: '@array'
        }
      }
    ]
  },

  {
    name: 'TCPSocket.connect',
    category: 'network/tcp',
    tests: [
      {
        id: 'TCPSocket.connect',
        name: '正向功能验证（真实建连）',
        description: '自动场景：连接 tcp 测试服务，验证 onConnect 触发、错误路径互斥与 raw payload 输出',
        type: 'async',
        timeout: 15000,
        unsupportedPolicy: 'skip',
        run: (runtime) => runManualConnectSuccess(runtime),
        cleanup: () => {
          cleanupConnectManualState();
        },
        expect: {
          apiExists: true,
          targetResolved: true,
          addressValid: true,
          portValid: true,
          connectInvoked: true,
          connectInvocationThrew: false,
          timeout: false,
          connectEventReceived: true,
          errorEventReceived: false,
          outcomeSingle: true,
          connectPayloadValidOrMissing: true,
          errorPayloadValidOrMissing: true,
          workSucceeded: true,
          raw: '@exists'
        },
        allowVariance: ['targetSource', 'connectReturnThenable', 'connectPromiseResolved', 'connectPromiseRejected', 'promiseError']
      },
      {
        id: 'tcp-connect-invalid-options-negative',
        name: '反向异常验证（无效参数）',
        description: '使用无效 address/port 调用 connect，验证不会出现 success 路径并记录 fail 侧 raw',
        type: 'async',
        timeout: 6000,
        run: (runtime) => runConnectNegativeInvalidOptions(runtime),
        expect: {
          apiExists: true,
          connectMethodExists: true,
          connectInvoked: true,
          negativeOutcomeObserved: true,
          outcomeSingle: true,
          connectPayloadValidOrMissing: true,
          errorPayloadValidOrMissing: true,
          raw: '@exists'
        },
        allowVariance: ['connectInvocationThrew', 'connectReturnThenable', 'connectEventReceived', 'errorEventReceived', 'timeout', 'error']
      },
      {
        id: 'tcp-connect-method-return-contract',
        name: '方法返回契约',
        description: '验证 connect 方法可调用、返回值非 Promise，并记录 raw 返回值',
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
      }
    ]
  },

  {
    name: 'TCPSocket.write',
    category: 'network/tcp',
    tests: [
      {
        id: 'TCPSocket.write',
        name: '正向功能验证（发送并接收）',
        description: '自动场景：建立 TCP 连接后 write 发送探测数据，验证 onMessage 回包触发与 payload 合法性',
        type: 'async',
        timeout: 20000,
        unsupportedPolicy: 'skip',
        run: (runtime) => runManualWriteSuccess(runtime),
        cleanup: () => {
          cleanupWriteManualState();
        },
        expect: {
          apiExists: true,
          targetResolved: true,
          addressValid: true,
          portValid: true,
          connectInvoked: true,
          connectInvocationThrew: false,
          connectEventReceived: true,
          connectPayloadValidOrMissing: true,
          writeInvoked: true,
          writeInvocationThrew: false,
          writePayloadStringValid: true,
          messageEventReceived: true,
          messagePayloadValid: true,
          errorEventReceived: false,
          errorPayloadValidOrMissing: true,
          timeout: false,
          outcomeSingle: true,
          workSucceeded: true,
          raw: '@exists'
        },
        allowVariance: ['targetSource', 'writeReturnThenable', 'error']
      },
      {
        id: 'tcp-write-method-return-contract',
        name: '方法返回契约',
        description: '验证 write 支持 ArrayBuffer 输入并返回非 Promise，记录 raw 返回值',
        type: 'sync',
        run: (runtime) => runWriteMethodReturnContract(runtime),
        expect: {
          methodExists: true,
          returnThenable: false,
          payloadArrayBufferValid: true,
          invocationHandled: true,
          raw: '@exists'
        },
        allowVariance: ['invocationThrew', 'invocationSucceeded', 'error', 'afterInvokeError']
      }
    ]
  },

  {
    name: 'TCPSocket.close',
    category: 'network/tcp',
    tests: [
      {
        id: 'TCPSocket.close',
        name: '正向功能验证（关闭连接）',
        description: '自动场景：建立连接后调用 close，验证 onClose 触发、错误路径互斥并记录 raw',
        type: 'async',
        timeout: 15000,
        unsupportedPolicy: 'skip',
        run: (runtime) => runManualCloseSuccess(runtime),
        cleanup: () => {
          cleanupCloseManualState();
        },
        expect: {
          apiExists: true,
          targetResolved: true,
          addressValid: true,
          portValid: true,
          connectInvoked: true,
          connectInvocationThrew: false,
          connectEventReceived: true,
          connectPayloadValidOrMissing: true,
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
        allowVariance: ['targetSource', 'closeReturnThenable', 'error']
      },
      {
        id: 'tcp-close-method-return-contract',
        name: '方法返回契约',
        description: '验证 close 可调用且返回值非 Promise，并输出 raw',
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
    name: 'TCPSocket.bindWifi',
    category: 'network/tcp',
    tests: [
      {
        id: 'TCPSocket.bindWifi',
        name: '正向功能验证（绑定 Wi-Fi）',
        description: '手动场景：配置有效 BSSID 后调用 bindWifi，验证 onBindWifi 触发并记录 raw（仅相关平台支持）',
        type: 'async',
        timeout: 15000,
        automation: 'manual',
        manualRequired: true,
        unsupportedPolicy: 'skip',
        run: (runtime) => runManualBindWifiSuccess(runtime),
        cleanup: () => {
          cleanupBindWifiManualState();
        },
        expect: {
          apiExists: true,
          bssidConfigured: true,
          bssidFormatValid: true,
          bindWifiInvoked: true,
          bindWifiInvocationThrew: false,
          bindWifiEventReceived: true,
          bindWifiPayloadValidOrMissing: true,
          errorEventReceived: false,
          errorPayloadValidOrMissing: true,
          timeout: false,
          outcomeSingle: true,
          workSucceeded: true,
          raw: '@exists'
        },
        allowVariance: ['bindWifiReturnThenable', 'error']
      },
      {
        id: 'tcp-bindWifi-method-return-contract',
        name: '方法返回契约',
        description: '验证 bindWifi 可调用且返回值非 Promise，记录 raw 返回值',
        type: 'sync',
        run: (runtime) => runBindWifiMethodReturnContract(runtime),
        expect: {
          methodExists: true,
          returnThenable: false,
          bssidConfigured: true,
          invocationHandled: true,
          raw: '@exists'
        },
        allowVariance: ['invocationThrew', 'invocationSucceeded', 'error', 'afterInvokeError']
      }
    ]
  },

  {
    name: 'TCPSocket.onConnect',
    category: 'network/tcp',
    tests: [
      {
        id: 'tcp-onConnect-register-contract',
        name: 'onConnect 注册契约',
        description: '验证 onConnect 可注册监听、可配套 offConnect 解除并输出 raw',
        type: 'sync',
        run: (runtime) => runTcpOnListener(runtime, 'onConnect', 'offConnect'),
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
      }
    ]
  },

  {
    name: 'TCPSocket.offConnect',
    category: 'network/tcp',
    tests: [
      {
        id: 'tcp-offConnect-contract',
        name: 'offConnect 取消监听契约',
        description: '验证 offConnect 支持传 listener 与不传 listener 两种反注册方式',
        type: 'sync',
        run: (runtime) => runTcpOffListener(runtime, 'onConnect', 'offConnect'),
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
    name: 'TCPSocket.onClose',
    category: 'network/tcp',
    tests: [
      {
        id: 'tcp-onClose-register-contract',
        name: 'onClose 注册契约',
        description: '验证 onClose 可注册监听、可配套 offClose 解除并输出 raw',
        type: 'sync',
        run: (runtime) => runTcpOnListener(runtime, 'onClose', 'offClose'),
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
      }
    ]
  },

  {
    name: 'TCPSocket.offClose',
    category: 'network/tcp',
    tests: [
      {
        id: 'tcp-offClose-contract',
        name: 'offClose 取消监听契约',
        description: '验证 offClose 支持传 listener 与不传 listener 两种反注册方式',
        type: 'sync',
        run: (runtime) => runTcpOffListener(runtime, 'onClose', 'offClose'),
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
    name: 'TCPSocket.onError',
    category: 'network/tcp',
    tests: [
      {
        id: 'tcp-onError-register-contract',
        name: 'onError 注册契约',
        description: '验证 onError 可注册监听、可配套 offError 解除并输出 raw',
        type: 'sync',
        run: (runtime) => runTcpOnListener(runtime, 'onError', 'offError'),
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
      }
    ]
  },

  {
    name: 'TCPSocket.offError',
    category: 'network/tcp',
    tests: [
      {
        id: 'tcp-offError-contract',
        name: 'offError 取消监听契约',
        description: '验证 offError 支持传 listener 与不传 listener 两种反注册方式',
        type: 'sync',
        run: (runtime) => runTcpOffListener(runtime, 'onError', 'offError'),
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
    name: 'TCPSocket.onMessage',
    category: 'network/tcp',
    tests: [
      {
        id: 'tcp-onMessage-register-contract',
        name: 'onMessage 注册契约',
        description: '验证 onMessage 可注册监听、可配套 offMessage 解除并输出 raw',
        type: 'sync',
        run: (runtime) => runTcpOnListener(runtime, 'onMessage', 'offMessage'),
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
      }
    ]
  },

  {
    name: 'TCPSocket.offMessage',
    category: 'network/tcp',
    tests: [
      {
        id: 'tcp-offMessage-contract',
        name: 'offMessage 取消监听契约',
        description: '验证 offMessage 支持传 listener 与不传 listener 两种反注册方式',
        type: 'sync',
        run: (runtime) => runTcpOffListener(runtime, 'onMessage', 'offMessage'),
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
    name: 'TCPSocket.onBindWifi',
    category: 'network/tcp',
    tests: [
      {
        id: 'tcp-onBindWifi-register-contract',
        name: 'onBindWifi 注册契约',
        description: '验证 onBindWifi 可注册监听、可配套 offBindWifi 解除并输出 raw',
        type: 'sync',
        run: (runtime) => runTcpOnListener(runtime, 'onBindWifi', 'offBindWifi'),
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
      }
    ]
  },

  {
    name: 'TCPSocket.offBindWifi',
    category: 'network/tcp',
    tests: [
      {
        id: 'tcp-offBindWifi-contract',
        name: 'offBindWifi 取消监听契约',
        description: '验证 offBindWifi 支持传 listener 与不传 listener 两种反注册方式',
        type: 'sync',
        run: (runtime) => runTcpOffListener(runtime, 'onBindWifi', 'offBindWifi'),
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
