package com.floop.checkmate_app.search.service;

import com.floop.checkmate_app.menu.domain.MenuItem;
import com.floop.checkmate_app.menu.repository.MenuItemRepository;
import com.floop.checkmate_app.restaurant.domain.Restaurant;
import com.floop.checkmate_app.restaurant.repository.RestaurantRepository;
import com.floop.checkmate_app.restaurant.spec.RestaurantSpecifications;
import com.floop.checkmate_app.search.dto.DishSearchResultDto;
import com.floop.checkmate_app.search.dto.MatchedDishDto;
import lombok.RequiredArgsConstructor;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DishSearchServiceImpl implements DishSearchService {

    private final MenuItemRepository itemRepository;
    private final RestaurantRepository restaurantRepository;

    @Override
    @Transactional(readOnly = true)
    public List<DishSearchResultDto> searchByDish(String q) {
        if (q == null || q.trim().length() < 2) return List.of();

        List<MenuItem> matches = itemRepository.findByNameContainingIgnoreCase(q.trim())
                .stream().filter(m -> Boolean.TRUE.equals(m.getIsAvailable())).toList();
        if (matches.isEmpty()) return List.of();

        Map<UUID, List<MenuItem>> byRestaurant = matches.stream()
                .collect(Collectors.groupingBy(MenuItem::getRestaurantId));
        Set<UUID> ids = byRestaurant.keySet();

        // yalnız aktiv restoranlar (mövcud isActive spec-i təkrar istifadə edirik)
        Specification<Restaurant> spec = Specification.allOf(
                RestaurantSpecifications.isActive(),
                (root, query, cb) -> root.get("id").in(ids)
        );

        return restaurantRepository.findAll(spec).stream().map(r -> {
            List<MatchedDishDto> dishes = byRestaurant.getOrDefault(r.getId(), List.of()).stream()
                    .limit(4)
                    .map(m -> new MatchedDishDto(m.getId(), m.getName(), m.getPrice(), m.getImageUrl()))
                    .toList();
            return new DishSearchResultDto(
                    r.getId(), r.getName(), r.getCategory(),
                    r.getPriceRange() != null ? r.getPriceRange().name() : null,
                    r.getAvgRating(), r.getTotalRatings(), r.getCoverUrl(), r.getAddress(),
                    r.getLatitude(), r.getLongitude(), dishes);
        }).toList();
    }
}