# create_db.sh
#!/bin/bash

# Create database directory if not exists
mkdir -p database

# Initialize database with schema
sqlite3 database/kasaku.db <<EOF
-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  company_name VARCHAR(255) DEFAULT 'PT Perusahaan Saya',
  admin_name VARCHAR(255) DEFAULT 'Admin',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  plan VARCHAR(50) DEFAULT 'FREE',
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status VARCHAR(50) DEFAULT 'ACTIVE',
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Addons table
CREATE TABLE IF NOT EXISTS addons (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER UNIQUE NOT NULL,
  manufacturing BOOLEAN DEFAULT 0,
  restaurant BOOLEAN DEFAULT 0,
  plus_advance BOOLEAN DEFAULT 0,
  custom_branding BOOLEAN DEFAULT 0,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id VARCHAR(50) PRIMARY KEY,
  user_id INTEGER NOT NULL,
  date DATE NOT NULL,
  description TEXT NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  type VARCHAR(20) NOT NULL,
  category VARCHAR(100) DEFAULT 'Umum',
  project_id VARCHAR(50),
  tax DECIMAL(10,2) DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Invoices table
CREATE TABLE IF NOT EXISTS invoices (
  id VARCHAR(50) PRIMARY KEY,
  user_id INTEGER NOT NULL,
  customer_name VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255),
  customer_phone VARCHAR(50),
  issue_date DATE NOT NULL,
  due_date DATE NOT NULL,
  total_amount DECIMAL(15,2) NOT NULL,
  tax_amount DECIMAL(10,2) DEFAULT 0,
  status VARCHAR(50) DEFAULT 'DRAFT',
  items JSON,
  payment_method VARCHAR(50) DEFAULT 'TRANSFER',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Clients table (Plus Advance)
CREATE TABLE IF NOT EXISTS clients (
  id VARCHAR(50) PRIMARY KEY,
  user_id INTEGER NOT NULL,
  name VARCHAR(255) NOT NULL,
  company VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  address TEXT,
  status VARCHAR(50) DEFAULT 'ACTIVE',
  total_revenue DECIMAL(15,2) DEFAULT 0,
  last_transaction_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Tasks table (Plus Advance)
CREATE TABLE IF NOT EXISTS tasks (
  id VARCHAR(50) PRIMARY KEY,
  user_id INTEGER NOT NULL,
  project_id VARCHAR(50),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  assignee VARCHAR(255),
  due_date DATE,
  status VARCHAR(50) DEFAULT 'TODO',
  priority VARCHAR(50) DEFAULT 'MEDIUM',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Calendar events table (Plus Advance)
CREATE TABLE IF NOT EXISTS calendar_events (
  id VARCHAR(50) PRIMARY KEY,
  user_id INTEGER NOT NULL,
  title VARCHAR(255) NOT NULL,
  date DATE NOT NULL,
  type VARCHAR(50) DEFAULT 'MEETING',
  description TEXT,
  start_time TIME,
  end_time TIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Inventory table (Manufacturing)
CREATE TABLE IF NOT EXISTS inventory (
  id VARCHAR(50) PRIMARY KEY,
  user_id INTEGER NOT NULL,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100) DEFAULT 'RAW_MATERIAL',
  unit VARCHAR(50) DEFAULT 'pcs',
  cost_per_unit DECIMAL(15,2) NOT NULL,
  current_stock DECIMAL(10,2) DEFAULT 0,
  min_stock_alert DECIMAL(10,2) DEFAULT 10,
  supplier VARCHAR(255),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- BOM table (Manufacturing)
CREATE TABLE IF NOT EXISTS boms (
  id VARCHAR(50) PRIMARY KEY,
  user_id INTEGER NOT NULL,
  product_name VARCHAR(255) NOT NULL,
  product_code VARCHAR(100),
  estimated_cost DECIMAL(15,2) DEFAULT 0,
  selling_price DECIMAL(15,2),
  items JSON,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Production orders table (Manufacturing)
CREATE TABLE IF NOT EXISTS production_orders (
  id VARCHAR(50) PRIMARY KEY,
  user_id INTEGER NOT NULL,
  bom_id VARCHAR(50) NOT NULL,
  order_date DATE NOT NULL,
  target_date DATE,
  quantity INTEGER NOT NULL,
  total_cost DECIMAL(15,2) DEFAULT 0,
  status VARCHAR(50) DEFAULT 'PLANNED',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (bom_id) REFERENCES boms(id)
);

-- Menu items table (Restaurant)
CREATE TABLE IF NOT EXISTS menu_items (
  id VARCHAR(50) PRIMARY KEY,
  user_id INTEGER NOT NULL,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  price DECIMAL(15,2) NOT NULL,
  cogs DECIMAL(15,2) DEFAULT 0,
  description TEXT,
  is_active BOOLEAN DEFAULT 1,
  image_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- POS orders table (Restaurant)
CREATE TABLE IF NOT EXISTS pos_orders (
  id VARCHAR(50) PRIMARY KEY,
  user_id INTEGER NOT NULL,
  order_date DATE NOT NULL,
  order_time TIME DEFAULT CURRENT_TIME,
  subtotal DECIMAL(15,2) NOT NULL,
  tax_amount DECIMAL(15,2) DEFAULT 0,
  total_amount DECIMAL(15,2) NOT NULL,
  payment_method VARCHAR(50) DEFAULT 'CASH',
  items JSON,
  customer_name VARCHAR(255),
  table_number VARCHAR(50),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Create indexes
CREATE INDEX idx_transactions_user_date ON transactions(user_id, date);
CREATE INDEX idx_invoices_user_status ON invoices(user_id, status);
CREATE INDEX idx_clients_user_status ON clients(user_id, status);
CREATE INDEX idx_tasks_user_project ON tasks(user_id, project_id);
CREATE INDEX idx_calendar_events_user_date ON calendar_events(user_id, date);
CREATE INDEX idx_inventory_user ON inventory(user_id);
CREATE INDEX idx_boms_user ON boms(user_id);
CREATE INDEX idx_production_orders_user_status ON production_orders(user_id, status);
CREATE INDEX idx_menu_items_user_category ON menu_items(user_id, category);
CREATE INDEX idx_pos_orders_user_date ON pos_orders(user_id, order_date);

-- Insert default user (password: admin123)
INSERT OR IGNORE INTO users (email, password_hash, company_name, admin_name) VALUES 
('admin@kasaku.com', '\$2b\$10\$YourHashedPasswordHere', 'PT Kasaku Indonesia', 'Admin Kasaku');

-- Insert default subscription
INSERT OR IGNORE INTO subscriptions (user_id, plan, start_date, end_date, status) VALUES 
(1, 'PRO', DATE('now'), DATE('now', '+30 days'), 'ACTIVE');

-- Insert default addons
INSERT OR IGNORE INTO addons (user_id, manufacturing, restaurant, plus_advance, custom_branding) VALUES 
(1, 1, 1, 1, 1);

EOF

echo "Database created successfully at database/kasaku.db"
echo "Database created successfully at database/kasaku.db"