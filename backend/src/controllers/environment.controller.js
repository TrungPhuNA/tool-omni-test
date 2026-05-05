const { Environment } = require('../models');

class EnvironmentController {
  async getAll(req, res) {
    try {
      const environments = await Environment.findAll();
      res.json({ status: 'success', data: environments });
    } catch (error) {
      res.status(500).json({ status: 'error', message: error.message });
    }
  }

  async create(req, res) {
    try {
      const { name, variables } = req.body;
      const environment = await Environment.create({ name, variables });
      res.status(201).json({ status: 'success', data: environment });
    } catch (error) {
      res.status(400).json({ status: 'error', message: error.message });
    }
  }

  async update(req, res) {
    try {
      const { id } = req.params;
      const { name, variables } = req.body;
      const environment = await Environment.findByPk(id);
      if (!environment) {
        return res.status(404).json({ status: 'error', message: 'Environment not found' });
      }
      await environment.update({ name, variables });
      res.json({ status: 'success', data: environment });
    } catch (error) {
      res.status(400).json({ status: 'error', message: error.message });
    }
  }

  async delete(req, res) {
    try {
      const { id } = req.params;
      const environment = await Environment.findByPk(id);
      if (!environment) {
        return res.status(404).json({ status: 'error', message: 'Environment not found' });
      }
      await environment.destroy();
      res.json({ status: 'success', message: 'Environment deleted successfully' });
    } catch (error) {
      res.status(500).json({ status: 'error', message: error.message });
    }
  }
}

module.exports = new EnvironmentController();
