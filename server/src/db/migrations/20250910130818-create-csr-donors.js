'use strict';

/** @type {import('sequelize-cli').Migration} */

module.exports = {
  async up(queryInterface, Sequelize) {
    const S = Sequelize;

    await queryInterface.createTable('csr_donors', {
      donor_id: { type: S.BIGINT, allowNull: false, autoIncrement: true, primaryKey: true },

      organization_name: { type: S.STRING(200), allowNull: true },
      contact_person:    { type: S.STRING(150), allowNull: true },

      email:        { type: S.STRING(150), allowNull: true },   // UNIQUE but nullable, as per your DDL
      phone_number: { type: S.STRING(15),  allowNull: true },

      pan_number: { type: S.STRING(20), allowNull: true },      // UNIQUE

      address: { type: S.TEXT, allowNull: true },
      city:    { type: S.STRING(100), allowNull: true },
      state:   { type: S.STRING(100), allowNull: true },
      pincode: { type: S.STRING(10),  allowNull: true },

      total_contribution: { type: S.DECIMAL(12,2), allowNull: true, defaultValue: 0 },

      created_at: { type: S.DATE, allowNull: true, defaultValue: S.literal('CURRENT_TIMESTAMP') },
    });

    // Unique constraints
    await queryInterface.addConstraint('csr_donors', {
      fields: ['email'],
      type: 'unique',
      name: 'uq_csr_donors_email',
    });
    await queryInterface.addConstraint('csr_donors', {
      fields: ['pan_number'],
      type: 'unique',
      name: 'uq_csr_donors_pan_number',
    });

    // Helpful indexes (optional, safe)
    await queryInterface.addIndex('csr_donors', ['organization_name'], { name: 'idx_csr_donors_org_name' });
    await queryInterface.addIndex('csr_donors', ['city'], { name: 'idx_csr_donors_city' });
    await queryInterface.addIndex('csr_donors', ['state'], { name: 'idx_csr_donors_state' });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('csr_donors');
  }
};
