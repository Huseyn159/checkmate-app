package com.floop.checkmate_app.menu.service;

import com.floop.checkmate_app.common.exception.*;
import com.floop.checkmate_app.menu.domain.*;
import com.floop.checkmate_app.menu.dto.*;
import com.floop.checkmate_app.menu.repository.*;
import com.floop.checkmate_app.restaurant.domain.*;
import com.floop.checkmate_app.restaurant.repository.RestaurantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class MenuManagementServiceImpl implements MenuManagementService {

    private final MenuCategoryRepository categoryRepository;
    private final MenuItemRepository itemRepository;
    private final RestaurantRepository restaurantRepository;

    @Override @Transactional
    public MenuCategoryDto addCategory(UUID restaurantId, UUID ownerId, CreateCategoryRequest req) {
        verifyOwner(restaurantId, ownerId);
        MenuCategory c = categoryRepository.save(MenuCategory.builder()
                .restaurantId(restaurantId)
                .name(req.name())
                .displayOrder(req.displayOrder() != null ? req.displayOrder() : 0)
                .build());
        return new MenuCategoryDto(c.getId(), c.getName(), c.getDisplayOrder(), List.of());
    }

    @Override @Transactional
    public MenuItemDto addItem(UUID categoryId, UUID ownerId, CreateMenuItemRequest req) {
        MenuCategory c = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Kateqoriya tapılmadı"));
        verifyOwner(c.getRestaurantId(), ownerId);
        MenuItem i = itemRepository.save(MenuItem.builder()
                .restaurantId(c.getRestaurantId())
                .categoryId(categoryId)
                .name(req.name())
                .description(req.description())
                .price(req.price())
                .imageUrl(req.imageUrl())
                .prepTimeMinutes(req.prepTimeMinutes())
                .isAvailable(true)
                .avgRating(BigDecimal.ZERO)
                .build());
        return new MenuItemDto(i.getId(), i.getName(), i.getDescription(), i.getPrice(),
                i.getImageUrl(), i.getIsAvailable(), i.getAvgRating(), i.getPrepTimeMinutes());
    }

    @Override @Transactional
    public void deleteItem(UUID itemId, UUID ownerId) {
        MenuItem i = itemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Yemək tapılmadı"));
        verifyOwner(i.getRestaurantId(), ownerId);
        itemRepository.delete(i);
    }

    @Override @Transactional
    public void deleteCategory(UUID categoryId, UUID ownerId) {
        MenuCategory c = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Kateqoriya tapılmadı"));
        verifyOwner(c.getRestaurantId(), ownerId);
        itemRepository.deleteByCategoryId(categoryId);   // əvvəl item-lər (FK)
        categoryRepository.delete(c);
    }

    @Override @Transactional
    public void submitForReview(UUID restaurantId, UUID ownerId) {
        Restaurant r = verifyOwner(restaurantId, ownerId);
        if (r.getStatus() != RestaurantStatus.DRAFT && r.getStatus() != RestaurantStatus.REJECTED)
            throw new ApiException("Yalnız DRAFT/REJECTED göndərilə bilər", HttpStatus.BAD_REQUEST);
        if (!itemRepository.existsByRestaurantId(restaurantId))
            throw new ApiException("Ən azı bir yemək əlavə et", HttpStatus.BAD_REQUEST);
        r.setStatus(RestaurantStatus.SUBMITTED);
        restaurantRepository.save(r);
    }

    private Restaurant verifyOwner(UUID restaurantId, UUID ownerId) {
        Restaurant r = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new ResourceNotFoundException("Restoran tapılmadı"));
        if (!ownerId.equals(r.getOwnerId()))
            throw new ApiException("Bu restoran sənə aid deyil", HttpStatus.FORBIDDEN);
        return r;
    }
}