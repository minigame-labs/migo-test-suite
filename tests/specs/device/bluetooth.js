export default [
  {
    name: 'migo.bluetooth',
    category: 'device',
    tests: [
      // --- 蓝牙通用 ---
      {
        id: 'migo.openBluetoothAdapter',
        name: '初始化蓝牙模块',
        description: '初始化蓝牙模块',
        type: 'async',
        run: (runtime) => new Promise((resolve) => {
          if (typeof runtime.openBluetoothAdapter !== 'function') {
            resolve({ _error: 'openBluetoothAdapter 不存在' });
            return;
          }
          runtime.openBluetoothAdapter({
            success: () => resolve('PASS'),
            fail: () => resolve('FAIL')
          });
        }),
        expect: 'PASS'
      },
      {
        id: 'migo.closeBluetoothAdapter',
        name: '关闭蓝牙模块',
        description: '关闭蓝牙模块',
        type: 'async',
        run: (runtime) => new Promise((resolve) => {
          if (typeof runtime.closeBluetoothAdapter !== 'function') {
            resolve({ _error: 'closeBluetoothAdapter 不存在' });
            return;
          }
          runtime.closeBluetoothAdapter({
            success: () => resolve('PASS'),
            fail: () => resolve('FAIL')
          });
        }),
        expect: 'PASS'
      },
      {
        id: 'migo.getBluetoothAdapterState',
        name: '获取本机蓝牙适配器状态',
        description: '获取本机蓝牙适配器状态',
        type: 'async',
        run: (runtime) => new Promise((resolve) => {
          if (typeof runtime.getBluetoothAdapterState !== 'function') {
            resolve({ _error: 'getBluetoothAdapterState 不存在' });
            return;
          }
          runtime.getBluetoothAdapterState({
            success: (res) => resolve(typeof res.available === 'boolean' ? 'PASS' : 'FAIL'),
            fail: () => resolve('FAIL')
          });
        }),
        expect: 'PASS'
      },
      {
        id: 'migo.onBluetoothAdapterStateChange',
        name: '监听蓝牙适配器状态变化事件',
        description: '验证接口存在性',
        type: 'sync',
        run: (runtime) => {
          if (typeof runtime.onBluetoothAdapterStateChange !== 'function') return { exists: false };
          runtime.onBluetoothAdapterStateChange(() => {});
          return { exists: true };
        },
        expect: { exists: true }
      },
      {
        id: 'migo.offBluetoothAdapterStateChange',
        name: '取消监听蓝牙适配器状态变化事件',
        description: '验证接口存在性',
        type: 'sync',
        run: (runtime) => {
          if (typeof runtime.offBluetoothAdapterStateChange !== 'function') return { exists: false };
          return { exists: true };
        },
        expect: { exists: true }
      },
      {
        id: 'migo.startBluetoothDevicesDiscovery',
        name: '开始搜寻附近的蓝牙外围设备',
        description: '开始搜寻附近的蓝牙外围设备',
        type: 'async',
        run: (runtime) => new Promise((resolve) => {
          if (typeof runtime.startBluetoothDevicesDiscovery !== 'function') {
            resolve({ _error: 'startBluetoothDevicesDiscovery 不存在' });
            return;
          }
          runtime.startBluetoothDevicesDiscovery({
            success: () => resolve('PASS'),
            fail: () => resolve('FAIL')
          });
        }),
        expect: 'PASS'
      },
      {
        id: 'migo.stopBluetoothDevicesDiscovery',
        name: '停止搜寻附近的蓝牙外围设备',
        description: '停止搜寻附近的蓝牙外围设备',
        type: 'async',
        run: (runtime) => new Promise((resolve) => {
          if (typeof runtime.stopBluetoothDevicesDiscovery !== 'function') {
            resolve({ _error: 'stopBluetoothDevicesDiscovery 不存在' });
            return;
          }
          runtime.stopBluetoothDevicesDiscovery({
            success: () => resolve('PASS'),
            fail: () => resolve('FAIL')
          });
        }),
        expect: 'PASS'
      },
      {
        id: 'migo.getBluetoothDevices',
        name: '获取在蓝牙模块生效期间所有已发现的蓝牙设备',
        description: '获取在蓝牙模块生效期间所有已发现的蓝牙设备',
        type: 'async',
        run: (runtime) => new Promise((resolve) => {
          if (typeof runtime.getBluetoothDevices !== 'function') {
            resolve({ _error: 'getBluetoothDevices 不存在' });
            return;
          }
          runtime.getBluetoothDevices({
            success: (res) => resolve(Array.isArray(res.devices) ? 'PASS' : 'FAIL'),
            fail: () => resolve('FAIL')
          });
        }),
        expect: 'PASS'
      },
      {
        id: 'migo.getConnectedBluetoothDevices',
        name: '根据 uuid 获取处于已连接状态的设备',
        description: '根据 uuid 获取处于已连接状态的设备',
        type: 'async',
        run: (runtime) => new Promise((resolve) => {
          if (typeof runtime.getConnectedBluetoothDevices !== 'function') {
            resolve({ _error: 'getConnectedBluetoothDevices 不存在' });
            return;
          }
          runtime.getConnectedBluetoothDevices({
            services: [],
            success: (res) => resolve(Array.isArray(res.devices) ? 'PASS' : 'FAIL'),
            fail: () => resolve('FAIL')
          });
        }),
        expect: 'PASS'
      },
      {
        id: 'migo.isBluetoothDevicePaired',
        name: '查询蓝牙设备是否配对',
        description: '查询蓝牙设备是否配对 (仅检查接口存在性)',
        type: 'sync',
        run: (runtime) => {
          if (typeof runtime.isBluetoothDevicePaired !== 'function') return { exists: false };
          return { exists: true };
        },
        expect: { exists: true }
      },
      {
        id: 'migo.makeBluetoothPair',
        name: '蓝牙配对',
        description: '蓝牙配对 (仅检查接口存在性)',
        type: 'sync',
        run: (runtime) => {
          if (typeof runtime.makeBluetoothPair !== 'function') return { exists: false };
          return { exists: true };
        },
        expect: { exists: true }
      },
      {
        id: 'migo.onBluetoothDeviceFound',
        name: '监听寻找到新设备的事件',
        description: '验证接口存在性',
        type: 'sync',
        run: (runtime) => {
          if (typeof runtime.onBluetoothDeviceFound !== 'function') return { exists: false };
          runtime.onBluetoothDeviceFound(() => {});
          return { exists: true };
        },
        expect: { exists: true }
      },
      {
        id: 'migo.offBluetoothDeviceFound',
        name: '取消监听寻找到新设备的事件',
        description: '验证接口存在性',
        type: 'sync',
        run: (runtime) => {
          if (typeof runtime.offBluetoothDeviceFound !== 'function') return { exists: false };
          return { exists: true };
        },
        expect: { exists: true }
      },

      // --- 信标 (Beacon) ---
      {
        id: 'migo.startBeaconDiscovery',
        name: '开始搜索 Beacon 设备',
        description: '开始搜索 Beacon 设备',
        type: 'async',
        run: (runtime) => new Promise((resolve) => {
          if (typeof runtime.startBeaconDiscovery !== 'function') {
            resolve({ _error: 'startBeaconDiscovery 不存在' });
            return;
          }
          runtime.startBeaconDiscovery({
            uuids: ['00000000-0000-0000-0000-000000000000'], // 示例 UUID
            success: () => resolve('PASS'),
            fail: () => resolve('FAIL')
          });
        }),
        expect: 'PASS'
      },
      {
        id: 'migo.stopBeaconDiscovery',
        name: '停止搜索 Beacon 设备',
        description: '停止搜索 Beacon 设备',
        type: 'async',
        run: (runtime) => new Promise((resolve) => {
          if (typeof runtime.stopBeaconDiscovery !== 'function') {
            resolve({ _error: 'stopBeaconDiscovery 不存在' });
            return;
          }
          runtime.stopBeaconDiscovery({
            success: () => resolve('PASS'),
            fail: () => resolve('FAIL')
          });
        }),
        expect: 'PASS'
      },
      {
        id: 'migo.getBeacons',
        name: '获取所有已搜索到的 iBeacon 设备',
        description: '获取所有已搜索到的 iBeacon 设备',
        type: 'async',
        run: (runtime) => new Promise((resolve) => {
          if (typeof runtime.getBeacons !== 'function') {
            resolve({ _error: 'getBeacons 不存在' });
            return;
          }
          runtime.getBeacons({
            success: (res) => resolve(Array.isArray(res.beacons) ? 'PASS' : 'FAIL'),
            fail: () => resolve('FAIL')
          });
        }),
        expect: 'PASS'
      },
      {
        id: 'migo.onBeaconUpdate',
        name: '监听 iBeacon 设备更新事件',
        description: '验证接口存在性',
        type: 'sync',
        run: (runtime) => {
          if (typeof runtime.onBeaconUpdate !== 'function') return { exists: false };
          runtime.onBeaconUpdate(() => {});
          return { exists: true };
        },
        expect: { exists: true }
      },
      {
        id: 'migo.offBeaconUpdate',
        name: '取消监听 iBeacon 设备更新事件',
        description: '验证接口存在性',
        type: 'sync',
        run: (runtime) => {
          if (typeof runtime.offBeaconUpdate !== 'function') return { exists: false };
          return { exists: true };
        },
        expect: { exists: true }
      },
      {
        id: 'migo.onBeaconServiceChange',
        name: '监听 iBeacon 服务状态变化事件',
        description: '验证接口存在性',
        type: 'sync',
        run: (runtime) => {
          if (typeof runtime.onBeaconServiceChange !== 'function') return { exists: false };
          runtime.onBeaconServiceChange(() => {});
          return { exists: true };
        },
        expect: { exists: true }
      },
      {
        id: 'migo.offBeaconServiceChange',
        name: '取消监听 iBeacon 服务状态变化事件',
        description: '验证接口存在性',
        type: 'sync',
        run: (runtime) => {
          if (typeof runtime.offBeaconServiceChange !== 'function') return { exists: false };
          return { exists: true };
        },
        expect: { exists: true }
      },

      // --- 低功耗 (BLE) 中心设备 ---
      {
        id: 'migo.createBLEConnection',
        name: '连接低功耗蓝牙设备',
        description: '连接低功耗蓝牙设备 (仅检查接口存在性，因需真实 deviceId)',
        type: 'sync',
        run: (runtime) => {
           if (typeof runtime.createBLEConnection !== 'function') return { exists: false };
           return { exists: true };
        },
        expect: { exists: true }
      },
      {
        id: 'migo.closeBLEConnection',
        name: '断开低功耗蓝牙连接',
        description: '断开低功耗蓝牙连接 (仅检查接口存在性)',
        type: 'sync',
        run: (runtime) => {
           if (typeof runtime.closeBLEConnection !== 'function') return { exists: false };
           return { exists: true };
        },
        expect: { exists: true }
      },
      {
        id: 'migo.getBLEDeviceCharacteristics',
        name: '获取蓝牙设备某个服务中所有特征值',
        description: '获取蓝牙设备某个服务中所有特征值 (仅检查接口存在性)',
        type: 'sync',
        run: (runtime) => {
           if (typeof runtime.getBLEDeviceCharacteristics !== 'function') return { exists: false };
           return { exists: true };
        },
        expect: { exists: true }
      },
      {
        id: 'migo.getBLEDeviceRSSI',
        name: '获取蓝牙设备的信号强度',
        description: '获取蓝牙设备的信号强度 (仅检查接口存在性)',
        type: 'sync',
        run: (runtime) => {
           if (typeof runtime.getBLEDeviceRSSI !== 'function') return { exists: false };
           return { exists: true };
        },
        expect: { exists: true }
      },
      {
        id: 'migo.getBLEDeviceServices',
        name: '获取蓝牙设备所有服务',
        description: '获取蓝牙设备所有服务 (仅检查接口存在性)',
        type: 'sync',
        run: (runtime) => {
           if (typeof runtime.getBLEDeviceServices !== 'function') return { exists: false };
           return { exists: true };
        },
        expect: { exists: true }
      },
      {
        id: 'migo.getBLEMTU',
        name: '获取蓝牙设备 MTU',
        description: '获取蓝牙设备 MTU (仅检查接口存在性)',
        type: 'sync',
        run: (runtime) => {
           if (typeof runtime.getBLEMTU !== 'function') return { exists: false };
           return { exists: true };
        },
        expect: { exists: true }
      },
      {
        id: 'migo.notifyBLECharacteristicValueChange',
        name: '启用特征值变化时的 notify 功能',
        description: '启用特征值变化时的 notify 功能 (仅检查接口存在性)',
        type: 'sync',
        run: (runtime) => {
           if (typeof runtime.notifyBLECharacteristicValueChange !== 'function') return { exists: false };
           return { exists: true };
        },
        expect: { exists: true }
      },
      {
        id: 'migo.readBLECharacteristicValue',
        name: '读取低功耗蓝牙设备的特征值的二进制数据',
        description: '读取低功耗蓝牙设备的特征值的二进制数据 (仅检查接口存在性)',
        type: 'sync',
        run: (runtime) => {
           if (typeof runtime.readBLECharacteristicValue !== 'function') return { exists: false };
           return { exists: true };
        },
        expect: { exists: true }
      },
      {
        id: 'migo.writeBLECharacteristicValue',
        name: '向低功耗蓝牙设备特征值中写入二进制数据',
        description: '向低功耗蓝牙设备特征值中写入二进制数据 (仅检查接口存在性)',
        type: 'sync',
        run: (runtime) => {
           if (typeof runtime.writeBLECharacteristicValue !== 'function') return { exists: false };
           return { exists: true };
        },
        expect: { exists: true }
      },
      {
        id: 'migo.setBLEMTU',
        name: '协商设置蓝牙低功耗的最大传输单元',
        description: '协商设置蓝牙低功耗的最大传输单元 (仅检查接口存在性)',
        type: 'sync',
        run: (runtime) => {
           if (typeof runtime.setBLEMTU !== 'function') return { exists: false };
           return { exists: true };
        },
        expect: { exists: true }
      },
      {
        id: 'migo.onBLECharacteristicValueChange',
        name: '监听低功耗蓝牙设备的特征值变化事件',
        description: '验证接口存在性',
        type: 'sync',
        run: (runtime) => {
          if (typeof runtime.onBLECharacteristicValueChange !== 'function') return { exists: false };
          runtime.onBLECharacteristicValueChange(() => {});
          return { exists: true };
        },
        expect: { exists: true }
      },
      {
        id: 'migo.offBLECharacteristicValueChange',
        name: '取消监听低功耗蓝牙设备的特征值变化事件',
        description: '验证接口存在性',
        type: 'sync',
        run: (runtime) => {
          if (typeof runtime.offBLECharacteristicValueChange !== 'function') return { exists: false };
          return { exists: true };
        },
        expect: { exists: true }
      },
      {
        id: 'migo.onBLEConnectionStateChange',
        name: '监听低功耗蓝牙连接状态的改变事件',
        description: '验证接口存在性',
        type: 'sync',
        run: (runtime) => {
          if (typeof runtime.onBLEConnectionStateChange !== 'function') return { exists: false };
          runtime.onBLEConnectionStateChange(() => {});
          return { exists: true };
        },
        expect: { exists: true }
      },
      {
        id: 'migo.offBLEConnectionStateChange',
        name: '取消监听低功耗蓝牙连接状态的改变事件',
        description: '验证接口存在性',
        type: 'sync',
        run: (runtime) => {
          if (typeof runtime.offBLEConnectionStateChange !== 'function') return { exists: false };
          return { exists: true };
        },
        expect: { exists: true }
      },
      {
        id: 'migo.onBLEMTUChange',
        name: '监听 BLE MTU 变化事件',
        description: '验证接口存在性',
        type: 'sync',
        run: (runtime) => {
          if (typeof runtime.onBLEMTUChange !== 'function') return { exists: false };
          runtime.onBLEMTUChange(() => {});
          return { exists: true };
        },
        expect: { exists: true }
      },
      {
        id: 'migo.offBLEMTUChange',
        name: '取消监听 BLE MTU 变化事件',
        description: '验证接口存在性',
        type: 'sync',
        run: (runtime) => {
          if (typeof runtime.offBLEMTUChange !== 'function') return { exists: false };
          return { exists: true };
        },
        expect: { exists: true }
      },

      // --- 低功耗 (BLE) 外围设备 ---
      {
        id: 'migo.createBLEPeripheralServer',
        name: '创建外围设备服务器',
        description: '创建外围设备服务器 (仅检查接口存在性)',
        type: 'sync',
        run: (runtime) => {
           if (typeof runtime.createBLEPeripheralServer !== 'function') return { exists: false };
           return { exists: true };
        },
        expect: { exists: true }
      },
      {
        id: 'migo.onBLEPeripheralConnectionStateChanged',
        name: '监听当前外围设备被连接或断开连接事件',
        description: '验证接口存在性',
        type: 'sync',
        run: (runtime) => {
          if (typeof runtime.onBLEPeripheralConnectionStateChanged !== 'function') return { exists: false };
          runtime.onBLEPeripheralConnectionStateChanged(() => {});
          return { exists: true };
        },
        expect: { exists: true }
      },
      {
        id: 'migo.offBLEPeripheralConnectionStateChanged',
        name: '取消监听当前外围设备被连接或断开连接事件',
        description: '验证接口存在性',
        type: 'sync',
        run: (runtime) => {
          if (typeof runtime.offBLEPeripheralConnectionStateChanged !== 'function') return { exists: false };
          return { exists: true };
        },
        expect: { exists: true }
      }
    ]
  }
];
