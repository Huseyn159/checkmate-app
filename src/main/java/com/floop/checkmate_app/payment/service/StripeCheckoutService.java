package com.floop.checkmate_app.payment.service;

import com.floop.checkmate_app.common.exception.ApiException;
import com.floop.checkmate_app.common.exception.ResourceNotFoundException;
import com.floop.checkmate_app.payment.dto.BillResponse;
import com.floop.checkmate_app.payment.dto.ParticipantBillDto;
import com.floop.checkmate_app.restaurant.domain.Restaurant;
import com.floop.checkmate_app.restaurant.repository.RestaurantRepository;
import com.floop.checkmate_app.session.repository.TableSessionRepository;
import com.stripe.exception.StripeException;
import com.stripe.model.checkout.Session;
import com.stripe.param.checkout.SessionCreateParams;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class StripeCheckoutService {

    private final BillService billService;
    private final TableSessionRepository sessionRepository;
    private final RestaurantRepository restaurantRepository;

    @Value("${app.base-url:http://localhost:3000}")
    private String appBaseUrl;
    @Value("${app.stripe.currency:usd}")
    private String currency;
    @Value("${app.stripe.platform-fee-percent:10}")
    private int platformFeePercent;
    @Value("${app.stripe.azn-per-usd:1.70}")
    private double aznPerUsd;

    /** Qalıq + bəxşiş üçün Stripe Checkout Session yaradır, restorana transfer ilə. */
    public String createCheckout(UUID sessionId, UUID userId, BigDecimal tipAmount) {
        BigDecimal tip = tipAmount != null ? tipAmount : BigDecimal.ZERO;

        BillResponse bill = billService.getBill(sessionId);
        ParticipantBillDto me = bill.participants().stream()
                .filter(b -> b.userId().equals(userId))
                .findFirst()
                .orElseThrow(() -> new ApiException("Bu masada hesabın yoxdur", HttpStatus.BAD_REQUEST));

        BigDecimal outstanding = me.outstanding();
        if (outstanding.compareTo(BigDecimal.ZERO) <= 0)
            throw new ApiException("Ödəniləcək qalıq yoxdur", HttpStatus.BAD_REQUEST);

        BigDecimal amount = outstanding.add(tip); // manatla
        // USD-də hesablanırsa manatı dollara çevir (test US hesabı USD-dir)
        BigDecimal charged = "usd".equalsIgnoreCase(currency)
                ? amount.divide(BigDecimal.valueOf(aznPerUsd), 2, RoundingMode.HALF_UP)
                : amount;
        long amountCents = charged.movePointRight(2).setScale(0, RoundingMode.HALF_UP).longValueExact();
        long feeCents = BigDecimal.valueOf(amountCents)
                .multiply(BigDecimal.valueOf(platformFeePercent))
                .divide(BigDecimal.valueOf(100), 0, RoundingMode.HALF_UP)
                .longValueExact();

        // sessiondan restoranı tap
        var ts = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Session tapılmadı"));
        UUID restaurantId = ts.getRestaurantId(); // ⚠️ TableSession-da bu yoxdursa aşağıdakı nota bax
        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new ResourceNotFoundException("Restoran tapılmadı"));
        if (restaurant.getStripeAccountId() == null)
            throw new ApiException("Restoran hələ ödənişləri qurmayıb", HttpStatus.BAD_REQUEST);

        try {
            SessionCreateParams.PaymentIntentData.Builder pi =
                    SessionCreateParams.PaymentIntentData.builder()
                            .setTransferData(SessionCreateParams.PaymentIntentData.TransferData.builder()
                                    .setDestination(restaurant.getStripeAccountId())
                                    .build());
            if (feeCents > 0) pi.setApplicationFeeAmount(feeCents);

            SessionCreateParams params = SessionCreateParams.builder()
                    .setMode(SessionCreateParams.Mode.PAYMENT)
                    .setSuccessUrl(appBaseUrl + "/session/" + sessionId + "/pay/success?cs={CHECKOUT_SESSION_ID}")
                    .setCancelUrl(appBaseUrl + "/session/" + sessionId + "?pay=cancel")
                    .addLineItem(SessionCreateParams.LineItem.builder()
                            .setQuantity(1L)
                            .setPriceData(SessionCreateParams.LineItem.PriceData.builder()
                                    .setCurrency(currency)
                                    .setUnitAmount(amountCents)
                                    .setProductData(SessionCreateParams.LineItem.PriceData.ProductData.builder()
                                            .setName(restaurant.getName() + " — hesab")
                                            .build())
                                    .build())
                            .build())
                    .setPaymentIntentData(pi.build())
                    .putMetadata("sessionId", sessionId.toString())
                    .putMetadata("userId", userId.toString())
                    .putMetadata("tip", tip.toPlainString())
                    .build();

            return Session.create(params).getUrl();
        } catch (StripeException e) {
            throw new ApiException("Stripe xətası: " + e.getMessage(), HttpStatus.BAD_GATEWAY);
        }
    }

    /** Uğur səhifəsindən çağırılır: Stripe-dan yoxla, sonra mövcud pay()-i işlət. */
    public BillResponse confirm(UUID sessionId, UUID userId, String checkoutId) {
        try {
            Session cs = Session.retrieve(checkoutId);

            String metaSession = cs.getMetadata().get("sessionId");
            String metaUser = cs.getMetadata().get("userId");
            if (metaSession == null || !metaSession.equals(sessionId.toString())
                    || metaUser == null || !metaUser.equals(userId.toString()))
                throw new ApiException("Ödəniş bu istifadəçiyə aid deyil", HttpStatus.FORBIDDEN);

            if (!"paid".equals(cs.getPaymentStatus()))
                throw new ApiException("Ödəniş tamamlanmayıb", HttpStatus.BAD_REQUEST);

            BigDecimal tip = new BigDecimal(cs.getMetadata().getOrDefault("tip", "0"));

            // refresh-də ikinci dəfə çağırılsa, pay() "qalıq yoxdur" atacaq → cari bill-i qaytar
            try {
                return billService.pay(sessionId, userId, tip);
            } catch (ApiException ex) {
                return billService.getBill(sessionId);
            }
        } catch (StripeException e) {
            throw new ApiException("Stripe xətası: " + e.getMessage(), HttpStatus.BAD_GATEWAY);
        }
    }
}