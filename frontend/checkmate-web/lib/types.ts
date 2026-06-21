export interface User {
    id: string;
    email: string;
    fullName: string;
    phone?: string;
    avatarUrl?: string;
    role: string;
    trustScore: number;
}

export interface AuthResponse {
    accessToken: string;
    refreshToken: string;
    user: User;
}

export interface RestaurantSummary {
    id: string;
    name: string;
    category: string;
    priceRange: string;
    coverUrl?: string;
    address?: string;
    avgRating: number;
    totalRatings: number;
}

export interface PageResponse<T> {
    content: T[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
}

export interface RestaurantDetail {
    id: string;
    name: string;
    description?: string;
    category: string;
    priceRange: string;
    address?: string;
    latitude?: number;
    longitude?: number;
    phone?: string;
    coverUrl?: string;
    status: string;
    avgRating: number;
    totalRatings: number;
}

export interface MenuItem {
    id: string;
    name: string;
    description?: string;
    price: number;
    imageUrl?: string;
    isAvailable: boolean;
    avgRating: number;
    prepTimeMinutes?: number;
}

export interface MenuCategory {
    id: string;
    name: string;
    displayOrder: number;
    items: MenuItem[];
}

export interface CreateReservationRequest {
    restaurantId: string;
    date: string;       // "2026-06-20"
    time: string;       // "19:30"
    partySize: number;
    zone?: string;
    features?: string[];
    specialNote?: string;
}

export interface ReservationResponse {
    id: string;
    restaurantId: string;
    tableNumber: string;
    zone: string;
    date: string;
    time: string;
    partySize: number;
    status: string;
    depositAmount: number;
    sessionCode: string;
    qrCode: string;
}

export interface Participant {
    userId: string;
    fullName: string;
}

export interface SessionResponse {
    id: string;
    reservationId: string;
    restaurantId: string;
    tableId: string;
    status: string;
    participants: Participant[];
}