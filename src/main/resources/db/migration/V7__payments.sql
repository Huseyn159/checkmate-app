CREATE TABLE session_payments (
                                  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                                  session_id  UUID NOT NULL REFERENCES table_sessions(id) ON DELETE CASCADE,
                                  user_id     UUID NOT NULL REFERENCES users(id),
                                  amount      NUMERIC(10,2) NOT NULL,
                                  tip_amount  NUMERIC(10,2) NOT NULL DEFAULT 0,
                                  paid_at     TIMESTAMP NOT NULL DEFAULT now(),
                                  UNIQUE (session_id, user_id)
);
CREATE INDEX idx_payments_session ON session_payments(session_id);