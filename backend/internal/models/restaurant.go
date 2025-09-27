package models

import "github.com/google/uuid"

// Restaurant represents a restaurant entity
type Restaurant struct {
	ID          string    `json:"id"`
	Name        string    `json:"name"`
	Cuisine     []string  `json:"cuisine"`
	PriceTier   string    `json:"price_tier"`
	AvgBillFor3 float64   `json:"avg_bill_for_3"`
	Events      []string  `json:"events"`
	Rating      float64   `json:"rating"`
	Location    Location  `json:"location"`
	Description string    `json:"description"`
	ImageURL    string    `json:"image_url,omitempty"`
}

// Location represents geographical coordinates
type Location struct {
	Latitude  float64 `json:"latitude"`
	Longitude float64 `json:"longitude"`
}

// SearchRequest represents search parameters
type SearchRequest struct {
	Query     string    `json:"q" form:"q"`
	PriceTier string    `json:"price_tier" form:"price_tier"`
	BillMin   *float64  `json:"bill_min" form:"bill_min"`
	BillMax   *float64  `json:"bill_max" form:"bill_max"`
	Events    []string  `json:"events" form:"events"`
	Cuisine   []string  `json:"cuisine" form:"cuisine"`
	Lat       *float64  `json:"lat" form:"lat"`
	Lng       *float64  `json:"lng" form:"lng"`
	Limit     int       `json:"limit" form:"limit"`
}

// SearchResponse represents search results
type SearchResponse struct {
	Restaurants []Restaurant `json:"restaurants"`
	Total       int          `json:"total"`
	Query       string       `json:"query"`
}

// RecommendationRequest represents recommendation parameters
type RecommendationRequest struct {
	Type  string `json:"type" form:"type"` // "popular", "budget", "events"
	Limit int    `json:"limit" form:"limit"`
}

// NewRestaurant creates a new restaurant with generated ID
func NewRestaurant(name, description string) *Restaurant {
	return &Restaurant{
		ID:          uuid.New().String(),
		Name:        name,
		Description: description,
		Cuisine:     make([]string, 0),
		Events:      make([]string, 0),
		Rating:      0.0,
		AvgBillFor3: 0.0,
		PriceTier:   "medium",
	}
}
