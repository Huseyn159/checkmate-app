package com.floop.checkmate_app.connect.dto;

public record ConnectStatusResponse(
        boolean connected,
        boolean chargesEnabled,
        boolean payoutsEnabled,
        boolean ready,          // ödəniş qəbul edə bilir (transfers aktiv)
        String onboardingUrl
) {}