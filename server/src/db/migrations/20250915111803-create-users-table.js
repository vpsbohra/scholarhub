'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const S = Sequelize;

    await queryInterface.createTable('users', {
      id: {
        type: S.INTEGER.UNSIGNED,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      email: {
        type: S.STRING(120),
        allowNull: false,
      },
      name: {
        type: S.STRING(80),
        allowNull: false,
      },
      password_hash: {
        type: S.STRING(255),
        allowNull: false,
      },
      created_at: {
        type: S.DATE,
        allowNull: false,
        defaultValue: S.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: S.DATE,
        allowNull: false,
        defaultValue: S.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
      },
      role: {
        type: S.ENUM('admin', 'superadmin'),
        allowNull: false,
        defaultValue: 'admin',
      },
    }, {
      charset: 'utf8mb4',
      collate: 'utf8mb4_general_ci',
      engine: 'InnoDB',
    });

    // Unique email constraint
    await queryInterface.addConstraint('users', {
      fields: ['email'],
      type: 'unique',
      name: 'uq_users_email',
    });
  },

  async down(queryInterface /*, Sequelize */) {
    await queryInterface.dropTable('users');
    // (MySQL cleans up ENUM with the table; no separate DROP TYPE needed.)
  }
};
