const DEFAULT_ENDPOINTS = {
  report: 'http://10.246.1.239:8765',
  http: 'http://10.246.1.239:8766',
  tcp: 'tcp://10.246.1.239:8768',
  ws: 'ws://10.246.1.239:8767',
  udp: 'udp://10.246.1.239:8769'
};

const DEFAULT_CONFIG = {
  version: '1.1.0',
  remoteLog: true,
  profile: 'smoke',
  runManualTests: false,
  defaultTimeoutMs: 8000,
  defaultRetries: 1,
  maxRetries: 1,
  endpoints: DEFAULT_ENDPOINTS
};

function normalizeConfig(raw) {
  if (!raw || typeof raw !== 'object') {
    return {};
  }

  const cfg = { ...raw };
  const endpoints = {
    ...DEFAULT_ENDPOINTS,
    ...(raw.endpoints && typeof raw.endpoints === 'object' ? raw.endpoints : {})
  };

  if (typeof raw.serverUrl === 'string' && raw.serverUrl) {
    endpoints.report = raw.serverUrl;
  }
  if (typeof raw.requestEndpoint === 'string' && raw.requestEndpoint) {
    endpoints.http = raw.requestEndpoint;
  }
  if (typeof raw.wsEndpoint === 'string' && raw.wsEndpoint) {
    endpoints.ws = raw.wsEndpoint;
  }
  if (typeof raw.tcpEndpoint === 'string' && raw.tcpEndpoint) {
    endpoints.tcp = raw.tcpEndpoint;
  }
  if (typeof raw.udpEndpoint === 'string' && raw.udpEndpoint) {
    endpoints.udp = raw.udpEndpoint;
  }

  cfg.endpoints = endpoints;
  return cfg;
}

export function getRuntimeConfig(runtime = null) {
  const injected = normalizeConfig(globalThis.__MIGO_TEST_CONFIG__);
  let extConfig = {};

  if (runtime && typeof runtime.getExtConfigSync === 'function') {
    try {
      const ext = runtime.getExtConfigSync();
      const candidate = ext && (ext.migoTestConfig || ext.testConfig || ext);
      extConfig = normalizeConfig(candidate);
    } catch (e) {
      extConfig = {};
    }
  }

  const merged = {
    ...DEFAULT_CONFIG,
    ...extConfig,
    ...injected,
    endpoints: {
      ...DEFAULT_ENDPOINTS,
      ...(extConfig.endpoints || {}),
      ...(injected.endpoints || {})
    }
  };

  return merged;
}

export function applyGlobalEndpoints(config) {
  const endpoints = {
    ...DEFAULT_ENDPOINTS,
    ...((config && config.endpoints) || {})
  };

  globalThis.__MIGO_TEST_ENDPOINTS__ = endpoints;
  return endpoints;
}

export function getEndpoint(name) {
  const endpoints = globalThis.__MIGO_TEST_ENDPOINTS__ || DEFAULT_ENDPOINTS;
  return endpoints[name] || DEFAULT_ENDPOINTS[name];
}

export function getDefaultConfig() {
  return { ...DEFAULT_CONFIG, endpoints: { ...DEFAULT_ENDPOINTS } };
}
