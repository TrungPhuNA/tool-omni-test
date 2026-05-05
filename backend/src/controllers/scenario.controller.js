const { Scenario, Collection } = require('../models');
const scenarioService = require('../services/scenario.service');

class ScenarioController {
  async getAll(req, res) {
    try {
      const scenarios = await Scenario.findAll();
      res.json({ status: 'success', data: scenarios });
    } catch (error) {
      res.status(500).json({ status: 'error', message: error.message });
    }
  }

  async getByCollection(req, res) {
    try {
      const { collectionId } = req.params;
      const scenarios = await Scenario.findAll({ where: { collection_id: collectionId } });
      res.json({ status: 'success', data: scenarios });
    } catch (error) {
      res.status(500).json({ status: 'error', message: error.message });
    }
  }

  async create(req, res) {
    try {
      const { name, collection_id, steps, stop_on_error } = req.body;
      const scenario = await Scenario.create({ name, collection_id, steps, stop_on_error });
      res.status(201).json({ status: 'success', data: scenario });
    } catch (error) {
      res.status(400).json({ status: 'error', message: error.message });
    }
  }

  async update(req, res) {
    try {
      const { id } = req.params;
      const { name, steps, stop_on_error } = req.body;
      const scenario = await Scenario.findByPk(id);
      if (!scenario) return res.status(404).json({ status: 'error', message: 'Scenario not found' });
      
      await scenario.update({ name, steps, stop_on_error });
      res.json({ status: 'success', data: scenario });
    } catch (error) {
      res.status(400).json({ status: 'error', message: error.message });
    }
  }

  async delete(req, res) {
    try {
      const { id } = req.params;
      const scenario = await Scenario.findByPk(id);
      if (!scenario) return res.status(404).json({ status: 'error', message: 'Scenario not found' });
      
      await scenario.destroy();
      res.json({ status: 'success', message: 'Scenario deleted' });
    } catch (error) {
      res.status(500).json({ status: 'error', message: error.message });
    }
  }

  async run(req, res) {
    try {
      const { id } = req.params;
      const { variables } = req.body;
      const scenario = await Scenario.findByPk(id);
      if (!scenario) return res.status(404).json({ status: 'error', message: 'Scenario not found' });
      
      const result = await scenarioService.run(scenario, variables);
      res.json({ status: 'success', data: result });
    } catch (error) {
      res.status(500).json({ status: 'error', message: error.message });
    }
  }
}

module.exports = new ScenarioController();
