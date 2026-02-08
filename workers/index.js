
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
  }
});
