CREATE TABLE reviews (
                         id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                         user_id UUID NOT NULL REFERENCES users(id),
                         restaurant_id UUID NOT NULL REFERENCES restaurants(id),
                         user_full_name VARCHAR(255) NOT NULL,
                         rating INT NOT NULL,
                         comment VARCHAR(500),
                         created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
                         updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
                         CONSTRAINT uq_review_user_restaurant UNIQUE (user_id, restaurant_id)
);
CREATE INDEX idx_reviews_restaurant ON reviews(restaurant_id);