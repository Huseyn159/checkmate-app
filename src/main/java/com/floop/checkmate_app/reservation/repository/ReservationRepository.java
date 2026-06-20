package com.floop.checkmate_app.reservation.repository;

import com.floop.checkmate_app.reservation.domain.*;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import java.time.LocalDate;
import java.util.*;

public interface ReservationRepository extends JpaRepository<Reservation, UUID> {


    //bosh masalari hesablamaq ucun
    @Query("""
        select r from Reservation r
        where r.restaurantId = :restaurantId
          and r.reservationDate = :date
          and r.status in :statuses
    """)
    List<Reservation> findActiveByRestaurantAndDate(
            @Param("restaurantId") UUID restaurantId,
            @Param("date") LocalDate date,
            @Param("statuses") Collection<ReservationStatus> statuses);

    List<Reservation> findByUserIdOrderByReservationDateDesc(UUID userId);


    boolean existsBySessionCode(String sessionCode);
    Optional<Reservation> findBySessionCode(String sessionCode);
    List<Reservation> findByRestaurantIdOrderByReservationDateAscReservationTimeAsc(UUID restaurantId);
    boolean existsByUserIdAndRestaurantId(UUID userId, UUID restaurantId);
    List<Reservation> findByStatusIn(Collection<ReservationStatus> statuses);
}