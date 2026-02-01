import requestSpecs from './request.js';
import uploadSpecs from './upload.js';
import downloadSpecs from './download.js';
import websocketSpecs from './websocket.js';

export default [
  // ...requestSpecs,
  // ...uploadSpecs,
  ...downloadSpecs,
  ...websocketSpecs,
];
