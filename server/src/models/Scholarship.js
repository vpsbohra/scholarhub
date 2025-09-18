const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Scholarship = sequelize.define('Scholarship', {
  scholarship_id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
  scholarship_name: { type: DataTypes.STRING(200), allowNull: false },
  description: DataTypes.TEXT,
  eligibility_criteria: DataTypes.TEXT,
  amount: { type: DataTypes.DECIMAL(12,2), allowNull: false },
  start_date: { type: DataTypes.DATEONLY, allowNull: false },
  end_date: { type: DataTypes.DATEONLY, allowNull: false },
  donor_id: { type: DataTypes.BIGINT, allowNull: true },
  status: { type: DataTypes.ENUM('draft','active','closed','archived'), defaultValue: 'draft' },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, {
  tableName: 'scholarships',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  underscored: true,
});

module.exports = Scholarship;
