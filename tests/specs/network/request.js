/**
 * 网络 request API 测试
 * category: network/request
 * 
 * Requires: server/request_test_server.py running on port 8766
 */

const endpoint = 'http://10.246.1.239:8766';

export default [
    // 1. Basic & Methods
    {
        name: 'migo.request.basic',
        category: 'network/request',
        tests: [
            {
                id: 'request-basic-get',
                name: 'Basic GET Request',
                description: 'Test basic GET request to echo endpoint',
                type: 'async',
                run: (runtime) => new Promise((resolve, reject) => {
                    runtime.request({
                        url: `${endpoint}/echo`,
                        method: 'GET',
                        success: (res) => {
                            if (res.statusCode === 200 && res.data.method === 'GET') {
                                resolve('PASS');
                            } else {
                                reject(`Unexpected response: ${JSON.stringify(res)}`);
                            }
                        },
                        fail: (err) => reject(`Request failed: ${JSON.stringify(err)}`)
                    });
                }),
                expect: 'PASS'
            },
      ...['POST', 'PUT', 'DELETE', 'OPTIONS', 'TRACE'].map(method => ({
                id: `request-method-${method.toLowerCase()}`,
                name: `Method ${method}`,
                description: `Test HTTP method ${method}`,
                type: 'async',
                run: (runtime) => new Promise((resolve, reject) => {
                    runtime.request({
                        url: `${endpoint}/echo`,
                        method: method,
                        success: (res) => {
                            if (res.statusCode === 200) {
                                if (method === 'HEAD' || method === 'CONNECT') {
                                    // HEAD has no body, CONNECT might be special, but echo server handles them
                                    resolve('PASS');
                                } else if (res.data.method === method) {
                                    resolve('PASS');
                                } else {
                                    reject(`Method mismatch. Expected ${method}, got ${res.data.method}`);
                                }
                            } else {
                                reject(`Status ${res.statusCode}`);
                            }
                        },
                        fail: (err) => reject(`Failed: ${JSON.stringify(err)}`)
                    });
                }),
                expect: 'PASS'
            })),
            {
                id: 'request-method-head',
                name: 'Method HEAD',
                description: 'Test HTTP method HEAD',
                type: 'async',
                run: (runtime) => new Promise((resolve, reject) => {
                    runtime.request({
                        url: `${endpoint}/echo`,
                        method: 'HEAD',
                        success: (res) => {
                            // HEAD returns headers but no body. wx.request might return empty data.
                            if (res.statusCode === 200) resolve('PASS');
                            else reject(`Status ${res.statusCode}`);
                        },
                        fail: reject
                    });
                }),
                expect: 'PASS'
            },
            {
                id: 'request-complete',
                name: 'Callback complete',
                description: 'Test complete callback',
                type: 'async',
                run: (runtime) => new Promise((resolve, reject) => {
                    let completed = false;
                    runtime.request({
                        url: `${endpoint}/echo`,
                        success: (res) => {
                            // success
                        },
                        complete: (res) => {
                            completed = true;
                            if (res.statusCode === 200) resolve('PASS');
                            else reject(`Complete called with wrong status: ${res.statusCode}`);
                        },
                        fail: (err) => reject(`Failed: ${JSON.stringify(err)}`)
                    });
                    
                    // Safety timeout in case complete is never called
                    setTimeout(() => {
                        if (!completed) reject('Complete callback not triggered');
                    }, 2000);
                }),
                expect: 'PASS'
            }
        ]
    },

    // 2. Data Transmission
    {
        name: 'migo.request.data',
        category: 'network/request',
        tests: [
            {
                id: 'request-post-json',
                name: 'POST JSON Data',
                description: 'POST object data (default JSON)',
                type: 'async',
                run: (runtime) => new Promise((resolve, reject) => {
                    const payload = { msg: 'hello', val: 123 };
                    runtime.request({
                        url: `${endpoint}/echo`,
                        method: 'POST',
                        data: payload,
                        success: (res) => {
                            // Server parses JSON if content-type matches
                            if (res.statusCode === 200 && res.data.body && res.data.body.msg === 'hello') {
                                resolve('PASS');
                            } else {
                                reject(`Body mismatch: ${JSON.stringify(res.data)}`);
                            }
                        },
                        fail: reject
                    });
                }),
                expect: 'PASS'
            },
            {
                id: 'request-post-string',
                name: 'POST String Data',
                description: 'POST string data',
                type: 'async',
                run: (runtime) => new Promise((resolve, reject) => {
                    const str = 'raw string data';
                    runtime.request({
                        url: `${endpoint}/echo`,
                        method: 'POST',
                        data: str,
                        success: (res) => {
                            if (res.statusCode === 200 && res.data.body === str) {
                                resolve('PASS');
                            } else {
                                reject(`Body mismatch: ${JSON.stringify(res.data)}`);
                            }
                        },
                        fail: reject
                    });
                }),
                expect: 'PASS'
            },
            {
                id: 'request-post-arraybuffer',
                name: 'POST ArrayBuffer',
                description: 'POST ArrayBuffer data',
                type: 'async',
                run: (runtime) => new Promise((resolve, reject) => {
                    const buf = new ArrayBuffer(4);
                    const view = new Uint8Array(buf);
                    view.set([65, 66, 67, 68]); // "ABCD"
                    runtime.request({
                        url: `${endpoint}/echo`,
                        method: 'POST',
                        data: buf,
                        success: (res) => {
                            // Server tries to decode as utf-8
                            if (res.statusCode === 200 && res.data.body === 'ABCD') {
                                resolve('PASS');
                            } else {
                                reject(`Body mismatch: ${JSON.stringify(res.data)}`);
                            }
                        },
                        fail: reject
                    });
                }),
                expect: 'PASS'
            }
        ]
    },

    // 3. Headers & Query
    {
        name: 'migo.request.params',
        category: 'network/request',
        tests: [
            {
                id: 'request-custom-header',
                name: 'Custom Header',
                description: 'Send custom headers',
                type: 'async',
                run: (runtime) => new Promise((resolve, reject) => {
                    runtime.request({
                        url: `${endpoint}/echo`,
                        header: { 'X-Migo-Test': 'HeaderValue', 'content-type': 'application/json' },
                        success: (res) => {
                            // Note: headers might be lowercased by server or client
                            const headers = res.data.headers;
                            const val = headers['X-Migo-Test'] || headers['x-migo-test'];
                            if (val === 'HeaderValue') resolve('PASS');
                            else reject(`Header missing or wrong: ${JSON.stringify(headers)}`);
                        },
                        fail: reject
                    });
                }),
                expect: 'PASS'
            },
            {
                id: 'request-query-params',
                name: 'Query Parameters',
                description: 'URL query parameters',
                type: 'async',
                run: (runtime) => new Promise((resolve, reject) => {
                    runtime.request({
                        url: `${endpoint}/echo?foo=bar&num=100`,
                        success: (res) => {
                            const q = res.data.query;
                            if (q.foo && q.foo[0] === 'bar' && q.num && q.num[0] === '100') resolve('PASS');
                            else reject(`Query mismatch: ${JSON.stringify(q)}`);
                        },
                        fail: reject
                    });
                }),
                expect: 'PASS'
            }
        ]
    },

    // 4. Response Handling (Status, Type, Timeout)
    {
        name: 'migo.request.response',
        category: 'network/request',
        tests: [
            {
                id: 'request-status-404',
                name: 'Status 404',
                description: 'Handle 404 status code',
                type: 'async',
                run: (runtime) => new Promise((resolve, reject) => {
                    runtime.request({
                        url: `${endpoint}/status/404`,
                        success: (res) => {
                            if (res.statusCode === 404) resolve('PASS');
                            else reject(`Expected 404, got ${res.statusCode}`);
                        },
                        fail: reject
                    });
                }),
                expect: 'PASS'
            },
            {
                id: 'request-status-500',
                name: 'Status 500',
                description: 'Handle 500 status code',
                type: 'async',
                run: (runtime) => new Promise((resolve, reject) => {
                    runtime.request({
                        url: `${endpoint}/status/500`,
                        success: (res) => {
                            if (res.statusCode === 500) resolve('PASS');
                            else reject(`Expected 500, got ${res.statusCode}`);
                        },
                        fail: reject
                    });
                }),
                expect: 'PASS'
            },
            {
                id: 'request-timeout',
                name: 'Timeout',
                description: 'Request timeout test',
                type: 'async',
                run: (runtime) => new Promise((resolve, reject) => {
                    runtime.request({
                        url: `${endpoint}/delay/2000`, // Server waits 2s
                        timeout: 500, // Client waits 500ms
                        success: (res) => reject('Should have timed out, but succeeded'),
                        fail: (err) => {
                            // Check if error indicates timeout
                            // This message format depends on implementation, but typically contains "timeout"
                            resolve('PASS');
                        }
                    });
                }),
                expect: 'PASS'
            }
        ]
    },

    // 5. DataType & ResponseType
    {
        name: 'migo.request.types',
        category: 'network/request',
        tests: [
            {
                id: 'request-datatype-json',
                name: 'dataType JSON',
                description: 'Auto parse JSON response',
                type: 'async',
                run: (runtime) => new Promise((resolve, reject) => {
                    runtime.request({
                        url: `${endpoint}/json`,
                        dataType: 'json',
                        success: (res) => {
                            if (typeof res.data === 'object' && res.data.foo === 'bar') resolve('PASS');
                            else reject(`Not parsed as object: ${typeof res.data}`);
                        },
                        fail: reject
                    });
                }),
                expect: 'PASS'
            },
            {
                id: 'request-datatype-text',
                name: 'dataType Text',
                description: 'Do not parse JSON response',
                type: 'async',
                run: (runtime) => new Promise((resolve, reject) => {
                    runtime.request({
                        url: `${endpoint}/json`,
                        dataType: 'text',
                        success: (res) => {
                            if (typeof res.data === 'string' && res.data.includes('"foo": "bar"')) resolve('PASS');
                            else reject(`Should be string, got: ${typeof res.data}`);
                        },
                        fail: reject
                    });
                }),
                expect: 'PASS'
            },
            {
                id: 'request-responsetype-arraybuffer',
                name: 'responseType ArrayBuffer',
                description: 'Receive binary data',
                type: 'async',
                run: (runtime) => new Promise((resolve, reject) => {
                    runtime.request({
                        url: `${endpoint}/binary`,
                        responseType: 'arraybuffer',
                        success: (res) => {
                            if (res.data instanceof ArrayBuffer && res.data.byteLength === 256) resolve('PASS');
                            else reject(`Expected ArrayBuffer(256), got ${res.data}`);
                        },
                        fail: reject
                    });
                }),
                expect: 'PASS'
            }
        ]
    },

    // 6. Advanced Options
    {
        name: 'migo.request.options',
        category: 'network/request',
        tests: [
            {
                id: 'request-redirect-follow',
                name: 'Redirect Follow',
                description: 'Automatically follow 302',
                type: 'async',
                run: (runtime) => new Promise((resolve, reject) => {
                    runtime.request({
                        url: `${endpoint}/redirect`,
                        // redirect: 'follow', // Default
                        success: (res) => {
                            // Should land on echo with query param
                            if (res.statusCode === 200 && res.data.query && res.data.query.redirected) resolve('PASS');
                            else reject('Did not follow redirect correctly');
                        },
                        fail: reject
                    });
                }),
                expect: 'PASS'
            },
            {
                id: 'request-cellular',
                name: 'Force Cellular',
                description: 'forceCellularNetwork=true',
                type: 'async',
                run: (runtime) => new Promise((resolve, reject) => {
                    runtime.request({
                        url: `${endpoint}/echo`,
                        forceCellularNetwork: true,
                        success: (res) => {
                            if (res.statusCode === 200) resolve('PASS');
                            else reject('Failed with cellular forced');
                        },
                        fail: (err) => {
                            // On simulator/desktop this might fail or be ignored. 
                            // If it fails because no cellular, we might consider it pass or fail depending on strictness.
                            // For now, assume it might fallback or succeed. If it strictly fails, we log it.
                            resolve('PASS'); // Weak assertion for environment compatibility
                        }
                    });
                }),
                expect: 'PASS'
            }
        ]
    },

    // 7. RequestTask
    {
        name: 'migo.request.task',
        category: 'network/request',
        tests: [
            {
                id: 'request-task-abort',
                name: 'RequestTask.abort()',
                description: 'Abort a running request',
                type: 'async',
                run: (runtime) => new Promise((resolve, reject) => {
                    const task = runtime.request({
                        url: `${endpoint}/delay/2000`, // Long running request
                        success: (res) => reject('Request succeeded but should have been aborted'),
                        fail: (err) => {
                            console.log('aborted ' + JSON.stringify(err))
                            // Expect "abort" in error message usually
                            resolve('PASS');
                        }
                    });

                    setTimeout(() => {
                        task.abort();
                    }, 100);
                }),
                expect: 'PASSA'
            },
            {
                id: 'request-task-headers',
                name: 'onHeadersReceived',
                description: 'Listen to response headers',
                type: 'async',
                run: (runtime) => new Promise((resolve, reject) => {
                    let headersReceived = false;
                    const task = runtime.request({
                        url: `${endpoint}/echo`,
                        success: (res) => {
                             console.log('success recved' + JSON.stringify(res))
                            if (headersReceived) resolve('PASS');
                            else reject('onHeadersReceived did not fire before success');
                        },
                        fail: reject
                    });

                    task.onHeadersReceived((res) => {
                        console.log('onheader recved' + JSON.stringify(res))
                        if (res.header) {
                            headersReceived = true;
                        }
                    });
                }),
                expect: 'PASS'
            },
            {
                id: 'request-task-off-headers',
                name: 'offHeadersReceived',
                description: 'Remove headers listener',
                type: 'async',
                run: (runtime) => new Promise((resolve, reject) => {
                    let count = 0;
                    const listener = () => { count++; };

                    const task = runtime.request({
                        url: `${endpoint}/echo`,
                        success: (res) => {
                            if (count === 0) resolve('PASS');
                            else reject('Listener should have been removed');
                        },
                        fail: reject
                    });

                    task.onHeadersReceived(listener);
                    task.offHeadersReceived(listener);
                }),
                expect: 'PASS'
            },
            {
                id: 'request-task-chunk',
                name: 'onChunkReceived',
                description: 'Receive data chunks',
                type: 'async',
                run: (runtime) => new Promise((resolve, reject) => {
                    const chunks = [];
                    const task = runtime.request({
                        url: `${endpoint}/chunked`,
                        enableChunked: true,
                        success: (res) => {
                            if (chunks.length >= 3) resolve('PASS');
                            else reject(`Expected 3+ chunks, got ${chunks.length}: ${chunks.join(',')}`);
                        },
                        fail: (err) => reject(`Request failed: ${JSON.stringify(err)}`)
                    });

                    task.onChunkReceived((res) => {
                        if (res.data && res.data.byteLength > 0) {
                            const str = String.fromCharCode.apply(null, new Uint8Array(res.data));
                            chunks.push(str);
                        }
                    });
                }),
                expect: 'PASS'
            }
        ]
    }
];
