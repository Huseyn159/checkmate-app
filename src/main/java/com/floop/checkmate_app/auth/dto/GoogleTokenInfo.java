package com.floop.checkmate_app.auth.dto;


import com.fasterxml.jackson.annotation.JsonIgnoreProperties;



@JsonIgnoreProperties(ignoreUnknown = true)
public record GoogleTokenInfo(String email, String name, String picture, String aud) {}