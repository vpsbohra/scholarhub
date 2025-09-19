'use strict';

/** @type {import('sequelize-cli').Migration} */

module.exports = {
  async up(q, S) {
    const t = await q.describeTable('csr_donors');
    if (!t.status) {
      await q.addColumn('csr_donors', 'status', {
        type: S.ENUM('active','inactive'),
        allowNull: false,
        defaultValue: 'active',
      });
    }
    // optional index
    const idx = await q.showIndex('csr_donors');
    if (!idx.some(i => i.name === 'idx_csr_donors_status')) {
      await q.addIndex('csr_donors', ['status'], { name: 'idx_csr_donors_status' });
    }
  },
  async down(q) {
    // drop index first, then column (MySQL requires enum drop carefully)
    try { await q.removeIndex('csr_donors', 'idx_csr_donors_status'); } catch {}
    await q.removeColumn('csr_donors', 'status');
  }
};
