package com.floop.checkmate_app.restaurant.dto;

import com.floop.checkmate_app.restaurant.domain.Restaurant;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface RestaurantMapper {
    RestaurantSummaryDto toSummary(Restaurant r);
    RestaurantDetailDto toDetail(Restaurant r);
}