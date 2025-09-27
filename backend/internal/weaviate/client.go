package weaviate

import (
	"context"
	"restaurant-recommendations/internal/models"
)

// Client interface for restaurant operations
type Client interface {
	InitializeSchema(ctx context.Context) error
	AddRestaurant(ctx context.Context, restaurant *models.Restaurant) error
	SearchRestaurants(ctx context.Context, req *models.SearchRequest) (*models.SearchResponse, error)
	GetRestaurant(ctx context.Context, id string) (*models.Restaurant, error)
	GetSimilarRestaurants(ctx context.Context, id string, limit int) ([]models.Restaurant, error)
}

// NewClient creates a new client (using simple implementation for MVP)
func NewClient(url string) (Client, error) {
	return NewSimpleClient(), nil
}
