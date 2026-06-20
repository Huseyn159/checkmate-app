package com.floop.checkmate_app.review.repository;


import com.floop.checkmate_app.review.domain.Review;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import java.util.*;

public interface ReviewRepository extends JpaRepository<Review, UUID> {
    List<Review> findByRestaurantIdOrderByCreatedAtDesc(UUID restaurantId);
    Optional<Review> findByUserIdAndRestaurantId(UUID userId, UUID restaurantId);
    long countByRestaurantId(UUID restaurantId);

    @Query("select avg(r.rating) from Review r where r.restaurantId = :rid")
    Double avgByRestaurantId(@Param("rid") UUID restaurantId);
}