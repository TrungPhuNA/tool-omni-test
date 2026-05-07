const { QueryInterface, DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

async function migrate() {
    const queryInterface = sequelize.getQueryInterface();
    
    console.log('--- STARTING NESTED FOLDERS & ORDERING MIGRATION ---');
    
    try {
        // 1. Cập nhật bảng folders
        console.log('1. Updating folders table...');
        const folderTableInfo = await queryInterface.describeTable('folders');

        if (!folderTableInfo.parent_id) {
            await queryInterface.addColumn('folders', 'parent_id', {
                type: DataTypes.INTEGER,
                allowNull: true,
                after: 'description',
                comment: 'ID của thư mục cha (cho lồng nhau)'
            });
            console.log('   -> Added parent_id to folders.');
        }

        // 2. Cập nhật bảng requests
        console.log('2. Updating requests table...');
        const requestTableInfo = await queryInterface.describeTable('requests');

        if (!requestTableInfo.order) {
            await queryInterface.addColumn('requests', 'order', {
                type: DataTypes.INTEGER,
                defaultValue: 0,
                after: 'post_script',
                comment: 'Thứ tự sắp xếp'
            });
            console.log('   -> Added order to requests.');
        }

        console.log('--- MIGRATION COMPLETED SUCCESSFULLY ---');
        process.exit(0);
    } catch (err) {
        console.error('--- MIGRATION FAILED ---');
        console.error(err);
        process.exit(1);
    }
}

migrate();
