package com.floop.checkmate_app.order.repository;

import com.floop.checkmate_app.order.domain.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface OrderRepository extends JpaRepository<Order, UUID> {
    List<Order> findBySessionId(UUID sessionId);
    List<Order> findBySessionIdIn(List<UUID> sessionIds);
}