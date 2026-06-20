package com.floop.checkmate_app.menu.service;

import com.floop.checkmate_app.menu.dto.*;
import java.util.UUID;

public interface MenuManagementService {
    MenuCategoryDto addCategory(UUID restaurantId, UUID ownerId, CreateCategoryRequest req);
    MenuItemDto addItem(UUID categoryId, UUID ownerId, CreateMenuItemRequest req);
    void deleteItem(UUID itemId, UUID ownerId);
    void deleteCategory(UUID categoryId, UUID ownerId);
    void submitForReview(UUID restaurantId, UUID ownerId);
}