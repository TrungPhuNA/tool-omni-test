const k6Service = require('../services/k6.service');

exports.start = async (req, res) => {
  try {
    const { method, url, requests: bodyRequests } = req.body;
    const io = req.app.get('io');
    
    // Validate: Hoặc là có single request (method+url), hoặc là có scenario (requests array)
    if (!bodyRequests && (!method || !url)) {
      return res.status(400).json({ status: 'fail', message: 'Vui lòng cung cấp Method/URL hoặc danh sách các bước kịch bản.' });
    }

    const testId = `lt_${Date.now()}`;
    const scriptPath = k6Service.generateScript(req.body);
    const isScenario = Array.isArray(bodyRequests);
    const requests = isScenario ? bodyRequests : [{ 
      name: req.body.name || 'API', 
      method: method, 
      url: url 
    }];

    k6Service.runTest(testId, scriptPath, io, req.body.requestId, requests, req.body.scenarioName);

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
