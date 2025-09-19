'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(q, S) {
    await q.createTable('student_documents', {
      document_id: { type: S.BIGINT, primaryKey: true, autoIncrement: true },
      student_id:  { type: S.BIGINT, allowNull: false },
      doc_type:    { type: S.ENUM('id_proof','address_proof','education'), allowNull: false },
      title:       { type: S.STRING(200) },
      file_name:   { type: S.STRING(200), allowNull: false },
      file_path:   { type: S.STRING(255), allowNull: false },   // e.g. /uploads/students/123/abc.pdf
      mime_type:   { type: S.STRING(100) },
      file_size:   { type: S.BIGINT },
      status:      { type: S.ENUM('pending','approved','rejected'), allowNull: false, defaultValue: 'pending' },
      remarks:     { type: S.STRING(255) },
      uploaded_at: { type: S.DATE, allowNull: false, defaultValue: S.literal('CURRENT_TIMESTAMP') },
      verified_at: { type: S.DATE, allowNull: true },
      verified_by: { type: S.INTEGER.UNSIGNED, allowNull: true }, // users.id (admin) optional
      checksum:    { type: S.STRING(64) }, // sha256 (optional)
    }, {
      charset: 'utf8mb4',
      collate: 'utf8mb4_general_ci',
      engine: 'InnoDB',
    });

    await q.addConstraint('student_documents', {
      fields: ['student_id'],
      type: 'foreign key',
      name: 'fk_student_documents_student',
      references: { table: 'students', field: 'student_id' },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });

    await q.addIndex('student_documents', ['student_id'], { name: 'idx_sd_student' });
    await q.addIndex('student_documents', ['student_id','doc_type'], { name: 'idx_sd_student_doctype' });
    await q.addIndex('student_documents', ['status'], { name: 'idx_sd_status' });
  },

  async down(q) {
    await q.removeIndex('student_documents', 'idx_sd_status');
    await q.removeIndex('student_documents', 'idx_sd_student_doctype');
    await q.removeIndex('student_documents', 'idx_sd_student');
    await q.removeConstraint('student_documents', 'fk_student_documents_student');
    await q.dropTable('student_documents');
  }
};
