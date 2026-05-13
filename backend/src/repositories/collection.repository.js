const sequelize = require('../config/sequelize');
const { Op } = require('sequelize');
const { Collection, Folder, Request, RequestExample, Scenario, CollectionShare } = require('../models');

class CollectionRepository {
    async getAll(userId, userEmail) {
        console.log(`[CollectionRepo] Fetching collections for user: ${userId}, email: ${userEmail}`);

        // Find collections shared with this user's email
        let sharedCollectionIds = [];
        if (userEmail) {
            const trimmedEmail = userEmail.trim();
            console.log(`[CollectionRepo] Querying shares for email: "${trimmedEmail}"`);

            const shares = await CollectionShare.findAll({
                where: { 
                    target_email: trimmedEmail,
                    type: 'internal' 
                },
                attributes: ['collection_id', 'folder_id'],
                include: [
                    {
                        model: Folder,
                        as: 'folder',
                        attributes: ['collection_id'],
                        required: false
                    }
                ]
            });

            console.log(`[CollectionRepo] Results found: ${shares.length}`);
            
            // Nếu không tìm thấy, thử tìm case-insensitive
            let finalShares = shares;
            if (shares.length === 0) {
                console.log(`[CollectionRepo] No direct match, trying case-insensitive search...`);
                finalShares = await CollectionShare.findAll({
                    where: sequelize.where(
                        sequelize.fn('LOWER', sequelize.col('target_email')),
                        trimmedEmail.toLowerCase()
                    ),
                    attributes: ['collection_id', 'folder_id'],
                    include: [{ model: Folder, as: 'folder', attributes: ['collection_id'], required: false }]
                });
                console.log(`[CollectionRepo] Case-insensitive results: ${finalShares.length}`);
            }
            
            // Log chi tiết từng bản ghi chia sẻ để debug
            finalShares.forEach((s, idx) => {
                console.log(`[CollectionRepo] Share #${idx}: coll_id=${s.collection_id}, folder_id=${s.folder_id}, folder_data=${s.folder ? JSON.stringify(s.folder) : 'NULL'}`);
            });

            // Get collection IDs from direct collection shares and folder shares
            const ids = finalShares.map(s => {
                // Ưu tiên lấy collection_id trực tiếp, nếu không thì lấy từ folder
                if (s.collection_id) return s.collection_id;
                if (s.folder) return s.folder.collection_id;
                return null;
            }).filter(id => id !== null);
            
            sharedCollectionIds = [...new Set(ids)]; // Unique IDs
            console.log(`[CollectionRepo] Final Shared Collection IDs to include:`, sharedCollectionIds);
        }

        const whereClause = {};
        if (userId) {
            whereClause[Op.or] = [
                { user_id: userId },
                { user_id: null }, // Support legacy data that has no owner yet
                { id: { [Op.in]: sharedCollectionIds } }
            ];
        }

        const results = await Collection.findAll({
            where: whereClause,
            include: [
                {
                    model: Folder,
                    as: 'folders',
                    separate: true,
                    order: [['order', 'ASC']],
                    include: [
                        {
                            model: Request,
                            as: 'requests',
                            separate: true,
                            order: [['order', 'ASC']],
                            include: [{ model: RequestExample, as: 'examples' }]
                        }
                    ]
                },
                {
                    model: Request,
                    as: 'requests',
                    where: { folder_id: null },
                    required: false,
                    separate: true,
                    order: [['order', 'ASC']],
                    include: [{ model: RequestExample, as: 'examples' }]
                },
                { model: Scenario, as: 'scenarios' },
                { model: CollectionShare, as: 'shares' }
            ],
            order: [['created_at', 'DESC']]
        });

        return results;
    }

    async getById(id) {
        return await Collection.findByPk(id, {
            include: [
                {
                    model: Folder,
                    as: 'folders',
                    separate: true,
                    order: [['order', 'ASC']],
                    include: [
                        {
                            model: Request,
                            as: 'requests',
                            separate: true,
                            order: [['order', 'ASC']],
                            include: [{ model: RequestExample, as: 'examples' }]
                        }
                    ]
                },
                {
                    model: Request,
                    as: 'requests',
                    where: { folder_id: null },
                    required: false,
                    separate: true,
                    order: [['order', 'ASC']],
                    include: [{ model: RequestExample, as: 'examples' }]
                },
                { model: Scenario, as: 'scenarios' },
                { model: CollectionShare, as: 'shares' }
            ]
        });
    }

    async create(data) {
        return await Collection.create(data);
    }

    async update(id, data) {
        const collection = await Collection.findByPk(id);
        if (!collection) return null;
        return await collection.update(data);
    }

    async delete(id) {
        const collection = await Collection.findByPk(id);
        if (!collection) return false;
        await collection.destroy();
        return true;
    }
}

module.exports = new CollectionRepository();
