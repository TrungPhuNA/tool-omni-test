const { QueryInterface, DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

async function migrate() {
    const queryInterface = sequelize.getQueryInterface();
    const tableInfo = await queryInterface.describeTable('collection_shares');

    if (!tableInfo.folder_id) {
        console.log('Adding folder_id column to collection_shares...');
        await queryInterface.addColumn('collection_shares', 'folder_id', {
            type: DataTypes.INTEGER,
            allowNull: true,
            after: 'collection_id',
            comment: 'ID của folder nếu chia sẻ ở cấp độ folder'
        });
        console.log('Column folder_id added successfully.');
    } else {
        console.log('Column folder_id already exists.');
    }
    
    process.exit(0);
}

migrate().catch(err => {
    console.error('Migration failed:', err);
    process.exit(1);
});
