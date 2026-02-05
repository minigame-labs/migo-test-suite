import batterySpecs from './battery.js';
import clipboardSpecs from './clipboard.js';
import screenSpecs from './screen.js';
import vibrationSpecs from './vibration.js';
import networkSpecs from './network.js';
import sensorSpecs from './sensor.js';

export default [
  ...batterySpecs,
  ...clipboardSpecs,
  ...screenSpecs,
  ...vibrationSpecs,
  ...networkSpecs,
  ...sensorSpecs
];
