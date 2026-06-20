package com.floop.checkmate_app.review.service;

import com.floop.checkmate_app.common.exception.ApiException;
import com.floop.checkmate_app.reservation.repository.ReservationRepository;
import com.floop.checkmate_app.restaurant.domain.Restaurant;
import com.floop.checkmate_app.restaurant.repository.RestaurantRepository;
import com.floop.checkmate_app.review.domain.Review;
import com.floop.checkmate_app.review.dto.*;
import com.floop.checkmate_app.review.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final ReservationRepository reservationRepository;
    private final RestaurantRepository restaurantRepository;

    @Transactional(readOnly = true)
    public ReviewSummaryResponse getSummary(UUID restaurantId) {
        Restaurant r = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new ApiException("Restoran tapılmadı", HttpStatus.NOT_FOUND));
        var reviews = reviewRepository.findByRestaurantIdOrderByCreatedAtDesc(restaurantId)
                .stream().map(ReviewService::toDto).toList();
        return new ReviewSummaryResponse(r.getAvgRating(), r.getTotalRatings(), reviews);
    }

    @Transactional(readOnly = true)
    public MyReviewResponse getMine(UUID restaurantId, UUID userId) {
        boolean canReview = reservationRepository.existsByUserIdAndRestaurantId(userId, restaurantId);
        var mine = reviewRepository.findByUserIdAndRestaurantId(userId, restaurantId)
                .map(ReviewService::toDto).orElse(null);
        return new MyReviewResponse(canReview, mine);
    }

    @Transactional
    public ReviewResponse submit(UUID restaurantId, UUID userId, String userFullName, ReviewRequest req) {
        Restaurant r = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new ApiException("Restoran tapılmadı", HttpStatus.NOT_FOUND));
        if (req.rating() < 1 || req.rating() > 5)
            throw new ApiException("Reytinq 1–5 olmalıdır", HttpStatus.BAD_REQUEST);
        if (!reservationRepository.existsByUserIdAndRestaurantId(userId, restaurantId))
            throw new ApiException("Yalnız rezerv etdiyin restoranı qiymətləndirə bilərsən", HttpStatus.FORBIDDEN);

        Review review = reviewRepository.findByUserIdAndRestaurantId(userId, restaurantId)
                .orElseGet(() -> Review.builder().userId(userId).restaurantId(restaurantId).build());
        review.setUserFullName(userFullName);
        review.setRating(req.rating());
        String c = req.comment();
        review.setComment(c == null || c.isBlank() ? null : c.trim());
        reviewRepository.save(review);

        recompute(r);
        return toDto(review);
    }

    private void recompute(Restaurant r) {
        long count = reviewRepository.countByRestaurantId(r.getId());
        Double avg = reviewRepository.avgByRestaurantId(r.getId());
        r.setAvgRating(avg == null ? BigDecimal.ZERO
                : BigDecimal.valueOf(avg).setScale(1, RoundingMode.HALF_UP));
        r.setTotalRatings((int) count);
        restaurantRepository.save(r);
    }

    private static ReviewResponse toDto(Review r) {
        return new ReviewResponse(r.getId(), r.getUserFullName(), r.getRating(), r.getComment(), r.getCreatedAt());
    }
}