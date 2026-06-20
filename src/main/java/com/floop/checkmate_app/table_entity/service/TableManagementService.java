package com.floop.checkmate_app.table_entity.service;

import com.floop.checkmate_app.table_entity.dto.CreateTableRequest;
import com.floop.checkmate_app.table_entity.dto.TableDto;

public interface TableManagementService {
    TableDto addTable(java.util.UUID restaurantId, java.util.UUID ownerId, CreateTableRequest req);
    java.util.List<TableDto> getTables(java.util.UUID restaurantId, java.util.UUID ownerId);
    void deleteTable(java.util.UUID tableId, java.util.UUID ownerId);
}
