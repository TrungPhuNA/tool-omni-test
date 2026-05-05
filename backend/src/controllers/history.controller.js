const { TestHistory, Request } = require('../models');

exports.getAll = async (req, res) => {
  try {
    const { type, status, limit = 50 } = req.query;
    const where = {};
    if (type) where.type = type;
    if (status) where.status = status;

    const history = await TestHistory.findAll({
      where,
      limit: parseInt(limit),
      order: [['createdAt', 'DESC']],
      include: [{ 
        model: Request, 
        as: 'request',
        attributes: ['name', 'method', 'url'] 
      }]
    });

    res.json({
      status: 'success',
      data: history
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const history = await TestHistory.findByPk(req.params.id, {
      include: [{ model: Request }]
    });
    if (!history) {
      return res.status(404).json({ status: 'fail', message: 'History not found' });
    }
    res.json({ status: 'success', data: history });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

exports.delete = async (req, res) => {
  try {
    await TestHistory.destroy({ where: { id: req.params.id } });
    res.json({ status: 'success', message: 'History deleted' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};
