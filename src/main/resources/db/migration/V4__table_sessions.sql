CREATE TABLE table_sessions (
                                id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                                reservation_id UUID NOT NULL REFERENCES reservations(id),
                                restaurant_id  UUID NOT NULL REFERENCES restaurants(id),
                                table_id       UUID NOT NULL REFERENCES restaurant_tables(id),
                                status         VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
                                started_at     TIMESTAMP NOT NULL DEFAULT now(),
                                closed_at      TIMESTAMP
);
CREATE INDEX idx_sessions_reservation ON table_sessions(reservation_id);

CREATE TABLE table_session_participants (
                                            id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                                            session_id UUID NOT NULL REFERENCES table_sessions(id) ON DELETE CASCADE,
                                            user_id    UUID NOT NULL REFERENCES users(id),
                                            joined_at  TIMESTAMP NOT NULL DEFAULT now(),
                                            UNIQUE (session_id, user_id)
);