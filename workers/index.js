worker.onMessage(function (res) {
  const msg = res.message || res; // Handle potential differences in environment implementation
  console.log('Worker received:', msg);

  if (msg.type === 'echo') {
    worker.postMessage({
      type: 'echo',
      data: msg.data
    });
  } else if (msg.type === 'error') {
    setTimeout(() => {
      throw new Error('Test worker error');
    }, 10);
  } else if (msg.type === 'testOnProcessKilled') {
    if (worker.testOnProcessKilled) {
      worker.testOnProcessKilled();
    } else {
      console.log('worker.testOnProcessKilled not supported');
    }
  } else if (msg.type === 'getCameraFrameData') {
    if (worker.getCameraFrameData) {
      try {
        const buffer = worker.getCameraFrameData();
        worker.postMessage({
          type: 'cameraFrameData',
          byteLength: buffer.byteLength
        });
      } catch (e) {
        worker.postMessage({
          type: 'cameraFrameData',
          error: e.message
        });
      }
    } else {
      worker.postMessage({
        type: 'cameraFrameData',
        error: 'not supported'
      });
    }
  } else if (msg.type === 'getEnv') {
   
    worker.postMessage({
      type: 'env',
      data: worker.env
    });
  } else if (msg.type === 'getAllProperties') {
    // 获取 worker 对象上的所有属性和方法
    const props = {};
    // 遍历自身属性
    Object.getOwnPropertyNames(worker).forEach(key => {
      try {
        const val = worker[key];
        props[key] = typeof val;
      } catch (e) {
        props[key] = 'error accessing property';
      }
    });
    
    // 也可以遍历原型链（如果需要）
    let proto = Object.getPrototypeOf(worker);
    while (proto && proto !== Object.prototype) {
        Object.getOwnPropertyNames(proto).forEach(key => {
            if (!props.hasOwnProperty(key)) {
                try {
                    const val = worker[key];
                    props[key] = typeof val;
                } catch (e) {
                    props[key] = 'error accessing property';
                }
            }
        });
        proto = Object.getPrototypeOf(proto);
    }

    worker.postMessage({
      type: 'allProperties',
      data: props
    });
  }
});
