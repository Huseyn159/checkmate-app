package com.floop.checkmate_app.admin.service;

import com.floop.checkmate_app.admin.dto.AdminRestaurantDto;
import java.util.*;

public interface AdminService {
    List<AdminRestaurantDto> getPending();
    void approve(UUID restaurantId);
    void reject(UUID restaurantId, String reason);
}