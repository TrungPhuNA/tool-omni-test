const { sequelize } = require('../src/models');
const { DataTypes } = require('sequelize');

/**
 * Script migration thủ công để cập nhật Database Schema
 * Chạy bằng lệnh: node scratch/migrate_scripts.js
 */
async function migrate() {
    try {
        await sequelize.authenticate();
        console.log('Kết nối database thành công.');

        const queryInterface = sequelize.getQueryInterface();

        // 1. Cập nhật bảng 'requests' (nếu thiếu script columns)
        const requestTable = await queryInterface.describeTable('requests');
        if (!requestTable.pre_script) {
            await queryInterface.addColumn('requests', 'pre_script', {
                type: DataTypes.TEXT,
                allowNull: true
            });
            console.log('✅ Đã thêm cột pre_script vào bảng requests');
        }

        if (!requestTable.post_script) {
            await queryInterface.addColumn('requests', 'post_script', {
                type: DataTypes.TEXT,
                allowNull: true
            });
            console.log('✅ Đã thêm cột post_script vào bảng requests');
        }

        // 2. Cập nhật bảng 'users' (Thêm role và status cho Admin Dashboard)
        const userTable = await queryInterface.describeTable('users');

        if (!userTable.role) {
            await queryInterface.addColumn('users', 'role', {
                type: DataTypes.ENUM('admin', 'user'),
                defaultValue: 'user',
                allowNull: false
            });
            console.log('✅ Đã thêm cột role vào bảng users');
        }

        if (!userTable.status) {
            await queryInterface.addColumn('users', 'status', {
                type: DataTypes.ENUM('active', 'inactive'),
                defaultValue: 'active',
                allowNull: false
            });
            console.log('✅ Đã thêm cột status vào bảng users');
        }

        console.log('🚀 Tất cả các bước migration đã hoàn thành thành công!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Migration thất bại:', error);
        process.exit(1);
    }
}

migrate();
