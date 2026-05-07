const { sequelize } = require('../models');

async function addDocumentationColumn() {
  try {
    const queryInterface = sequelize.getQueryInterface();
    const tableDefinition = await queryInterface.describeTable('requests');
    
    if (!tableDefinition.documentation) {
      await queryInterface.addColumn('requests', 'documentation', {
        type: require('sequelize').DataTypes.TEXT,
        allowNull: true,
        comment: 'Tài liệu hướng dẫn chi tiết (Markdown)'
      });
      console.log('Column "documentation" added successfully.');
    } else {
      console.log('Column "documentation" already exists.');
    }
  } catch (error) {
    console.error('Error adding column:', error);
  } finally {
    await sequelize.close();
  }
}

addDocumentationColumn();
