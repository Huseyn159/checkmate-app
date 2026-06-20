package com.floop.checkmate_app.menu.controller;

import com.floop.checkmate_app.menu.dto.*;
import com.floop.checkmate_app.menu.service.MenuManagementService;
import com.floop.checkmate_app.user.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/dashboard")
@RequiredArgsConstructor
public class MenuManagementController {

    private final MenuManagementService menuService;
    private final UserService userService;

    @PostMapping("/restaurants/{restaurantId}/categories")
    public MenuCategoryDto addCategory(@AuthenticationPrincipal UserDetails p,
                                       @PathVariable UUID restaurantId, @Valid @RequestBody CreateCategoryRequest req) {
        return menuService.addCategory(restaurantId, uid(p), req);
    }

    @PostMapping("/categories/{categoryId}/items")
    public MenuItemDto addItem(@AuthenticationPrincipal UserDetails p,
                               @PathVariable UUID categoryId, @Valid @RequestBody CreateMenuItemRequest req) {
        return menuService.addItem(categoryId, uid(p), req);
    }

    @DeleteMapping("/menu-items/{itemId}")
    public void deleteItem(@AuthenticationPrincipal UserDetails p, @PathVariable UUID itemId) {
        menuService.deleteItem(itemId, uid(p));
    }

    @DeleteMapping("/categories/{categoryId}")
    public void deleteCategory(@AuthenticationPrincipal UserDetails p, @PathVariable UUID categoryId) {
        menuService.deleteCategory(categoryId, uid(p));
    }

    @PostMapping("/restaurants/{restaurantId}/submit")
    public void submit(@AuthenticationPrincipal UserDetails p, @PathVariable UUID restaurantId) {
        menuService.submitForReview(restaurantId, uid(p));
    }

    private UUID uid(UserDetails p) { return userService.getByEmail(p.getUsername()).getId(); }
}