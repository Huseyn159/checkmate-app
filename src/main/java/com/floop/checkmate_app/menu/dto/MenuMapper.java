package com.floop.checkmate_app.menu.dto;

import com.floop.checkmate_app.menu.domain.MenuItem;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface MenuMapper {
    MenuItemDto toItemDto(MenuItem item);
}