'use strict';

/** @type {import('sequelize-cli').Migration} */

module.exports = {
  async up(queryInterface, Sequelize) {
    const S = Sequelize;

    await queryInterface.createTable('activity_logs', {
      log_id: { type: S.BIGINT, allowNull: false, autoIncrement: true, primaryKey: true },

      user_type: {                     // polymorphic: 'student' | 'donor' | 'admin'
        type: S.ENUM('student','donor','admin'),
        allowNull: false
      },

      user_id: { type: S.BIGINT, allowNull: false }, // refers to students.student_id / csr_donors.donor_id / admins.id, etc.

      action: { type: S.STRING(255), allowNull: false },

      created_at: { type: S.DATE, allowNull: false, defaultValue: S.literal('CURRENT_TIMESTAMP') },
    });

    // Helpful indexes for querying logs
    await queryInterface.addIndex('activity_logs', ['user_type', 'user_id'], { name: 'idx_activity_logs_actor' });
    await queryInterface.addIndex('activity_logs', ['created_at'], { name: 'idx_activity_logs_created_at' });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('activity_logs');
    // MySQL auto-cleans ENUM type with table; explicit DROP TYPE not needed here.
  }
};

