package com.floop.checkmate_app.menu.dto;

public record CreateCategoryRequest(
        @jakarta.validation.constraints.NotBlank String name,
        Integer displayOrder) {}

