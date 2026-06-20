package com.floop.checkmate_app.search.controller;

import com.floop.checkmate_app.search.dto.DishSearchResultDto;
import com.floop.checkmate_app.search.service.DishSearchService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class DishSearchController {

    private final DishSearchService dishSearchService;

    // /api/v1/restaurants/** permitAll altına düşür → guest də axtara bilər
    @GetMapping("/api/v1/restaurants/dish-search")
    public List<DishSearchResultDto> search(@RequestParam String q) {
        return dishSearchService.searchByDish(q);
    }
}