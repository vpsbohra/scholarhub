const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const StudentDocument = sequelize.define('StudentDocument', {
  document_id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
  student_id:  { type: DataTypes.BIGINT, allowNull: false },
  doc_type:    { type: DataTypes.ENUM('id_proof','address_proof','education'), allowNull: false },
  title:       { type: DataTypes.STRING(200) },
  file_name:   { type: DataTypes.STRING(200), allowNull: false },
  file_path:   { type: DataTypes.STRING(255), allowNull: false },
  mime_type:   { type: DataTypes.STRING(100) },
  file_size:   { type: DataTypes.BIGINT },
  status:      { type: DataTypes.ENUM('pending','approved','rejected'), defaultValue: 'pending' },
  remarks:     { type: DataTypes.STRING(255) },
  uploaded_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  verified_at: { type: DataTypes.DATE, allowNull: true },
  verified_by: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true },
  checksum:    { type: DataTypes.STRING(64) },
}, {
  tableName: 'student_documents',
  timestamps: false,
  underscored: true,
});

module.exports = StudentDocument;
