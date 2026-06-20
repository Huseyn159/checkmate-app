package com.floop.checkmate_app.reservation.service;

import com.floop.checkmate_app.session.domain.SessionStatus;
import com.floop.checkmate_app.session.repository.TableSessionRepository;
import com.floop.checkmate_app.common.exception.*;
import com.floop.checkmate_app.common.lock.RedisLockService;
import com.floop.checkmate_app.reservation.domain.*;
import com.floop.checkmate_app.reservation.dto.*;
import com.floop.checkmate_app.reservation.repository.ReservationRepository;
import com.floop.checkmate_app.table_entity.domain.RestaurantTable;
import com.floop.checkmate_app.table_entity.repository.RestaurantTableRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.security.SecureRandom;
import java.time.*;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReservationServiceImpl implements ReservationService {

    private final ReservationRepository reservationRepository;
    private final RestaurantTableRepository tableRepository;
    private final RedisLockService redisLock;
    private final ReservationMapper mapper;
    private final TableSessionRepository sessionRepository;

    private static final ZoneId APP_ZONE = ZoneId.of("Asia/Baku");
    private static final int SLOT_MINUTES = 120;          // bir rezerv 2 saat tutur
    private static final LocalTime PEAK_START = LocalTime.of(19, 0);
    private static final LocalTime PEAK_END   = LocalTime.of(21, 0);
    private static final List<ReservationStatus> ACTIVE = List.of(
            ReservationStatus.PENDING, ReservationStatus.CONFIRMED, ReservationStatus.ARRIVED);
    private static final SecureRandom RANDOM = new SecureRandom();
    private static final int BLOCK_GAP = 60;    // <1 saat → bağlı
    private static final int TIGHT_GAP = 120;   // 1–2 saat → təsdiq lazım

    @Override
    @Transactional
    public ReservationResponse create(UUID userId, CreateReservationRequest req) {
        LocalDateTime when = LocalDateTime.of(req.date(), req.time());
        if (when.isBefore(LocalDateTime.now(APP_ZONE).plusHours(2))) {
            throw new ApiException("Ən tezi 2 saat sonraya rezerv etmək olar", HttpStatus.BAD_REQUEST);
        }

        String lockKey = "lock:reservation:%s:%s:%s".formatted(req.restaurantId(), req.date(), req.time());
        String token = redisLock.tryLock(lockKey, Duration.ofSeconds(10));
        if (token == null) {
            throw new ApiException("Sistem məşğuldur, bir az sonra yenidən cəhd et", HttpStatus.CONFLICT);
        }
        try {
            List<RestaurantTable> tables = tableRepository.findByRestaurantId(req.restaurantId());
            if (tables.isEmpty()) throw new ResourceNotFoundException("Bu restoranda masa yoxdur");

            int reqMin = req.time().toSecondOfDay() / 60;

            // həmin gün aktiv rezervlər: masa → saatlar (dəq)
            Map<UUID, List<Integer>> resMinsByTable = new HashMap<>();
            for (Reservation r : reservationRepository.findActiveByRestaurantAndDate(req.restaurantId(), req.date(), ACTIVE)) {
                if (r.getTableId() == null || r.getReservationTime() == null) continue;
                resMinsByTable.computeIfAbsent(r.getTableId(), k -> new ArrayList<>())
                        .add(r.getReservationTime().toSecondOfDay() / 60);
            }

            // bugün oturulmuş masalar (açıq sessiya) → bağlı
            Set<UUID> seated = new HashSet<>();
            if (req.date().equals(LocalDate.now(APP_ZONE))) {
                sessionRepository.findByRestaurantId(req.restaurantId()).stream()
                        .filter(s -> s.getStatus() == SessionStatus.ACTIVE && s.getTableId() != null)
                        .forEach(s -> seated.add(s.getTableId()));
            }

            RestaurantTable bestFree = null; int bestFreeScore = Integer.MIN_VALUE;
            RestaurantTable bestTight = null; int bestTightScore = Integer.MIN_VALUE;
            int bestTightGap = 0, bestTightOtherMin = 0;

            for (RestaurantTable t : tables) {
                if (t.getCapacity() < req.partySize()) continue;
                if (seated.contains(t.getId())) continue;

                int nearest = Integer.MAX_VALUE, nearestOther = -1;
                for (int em : resMinsByTable.getOrDefault(t.getId(), List.of())) {
                    int gap = Math.abs(reqMin - em);
                    if (gap < nearest) { nearest = gap; nearestOther = em; }
                }
                if (nearest < BLOCK_GAP) continue;       // <1 saat → bağlı
                int sc = score(t, req);
                if (nearest >= TIGHT_GAP) {               // sərbəst
                    if (sc > bestFreeScore) { bestFree = t; bestFreeScore = sc; }
                } else {                                   // sıx (1–2 saat)
                    if (sc > bestTightScore) { bestTight = t; bestTightScore = sc; bestTightGap = nearest; bestTightOtherMin = nearestOther; }
                }
            }

            RestaurantTable chosen;
            if (bestFree != null) {
                chosen = bestFree;
            } else if (bestTight != null) {
                if (!Boolean.TRUE.equals(req.confirm())) {
                    LocalTime other = LocalTime.ofSecondOfDay(bestTightOtherMin * 60L);
                    throw new ApiException(
                            "CONFIRM_TIGHT::Bu saatda yalnız sıx masa var. Yaxın rezerv saat %s-dədir — təxminən %d dəq vaxtın olacaq. Davam edək?"
                                    .formatted(other, bestTightGap),
                            HttpStatus.CONFLICT);
                }
                chosen = bestTight;
            } else {
                throw new ApiException("Bu saata uyğun boş masa yoxdur", HttpStatus.CONFLICT);
            }

            BigDecimal deposit = calculateDeposit(req.time());
            String code = generateUniqueSessionCode();
            Reservation reservation = Reservation.builder()
                    .userId(userId).restaurantId(req.restaurantId()).tableId(chosen.getId())
                    .reservationDate(req.date()).reservationTime(req.time()).partySize(req.partySize())
                    .specialNote(req.specialNote()).status(ReservationStatus.PENDING)
                    .depositAmount(deposit).sessionCode(code).qrCode(code).build();
            reservationRepository.save(reservation);
            return mapper.toResponse(reservation, chosen);
        } finally {
            redisLock.unlock(lockKey, token);
        }
    }

    /** Masa tutuludur: eyni saata rezerv VAR, və ya hazırda açıq sessiyası var (bugün). */
    private Set<UUID> occupiedTableIds(UUID restaurantId, LocalDate date, LocalTime time) {
        Set<UUID> occupied = new HashSet<>();

        // 1) Eyni saata aktiv rezerv (qoşa-rezervin qarşısı)
        reservationRepository.findActiveByRestaurantAndDate(restaurantId, date, ACTIVE).stream()
                .filter(r -> r.getTableId() != null && time.equals(r.getReservationTime()))
                .forEach(r -> occupied.add(r.getTableId()));

        // 2) Hazırda oturulmuş masa (açıq sessiya) — yalnız bugün üçün,
        //    restoran sessiyanı bağlayana qədər dolu (müddət dəyişkəndir)
        if (date.equals(LocalDate.now(APP_ZONE))) {
            sessionRepository.findByRestaurantId(restaurantId).stream()
                    .filter(s -> s.getStatus() == SessionStatus.ACTIVE && s.getTableId() != null)
                    .forEach(s -> occupied.add(s.getTableId()));
        }

        return occupied;
    }

    /** Masaya bal verir — yüksək bal = daha uyğun. */
    private int score(RestaurantTable t, CreateReservationRequest req) {
        // Az israf: 4 nəfəri 4-lük masaya, 10-luğa yox. Fərq nə qədər az, bal o qədər çox.
        int s = 100 - (t.getCapacity() - req.partySize()) * 10;

        // Zona uyğunluğu böyük bonus
        if (req.zone() != null && req.zone() == t.getZone()) {
            s += 50;
        }
        // Hər uyğun xüsusiyyət üçün bonus
        if (req.features() != null && t.getFeatures() != null) {
            long matches = req.features().stream().filter(t.getFeatures()::contains).count();
            s += (int) matches * 10;
        }
        return s;
    }

    /** Sadə deposit siyasəti: baza 5 AZN, peak saatda (19:00–21:00) +5 AZN. */
    private BigDecimal calculateDeposit(LocalTime time) {
        BigDecimal base = new BigDecimal("5.00");
        boolean peak = !time.isBefore(PEAK_START) && !time.isAfter(PEAK_END);
        return peak ? base.add(new BigDecimal("5.00")) : base;
    }

    private String generateUniqueSessionCode() {
        String code;
        do {
            code = String.format("%06d", RANDOM.nextInt(1_000_000));
        } while (reservationRepository.existsBySessionCode(code));
        return code;
    }

    @Override
    @Transactional
    public void cancel(UUID userId, UUID reservationId) {
        Reservation r = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new ResourceNotFoundException("Rezerv tapılmadı"));
        if (!r.getUserId().equals(userId)) {
            throw new ApiException("Bu rezerv sənə aid deyil", HttpStatus.FORBIDDEN);
        }
        if (r.getStatus() != ReservationStatus.PENDING
                && r.getStatus() != ReservationStatus.CONFIRMED) {
            throw new ApiException("Bu rezerv ləğv edilə bilməz", HttpStatus.BAD_REQUEST);
        }
        // 2 saat qaydası: burada refund siyasəti budaqlanardı (tam/yarı/sıfır).
        // MVP-də sadəcə ləğv edirik.
        r.setStatus(ReservationStatus.CANCELLED);
        r.setCancelledAt(Instant.now());
        reservationRepository.save(r);
    }

    @Override
    public List<ReservationResponse> getUserReservations(UUID userId) {
        return reservationRepository.findByUserIdOrderByReservationDateDesc(userId).stream()
                .map(r -> {
                    RestaurantTable t = tableRepository.findById(r.getTableId()).orElse(null);
                    return mapper.toResponse(r, t != null ? t : placeholder());
                })
                .toList();
    }

    private RestaurantTable placeholder() {
        return RestaurantTable.builder()
                .tableNumber("-").zone(com.floop.checkmate_app.table_entity.domain.TableZone.MAIN)
                .build();
    }
}