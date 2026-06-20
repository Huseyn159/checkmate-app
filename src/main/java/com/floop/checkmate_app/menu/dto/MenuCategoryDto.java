package com.floop.checkmate_app.menu.dto;

import java.util.List;
import java.util.UUID;

public record MenuCategoryDto(
        UUID id, String name, Integer displayOrder, List<MenuItemDto> items
) {}