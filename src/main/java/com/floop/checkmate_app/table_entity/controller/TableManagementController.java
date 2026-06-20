package com.floop.checkmate_app.table_entity.controller;

import com.floop.checkmate_app.table_entity.dto.CreateTableRequest;
import com.floop.checkmate_app.table_entity.dto.TableDto;
import com.floop.checkmate_app.table_entity.service.TableManagementService;
import com.floop.checkmate_app.user.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/dashboard")
@RequiredArgsConstructor
public class TableManagementController {

    private final TableManagementService tableService;
    private final UserService userService;

    @GetMapping("/restaurants/{restaurantId}/tables")
    public List<TableDto> list(@AuthenticationPrincipal UserDetails p, @PathVariable UUID restaurantId) {
        return tableService.getTables(restaurantId, uid(p));
    }

    @PostMapping("/restaurants/{restaurantId}/tables")
    public TableDto add(@AuthenticationPrincipal UserDetails p, @PathVariable UUID restaurantId,
                        @Valid @RequestBody CreateTableRequest req) {
        return tableService.addTable(restaurantId, uid(p), req);
    }

    @DeleteMapping("/tables/{tableId}")
    public void delete(@AuthenticationPrincipal UserDetails p, @PathVariable UUID tableId) {
        tableService.deleteTable(tableId, uid(p));
    }

    private UUID uid(UserDetails p) { return userService.getByEmail(p.getUsername()).getId(); }
}