CREATE TABLE order_proposals (
                                 id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                                 session_id   UUID NOT NULL REFERENCES table_sessions(id) ON DELETE CASCADE,
                                 proposer_id  UUID NOT NULL REFERENCES users(id),
                                 status       VARCHAR(20) NOT NULL DEFAULT 'OPEN',
                                 created_at   TIMESTAMP NOT NULL DEFAULT now(),
                                 finalized_at TIMESTAMP
);
CREATE INDEX idx_proposals_session ON order_proposals(session_id);

CREATE TABLE proposal_items (
                                id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                                proposal_id  UUID NOT NULL REFERENCES order_proposals(id) ON DELETE CASCADE,
                                menu_item_id UUID NOT NULL REFERENCES menu_items(id),
                                item_name    VARCHAR(255) NOT NULL,
                                quantity     INT NOT NULL,
                                unit_price   NUMERIC(10,2) NOT NULL
);

CREATE TABLE proposal_votes (
                                id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                                proposal_id UUID NOT NULL REFERENCES order_proposals(id) ON DELETE CASCADE,
                                user_id     UUID NOT NULL REFERENCES users(id),
                                approve     BOOLEAN NOT NULL,
                                voted_at    TIMESTAMP NOT NULL DEFAULT now(),
                                UNIQUE (proposal_id, user_id)
);

CREATE TABLE order_shares (
                              id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                              order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
                              user_id  UUID NOT NULL REFERENCES users(id),
                              UNIQUE (order_id, user_id)
);