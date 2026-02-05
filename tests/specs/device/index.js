import batterySpecs from './battery.js';
import clipboardSpecs from './clipboard.js';
import screenSpecs from './screen.js';
import vibrationSpecs from './vibration.js';
import networkSpecs from './network.js';
import sensorSpecs from './sensor.js';
import keyboardSpecs from './keyboard.js';
import bluetoothSpecs from './bluetooth.js';
import gamepadSpecs from './gamepad.js';
import motionSpecs from './motion.js';
import mouseSpecs from './mouse.js';
import touchSpecs from './touch.js';
import othersSpecs from './others.js';

export default [
  ...batterySpecs,
  ...clipboardSpecs,
  ...screenSpecs,
  ...vibrationSpecs,
  ...networkSpecs,
  ...sensorSpecs,
  ...keyboardSpecs,
  ...bluetoothSpecs,
  ...gamepadSpecs,
  ...motionSpecs,
  ...mouseSpecs,
  ...touchSpecs,
  ...othersSpecs
];
