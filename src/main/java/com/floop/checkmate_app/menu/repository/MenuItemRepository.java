package com.floop.checkmate_app.menu.repository;

import com.floop.checkmate_app.menu.domain.MenuItem;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface MenuItemRepository extends JpaRepository<MenuItem, UUID> {
    List<MenuItem> findByRestaurantId(UUID restaurantId);
    Boolean existsByRestaurantId(UUID restaurantId);
    void deleteByCategoryId(UUID categoryId);
    List<MenuItem> findByNameContainingIgnoreCase(String name);
}