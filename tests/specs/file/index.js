import apiCheckSpecs from './api_check.js';
import basicSpecs from './basic.js';
import readWritePathSpecs from './read_write_path.js';
import readWriteFdSpecs from './read_write_fd.js';
import directorySpecs from './directory.js';
import statSpecs from './stat.js';
import managementSpecs from './management.js';
import compressedSpecs from './compressed.js';

export default [
    ...apiCheckSpecs,
    ...basicSpecs,
    ...readWritePathSpecs,
    ...readWriteFdSpecs,
    ...directorySpecs,
    ...statSpecs,
    ...managementSpecs,
    ...compressedSpecs
];
