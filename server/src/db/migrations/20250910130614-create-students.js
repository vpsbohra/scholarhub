'use strict';

/** @type {import('sequelize-cli').Migration} */

module.exports = {
  async up(queryInterface, Sequelize) {
    const S = Sequelize;

    await queryInterface.createTable('students', {
      student_id: { type: S.BIGINT, allowNull: false, autoIncrement: true, primaryKey: true },

      first_name: { type: S.STRING(100), allowNull: false },
      last_name:  { type: S.STRING(100), allowNull: false },

      aadhar_number: { type: S.CHAR(12), allowNull: true },
      email:         { type: S.STRING(150), allowNull: true },
      phone_number:  { type: S.STRING(15), allowNull: true },

      password_hash: { type: S.STRING(255), allowNull: false },

      dob:    { type: S.DATEONLY, allowNull: true },
      gender: { type: S.ENUM('Male','Female','Other'), allowNull: true },

      guardian_name: { type: S.STRING(150), allowNull: true },
      annual_income: { type: S.DECIMAL(10,2), allowNull: true },

      category: { type: S.ENUM('General','OBC','SC','ST','Other'), allowNull: true },

      address: { type: S.TEXT, allowNull: true },
      city:    { type: S.STRING(100), allowNull: true },
      state:   { type: S.STRING(100), allowNull: true },
      pincode: { type: S.STRING(10), allowNull: true },

      bank_account_no: { type: S.STRING(20), allowNull: true },
      ifsc_code:       { type: S.STRING(15), allowNull: true },

      documents_uploaded: { type: S.BOOLEAN, allowNull: false, defaultValue: false },
      email_verified:     { type: S.BOOLEAN, allowNull: false, defaultValue: false },
      phone_verified:     { type: S.BOOLEAN, allowNull: false, defaultValue: false },

      status: {
        type: S.ENUM('pending','verified','rejected','inactive'),
        allowNull: false,
        defaultValue: 'pending'
      },

      created_at: { type: S.DATE, allowNull: false, defaultValue: S.literal('CURRENT_TIMESTAMP') },
      // MySQL "ON UPDATE CURRENT_TIMESTAMP"
      updated_at: { type: S.DATE, allowNull: false, defaultValue: S.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP') },
    });

    // Uniques (as per your DDL)
    await queryInterface.addConstraint('students', {
      fields: ['aadhar_number'],
      type: 'unique',
      name: 'uq_students_aadhar_number'
    });
    await queryInterface.addConstraint('students', {
      fields: ['email'],
      type: 'unique',
      name: 'uq_students_email'
    });
    await queryInterface.addConstraint('students', {
      fields: ['phone_number'],
      type: 'unique',
      name: 'uq_students_phone_number'
    });

    // (Optional) handy indexes for queries
    await queryInterface.addIndex('students', ['status'], { name: 'idx_students_status' });
    await queryInterface.addIndex('students', ['city'],   { name: 'idx_students_city' });
    await queryInterface.addIndex('students', ['state'],  { name: 'idx_students_state' });
  },

  async down(queryInterface, Sequelize) {
    // Drop table first
    await queryInterface.dropTable('students');

    // Cleanup ENUM types if Sequelize created them (mostly relevant for Postgres; MySQL cleans with table)
    // In MySQL this is not strictly necessary, but safe to leave as comments:
    // await queryInterface.sequelize.query("DROP TYPE IF EXISTS enum_students_gender");
    // await queryInterface.sequelize.query("DROP TYPE IF EXISTS enum_students_category");
    // await queryInterface.sequelize.query("DROP TYPE IF EXISTS enum_students_status");
  }
};

