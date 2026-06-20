package com.floop.checkmate_app.restaurant.service;

import com.floop.checkmate_app.common.dto.PageResponse;
import com.floop.checkmate_app.common.exception.ApiException;
import com.floop.checkmate_app.common.exception.ResourceNotFoundException;
import com.floop.checkmate_app.restaurant.domain.Restaurant;
import com.floop.checkmate_app.restaurant.domain.RestaurantStatus;
import com.floop.checkmate_app.restaurant.dto.*;
import com.floop.checkmate_app.restaurant.repository.RestaurantRepository;
import com.floop.checkmate_app.restaurant.spec.RestaurantSpecifications;
import com.floop.checkmate_app.user.domain.Role;
import com.floop.checkmate_app.user.domain.UserEntity;
import com.floop.checkmate_app.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RestaurantServiceImpl implements RestaurantService {

    private final RestaurantRepository restaurantRepository;
    private final RestaurantMapper restaurantMapper;
    private final UserRepository userRepository;

    @Override
    public PageResponse<RestaurantSummaryDto> search(RestaurantFilter f, Pageable pageable) {
        Specification<Restaurant> spec = Specification.allOf(
                RestaurantSpecifications.isActive(),
                RestaurantSpecifications.hasCategory(f.category()),
                RestaurantSpecifications.hasPriceRange(f.priceRange()),
                RestaurantSpecifications.minRating(f.minRating()),
                RestaurantSpecifications.search(f.search())
        );
        Page<RestaurantSummaryDto> page = restaurantRepository.findAll(spec, pageable)
                .map(restaurantMapper::toSummary);
        return PageResponse.from(page);
    }

    @Override
    public RestaurantDetailDto getById(UUID id) {
        Restaurant r = restaurantRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Restoran tapılmadı"));
        return restaurantMapper.toDetail(r);
    }

    @Transactional
    public RestaurantDetailDto create(UUID ownerId, CreateRestaurantRequest req) {
        if (restaurantRepository.existsByVoen(req.voen()))
            throw new ApiException("Bu VÖEN ilə restoran artıq mövcuddur", HttpStatus.CONFLICT);

        Restaurant r = Restaurant.builder()
                .ownerId(ownerId)
                .name(req.name()).description(req.description()).category(req.category())
                .priceRange(req.priceRange()).address(req.address())
                .latitude(req.lat()).longitude(req.lng())   // entity sahə adlarına uyğunlaşdır
                .phone(req.phone()).voen(req.voen()).coverUrl(req.coverUrl())
                .status(RestaurantStatus.DRAFT)
                .trustScore(0).avgRating(BigDecimal.valueOf(0.0)).totalRatings(0)
                .build();
        r = restaurantRepository.save(r);

        UserEntity u = userRepository.findById(ownerId)
                .orElseThrow(() -> new ResourceNotFoundException("İstifadəçi tapılmadı"));
        if (u.getRole() != Role.OWNER) { u.setRole(Role.OWNER); userRepository.save(u); }

        return restaurantMapper.toDetail(r);
    }
}