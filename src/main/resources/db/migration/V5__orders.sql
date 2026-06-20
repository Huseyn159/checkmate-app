CREATE TABLE orders (
                        id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                        session_id   UUID NOT NULL REFERENCES table_sessions(id) ON DELETE CASCADE,
                        user_id      UUID NOT NULL REFERENCES users(id),
                        is_shared    BOOLEAN NOT NULL DEFAULT FALSE,
                        status       VARCHAR(20) NOT NULL DEFAULT 'PENDING',
                        total_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
                        created_at   TIMESTAMP NOT NULL DEFAULT now()
);
CREATE INDEX idx_orders_session ON orders(session_id);

CREATE TABLE order_items (
                             id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                             order_id     UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
                             menu_item_id UUID NOT NULL REFERENCES menu_items(id),
                             item_name    VARCHAR(255) NOT NULL,
                             quantity     INT NOT NULL,
                             unit_price   NUMERIC(10,2) NOT NULL
);
CREATE INDEX idx_order_items_order ON order_items(order_id);