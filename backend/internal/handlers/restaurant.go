package handlers

import (
	"net/http"

	"restaurant-recommendations/internal/models"
	"restaurant-recommendations/internal/weaviate"

	"github.com/gin-gonic/gin"
)

type RestaurantHandler struct {
	weaviateClient weaviate.Client
}

func NewRestaurantHandler(weaviateClient weaviate.Client) *RestaurantHandler {
	return &RestaurantHandler{
		weaviateClient: weaviateClient,
	}
}

// SearchRestaurants handles restaurant search requests
func (h *RestaurantHandler) SearchRestaurants(c *gin.Context) {
	var req models.SearchRequest
	
	// Bind query parameters
	if err := c.ShouldBindQuery(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Set default limit
	if req.Limit <= 0 {
		req.Limit = 10
	}

	// Perform search
	result, err := h.weaviateClient.SearchRestaurants(c.Request.Context(), &req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to search restaurants"})
		return
	}

	c.JSON(http.StatusOK, result)
}

// GetRestaurant handles getting a single restaurant by ID
func (h *RestaurantHandler) GetRestaurant(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Restaurant ID is required"})
		return
	}

	restaurant, err := h.weaviateClient.GetRestaurant(c.Request.Context(), id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Restaurant not found"})
		return
	}

	// Get similar restaurants
	similar, err := h.weaviateClient.GetSimilarRestaurants(c.Request.Context(), id, 5)
	if err != nil {
		// Log error but don't fail the request
		similar = []models.Restaurant{}
	}

	response := gin.H{
		"restaurant": restaurant,
		"similar":    similar,
	}

	c.JSON(http.StatusOK, response)
}

// GetRecommendations handles curated recommendation requests
func (h *RestaurantHandler) GetRecommendations(c *gin.Context) {
	var req models.RecommendationRequest
	
	if err := c.ShouldBindQuery(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Set default limit
	if req.Limit <= 0 {
		req.Limit = 10
	}

	var searchReq models.SearchRequest
	searchReq.Limit = req.Limit

	// Configure search based on recommendation type
	switch req.Type {
	case "popular":
		// Search for highly rated restaurants
		searchReq.Query = "popular restaurant"
	case "budget":
		// Search for budget-friendly options around 200 SAR
		billMax := 250.0
		searchReq.BillMax = &billMax
		searchReq.PriceTier = "low"
	case "events":
		// Search for restaurants with events
		searchReq.Events = []string{"Live Music", "Family Night", "Entertainment"}
	default:
		// Default to popular
		searchReq.Query = "restaurant"
	}

	result, err := h.weaviateClient.SearchRestaurants(c.Request.Context(), &searchReq)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get recommendations"})
		return
	}

	response := gin.H{
		"type":         req.Type,
		"restaurants": result.Restaurants,
		"total":       result.Total,
	}

	c.JSON(http.StatusOK, response)
}

// ImportRestaurants handles CSV import (admin only)
func (h *RestaurantHandler) ImportRestaurants(c *gin.Context) {
	// This would handle CSV import functionality
	// For MVP, we'll implement basic JSON import
	var restaurants []models.Restaurant
	
	if err := c.ShouldBindJSON(&restaurants); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	imported := 0
	for _, restaurant := range restaurants {
		if restaurant.Name == "" || restaurant.Description == "" {
			continue // Skip invalid entries
		}
		
		err := h.weaviateClient.AddRestaurant(c.Request.Context(), &restaurant)
		if err != nil {
			continue // Skip failed imports
		}
		imported++
	}

	c.JSON(http.StatusOK, gin.H{
		"message":  "Import completed",
		"imported": imported,
		"total":    len(restaurants),
	})
}

// HealthCheck handles health check requests
func (h *RestaurantHandler) HealthCheck(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"status": "healthy",
		"service": "restaurant-recommendations-api",
	})
}
