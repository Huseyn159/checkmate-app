package com.floop.checkmate_app.table_entity.dto;
import java.util.UUID;

public record TableDto(UUID id, String tableNumber, Integer capacity,
                       String zone, java.util.List<String> features) {}