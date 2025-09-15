const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const CsrDonor = sequelize.define('CsrDonor', {
  donor_id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
  organization_name: { type: DataTypes.STRING(200), allowNull: false },
  contact_person: DataTypes.STRING(150),
  email: DataTypes.STRING(150),
  phone_number: DataTypes.STRING(15),
  pan_number: DataTypes.STRING(20),
  address: DataTypes.TEXT,
  city: DataTypes.STRING(100),
  state: DataTypes.STRING(100),
  pincode: DataTypes.STRING(10),
  total_contribution: { type: DataTypes.DECIMAL(12,2), defaultValue: 0 },
  password_hash: { type: DataTypes.STRING(255), allowNull: false }, // NEW
  provider: { type: DataTypes.ENUM('local','google'), defaultValue: 'local' },
  provider_id: { type: DataTypes.STRING(64) },

}, { tableName: 'csr_donors', timestamps: false, underscored: true });

module.exports = CsrDonor;
