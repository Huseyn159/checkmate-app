package com.floop.checkmate_app.connect.service;

import com.floop.checkmate_app.restaurant.domain.Restaurant;
import com.stripe.exception.StripeException;
import com.stripe.model.Account;
import com.stripe.model.AccountLink;
import com.stripe.param.AccountCreateParams;
import com.stripe.param.AccountLinkCreateParams;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class StripeConnectService {

    @Value("${app.stripe.connect.country:US}")
    private String country;

    @Value("${app.base-url:http://localhost:3000}")
    private String appBaseUrl;

    /** Connected account yaradır (yoxdursa) və id-ni qaytarır. */
    public String createAccount() throws StripeException {
        AccountCreateParams params = AccountCreateParams.builder()
                .setType(AccountCreateParams.Type.EXPRESS)
                .setCountry(country)
                .setCapabilities(AccountCreateParams.Capabilities.builder()
                        .setCardPayments(AccountCreateParams.Capabilities.CardPayments.builder()
                                .setRequested(true).build())
                        .setTransfers(AccountCreateParams.Capabilities.Transfers.builder()
                                .setRequested(true).build())
                        .build())
                .build();
        return Account.create(params).getId();
    }

    /** Stripe-ın hostlanmış onboarding linkini qaytarır. */
    public String createOnboardingLink(String accountId, UUID restaurantId) throws StripeException {
        AccountLinkCreateParams params = AccountLinkCreateParams.builder()
                .setAccount(accountId)
                .setType(AccountLinkCreateParams.Type.ACCOUNT_ONBOARDING)
                .setRefreshUrl(appBaseUrl + "/dashboard/payments?refresh=" + restaurantId)
                .setReturnUrl(appBaseUrl + "/dashboard/payments?done=" + restaurantId)
                .build();
        return AccountLink.create(params).getUrl();
    }

    public Account retrieve(String accountId) throws StripeException {
        return Account.retrieve(accountId);
    }
}