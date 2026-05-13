const sequelize = require('../config/sequelize');
const { Op } = require('sequelize');
const { Collection, Folder, Request, RequestExample, Scenario, CollectionShare } = require('../models');

class CollectionRepository {
    async getAll(userId, userEmail) {
        console.log(`[CollectionRepo] Fetching collections for user: ${userId}, email: ${userEmail}`);

        // Find collections shared with this user's email
        let sharedCollectionIds = [];
        let finalShares = [];

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
            finalShares = shares;
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

        // Nếu không có thông tin email chia sẻ, trả về kết quả thuần túy (chủ yếu là chủ sở hữu)
        if (!userEmail || !finalShares || finalShares.length === 0) {
            return results;
        }

        // Xử lý lọc dữ liệu cho các collection được chia sẻ (đặc biệt là chia sẻ cấp folder)
        const processedResults = results.map(collection => {
            const col = collection.get({ plain: true });
            
            // Nếu là chủ sở hữu, giữ nguyên toàn bộ nội dung
            if (userId && col.user_id === userId) {
                return col;
            }

            // Lấy các bản ghi chia sẻ liên quan đến collection này
            const relevantShares = finalShares.filter(s => 
                s.collection_id === col.id || (s.folder && s.folder.collection_id === col.id)
            );

            // 1. Nếu có ít nhất một share là cấp COLLECTION -> được xem toàn bộ
            const isFullShare = relevantShares.some(s => s.collection_id === col.id);
            if (isFullShare) {
                return col;
            }

            // 2. Nếu chỉ được chia sẻ cấp FOLDER
            const allowedRootFolderIds = relevantShares
                .filter(s => s.folder_id && s.folder && s.folder.collection_id === col.id)
                .map(s => s.folder_id);

            if (allowedRootFolderIds.length > 0) {
                console.log(`[CollectionRepo] Filtering folders for collection ${col.id}. Shared roots:`, allowedRootFolderIds);
                
                // Tìm tất cả folder con của các folder được share (đệ quy)
                const allAllowedFolderIds = new Set();
                const addDescendants = (folderId) => {
                    allAllowedFolderIds.add(folderId);
                    col.folders.forEach(f => {
                        if (f.parent_id === folderId) {
                            addDescendants(f.id);
                        }
                    });
                };
                
                allowedRootFolderIds.forEach(id => addDescendants(id));

                // Lọc danh sách folders
                col.folders = col.folders.filter(f => allAllowedFolderIds.has(f.id));
                
                // Ẩn toàn bộ requests ở root của collection (vì chỉ share folder con)
                col.requests = [];
                
                // QUAN TRỌNG: Để frontend render đúng cây thư mục từ folder được share,
                // chúng ta coi các folder là "root" (parent_id = null) nếu cha của nó không nằm trong danh sách được phép
                col.folders = col.folders.map(f => {
                    if (!f.parent_id || !allAllowedFolderIds.has(f.parent_id)) {
                        return { ...f, parent_id: null };
                    }
                    return f;
                });

                col.is_folder_share = true; // Gắn flag để frontend có thể nhận biết
            }

            return col;
        });

        return processedResults;
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
