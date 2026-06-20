package com.floop.checkmate_app.table_entity.repository;

import com.floop.checkmate_app.table_entity.domain.RestaurantTable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface RestaurantTableRepository extends JpaRepository<RestaurantTable, UUID> {
    List<RestaurantTable> findByRestaurantId(UUID restaurantId);

}