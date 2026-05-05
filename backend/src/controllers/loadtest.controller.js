const k6Service = require('../services/k6.service');

exports.start = async (req, res) => {
  try {
    const { method, url, headers, body, vus, duration, requestId } = req.body;
    const io = req.app.get('io');
    
    // Validate required fields
    if (!method || !url) {
      return res.status(400).json({ status: 'fail', message: 'Method and URL are required' });
    }

    const testId = `lt_${Date.now()}`;
    const scriptPath = k6Service.generateScript({ method, url, headers, body, vus, duration });
    
    k6Service.runTest(testId, scriptPath, io, requestId);

    res.json({
      status: 'success',
      data: { testId, message: 'Load test started' }
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

exports.stop = async (req, res) => {
  try {
    const { testId } = req.body;
    const stopped = k6Service.stopTest(testId);
    res.json({
      status: 'success',
      data: { stopped, message: stopped ? 'Load test stopped' : 'No active test found' }
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};
