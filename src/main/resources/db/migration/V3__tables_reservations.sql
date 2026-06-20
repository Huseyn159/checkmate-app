CREATE TABLE restaurant_tables (
                                   id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                                   restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
                                   table_number  VARCHAR(50) NOT NULL,
                                   capacity      INT NOT NULL,
                                   zone          VARCHAR(20) NOT NULL DEFAULT 'MAIN',
                                   features      JSONB,
                                   created_at    TIMESTAMP NOT NULL DEFAULT now()
);
CREATE INDEX idx_tables_restaurant ON restaurant_tables(restaurant_id);

CREATE TABLE reservations (
                              id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                              user_id          UUID NOT NULL REFERENCES users(id),
                              restaurant_id    UUID NOT NULL REFERENCES restaurants(id),
                              table_id         UUID NOT NULL REFERENCES restaurant_tables(id),
                              reservation_date DATE NOT NULL,
                              reservation_time TIME NOT NULL,
                              party_size       INT NOT NULL,
                              special_note     VARCHAR(500),
                              status           VARCHAR(20) NOT NULL DEFAULT 'PENDING',
                              deposit_amount   NUMERIC(10,2) NOT NULL DEFAULT 0,
                              deposit_paid_at  TIMESTAMP,
                              arrived_at       TIMESTAMP,
                              cancelled_at     TIMESTAMP,
                              qr_code          VARCHAR(100),
                              session_code     VARCHAR(6),
                              created_at       TIMESTAMP NOT NULL DEFAULT now(),
                              updated_at       TIMESTAMP NOT NULL DEFAULT now()
);
CREATE INDEX idx_reservations_lookup ON reservations(restaurant_id, reservation_date, status);
CREATE INDEX idx_reservations_user   ON reservations(user_id, status);