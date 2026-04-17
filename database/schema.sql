-- Database Outline for TrackWise

-- Note: The database must be created manually via your hosting control panel.
-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('employee', 'manager') NOT NULL DEFAULT 'employee',
    allowance DECIMAL(10,2) NOT NULL DEFAULT 10000.00
);

-- Categories Table
CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    threshold DECIMAL(10,2) NOT NULL DEFAULT 1000.00
);

-- Expenses Table
CREATE TABLE IF NOT EXISTS expenses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    category_id INT NOT NULL,
    description TEXT NOT NULL,
    bill_path VARCHAR(255) DEFAULT NULL,
    status ENUM('pending', 'approved', 'rejected', 'auto_approved') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

-- Initial Dummy Data
-- Default Admin Manager passwords are 'password123'
INSERT IGNORE INTO users (id, name, email, password_hash, role) VALUES 
(1, 'Admin Manager', 'adminm677@gmail.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'manager'),
(2, 'Test Employee', 'employee@trackwise.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'employee');

INSERT IGNORE INTO categories (id, name, threshold) VALUES 
(1, 'Travel', 5000.00),
(2, 'Food', 1000.00),
(3, 'Office Supplies', 2000.00),
(4, 'Internet & Software', 1500.00),
(5, 'Misc', 1000.00);
