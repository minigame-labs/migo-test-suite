const BASE_PROFILE = {
  name: 'full',
  description: '全量测试配置',
  includeAutomation: ['ci', 'device_lab', 'manual'],
  includeSeverity: ['P0', 'P1', 'P2'],
  includeTypes: ['sync', 'async', 'render', 'audio', 'event', 'navigate'],
  includeManual: true,
  runManualTests: true,
  defaultTimeoutMs: 10000,
  defaultRetries: 0,
  maxRetries: 1
};

const PROFILES = {
  smoke: {
    ...BASE_PROFILE,
    name: 'smoke',
    description: 'CI 快速门禁，只覆盖高优先级自动化用例',
    includeAutomation: ['ci'],
    includeSeverity: ['P0'],
    includeTypes: ['sync', 'async', 'render'],
    includeManual: false,
    runManualTests: false,
    defaultTimeoutMs: 8000,
    defaultRetries: 1,
    maxRetries: 1
  },
  regression: {
    ...BASE_PROFILE,
    name: 'regression',
    description: '回归测试，覆盖自动化和设备实验室可执行用例',
    includeAutomation: ['ci', 'device_lab'],
    includeManual: false,
    runManualTests: false,
    defaultTimeoutMs: 10000,
    defaultRetries: 1,
    maxRetries: 2
  },
  device_lab: {
    ...BASE_PROFILE,
    name: 'device_lab',
    description: '设备实验室回归，覆盖可自动触发和传感器/输入相关用例',
    includeAutomation: ['ci', 'device_lab'],
    includeManual: false,
    runManualTests: false,
    defaultTimeoutMs: 10000,
    defaultRetries: 1,
    maxRetries: 2
  },
  manual: {
    ...BASE_PROFILE,
    name: 'manual',
    description: '人工验收，包含所有需要观察/交互的用例',
    includeAutomation: ['ci', 'device_lab', 'manual'],
    includeManual: true,
    runManualTests: true,
    defaultTimeoutMs: 12000,
    defaultRetries: 0,
    maxRetries: 1
  },
  full: { ...BASE_PROFILE }
};

export function getTestProfile(name) {
  if (!name || typeof name !== 'string') {
    return { ...PROFILES.smoke };
  }
  return { ...(PROFILES[name] || PROFILES.smoke) };
}

export function listProfiles() {
  return Object.keys(PROFILES);
}

export const testProfiles = PROFILES;
