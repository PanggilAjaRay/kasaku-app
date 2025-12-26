-- Create database
CREATE DATABASE IF NOT EXISTS kasaku_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE kasaku_db;

-- Drop tables if they exist (in correct order due to foreign keys)
DROP TABLE IF EXISTS pos_order_items;
DROP TABLE IF EXISTS pos_orders;
DROP TABLE IF EXISTS menu_categories;
DROP TABLE IF EXISTS menu_items;
DROP TABLE IF EXISTS production_orders;
DROP TABLE IF EXISTS bom_items;
DROP TABLE IF EXISTS boms;
DROP TABLE IF EXISTS raw_materials;
DROP TABLE IF EXISTS calendar_events;
DROP TABLE IF EXISTS tasks;
DROP TABLE IF EXISTS projects;
DROP TABLE IF EXISTS clients;
DROP TABLE  IF EXISTS invoice_items;
DROP TABLE IF EXISTS invoices;
DROP TABLE IF EXISTS transactions;
DROP TABLE IF EXISTS invoice_settings;
DROP TABLE IF EXISTS user_profiles;
DROP TABLE IF EXISTS licenses;
DROP TABLE IF EXISTS users;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255),
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  company_name VARCHAR(255) DEFAULT 'PT Perusahaan Saya',
  admin_name VARCHAR(255) DEFAULT 'Admin',
  role ENUM('admin', 'user') DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Licenses
CREATE TABLE IF NOT EXISTS licenses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNIQUE,
  status ENUM('OK', 'EXPIRED', 'SUSPENDED') DEFAULT 'OK',
  plan ENUM('BASIC', 'PRO', 'ENTERPRISE') DEFAULT 'PRO',
  days_left INT DEFAULT 30,
  addon_manufacturing BOOLEAN DEFAULT FALSE,
  addon_restaurant BOOLEAN DEFAULT FALSE,
  addon_plus_advance BOOLEAN DEFAULT FALSE,
  addon_custom_branding BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Transactions
CREATE TABLE IF NOT EXISTS transactions (
  id VARCHAR(50) PRIMARY KEY,
  user_id INT,
  date DATE NOT NULL,
  description TEXT,
  amount DECIMAL(15,2) NOT NULL,
  type ENUM('income', 'expense') NOT NULL,
  category VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_date (user_id, date),
  INDEX idx_type (type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Invoices
CREATE TABLE IF NOT EXISTS invoices (
  id VARCHAR(50) PRIMARY KEY,
  user_id INT,
  customer_name VARCHAR(255) NOT NULL,
  date DATE NOT NULL,
  due_date DATE,
  amount DECIMAL(15,2) NOT NULL,
  status ENUM('PENDING', 'PAID', 'OVERDUE', 'CANCELLED') DEFAULT 'PENDING',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_status (user_id, status),
  INDEX idx_date (date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Invoice Items
CREATE TABLE IF NOT EXISTS invoice_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  invoice_id VARCHAR(50),
  description TEXT,
  quantity INT DEFAULT 1,
  price DECIMAL(15,2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Clients
CREATE TABLE IF NOT EXISTS clients (
  id VARCHAR(50) PRIMARY KEY,
  user_id INT,
  name VARCHAR(255) NOT NULL,
  company VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(50),
  status ENUM('ACTIVE', 'INACTIVE') DEFAULT 'ACTIVE',
  total_revenue DECIMAL(15,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_status (user_id, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Projects
CREATE TABLE IF NOT EXISTS projects (
  id VARCHAR(50) PRIMARY KEY,
  user_id INT,
  name VARCHAR(255) NOT NULL,
  client_id VARCHAR(50),
  client_name VARCHAR(255),
  status ENUM('PLANNING', 'IN_PROGRESS', 'COMPLETED', 'ON_HOLD') DEFAULT 'PLANNING',
  progress INT DEFAULT 0,
  due_date DATE,
  budget DECIMAL(15,2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE SET NULL,
  INDEX idx_user_status (user_id, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tasks
CREATE TABLE IF NOT EXISTS tasks (
  id VARCHAR(50) PRIMARY KEY,
  user_id INT,
  project_id VARCHAR(50),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status ENUM('TODO', 'IN_PROGRESS', 'COMPLETED') DEFAULT 'TODO',
  priority ENUM('LOW', 'MEDIUM', 'HIGH') DEFAULT 'MEDIUM',
  due_date DATE,
  assignee VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  INDEX idx_user_status (user_id, status),
  INDEX idx_project (project_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Calendar Events
CREATE TABLE IF NOT EXISTS calendar_events (
  id VARCHAR(50) PRIMARY KEY,
  user_id INT,
  title VARCHAR(255) NOT NULL,
  date DATE NOT NULL,
  type ENUM('CUSTOM', 'INVOICE_DUE', 'PROJECT_DUE', 'TASK_DUE') DEFAULT 'CUSTOM',
  related_id VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_date (user_id, date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Raw Materials (Manufacturing) - table name: inventory
CREATE TABLE IF NOT EXISTS inventory (
  id VARCHAR(50) PRIMARY KEY,
  user_id INT,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(50) DEFAULT 'RAW_MATERIAL',
  unit VARCHAR(50),
  cost_per_unit DECIMAL(15,2),
  current_stock DECIMAL(15,2) DEFAULT 0,
  min_stock_alert DECIMAL(15,2) DEFAULT 0,
  supplier VARCHAR(255),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bill of Materials (BOM)
CREATE TABLE IF NOT EXISTS boms (
  id VARCHAR(50) PRIMARY KEY,
  user_id INT,
  product_name VARCHAR(255) NOT NULL,
  estimated_cost DECIMAL(15,2),
  items JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Production Orders
CREATE TABLE IF NOT EXISTS production_orders (
  id VARCHAR(50) PRIMARY KEY,
  user_id INT,
  bom_id VARCHAR(50),
  date DATE NOT NULL,
  qty_produced INT,
  total_cost DECIMAL(15,2),
  status ENUM('IN_PROGRESS', 'COMPLETED') DEFAULT 'IN_PROGRESS',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (bom_id) REFERENCES boms(id) ON DELETE SET NULL,
  INDEX idx_user_status (user_id, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Menu Items (Restaurant)
CREATE TABLE IF NOT EXISTS menu_items (
 id VARCHAR(50) PRIMARY KEY,
  user_id INT,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100),
  price DECIMAL(15,2),
  cogs DECIMAL(15,2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_category (user_id, category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- POS Orders
CREATE TABLE IF NOT EXISTS pos_orders (
  id VARCHAR(50) PRIMARY KEY,
  user_id INT,
  date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  total DECIMAL(15,2),
  profit DECIMAL(15,2),
  payment_method ENUM('CASH', 'CARD', 'TRANSFER') DEFAULT 'CASH',
  items JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_date (user_id, date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
