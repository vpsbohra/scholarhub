const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const CsrDonor = sequelize.define('CsrDonor', {
  donor_id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
  organization_name: { type: DataTypes.STRING(200), allowNull: false },
  contact_person: { type: DataTypes.STRING(150) },
  email: { type: DataTypes.STRING(150), unique: true },
  phone_number: { type: DataTypes.STRING(15) },
  pan_number: { type: DataTypes.STRING(20), unique: true },
  address: { type: DataTypes.TEXT },
  city: { type: DataTypes.STRING(100) },
  state: { type: DataTypes.STRING(100) },
  pincode: { type: DataTypes.STRING(10) },
  total_contribution: { type: DataTypes.DECIMAL(12,2), defaultValue: 0 },
  password_hash: { type: DataTypes.STRING(255) },           // if you added it earlier
  status: { type: DataTypes.ENUM('active','inactive'), defaultValue: 'inactive', allowNull: false },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, {
  tableName: 'csr_donors',
  timestamps: false,
  underscored: true,
});

module.exports = CsrDonor;
