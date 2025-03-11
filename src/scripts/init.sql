
CREATE TABLE IF NOT EXISTS  vat (
    id INT PRIMARY KEY,
    vat_percentage DECIMAL(10,2) NOT NULL DEFAULT 0.00
);

CREATE TABLE IF NOT EXISTS notification (
    id INT PRIMARY KEY,
    message_en TEXT,
    message_ar TEXT,
    scheduled_timestamp DATETIME
);

CREATE TABLE IF NOT EXISTS review (
    id INT PRIMARY KEY,
    user_id INT,
    booking_id INT,
    created_timestamp DATETIME,
    rating INT
);

CREATE TABLE IF NOT EXISTS comment (
    id INT PRIMARY KEY,
    user_id INT,
    booking_id INT,
    created_timestamp DATETIME,
    rating INT
);

CREATE TABLE IF NOT EXISTS branch (
    id INT PRIMARY KEY,
    name_ar VARCHAR(1024),
    name_en VARCHAR(1024),
    city_en TEXT,
    city_ar TEXT,
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8)
);

CREATE TABLE IF NOT EXISTS banner (
    id INT PRIMARY KEY,
    image_english_url TEXT,
    image_arabic_url TEXT,
    link TEXT,
    created_timestamp DATETIME,
    start_timestamp DATETIME,
    end_timestamp DATETIME
);

CREATE TABLE IF NOT EXISTS user (
    id INT AUTO_INCREMENT PRIMARY KEY,
    is_admin BOOLEAN DEFAULT FALSE,
    full_name VARCHAR(1024),
    email_address VARCHAR(512) UNIQUE,
    phone_number VARCHAR(100) UNIQUE,
    national_id VARCHAR(512) UNIQUE,
    photo_url TEXT,
    password_hash VARCHAR(512),
    created_timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
);

CREATE TABLE IF NOT EXISTS setting (
    user_id INT PRIMARY KEY,
    push_notification_enabled BOOLEAN,
    email_notification_enabled BOOLEAN,
    sms_alert_enabled BOOLEAN,
    preferred_language ENUM('en', 'ar')
);