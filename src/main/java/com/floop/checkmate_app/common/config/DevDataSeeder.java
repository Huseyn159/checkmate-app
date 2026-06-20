package com.floop.checkmate_app.common.config;

import com.floop.checkmate_app.menu.domain.*;
import com.floop.checkmate_app.menu.repository.*;
import com.floop.checkmate_app.restaurant.domain.*;
import com.floop.checkmate_app.restaurant.repository.RestaurantRepository;
import com.floop.checkmate_app.table_entity.domain.RestaurantTable;
import com.floop.checkmate_app.table_entity.domain.TableZone;
import com.floop.checkmate_app.table_entity.repository.RestaurantTableRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class DevDataSeeder implements CommandLineRunner {

    private final RestaurantRepository restaurantRepository;
    private final MenuCategoryRepository categoryRepository;
    private final MenuItemRepository itemRepository;
    private final RestaurantTableRepository restaurantTableRepository;

    @Override
    public void run(String... args) {
        if (restaurantRepository.count() > 0) return;   // yalnız boş olanda seed et

        seedRestaurant("Çinar Restoranı", "Milli Azərbaycan mətbəxi", "Milli",
                PriceRange.MODERATE, "Nizami küç. 10, Bakı", new BigDecimal("4.6"),
                new String[]{"Plov", "Düşbərə"}, new String[]{"Çay", "Ayran"});

        seedRestaurant("La Bottega", "İtalyan mətbəxi və pizza", "İtalyan",
                PriceRange.EXPENSIVE, "Fountain Square, Bakı", new BigDecimal("4.8"),
                new String[]{"Margherita Pizza", "Carbonara"}, new String[]{"Espresso", "Aperol"});

        seedRestaurant("Burger Lab", "Fast food və burgerlər", "Fast food",
                PriceRange.CHEAP, "28 May küç. 5, Bakı", new BigDecimal("4.3"),
                new String[]{"Classic Burger", "Cheeseburger"}, new String[]{"Cola", "Milkshake"});
    }

    private void seedRestaurant(String name, String desc, String category, PriceRange price,
                                String address, BigDecimal rating,
                                String[] mains, String[] drinks) {
        Restaurant r = restaurantRepository.save(Restaurant.builder()
                .name(name).description(desc).category(category).priceRange(price)
                .address(address).status(RestaurantStatus.ACTIVE)
                .avgRating(rating).totalRatings(10)
                .coverUrl("https://picsum.photos/seed/" + name.hashCode() + "/600/400")
                .build());

        MenuCategory mainCat = categoryRepository.save(MenuCategory.builder()
                .restaurantId(r.getId()).name("Əsas yeməklər").displayOrder(1).build());
        MenuCategory drinkCat = categoryRepository.save(MenuCategory.builder()
                .restaurantId(r.getId()).name("İçkilər").displayOrder(2).build());

        BigDecimal p = new BigDecimal("12.00");
        for (String m : mains) {
            itemRepository.save(MenuItem.builder()
                    .restaurantId(r.getId()).categoryId(mainCat.getId())
                    .name(m).price(p).isAvailable(true)
                    .avgRating(new BigDecimal("4.5")).prepTimeMinutes(15).build());
        }
        for (String d : drinks) {
            itemRepository.save(MenuItem.builder()
                    .restaurantId(r.getId()).categoryId(drinkCat.getId())
                    .name(d).price(new BigDecimal("4.00")).isAvailable(true)
                    .avgRating(new BigDecimal("4.0")).prepTimeMinutes(2).build());
        }

        // seedRestaurant içində, item-lərdən sonra:
        restaurantTableRepository.save(RestaurantTable.builder()
                .restaurantId(r.getId()).tableNumber("1").capacity(2)
                .zone(TableZone.WINDOW).features(List.of("quiet")).build());
        restaurantTableRepository.save(RestaurantTable.builder()
                .restaurantId(r.getId()).tableNumber("2").capacity(4)
                .zone(TableZone.MAIN).features(List.of()).build());
        restaurantTableRepository.save(RestaurantTable.builder()
                .restaurantId(r.getId()).tableNumber("3").capacity(6)
                .zone(TableZone.TERRACE).features(List.of("vip")).build());
    }
}