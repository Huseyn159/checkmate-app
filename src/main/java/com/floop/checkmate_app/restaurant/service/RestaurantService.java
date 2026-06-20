package com.floop.checkmate_app.restaurant.service;

import com.floop.checkmate_app.common.dto.PageResponse;
import com.floop.checkmate_app.restaurant.dto.*;
import org.springframework.data.domain.Pageable;
import java.util.UUID;

public interface RestaurantService {
    PageResponse<RestaurantSummaryDto> search(RestaurantFilter filter, Pageable pageable);
    RestaurantDetailDto getById(UUID id);
    RestaurantDetailDto create(java.util.UUID ownerId, CreateRestaurantRequest request);

}