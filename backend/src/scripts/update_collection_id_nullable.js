const { QueryInterface, DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

async function migrate() {
    const queryInterface = sequelize.getQueryInterface();
    
    console.log('Updating collection_id to be nullable in collection_shares...');
    
    // Sử dụng changeColumn để cho phép null
    await queryInterface.changeColumn('collection_shares', 'collection_id', {
        type: DataTypes.INTEGER,
        allowNull: true
    });
    
    console.log('Update successful.');
    process.exit(0);
}

migrate().catch(err => {
    console.error('Migration failed:', err);
    process.exit(1);
});
