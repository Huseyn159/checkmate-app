package com.floop.checkmate_app.table_entity.dto;

import java.util.List;
import java.util.UUID;

public record FloorTableDto(UUID id, String tableNumber, Integer capacity,
                            String zone, List<String> features, boolean available, boolean tight) {}