const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Student = sequelize.define('Student', {
  student_id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
  first_name: DataTypes.STRING(100),
  last_name: DataTypes.STRING(100),
  aadhar_number: DataTypes.CHAR(12),
  email: DataTypes.STRING(150),
  phone_number: DataTypes.STRING(15),
  password_hash: DataTypes.STRING(255),
  dob: DataTypes.DATEONLY,
  gender: DataTypes.ENUM('Male','Female','Other'),
  guardian_name: DataTypes.STRING(150),
  annual_income: DataTypes.DECIMAL(10,2),
  category: DataTypes.ENUM('General','OBC','SC','ST','Other'),
  address: DataTypes.TEXT,
  city: DataTypes.STRING(100),
  state: DataTypes.STRING(100),
  pincode: DataTypes.STRING(10),
  bank_account_no: DataTypes.STRING(20),
  ifsc_code: DataTypes.STRING(15),
  documents_uploaded: { type: DataTypes.BOOLEAN, defaultValue: false },
  email_verified: { type: DataTypes.BOOLEAN, defaultValue: false },
  phone_verified: { type: DataTypes.BOOLEAN, defaultValue: false },
  status: { type: DataTypes.ENUM('pending','verified','rejected','inactive'), defaultValue: 'pending' },
  provider: { type: DataTypes.ENUM('local','google'), defaultValue: 'local' },
  provider_id: { type: DataTypes.STRING(64) },
}, { tableName: 'students', timestamps: true, createdAt: 'created_at', updatedAt: 'updated_at', underscored: true });

module.exports = Student;
