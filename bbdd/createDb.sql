USE master;
GO

IF EXISTS (SELECT * FROM sys.databases WHERE name = 'wandaDB')
BEGIN
    ALTER DATABASE wandaDB SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
    DROP DATABASE wandaDB;
END
GO

CREATE DATABASE wandaDB;
GO

USE wandaDB;
GO

-- =============================================
-- 2. CREACIÓN DE TABLAS (ESTRUCTURA)
-- =============================================

-- TABLA DE USUARIOS
CREATE TABLE USERS (
    user_id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(100) NOT NULL,
    email NVARCHAR(100) NOT NULL UNIQUE,
    password NVARCHAR(255) NOT NULL,
    role NVARCHAR(50) NOT NULL DEFAULT 'User' -- <--- AÑADIDO EL ROL AQUÍ
);

-- TABLA DE CUENTAS
CREATE TABLE ACCOUNTS (
    account_id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(100) NOT NULL,
    account_type NVARCHAR(20) NOT NULL CHECK (account_type IN ('personal', 'joint')),
    amount DECIMAL(18, 2) DEFAULT 0.00,
    weekly_budget DECIMAL(18, 2) NULL,
    monthly_budget DECIMAL(18, 2) NULL,
    account_picture_url NVARCHAR(100) NULL,
    creation_date DATETIME DEFAULT GETDATE() 
);

-- TABLA INTERMEDIA USUARIOS-CUENTAS (SIN ROLES)
CREATE TABLE ACCOUNT_USERS (
    user_id INT NOT NULL,
    account_id INT NOT NULL,
    joined_at DATETIME DEFAULT GETDATE(),
    PRIMARY KEY (user_id, account_id),
    CONSTRAINT FK_AccountUsers_User FOREIGN KEY (user_id) REFERENCES USERS(user_id) ON DELETE CASCADE,
    CONSTRAINT FK_AccountUsers_Account FOREIGN KEY (account_id) REFERENCES ACCOUNTS(account_id) ON DELETE CASCADE
);

-- TABLA DE OBJETIVOS DE AHORRO
CREATE TABLE OBJECTIVES (
    objective_id INT IDENTITY(1,1) PRIMARY KEY,
    account_id INT NOT NULL,
    name NVARCHAR(100) NOT NULL,
    target_amount DECIMAL(18, 2) NOT NULL,
    current_save DECIMAL(18, 2) DEFAULT 0.00,
    deadline DATE NULL,
    is_completed BIT DEFAULT 0,
    CONSTRAINT FK_Objectives_Account FOREIGN KEY (account_id) REFERENCES ACCOUNTS(account_id) ON DELETE CASCADE
);

-- TABLA DE TRANSACCIONES
CREATE TABLE TRANSACTIONS (
    transaction_id INT IDENTITY(1,1) PRIMARY KEY,
    account_id INT NOT NULL,
    user_id INT NOT NULL,
    category NVARCHAR(50) NOT NULL, 
    objective_id INT NULL, 
    amount DECIMAL(18, 2) NOT NULL,
    transaction_type NVARCHAR(20) NOT NULL CHECK (transaction_type IN ('income', 'expense', 'saving')),
    concept NVARCHAR(255),
    transaction_date DATETIME DEFAULT GETDATE(),
    isRecurring BIT DEFAULT 0,
    frequency NVARCHAR(20) NULL CHECK (frequency IN ('monthly', 'weekly', 'annual')),
    end_date DATE NULL,
    split_type NVARCHAR(20) NOT NULL CHECK (split_type IN ('individual', 'contribution', 'divided')),
    
    last_execution_date DATETIME NULL,
    
    CONSTRAINT FK_Transactions_Account FOREIGN KEY (account_id) REFERENCES ACCOUNTS(account_id) ON DELETE CASCADE,
    CONSTRAINT FK_Transactions_User FOREIGN KEY (user_id) REFERENCES USERS(user_id),
    CONSTRAINT FK_Transactions_Objective FOREIGN KEY (objective_id) REFERENCES OBJECTIVES(objective_id) ON DELETE NO ACTION 
);

-- TABLA DE REPARTO DE GASTOS (SPLITS)
CREATE TABLE TRANSACTION_SPLITS (
    split_id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NOT NULL,
    transaction_id INT NOT NULL,
    amount_assigned DECIMAL(18, 2) NOT NULL,
    status NVARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'settled')),
    
    paid_at DATETIME NULL,
    
    CONSTRAINT FK_Splits_User FOREIGN KEY (user_id) REFERENCES USERS(user_id),
    CONSTRAINT FK_Splits_Transaction FOREIGN KEY (transaction_id) REFERENCES TRANSACTIONS(transaction_id) ON DELETE CASCADE
);
GO

-- =============================================
-- 3. CARGA DE DATOS INICIALES (SEEDING)
-- =============================================

-- Usuarios (Password: Wanda123!)

INSERT INTO USERS (name, email, password, role) 
VALUES ('Admin', 'admin@gmail.com', '$2a$11$FPiUn.1ESFq4b7TcsiUVAuZipE0RS7rIHj9SuZwVltLzqpqeeRseO', 'Admin');

