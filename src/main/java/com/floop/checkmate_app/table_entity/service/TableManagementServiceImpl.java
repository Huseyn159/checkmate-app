package com.floop.checkmate_app.table_entity.service;


import com.floop.checkmate_app.common.exception.ApiException;
import com.floop.checkmate_app.common.exception.ResourceNotFoundException;
import com.floop.checkmate_app.restaurant.domain.Restaurant;
import com.floop.checkmate_app.restaurant.repository.RestaurantRepository;
import com.floop.checkmate_app.table_entity.domain.RestaurantTable;
import com.floop.checkmate_app.table_entity.dto.CreateTableRequest;
import com.floop.checkmate_app.table_entity.dto.TableDto;
import com.floop.checkmate_app.table_entity.repository.RestaurantTableRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TableManagementServiceImpl implements TableManagementService {

    private final RestaurantTableRepository tableRepository;   // import yolunu uyğunlaşdır
    private final RestaurantRepository restaurantRepository;

    @Override
    @Transactional
    public TableDto addTable(UUID restaurantId, UUID ownerId, CreateTableRequest req) {
        verifyOwner(restaurantId, ownerId);
        RestaurantTable t = tableRepository.save(RestaurantTable.builder()
                .restaurantId(restaurantId)
                .tableNumber(String.valueOf(req.tableNumber()))
                .capacity(req.capacity())
                .zone(req.zone())
                .features(req.features() != null ? req.features() : java.util.List.of())
                .build());
        return toDto(t);
    }

    @Override
    public List<TableDto> getTables(UUID restaurantId, UUID ownerId) {
        verifyOwner(restaurantId, ownerId);
        return tableRepository.findByRestaurantId(restaurantId).stream().map(this::toDto).toList();
    }

    @Override @Transactional
    public void deleteTable(UUID tableId, UUID ownerId) {
        RestaurantTable t = tableRepository.findById(tableId)
                .orElseThrow(() -> new ResourceNotFoundException("Masa tapılmadı"));
        verifyOwner(t.getRestaurantId(), ownerId);
        tableRepository.delete(t);
    }

    private TableDto toDto(RestaurantTable t) {
        return new TableDto(t.getId(), t.getTableNumber(), t.getCapacity(),
                t.getZone().name(), t.getFeatures());
    }

    private void verifyOwner(UUID restaurantId, UUID ownerId) {
        Restaurant r = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new ResourceNotFoundException("Restoran tapılmadı"));
        if (!ownerId.equals(r.getOwnerId()))
            throw new ApiException("Bu restoran sənə aid deyil", HttpStatus.FORBIDDEN);
    }
}