package com.floop.checkmate_app.payment.repository;

import com.floop.checkmate_app.payment.domain.SessionPayment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;

public interface SessionPaymentRepository extends JpaRepository<SessionPayment, UUID> {
    List<SessionPayment> findBySessionId(UUID sessionId);
    boolean existsBySessionIdAndUserId(UUID sessionId, UUID userId);
    Optional<SessionPayment> findBySessionIdAndUserId(UUID sessionId, UUID userId);
}