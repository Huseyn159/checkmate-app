package com.floop.checkmate_app.admin.service;

import com.floop.checkmate_app.admin.dto.AdminRestaurantDto;
import com.floop.checkmate_app.common.exception.ResourceNotFoundException;
import com.floop.checkmate_app.restaurant.domain.*;
import com.floop.checkmate_app.restaurant.repository.RestaurantRepository;
import com.floop.checkmate_app.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.*;

@Service
@RequiredArgsConstructor
public class AdminServiceImpl implements AdminService {

    private final RestaurantRepository restaurantRepository;
    private final UserRepository userRepository;

    @Override
    public List<AdminRestaurantDto> getPending() {
        return restaurantRepository.findByStatus(RestaurantStatus.SUBMITTED).stream()
                .map(r -> new AdminRestaurantDto(
                        r.getId(), r.getName(), r.getDescription(), r.getCategory(),
                        r.getPriceRange().name(), r.getAddress(), r.getPhone(),
                        r.getCoverUrl(), r.getVoen(), r.getStatus().name(),
                        userRepository.findById(r.getOwnerId()).map(u -> u.getFullName()).orElse("?")))
                .toList();
    }

    @Override @Transactional
    public void approve(UUID id) {
        Restaurant r = find(id);
        r.setStatus(RestaurantStatus.ACTIVE);
        r.setRejectionReason(null);
        restaurantRepository.save(r);
    }

    @Override @Transactional
    public void reject(UUID id, String reason) {
        Restaurant r = find(id);
        r.setStatus(RestaurantStatus.REJECTED);
        r.setRejectionReason(reason);
        restaurantRepository.save(r);
    }

    private Restaurant find(UUID id) {
        return restaurantRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Restoran tapılmadı"));
    }
}