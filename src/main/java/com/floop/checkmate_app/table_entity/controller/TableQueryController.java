package com.floop.checkmate_app.table_entity.controller;

import com.floop.checkmate_app.reservation.domain.ReservationStatus;
import com.floop.checkmate_app.reservation.repository.ReservationRepository;
import com.floop.checkmate_app.session.domain.SessionStatus;
import com.floop.checkmate_app.session.repository.TableSessionRepository;
import com.floop.checkmate_app.table_entity.domain.RestaurantTable;
import com.floop.checkmate_app.table_entity.dto.FloorTableDto;
import com.floop.checkmate_app.table_entity.dto.TableOptionsDto;
import com.floop.checkmate_app.table_entity.repository.RestaurantTableRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZoneId;
import java.util.*;

@RestController
@RequestMapping("/api/v1/restaurants")
@RequiredArgsConstructor
public class TableQueryController {

    private static final ZoneId APP_ZONE = ZoneId.of("Asia/Baku");

    private final RestaurantTableRepository tableRepository;
    private final ReservationRepository reservationRepository;
    private final TableSessionRepository sessionRepository;

    @GetMapping("/{restaurantId}/table-options")
    public TableOptionsDto options(@PathVariable UUID restaurantId) {
        List<RestaurantTable> tables = tableRepository.findByRestaurantId(restaurantId);
        List<String> zones = tables.stream().map(t -> t.getZone().name()).distinct().sorted().toList();
        List<String> features = tables.stream()
                .flatMap(t -> (t.getFeatures() == null ? List.<String>of() : t.getFeatures()).stream())
                .distinct().sorted().toList();
        return new TableOptionsDto(zones, features);
    }

    @GetMapping("/{restaurantId}/floor")
    public List<FloorTableDto> floor(
            @PathVariable UUID restaurantId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam @DateTimeFormat(pattern = "HH:mm") LocalTime time) {

        List<RestaurantTable> tables = tableRepository.findByRestaurantId(restaurantId);
        int reqMin = time.toSecondOfDay() / 60;

        Map<UUID, List<Integer>> resMins = new HashMap<>();
        reservationRepository.findActiveByRestaurantAndDate(restaurantId, date,
                        List.of(ReservationStatus.PENDING, ReservationStatus.CONFIRMED, ReservationStatus.ARRIVED))
                .forEach(r -> { if (r.getTableId() != null && r.getReservationTime() != null)
                    resMins.computeIfAbsent(r.getTableId(), k -> new ArrayList<>())
                            .add(r.getReservationTime().toSecondOfDay() / 60); });

        Set<UUID> seated = new HashSet<>();
        if (date.equals(LocalDate.now(APP_ZONE))) {
            sessionRepository.findByRestaurantId(restaurantId).stream()
                    .filter(s -> s.getStatus() == SessionStatus.ACTIVE && s.getTableId() != null)
                    .forEach(s -> seated.add(s.getTableId()));
        }

        return tables.stream()
                .sorted(Comparator.comparing((RestaurantTable t) -> t.getZone().name())
                        .thenComparing(RestaurantTable::getTableNumber))
                .map(t -> {
                    boolean available, tight;
                    if (seated.contains(t.getId())) { available = false; tight = false; }
                    else {
                        int nearest = Integer.MAX_VALUE;
                        for (int em : resMins.getOrDefault(t.getId(), List.of()))
                            nearest = Math.min(nearest, Math.abs(reqMin - em));
                        if (nearest < 60) { available = false; tight = false; }
                        else if (nearest < 120) { available = false; tight = true; }
                        else { available = true; tight = false; }
                    }
                    return new FloorTableDto(t.getId(), t.getTableNumber(), t.getCapacity(),
                            t.getZone().name(), t.getFeatures(), available, tight);
                }).toList();
    }
}