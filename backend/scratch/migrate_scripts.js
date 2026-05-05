const { sequelize } = require('../src/models');

async function migrate() {
  try {
    const queryInterface = sequelize.getQueryInterface();
    const tableInfo = await queryInterface.describeTable('requests');
    
    if (!tableInfo.pre_script) {
      await queryInterface.addColumn('requests', 'pre_script', {
        type: require('sequelize').DataTypes.TEXT,
        allowNull: true
      });
      console.log('Added pre_script column');
    }
    
    if (!tableInfo.post_script) {
      await queryInterface.addColumn('requests', 'post_script', {
        type: require('sequelize').DataTypes.TEXT,
        allowNull: true
      });
      console.log('Added post_script column');
    }
    
    console.log('Migration completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrate();
