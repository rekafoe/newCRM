-- PostgreSQL schema for CRM System
-- Initial migration

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255),
    role VARCHAR(50) DEFAULT 'user',
    api_token VARCHAR(255) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    number VARCHAR(50) UNIQUE NOT NULL,
    status INTEGER DEFAULT 1,
    total_amount INTEGER DEFAULT 0,
    prepayment_amount INTEGER DEFAULT 0,
    prepayment_status VARCHAR(50),
    payment_method VARCHAR(50),
    customer_email VARCHAR(255),
    user_id INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Order items table
CREATE TABLE IF NOT EXISTS order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
    type VARCHAR(255) NOT NULL,
    params JSONB,
    price INTEGER NOT NULL,
    quantity INTEGER DEFAULT 1,
    printer_id INTEGER,
    sides INTEGER DEFAULT 1,
    sheets INTEGER DEFAULT 1,
    waste INTEGER DEFAULT 0,
    clicks INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Materials table
CREATE TABLE IF NOT EXISTS materials (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    unit VARCHAR(50) DEFAULT 'шт',
    current_stock INTEGER DEFAULT 0,
    min_stock INTEGER DEFAULT 0,
    max_stock INTEGER DEFAULT 0,
    cost_per_unit INTEGER DEFAULT 0,
    supplier_id INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Suppliers table
CREATE TABLE IF NOT EXISTS suppliers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    contact_info TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Photo orders table (for Telegram bot)
CREATE TABLE IF NOT EXISTS photo_orders (
    id SERIAL PRIMARY KEY,
    chat_id VARCHAR(50) NOT NULL,
    username VARCHAR(100),
    first_name VARCHAR(100),
    original_photos TEXT[],
    selected_size JSONB,
    processing_options JSONB,
    quantity INTEGER DEFAULT 1,
    total_price INTEGER DEFAULT 0,
    status VARCHAR(50) DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User order pages table
CREATE TABLE IF NOT EXISTS user_order_pages (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    user_name VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'active',
    total_orders INTEGER DEFAULT 0,
    completed_orders INTEGER DEFAULT 0,
    total_revenue INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, date)
);

-- User order page orders table
CREATE TABLE IF NOT EXISTS user_order_page_orders (
    id SERIAL PRIMARY KEY,
    page_id INTEGER REFERENCES user_order_pages(id) ON DELETE CASCADE,
    order_id INTEGER NOT NULL,
    order_type VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    notes TEXT,
    UNIQUE(order_id, order_type)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_materials_category ON materials(category);
CREATE INDEX IF NOT EXISTS idx_photo_orders_chat_id ON photo_orders(chat_id);
CREATE INDEX IF NOT EXISTS idx_photo_orders_status ON photo_orders(status);
CREATE INDEX IF NOT EXISTS idx_user_order_pages_user_id_date ON user_order_pages(user_id, date);
CREATE INDEX IF NOT EXISTS idx_user_order_page_orders_page_id ON user_order_page_orders(page_id);

-- Insert default admin user
INSERT INTO users (name, email, role, api_token) 
VALUES ('Admin', 'admin@crm.local', 'admin', 'admin-token-123')
ON CONFLICT (email) DO NOTHING;

-- Insert default order statuses (will be handled by application)
-- This is just for reference
