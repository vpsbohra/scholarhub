const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const User = sequelize.define('User', {
  id:    { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
  email: { type: DataTypes.STRING(120), allowNull: false, unique: true, validate: { isEmail: true } },
  name:  { type: DataTypes.STRING(80), allowNull: false },

  // If your column in DB is snake_case:
  passwordHash: { type: DataTypes.STRING(255), allowNull: false, field: 'password_hash' },

  // Admin roles
  role: { type: DataTypes.ENUM('admin','superadmin'), allowNull: false, defaultValue: 'admin' },
}, {
  tableName: 'users',
  timestamps: true,
  underscored: true,          // created_at, updated_at
});

module.exports = User;
