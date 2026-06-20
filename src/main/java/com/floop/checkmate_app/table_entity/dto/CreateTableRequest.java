package com.floop.checkmate_app.table_entity.dto;

import com.floop.checkmate_app.table_entity.domain.TableZone;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record CreateTableRequest(
        @NotNull Integer tableNumber,
        @NotNull @Min(1) Integer capacity,
        @NotNull TableZone zone,
        java.util.List<String> features) {}
