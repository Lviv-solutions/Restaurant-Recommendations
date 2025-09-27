package weaviate

import (
	"context"
	"fmt"
	"math"
	"restaurant-recommendations/internal/models"
	"sort"
	"strings"
)

// SimpleClient is a basic in-memory implementation for MVP
type SimpleClient struct {
	restaurants []models.Restaurant
}

// NewSimpleClient creates a new simple client
func NewSimpleClient() *SimpleClient {
	return &SimpleClient{
		restaurants: make([]models.Restaurant, 0),
	}
}

// InitializeSchema is a no-op for the simple client
func (c *SimpleClient) InitializeSchema(ctx context.Context) error {
	return nil
}

// AddRestaurant adds a restaurant to the in-memory store
func (c *SimpleClient) AddRestaurant(ctx context.Context, restaurant *models.Restaurant) error {
	// Check if restaurant already exists
	for i, existing := range c.restaurants {
		if existing.ID == restaurant.ID {
			c.restaurants[i] = *restaurant
			return nil
		}
	}
	
	c.restaurants = append(c.restaurants, *restaurant)
	return nil
}

// SearchRestaurants performs basic search with filters
func (c *SimpleClient) SearchRestaurants(ctx context.Context, req *models.SearchRequest) (*models.SearchResponse, error) {
	results := make([]models.Restaurant, 0)
	
	for _, restaurant := range c.restaurants {
		if c.matchesFilters(restaurant, req) {
			results = append(results, restaurant)
		}
	}
	
	// Sort by relevance (basic scoring)
	c.sortByRelevance(results, req)
	
	// Apply limit
	if req.Limit > 0 && len(results) > req.Limit {
		results = results[:req.Limit]
	}
	
	return &models.SearchResponse{
		Restaurants: results,
		Total:       len(results),
		Query:       req.Query,
	}, nil
}

// GetRestaurant gets a restaurant by ID
func (c *SimpleClient) GetRestaurant(ctx context.Context, id string) (*models.Restaurant, error) {
	for _, restaurant := range c.restaurants {
		if restaurant.ID == id {
			return &restaurant, nil
		}
	}
	return nil, fmt.Errorf("restaurant not found")
}

// GetSimilarRestaurants finds similar restaurants
func (c *SimpleClient) GetSimilarRestaurants(ctx context.Context, id string, limit int) ([]models.Restaurant, error) {
	target, err := c.GetRestaurant(ctx, id)
	if err != nil {
		return nil, err
	}
	
	var similar []models.Restaurant
	for _, restaurant := range c.restaurants {
		if restaurant.ID != id {
			similarity := c.calculateSimilarity(*target, restaurant)
			if similarity > 0.3 { // Basic threshold
				similar = append(similar, restaurant)
			}
		}
	}
	
	// Sort by similarity (basic implementation)
	sort.Slice(similar, func(i, j int) bool {
		return c.calculateSimilarity(*target, similar[i]) > c.calculateSimilarity(*target, similar[j])
	})
	
	if len(similar) > limit {
		similar = similar[:limit]
	}
	
	return similar, nil
}

// matchesFilters checks if a restaurant matches the search filters
func (c *SimpleClient) matchesFilters(restaurant models.Restaurant, req *models.SearchRequest) bool {
	// Text search
	if req.Query != "" {
		query := strings.ToLower(req.Query)
		searchText := strings.ToLower(fmt.Sprintf("%s %s %s", 
			restaurant.Name, 
			restaurant.Description, 
			strings.Join(restaurant.Cuisine, " ")))
		
		if !strings.Contains(searchText, query) {
			return false
		}
	}
	
	// Price tier filter
	if req.PriceTier != "" && restaurant.PriceTier != req.PriceTier {
		return false
	}
	
	// Bill range filter
	if req.BillMin != nil && restaurant.AvgBillFor3 < *req.BillMin {
		return false
	}
	if req.BillMax != nil && restaurant.AvgBillFor3 > *req.BillMax {
		return false
	}
	
	// Cuisine filter
	if len(req.Cuisine) > 0 {
		found := false
		for _, reqCuisine := range req.Cuisine {
			for _, resCuisine := range restaurant.Cuisine {
				if strings.EqualFold(reqCuisine, resCuisine) {
					found = true
					break
				}
			}
			if found {
				break
			}
		}
		if !found {
			return false
		}
	}
	
	// Events filter
	if len(req.Events) > 0 {
		found := false
		for _, reqEvent := range req.Events {
			for _, resEvent := range restaurant.Events {
				if strings.EqualFold(reqEvent, resEvent) {
					found = true
					break
				}
			}
			if found {
				break
			}
		}
		if !found {
			return false
		}
	}
	
	return true
}

// sortByRelevance sorts restaurants by relevance score
func (c *SimpleClient) sortByRelevance(restaurants []models.Restaurant, req *models.SearchRequest) {
	sort.Slice(restaurants, func(i, j int) bool {
		scoreI := c.calculateRelevanceScore(restaurants[i], req)
		scoreJ := c.calculateRelevanceScore(restaurants[j], req)
		return scoreI > scoreJ
	})
}

// calculateRelevanceScore calculates a relevance score for a restaurant
func (c *SimpleClient) calculateRelevanceScore(restaurant models.Restaurant, req *models.SearchRequest) float64 {
	score := 0.0
	
	// Base rating score (30%)
	score += restaurant.Rating * 0.3
	
	// Text relevance (40%)
	if req.Query != "" {
		query := strings.ToLower(req.Query)
		searchText := strings.ToLower(fmt.Sprintf("%s %s %s", 
			restaurant.Name, 
			restaurant.Description, 
			strings.Join(restaurant.Cuisine, " ")))
		
		// Simple text matching score
		words := strings.Fields(query)
		matches := 0
		for _, word := range words {
			if strings.Contains(searchText, word) {
				matches++
			}
		}
		if len(words) > 0 {
			score += (float64(matches) / float64(len(words))) * 0.4 * 5 // Scale to 0-2
		}
	}
	
	// Bill fit score (30%)
	if req.BillMin != nil || req.BillMax != nil {
		billScore := 1.0
		if req.BillMin != nil && restaurant.AvgBillFor3 < *req.BillMin {
			billScore *= 0.5
		}
		if req.BillMax != nil && restaurant.AvgBillFor3 > *req.BillMax {
			billScore *= 0.5
		}
		score += billScore * 0.3 * 5 // Scale to 0-1.5
	}
	
	return score
}

// calculateSimilarity calculates similarity between two restaurants
func (c *SimpleClient) calculateSimilarity(r1, r2 models.Restaurant) float64 {
	similarity := 0.0
	
	// Cuisine similarity
	cuisineMatch := 0
	for _, c1 := range r1.Cuisine {
		for _, c2 := range r2.Cuisine {
			if strings.EqualFold(c1, c2) {
				cuisineMatch++
			}
		}
	}
	if len(r1.Cuisine) > 0 {
		similarity += (float64(cuisineMatch) / float64(len(r1.Cuisine))) * 0.4
	}
	
	// Price tier similarity
	if r1.PriceTier == r2.PriceTier {
		similarity += 0.3
	}
	
	// Rating similarity
	ratingDiff := math.Abs(r1.Rating - r2.Rating)
	similarity += (1.0 - (ratingDiff / 5.0)) * 0.3
	
	return similarity
}
