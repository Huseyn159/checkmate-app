CREATE TABLE restaurants (
                             id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                             owner_id      UUID REFERENCES users(id),
                             name          VARCHAR(255) NOT NULL,
                             description   TEXT,
                             category      VARCHAR(100),
                             price_range   VARCHAR(20) NOT NULL DEFAULT 'MODERATE',
                             address       VARCHAR(500),
                             latitude      DOUBLE PRECISION,
                             longitude     DOUBLE PRECISION,
                             phone         VARCHAR(50),
                             cover_url     VARCHAR(500),
                             status        VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
                             avg_rating    NUMERIC(2,1) NOT NULL DEFAULT 0.0,
                             total_ratings INT NOT NULL DEFAULT 0,
                             created_at    TIMESTAMP NOT NULL DEFAULT now(),
                             updated_at    TIMESTAMP NOT NULL DEFAULT now()
);
CREATE INDEX idx_restaurants_category    ON restaurants(category);
CREATE INDEX idx_restaurants_price_range ON restaurants(price_range);

CREATE TABLE menu_categories (
                                 id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                                 restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
                                 name          VARCHAR(150) NOT NULL,
                                 display_order INT NOT NULL DEFAULT 0
);
CREATE INDEX idx_menu_categories_restaurant ON menu_categories(restaurant_id);

CREATE TABLE menu_items (
                            id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                            restaurant_id     UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
                            category_id       UUID NOT NULL REFERENCES menu_categories(id) ON DELETE CASCADE,
                            name              VARCHAR(255) NOT NULL,
                            description       TEXT,
                            price             NUMERIC(10,2) NOT NULL,
                            image_url         VARCHAR(500),
                            is_available      BOOLEAN NOT NULL DEFAULT TRUE,
                            avg_rating        NUMERIC(2,1) NOT NULL DEFAULT 0.0,
                            prep_time_minutes INT,
                            created_at        TIMESTAMP NOT NULL DEFAULT now()
);
CREATE INDEX idx_menu_items_restaurant ON menu_items(restaurant_id);
CREATE INDEX idx_menu_items_category   ON menu_items(category_id);