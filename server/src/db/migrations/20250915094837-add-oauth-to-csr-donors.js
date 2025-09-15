'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
 async up(q, S) {
    await q.addColumn('csr_donors', 'provider',   { type: S.ENUM('local','google'), allowNull: false, defaultValue: 'local' });
    await q.addColumn('csr_donors', 'provider_id',{ type: S.STRING(64), allowNull: true });
  },
  async down(q) {
    await q.removeColumn('csr_donors', 'provider_id');
    await q.removeColumn('csr_donors', 'provider');
  }
};
