const { sequelize } = require('../src/models');

async function fixSchema() {
  const queryInterface = sequelize.getQueryInterface();
  
  console.log('--- Bắt đầu cập nhật cấu trúc Database ---');

  try {
    // 1. Thêm cột user_id vào bảng collections
    const collectionsTable = await queryInterface.describeTable('collections');
    if (!collectionsTable.user_id) {
      console.log('Đang thêm cột user_id vào bảng collections...');
      await queryInterface.addColumn('collections', 'user_id', {
        type: require('sequelize').DataTypes.INTEGER,
        allowNull: true,
        comment: 'ID của người dùng sở hữu collection này'
      });
      console.log('✅ Đã thêm cột user_id thành công.');
    } else {
      console.log('ℹ️ Cột user_id đã tồn tại trong bảng collections.');
    }

    // 2. Tạo bảng collection_shares nếu chưa có
    // Lưu ý: sequelize.sync() bình thường sẽ tự tạo bảng mới nếu nó chưa tồn tại, 
    // nhưng để chắc chắn, ta gọi sync riêng cho model này.
    const { CollectionShare } = require('../src/models');
    await CollectionShare.sync();
    console.log('✅ Bảng collection_shares đã sẵn sàng.');

    console.log('--- Cập nhật hoàn tất! ---');
    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi khi cập nhật cấu trúc:', error);
    process.exit(1);
  }
}

fixSchema();
