package com.floop.checkmate_app.restaurant.repository;

import com.floop.checkmate_app.restaurant.domain.Restaurant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import java.util.UUID;

public interface RestaurantRepository
        extends JpaRepository<Restaurant, UUID>, JpaSpecificationExecutor<Restaurant> {
    java.util.List<com.floop.checkmate_app.restaurant.domain.Restaurant> findByOwnerId(java.util.UUID ownerId);

    boolean existsByVoen(String voen);

    java.util.List<Restaurant> findByStatus(com.floop.checkmate_app.restaurant.domain.RestaurantStatus status);

}