'use strict';

/** @type {import('sequelize-cli').Migration} */

module.exports = {
  async up(queryInterface, Sequelize) {
    const S = Sequelize;

    await queryInterface.createTable('applications', {
      application_id: { type: S.BIGINT, allowNull: false, autoIncrement: true, primaryKey: true },

      student_id:     { type: S.BIGINT, allowNull: false },
      scholarship_id: { type: S.BIGINT, allowNull: false },

      application_date: { type: S.DATE, allowNull: false, defaultValue: S.literal('CURRENT_TIMESTAMP') },

      status: {
        type: S.ENUM('pending','approved','rejected','funded'),
        allowNull: false,
        defaultValue: 'pending'
      },

      remarks: { type: S.TEXT, allowNull: true },
    });

    // FKs
    await queryInterface.addConstraint('applications', {
      fields: ['student_id'],
      type: 'foreign key',
      name: 'fk_applications_student',
      references: { table: 'students', field: 'student_id' },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT', // change to 'CASCADE' or 'SET NULL' if you prefer
    });

    await queryInterface.addConstraint('applications', {
      fields: ['scholarship_id'],
      type: 'foreign key',
      name: 'fk_applications_scholarship',
      references: { table: 'scholarships', field: 'scholarship_id' },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT', // change as needed
    });

    // Helpful indexes
    await queryInterface.addIndex('applications', ['student_id'], { name: 'idx_applications_student_id' });
    await queryInterface.addIndex('applications', ['scholarship_id'], { name: 'idx_applications_scholarship_id' });
    await queryInterface.addIndex('applications', ['student_id','scholarship_id'], { name: 'idx_applications_student_scholarship' });

    // If you want to prevent duplicate applications per (student, scholarship), make it UNIQUE instead:
    // await queryInterface.addConstraint('applications', {
    //   fields: ['student_id','scholarship_id'],
    //   type: 'unique',
    //   name: 'uq_applications_student_scholarship',
    // });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('applications');
  }
};

