'use strict';
const bcrypt = require('bcrypt');

module.exports = {
  async up(q) {
    const password_hash = await bcrypt.hash('Admin@123', 10);
    await q.bulkInsert('users', [{
      email: 'admin@scholarhub.local',
      name: 'System Admin',
      password_hash,               // or passwordHash if your column is camelCase
      role: 'superadmin',
      created_at: new Date(),
      updated_at: new Date()
    }], {});
  },
  async down(q) {
    await q.bulkDelete('users', { email: 'admin@scholarhub.local' }, {});
  }
};
