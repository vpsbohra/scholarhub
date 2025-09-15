'use strict';

/** @type {import('sequelize-cli').Migration} */

module.exports = {
  async up(queryInterface, Sequelize) {
    const S = Sequelize;

    await queryInterface.createTable('scholarships', {
      scholarship_id: { type: S.BIGINT, allowNull: false, autoIncrement: true, primaryKey: true },

      scholarship_name:    { type: S.STRING(200), allowNull: false },
      description:         { type: S.TEXT, allowNull: true },
      eligibility_criteria:{ type: S.TEXT, allowNull: true },

      amount:     { type: S.DECIMAL(12,2), allowNull: false },
      start_date: { type: S.DATEONLY, allowNull: false },
      end_date:   { type: S.DATEONLY, allowNull: false },

      donor_id:   { type: S.BIGINT, allowNull: true },

      created_at: { type: S.DATE, allowNull: false, defaultValue: S.literal('CURRENT_TIMESTAMP') },
    });

    // Foreign key -> csr_donors(donor_id)
    await queryInterface.addConstraint('scholarships', {
      fields: ['donor_id'],
      type: 'foreign key',
      name: 'fk_scholarships_donor',
      references: { table: 'csr_donors', field: 'donor_id' },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT', // matches typical MySQL default; change to 'SET NULL' if you prefer
    });

    // Helpful indexes
    await queryInterface.addIndex('scholarships', ['donor_id'], { name: 'idx_scholarships_donor_id' });
    await queryInterface.addIndex('scholarships', ['start_date', 'end_date'], { name: 'idx_scholarships_dates' });
    await queryInterface.addIndex('scholarships', ['scholarship_name'], { name: 'idx_scholarships_name' });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('scholarships');
  }
};

