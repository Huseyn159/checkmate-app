package com.floop.checkmate_app.search.service;

import com.floop.checkmate_app.search.dto.DishSearchResultDto;
import java.util.List;

public interface DishSearchService {
    List<DishSearchResultDto> searchByDish(String q);
}