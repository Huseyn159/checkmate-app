package com.floop.checkmate_app.restaurant.spec;

import com.floop.checkmate_app.restaurant.domain.*;
import org.springframework.data.jpa.domain.Specification;
import java.math.BigDecimal;

public final class RestaurantSpecifications {

    private RestaurantSpecifications() {}

    public static Specification<Restaurant> isActive() {
        return (root, query, cb) -> cb.equal(root.get("status"), RestaurantStatus.ACTIVE);
    }

    public static Specification<Restaurant> hasCategory(String category) {
        return (root, query, cb) -> (category == null || category.isBlank())
                ? null
                : cb.equal(cb.lower(root.get("category")), category.toLowerCase());
    }

    public static Specification<Restaurant> hasPriceRange(PriceRange priceRange) {
        return (root, query, cb) -> priceRange == null
                ? null
                : cb.equal(root.get("priceRange"), priceRange);
    }

    public static Specification<Restaurant> minRating(BigDecimal min) {
        return (root, query, cb) -> min == null
                ? null
                : cb.greaterThanOrEqualTo(root.get("avgRating"), min);
    }

    public static Specification<Restaurant> search(String term) {
        return (root, query, cb) -> {
            if (term == null || term.isBlank()) return null;
            String like = "%" + term.toLowerCase() + "%";
            return cb.or(
                    cb.like(cb.lower(root.get("name")), like),
                    cb.like(cb.lower(root.get("description")), like),
                    cb.like(cb.lower(root.get("category")), like)
            );
        };
    }
}