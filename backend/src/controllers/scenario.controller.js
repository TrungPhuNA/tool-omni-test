const scenarioService = require('../services/scenario.service');

class ScenarioController {
    async getAll(req, res, next) {
        try {
            const scenarios = await scenarioService.getAll();
            res.status(200).json({
                status: 'success',
                code: 'SUCCESS',
                data: scenarios
            });
        } catch (error) {
            next(error);
        }
    }

    async getByCollection(req, res, next) {
        try {
            const { collectionId } = req.params;
            const scenarios = await scenarioService.getByCollectionId(collectionId);
            res.status(200).json({
                status: 'success',
                code: 'SUCCESS',
                data: scenarios
            });
        } catch (error) {
            next(error);
        }
    }

    async create(req, res, next) {
        try {
            const scenario = await scenarioService.create(req.body);
            res.status(201).json({
                status: 'success',
                code: 'SUCCESS',
                data: scenario
            });
        } catch (error) {
            next(error);
        }
    }

    async update(req, res, next) {
        try {
            const { id } = req.params;
            const scenario = await scenarioService.update(id, req.body);
            res.status(200).json({
                status: 'success',
                code: 'SUCCESS',
                data: scenario
            });
        } catch (error) {
            if (error.message === 'Không tìm thấy kịch bản để cập nhật') {
                return res.status(404).json({
                    status: 'fail',
                    code: 'NOT_FOUND',
                    message: error.message
                });
            }
            next(error);
        }
    }

    async delete(req, res, next) {
        try {
            const { id } = req.params;
            await scenarioService.delete(id);
            res.status(200).json({
                status: 'success',
                code: 'SUCCESS',
                message: 'Xoá kịch bản thành công'
            });
        } catch (error) {
            if (error.message === 'Không tìm thấy kịch bản để xoá') {
                return res.status(404).json({
                    status: 'fail',
                    code: 'NOT_FOUND',
                    message: error.message
                });
            }
            next(error);
        }
    }

    async run(req, res, next) {
        try {
            const { id } = req.params;
            const { variables } = req.body;
            const scenario = await scenarioService.getById(id);
            const result = await scenarioService.run(scenario, variables);
            res.status(200).json({
                status: 'success',
                code: 'SUCCESS',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new ScenarioController();
