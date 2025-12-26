-- Seed data for testing
USE kasaku_db;

-- Insert default admin user (password: admin123)
-- Hash generated with: bcrypt.hashSync('admin123', 10)
INSERT INTO users (email, password_hash, company_name, admin_name, role) VALUES 
('admin@kasaku.com', '$2b$10$8EqYyt.oZpJWNKMHX9hC3.kB9YqRJPEJZJ3U3kJpvQqvyZ0jmGqxa', 'PT Maju Bersama', 'Budi Santoso', 'admin');

-- Get the user ID (will be 1 for first insert)
SET @userId = LAST_INSERT_ID();

-- Insert license
INSERT INTO licenses (user_id, status, plan, days_left, addon_manufacturing, addon_restaurant, addon_plus_advance, addon_custom_branding) VALUES
(@userId, 'OK', 'PRO', 30, TRUE, TRUE, TRUE, FALSE);

-- Insert sample transactions
INSERT INTO transactions (id, user_id, date, description, amount, type, category) VALUES
('TRX-001', @userId, '2023-12-20', 'Pembayaran Invoice #INV-001', 5000000, 'income', 'Penjualan'),
('TRX-002', @userId, '2023-12-19', 'Beli Kertas A4', 45000, 'expense', 'Perlengkapan Kantor'),
('TRX-003', @userId, '2023-12-18', 'Biaya Listrik Desember', 1200000, 'expense', 'Utilitas');

-- Insert sample clients
INSERT INTO clients (id, user_id, name, company, email, phone, status, total_revenue) VALUES
('C-001', @userId, 'Budi Santoso', 'PT Teknologi Maju', 'budi@tekmaju.com', '081234567890', 'ACTIVE', 45000000),
('C-002', @userId, 'Siti Aminah', 'CV Berkah Abadi', 'siti@berkah.co.id', '081987654321', 'ACTIVE', 12500000);

-- Insert sample invoices
INSERT INTO invoices (id, user_id, customer_name, date, due_date, amount, status) VALUES
('INV-2023-001', @userId, 'PT Teknologi Maju', '2023-12-20', '2024-01-20', 12500000, 'PENDING'),
('INV-2023-002', @userId, 'CV Berkah Abadi', '2023-12-15', '2024-01-15', 3200000, 'PAID');

-- Insert sample projects
INSERT INTO projects (id, user_id, name, client_id, client_name, status, progress, due_date, budget) VALUES
('P-001', @userId, 'Website Redesign', 'C-001', 'PT Teknologi Maju', 'IN_PROGRESS', 75, '2024-01-15', 15000000);

-- Insert raw materials for manufacturing
INSERT INTO inventory (id, user_id, name, category, unit, cost_per_unit, current_stock, min_stock_alert) VALUES
('RM-001', @userId, 'Kayu Jati Solid', 'RAW_MATERIAL', 'meter', 150000, 45, 10),
('RM-002', @userId, 'Cat Varnish', 'RAW_MATERIAL', 'kaleng', 85000, 12, 5),
('RM-003', @userId, 'Sekrup Baja 5cm', 'RAW_MATERIAL', 'pcs', 500, 1500, 200);

-- Insert BOM (using JSON for items)
INSERT INTO boms (id, user_id, product_name, estimated_cost, items) VALUES
('BOM-001', @userId, 'Meja Makan Jati (Standard)', 650000, JSON_ARRAY(
  JSON_OBJECT('materialId', 'RM-001', 'qtyRequired', 3.5),
  JSON_OBJECT('materialId', 'RM-002', 'qtyRequired', 1),
  JSON_OBJECT('materialId', 'RM-003', 'qtyRequired', 24)
));

-- Insert production order
INSERT INTO production_orders (id, user_id, bom_id, date, qty_produced, total_cost, status) VALUES
('PO-2312-01', @userId, 'BOM-001', '2023-12-20', 10, 6500000, 'IN_PROGRESS');

-- Insert menu items for restaurant
INSERT INTO menu_items (id, user_id, name, category, price, cogs) VALUES
('M01', @userId, 'Nasi Goreng Spesial', 'MAKANAN', 25000, 12000),
('M02', @userId, 'Ayam Bakar Madu', 'MAKANAN', 30000, 15000),
('M03', @userId, 'Mie Goreng Jawa', 'MAKANAN', 22000, 10000),
('M04', @userId, 'Es Teh Manis', 'MINUMAN', 5000, 1500),
('M05', @userId, 'Kopi Susu Gula Aren', 'MINUMAN', 18000, 6000),
('M06', @userId, 'Kentang Goreng', 'CEMILAN', 15000, 5000);
