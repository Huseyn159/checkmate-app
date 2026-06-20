package com.floop.checkmate_app.order.repository;

import com.floop.checkmate_app.order.domain.OrderShare;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface OrderShareRepository extends JpaRepository<OrderShare, UUID> {
    List<OrderShare> findByOrderId(UUID orderId);
}