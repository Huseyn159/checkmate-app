package com.floop.checkmate_app.reservation.job;

import com.floop.checkmate_app.reservation.domain.Reservation;
import com.floop.checkmate_app.reservation.domain.ReservationStatus;
import com.floop.checkmate_app.reservation.repository.ReservationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;

@Component
@RequiredArgsConstructor
public class ReservationExpiryJob {

    private static final ZoneId APP_ZONE = ZoneId.of("Asia/Baku");
    private final ReservationRepository reservationRepository;

    /** Hər dəqiqə: vaxtından 1 saat keçmiş, hələ gəlməmiş rezervləri NO_SHOW edir. */
    @Scheduled(fixedDelay = 60_000)
    @Transactional
    public void expireNoShows() {
        LocalDateTime now = LocalDateTime.now(APP_ZONE);
        List<Reservation> active = reservationRepository.findByStatusIn(
                List.of(ReservationStatus.PENDING, ReservationStatus.CONFIRMED));
        for (Reservation r : active) {
            LocalDateTime when = LocalDateTime.of(r.getReservationDate(), r.getReservationTime());
            if (when.plusHours(1).isBefore(now)) {
                r.setStatus(ReservationStatus.NO_SHOW);
                r.setCancelledAt(Instant.now());
                reservationRepository.save(r);
            }
        }
    }
}