package com.floop.checkmate_app.admin.controller;

import com.floop.checkmate_app.admin.dto.*;
import com.floop.checkmate_app.admin.service.AdminService;
import com.floop.checkmate_app.common.exception.ApiException;
import com.floop.checkmate_app.user.domain.*;
import com.floop.checkmate_app.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;
    private final UserService userService;

    @GetMapping("/restaurants/pending")
    public List<AdminRestaurantDto> pending(@AuthenticationPrincipal UserDetails p) {
        requireAdmin(p);
        return adminService.getPending();
    }

    @PostMapping("/restaurants/{id}/approve")
    public void approve(@AuthenticationPrincipal UserDetails p, @PathVariable UUID id) {
        requireAdmin(p);
        adminService.approve(id);
    }

    @PostMapping("/restaurants/{id}/reject")
    public void reject(@AuthenticationPrincipal UserDetails p, @PathVariable UUID id,
                       @RequestBody RejectRequest req) {
        requireAdmin(p);
        adminService.reject(id, req.reason());
    }

    private void requireAdmin(UserDetails p) {
        UserEntity u = userService.getByEmail(p.getUsername());
        if (u.getRole() != Role.ADMIN)
            throw new ApiException("Admin hüququ lazımdır", HttpStatus.FORBIDDEN);
    }
}