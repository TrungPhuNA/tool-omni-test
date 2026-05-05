const proxyService = require('./proxy.service');
const scenarioRepository = require('../repositories/scenario.repository');
const requestRepository = require('../repositories/request.repository');

class ScenarioService {
  async getAll() {
    return await scenarioRepository.findAll();
  }

  async getByCollectionId(collectionId) {
    return await scenarioRepository.findByCollectionId(collectionId);
  }

  async getById(id) {
    const scenario = await scenarioRepository.findById(id);
    if (!scenario) throw new Error('Không tìm thấy kịch bản');
    return scenario;
  }

  async create(data) {
    return await scenarioRepository.create(data);
  }

  async update(id, data) {
    const scenario = await scenarioRepository.update(id, data);
    if (!scenario) throw new Error('Không tìm thấy kịch bản để cập nhật');
    return scenario;
  }

  async delete(id) {
    const deleted = await scenarioRepository.delete(id);
    if (!deleted) throw new Error('Không tìm thấy kịch bản để xoá');
    return true;
  }

  /**
   * Chạy kịch bản test tuần tự
   * @param {Object} scenario { steps: [{ requestId, extractors: [{ key, path }] }] }
   * @param {Object} globalVars Biến môi trường
   */
  async run(scenario, globalVars = {}) {
    const results = [];
    const context = { ...globalVars }; // Chứa các biến động được trích xuất
    
    for (const step of scenario.steps) {
      const requestModel = await requestRepository.getById(step.requestId);
      if (!requestModel) {
        results.push({ step, error: 'Request not found' });
        if (scenario.stop_on_error) break;
        continue;
      }

      // Chuẩn bị config và inject biến từ context
      const config = {
        method: requestModel.method,
        url: proxyService.injectVariables(requestModel.url, context),
        headers: this.injectObject(requestModel.headers, context),
        params: this.injectObject(requestModel.params, context),
        body: this.injectObject(requestModel.body, context),
        authConfig: requestModel.auth_config
      };

      // Thực thi request
      const response = await proxyService.executeRequest(config);
      
      // Trích xuất biến (Extractors)
      if (step.extractors && response.body) {
        const _ = require('lodash');
        step.extractors.forEach(ext => {
          const val = _.get(response.body, ext.path);
          if (val) context[ext.key] = val;
        });
      }

      results.push({
        name: requestModel.name,
        step,
        response
      });

      // Kiểm tra dừng nếu lỗi
      if (scenario.stop_on_error && response.statusCode >= 400) {
        break;
      }
    }

    return { results, finalContext: context };
  }

  injectObject(obj, vars) {
    if (!obj) return obj;
    try {
      const str = typeof obj === 'string' ? obj : JSON.stringify(obj);
      const injectedStr = proxyService.injectVariables(str, vars);
      return JSON.parse(injectedStr);
    } catch (e) {
      return obj;
    }
  }
}

module.exports = new ScenarioService();
