'use strict';

/** @type {import('sequelize-cli').Migration} */

module.exports = {
  async up(queryInterface, Sequelize) {
    const S = Sequelize;

    // 1) Add columns only if missing
    const table = await queryInterface.describeTable('scholarships');
    if (!table.status) {
      await queryInterface.addColumn('scholarships', 'status', {
        type: S.ENUM('draft','active','closed','archived'),
        allowNull: false,
        defaultValue: 'draft',
      });
    }
    if (!table.updated_at) {
      await queryInterface.addColumn('scholarships', 'updated_at', {
        type: S.DATE,
        allowNull: false,
        defaultValue: S.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
      });
    }

    // 2) Add indexes only if missing
    const indexes = await queryInterface.showIndex('scholarships');
    const hasDonorIdx = indexes.some(i => i.name === 'idx_scholarships_donor_id');
    const hasStatusDatesIdx = indexes.some(i => i.name === 'idx_scholarships_status_dates');

    // NOTE: donor_id index already exists from the original table creation; skip if present
    if (!hasDonorIdx) {
      await queryInterface.addIndex('scholarships', ['donor_id'], { name: 'idx_scholarships_donor_id' });
    }

    if (!hasStatusDatesIdx) {
      await queryInterface.addIndex(
        'scholarships',
        ['status', 'start_date', 'end_date'],
        { name: 'idx_scholarships_status_dates' }
      );
    }
  },

  async down(queryInterface /*, Sequelize */) {
    // Drop indexes/columns only if they exist
    const indexes = await queryInterface.showIndex('scholarships');
    const hasStatusDatesIdx = indexes.some(i => i.name === 'idx_scholarships_status_dates');
    if (hasStatusDatesIdx) {
      await queryInterface.removeIndex('scholarships', 'idx_scholarships_status_dates');
    }
    // We do NOT remove idx_scholarships_donor_id here since it pre-existed.

    const table = await queryInterface.describeTable('scholarships');
    if (table.updated_at) await queryInterface.removeColumn('scholarships', 'updated_at');
    if (table.status)     await queryInterface.removeColumn('scholarships', 'status');
  }
};

