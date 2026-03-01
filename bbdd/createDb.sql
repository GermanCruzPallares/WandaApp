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
-- <--- SE HA AÑADIDO EL ROL EN LOS INSERTS --->
INSERT INTO USERS (name, email, password, role) 
VALUES ('Ana García', 'ana@wanda.com', '$2a$12$MQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4hZ1.Gce3C', 'Admin');

INSERT INTO USERS (name, email, password, role) 
VALUES ('Juan Pérez', 'juan@wanda.com', '$2a$12$MQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4hZ1.Gce3C', 'User');

INSERT INTO USERS (name, email, password, role) 
VALUES ('Admin', 'admin@gmail.com', '$2a$11$FPiUn.1ESFq4b7TcsiUVAuZipE0RS7rIHj9SuZwVltLzqpqeeRseO', 'Admin');

-- Cuentas 
INSERT INTO ACCOUNTS (name, account_type, amount, weekly_budget, monthly_budget) 
VALUES ('Ahorros Ana', 'personal', 1500.00, 100.00, 400.00); 

INSERT INTO ACCOUNTS (name, account_type, amount, weekly_budget, monthly_budget) 
VALUES ('Cuenta Juan', 'personal', 1200.00, 80.00, 350.00); 

-- Cuenta conjunta (Sin saldo inicial)
INSERT INTO ACCOUNTS (name, account_type) 
VALUES ('Casa Ana y Juan', 'joint'); 

-- Relación Usuarios <-> Cuentas (SIN ROLES)
INSERT INTO ACCOUNT_USERS (user_id, account_id) VALUES (1, 1); 
INSERT INTO ACCOUNT_USERS (user_id, account_id) VALUES (2, 2); 
INSERT INTO ACCOUNT_USERS (user_id, account_id) VALUES (1, 3); 
INSERT INTO ACCOUNT_USERS (user_id, account_id) VALUES (2, 3);

-- Objetivos de Ahorro
INSERT INTO OBJECTIVES (account_id, name, target_amount, current_save, deadline)
VALUES (1, 'Viaje Japón', 3000.00, 0.00, '2026-12-01');

-- Transacciones 
INSERT INTO TRANSACTIONS (account_id, user_id, category, objective_id, amount, transaction_type, concept, split_type)
VALUES (1, 1, 'Ocio', 1, 100.00, 'saving', 'Aportación Japón', 'individual');

INSERT INTO TRANSACTIONS (account_id, user_id, category, amount, transaction_type, concept, split_type)
VALUES (3, 2, 'Hogar', 50.00, 'expense', 'Fibra Óptica', 'contribution');

INSERT INTO TRANSACTIONS (account_id, user_id, category, amount, transaction_type, concept, split_type)
VALUES (3, 1, 'Comida', 60.00, 'expense', 'Cena Viernes', 'divided'); 


-- *** TODOS LOS EJEMPLOS DE GASTOS FRECUENTES (EXPENSE) ***
INSERT INTO TRANSACTIONS (account_id, user_id, category, objective_id, amount, transaction_type, concept, split_type, isRecurring, frequency, end_date) VALUES 
-- 1. Semanal e Indefinido (sin fecha fin)
(1, 1, 'Otros', NULL, 25.00, 'expense', 'Clases particulares de guitarra', 'individual', 1, 'weekly', NULL),
-- 2. Semanal y Definido (con fecha fin)
(1, 1, 'Alimentación', NULL, 30.00, 'expense', 'Cesta de fruta local', 'individual', 1, 'weekly', '2026-06-30'),
-- 3. Mensual e Indefinido (sin fecha fin)
(1, 1, 'Suscripciones', NULL, 12.99, 'expense', 'Suscripción Netflix Premium', 'individual', 1, 'monthly', NULL),
-- 4. Mensual y Definido (con fecha fin)
(1, 1, 'Salud', NULL, 125.00, 'expense', 'Tratamiento de Ortodoncia', 'individual', 1, 'monthly', '2026-12-31'),
-- 5. Anual e Indefinido (sin fecha fin)
(1, 1, 'Facturas', NULL, 450.00, 'expense', 'Seguro del Hogar a todo riesgo', 'individual', 1, 'annual', NULL),
-- 6. Anual y Definido (con fecha fin)
(1, 1, 'Ocio', NULL, 180.00, 'expense', 'Abono Socio Club Deportivo', 'individual', 1, 'annual', '2028-06-01');
-- *** TODOS LOS EJEMPLOS DE INGRESOS FRECUENTES (INCOME) ***
INSERT INTO TRANSACTIONS (account_id, user_id, category, objective_id, amount, transaction_type, concept, split_type, isRecurring, frequency, end_date) VALUES 
-- 7. Semanal e Indefinido (sin fecha fin)
(1, 1, 'Freelance', NULL, 150.00, 'income', 'Mantenimiento web cliente', 'individual', 1, 'weekly', NULL),
-- 8. Semanal y Definido (con fecha fin)
(1, 1, 'Venta', NULL, 40.00, 'income', 'Pago a plazos portátil vendido', 'individual', 1, 'weekly', '2026-04-15'),
-- 9. Mensual e Indefinido (sin fecha fin)
(1, 1, 'Salario', NULL, 2500.00, 'income', 'Nómina principal', 'individual', 1, 'monthly', NULL),
-- 10. Mensual y Definido (con fecha fin)
(1, 1, 'Freelance', NULL, 800.00, 'income', 'Proyecto consultoría temporal', 'individual', 1, 'monthly', '2026-09-01'),
-- 11. Anual e Indefinido (sin fecha fin)
(1, 1, 'Inversión', NULL, 600.00, 'income', 'Rentabilidad Fondo Abierto', 'individual', 1, 'annual', NULL),
-- 12. Anual y Definido (con fecha fin)
(1, 1, 'Inversión', NULL, 1000.00, 'income', 'Letra del Tesoro / Bono', 'individual', 1, 'annual', '2028-01-01');




-- Reparto de Gastos
INSERT INTO TRANSACTION_SPLITS (user_id, transaction_id, amount_assigned, status)
VALUES (1, 3, 30.00, 'settled');
INSERT INTO TRANSACTION_SPLITS (user_id, transaction_id, amount_assigned, status)
VALUES (2, 3, 30.00, 'pending');
GO