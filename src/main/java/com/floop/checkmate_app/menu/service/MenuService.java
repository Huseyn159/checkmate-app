package com.floop.checkmate_app.menu.service;

import com.floop.checkmate_app.menu.dto.MenuCategoryDto;
import java.util.List;
import java.util.UUID;

public interface MenuService {
    List<MenuCategoryDto> getMenu(UUID restaurantId);
}