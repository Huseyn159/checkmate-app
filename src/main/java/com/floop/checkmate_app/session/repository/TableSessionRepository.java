package com.floop.checkmate_app.session.repository;

import com.floop.checkmate_app.session.domain.TableSession;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface TableSessionRepository extends JpaRepository<TableSession, UUID> {
    Optional<TableSession> findByReservationId(UUID reservationId);
    List<TableSession> findByRestaurantId(UUID restaurantId);
}