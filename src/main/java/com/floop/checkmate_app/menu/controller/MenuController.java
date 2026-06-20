package com.floop.checkmate_app.menu.controller;

import com.floop.checkmate_app.menu.dto.MenuCategoryDto;
import com.floop.checkmate_app.menu.service.MenuService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/restaurants/{restaurantId}/menu")
@RequiredArgsConstructor
public class MenuController {

    private final MenuService menuService;

    @GetMapping
    public List<MenuCategoryDto> getMenu(@PathVariable UUID restaurantId) {
        return menuService.getMenu(restaurantId);
    }
}