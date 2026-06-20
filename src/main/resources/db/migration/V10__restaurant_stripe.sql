ALTER TABLE restaurants
    ADD COLUMN stripe_account_id VARCHAR(255),
    ADD COLUMN charges_enabled   BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN payouts_enabled   BOOLEAN NOT NULL DEFAULT FALSE;