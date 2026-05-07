const { QueryInterface, DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

async function migrate() {
    const queryInterface = sequelize.getQueryInterface();
    
    console.log('--- STARTING PRODUCTION MIGRATION ---');
    
    try {
        const tableInfo = await queryInterface.describeTable('collection_shares');

        // 1. Thêm cột folder_id nếu chưa có
        if (!tableInfo.folder_id) {
            console.log('1. Adding folder_id column to collection_shares...');
            await queryInterface.addColumn('collection_shares', 'folder_id', {
                type: DataTypes.INTEGER,
                allowNull: true,
                comment: 'ID của folder nếu chia sẻ ở cấp độ folder'
            });
            console.log('   -> Success: folder_id added.');
        } else {
            console.log('1. Column folder_id already exists.');
        }

        // 2. Cập nhật collection_id thành cho phép NULL
        console.log('2. Updating collection_id to be nullable...');
        await queryInterface.changeColumn('collection_shares', 'collection_id', {
            type: DataTypes.INTEGER,
            allowNull: true
        });
        console.log('   -> Success: collection_id is now nullable.');

        console.log('--- MIGRATION COMPLETED SUCCESSFULLY ---');
        process.exit(0);
    } catch (err) {
        console.error('--- MIGRATION FAILED ---');
        console.error(err);
        process.exit(1);
    }
}

migrate();
