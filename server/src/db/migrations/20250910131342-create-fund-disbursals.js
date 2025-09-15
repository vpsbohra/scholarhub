'use strict';

/** @type {import('sequelize-cli').Migration} */

module.exports = {
  async up(queryInterface, Sequelize) {
    const S = Sequelize;

    await queryInterface.createTable('fund_disbursals', {
      disbursal_id: { type: S.BIGINT, allowNull: false, autoIncrement: true, primaryKey: true },

      application_id:   { type: S.BIGINT, allowNull: false },
      disbursed_amount: { type: S.DECIMAL(12, 2), allowNull: false },

      disbursal_date: { type: S.DATE, allowNull: false, defaultValue: S.literal('CURRENT_TIMESTAMP') },

      transaction_reference: { type: S.STRING(100), allowNull: true },
    });

    // FK -> applications(application_id)
    await queryInterface.addConstraint('fund_disbursals', {
      fields: ['application_id'],
      type: 'foreign key',
      name: 'fk_fund_disbursals_application',
      references: { table: 'applications', field: 'application_id' },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT', // change to 'CASCADE' if you want disbursals deleted with applications
    });

    // Helpful indexes
    await queryInterface.addIndex('fund_disbursals', ['application_id'], { name: 'idx_fund_disbursals_application_id' });
    await queryInterface.addIndex('fund_disbursals', ['disbursal_date'], { name: 'idx_fund_disbursals_date' });
    await queryInterface.addIndex('fund_disbursals', ['transaction_reference'], { name: 'idx_fund_disbursals_tx_ref' });

    // If transaction_reference must be unique, use this instead:
    await queryInterface.addConstraint('fund_disbursals', {
      fields: ['transaction_reference'],
      type: 'unique',
      name: 'uq_fund_disbursals_tx_ref',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('fund_disbursals');
  }
};

