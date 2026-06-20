ALTER TABLE restaurants ADD COLUMN voen VARCHAR(20);
ALTER TABLE restaurants ADD COLUMN rejection_reason TEXT;
ALTER TABLE restaurants ADD COLUMN trust_score INT NOT NULL DEFAULT 0;