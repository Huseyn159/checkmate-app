CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE users (
                       id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                       email         VARCHAR(255) UNIQUE NOT NULL,
                       password_hash VARCHAR(255),
                       full_name     VARCHAR(255),
                       phone         VARCHAR(50),
                       avatar_url    VARCHAR(500),
                       role          VARCHAR(20) NOT NULL DEFAULT 'CUSTOMER',
                       trust_score   INT NOT NULL DEFAULT 50,
                       created_at    TIMESTAMP NOT NULL DEFAULT now(),
                       updated_at    TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX idx_users_email ON users(email);