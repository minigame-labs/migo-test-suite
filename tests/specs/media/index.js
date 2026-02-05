import audioSpecs from './audio/index.js';
import cameraSpecs from './camera/index.js';
import imageSpecs from './image/index.js';
import recorderSpecs from './recorder/index.js';
import videoDecoderSpecs from './video_decoder/index.js';
import videoSpecs from './video/index.js';
import voipSpecs from './voip/index.js';

export default [
    ...audioSpecs,
    ...cameraSpecs,
    ...imageSpecs,
    ...recorderSpecs,
    ...videoDecoderSpecs,
    ...videoSpecs,
    ...voipSpecs
];
