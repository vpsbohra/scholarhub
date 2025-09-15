'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(q, S) {
    await q.addColumn('csr_donors', 'password_hash', {
      type: S.STRING(255), allowNull: false, defaultValue: ''
    });
    // optional: drop default after backfilling real passwords
    // await q.changeColumn('csr_donors', 'password_hash', { type: S.STRING(255), allowNull: false });
  },

async down(q) { await q.removeColumn('csr_donors', 'password_hash'); }
};
