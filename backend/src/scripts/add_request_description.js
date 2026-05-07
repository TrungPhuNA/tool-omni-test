const { QueryInterface, DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

async function migrate() {
    const queryInterface = sequelize.getQueryInterface();
    
    console.log('Adding description column to requests table...');
    
    try {
        const tableInfo = await queryInterface.describeTable('requests');

        if (!tableInfo.description) {
            await queryInterface.addColumn('requests', 'description', {
                type: DataTypes.TEXT,
                allowNull: true,
                after: 'url',
                comment: 'Mô tả chi tiết cho API'
            });
            console.log('Column description added successfully.');
        } else {
            console.log('Column description already exists.');
        }
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
}

migrate();
