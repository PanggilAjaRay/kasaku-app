// database/seeds/20240101000001-initial-data.js
const bcrypt = require('bcrypt');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Hash password
    const passwordHash = await bcrypt.hash('password123', 10);
    
    // Create initial user
    const userId = await queryInterface.bulkInsert('users', [{
      email: 'admin@kasaku.com',
      password_hash: passwordHash,
      company_name: 'PT Kasaku Indonesia',
      admin_name: 'Admin Kasaku',
      created_at: new Date()
    }], { returning: true });

    // Create subscription
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1); // 1 bulan dari sekarang
    
    await queryInterface.bulkInsert('subscriptions', [{
      user_id: userId,
      plan: 'PRO',
      start_date: new Date(),
      end_date: endDate,
      status: 'ACTIVE'
    }]);

    // Create addons
    await queryInterface.bulkInsert('addons', [{
      user_id: userId,
      manufacturing: false,
      restaurant: false,
      plus_advance: false,
      custom_branding: false
    }]);

    // Create sample transactions
    await queryInterface.bulkInsert('transactions', [
      {
        id: 'TRX-001',
        user_id: userId,
        date: '2023-10-25',
        description: 'Pembayaran Invoice #INV-001',
        amount: 5000000,
        type: 'income',
        category: 'Penjualan',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 'TRX-002',
        user_id: userId,
        date: '2023-10-24',
        description: 'Beli Kertas A4',
        amount: 45000,
        type: 'expense',
        category: 'Perlengkapan Kantor',
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);

    // Create sample invoice
    await queryInterface.bulkInsert('invoices', [{
      id: 'INV-2023-001',
      user_id: userId,
      customer_name: 'PT Teknologi Maju',
      issue_date: '2023-10-25',
      due_date: '2023-11-25',
      total_amount: 12500000,
      status: 'PENDING',
      items: JSON.stringify([
        { description: 'Jasa Development Website', quantity: 1, price: 10000000 },
        { description: 'Jasa Maintenance', quantity: 1, price: 2500000 }
      ]),
      created_at: new Date(),
      updated_at: new Date()
    }]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('transactions', null, {});
    await queryInterface.bulkDelete('invoices', null, {});
    await queryInterface.bulkDelete('addons', null, {});
    await queryInterface.bulkDelete('subscriptions', null, {});
    await queryInterface.bulkDelete('users', null, {});
  }
};