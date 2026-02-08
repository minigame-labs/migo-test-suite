import requestSpecs from './request.js';
import uploadSpecs from './upload.js';
import downloadSpecs from './download.js';
import websocketSpecs from './websocket.js';
import tcpSpecs from './tcp.js';
import udpSpecs from './udp.js';

export default [
  // ...requestSpecs,
  // ...uploadSpecs,
  ...downloadSpecs,
  ...websocketSpecs,
  ...tcpSpecs,
  ...udpSpecs,
];
