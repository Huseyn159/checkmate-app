package com.floop.checkmate_app.menu.service;

import com.floop.checkmate_app.menu.domain.*;
import com.floop.checkmate_app.menu.dto.*;
import com.floop.checkmate_app.menu.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MenuServiceImpl implements MenuService {

    private final MenuCategoryRepository categoryRepository;
    private final MenuItemRepository itemRepository;
    private final MenuMapper menuMapper;

    @Override
    public List<MenuCategoryDto> getMenu(UUID restaurantId) {
        List<MenuCategory> categories =
                categoryRepository.findByRestaurantIdOrderByDisplayOrderAsc(restaurantId);

        Map<UUID, List<MenuItem>> itemsByCategory = itemRepository.findByRestaurantId(restaurantId)
                .stream()
                .collect(Collectors.groupingBy(MenuItem::getCategoryId));

        return categories.stream()
                .map(c -> new MenuCategoryDto(
                        c.getId(), c.getName(), c.getDisplayOrder(),
                        itemsByCategory.getOrDefault(c.getId(), List.of())
                                .stream().map(menuMapper::toItemDto).toList()))
                .toList();
    }
}