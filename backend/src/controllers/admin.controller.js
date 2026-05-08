const { User, Collection, Request, TestHistory, Folder } = require('../models');
const { Op } = require('sequelize');

class AdminController {
    /**
     * Lấy thống kê tổng quan
     */
    async getStats(req, res, next) {
        try {
            const userCount = await User.count();
            const collectionCount = await Collection.count();
            const requestCount = await Request.count();
            const folderCount = await Folder.count();
            
            // Thống kê lịch sử chạy test (30 ngày gần nhất)
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

            const passCount = await TestHistory.count({
                where: {
                    status: 'pass',
                    created_at: { [Op.gte]: thirtyDaysAgo }
                }
            });

            const failCount = await TestHistory.count({
                where: {
                    status: 'fail',
                    created_at: { [Op.gte]: thirtyDaysAgo }
                }
            });

            // Lấy 10 request mới nhất
            const recentRequests = await Request.findAll({
                limit: 10,
                order: [['created_at', 'DESC']],
                include: [{ model: Collection, as: 'collection', attributes: ['name'] }]
            });

            res.status(200).json({
                status: 'success',
                data: {
                    counters: {
                        users: userCount,
                        collections: collectionCount,
                        requests: requestCount,
                        folders: folderCount
                    },
                    testResults: {
                        pass: passCount,
                        fail: failCount,
                        total: passCount + failCount
                    },
                    recentRequests
                }
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Quản lý người dùng
     */
    async getUsers(req, res, next) {
        try {
            const users = await User.findAll({
                attributes: { exclude: ['password'] },
                order: [['created_at', 'DESC']]
            });
            res.status(200).json({
                status: 'success',
                data: users
            });
        } catch (error) {
            next(error);
        }
    }

    async updateUser(req, res, next) {
        try {
            const { id } = req.params;
            const { role, status } = req.body;
            
            const user = await User.findByPk(id);
            if (!user) {
                return res.status(404).json({ message: 'Không tìm thấy người dùng' });
            }

            await user.update({ role, status });
            
            res.status(200).json({
                status: 'success',
                message: 'Cập nhật người dùng thành công',
                data: user
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Quản lý Collections hệ thống
     */
    async getCollections(req, res, next) {
        try {
            const { sequelize } = require('../models');
            const collections = await Collection.findAll({
                attributes: {
                    include: [
                        [
                            sequelize.literal('(SELECT COUNT(*) FROM folders WHERE folders.collection_id = Collection.id)'),
                            'foldersCount'
                        ],
                        [
                            sequelize.literal('(SELECT COUNT(*) FROM requests WHERE requests.collection_id = Collection.id)'),
                            'requestsCount'
                        ]
                    ]
                },
                order: [['created_at', 'DESC']],
                include: [
                    { model: User, as: 'owner', attributes: ['username', 'email'] }
                ]
            });
            res.status(200).json({
                status: 'success',
                data: collections
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new AdminController();
