package main

import (
	"context"
	"log"
	"os"
	"time"

	"restaurant-recommendations/internal/handlers"
	"restaurant-recommendations/internal/weaviate"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	// Get configuration from environment
	weaviateURL := getEnv("WEAVIATE_URL", "http://localhost:8080")
	port := getEnv("PORT", "8000")

	// Initialize Weaviate client
	weaviateClient, err := weaviate.NewClient(weaviateURL)
	if err != nil {
		log.Fatalf("Failed to create Weaviate client: %v", err)
	}

	// Wait for Weaviate to be ready and initialize schema
	ctx, cancel := context.WithTimeout(context.Background(), 60*time.Second)
	defer cancel()

	log.Println("Waiting for Weaviate to be ready...")
	time.Sleep(10 * time.Second) // Give Weaviate time to start

	if err := weaviateClient.InitializeSchema(ctx); err != nil {
		log.Fatalf("Failed to initialize Weaviate schema: %v", err)
	}

	// Initialize handlers
	restaurantHandler := handlers.NewRestaurantHandler(weaviateClient)

	// Setup Gin router
	router := gin.Default()

	// Configure CORS - Allow all origins for demo
	config := cors.DefaultConfig()
	config.AllowAllOrigins = true
	config.AllowMethods = []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"}
	config.AllowHeaders = []string{"Origin", "Content-Type", "Accept", "Authorization"}
	router.Use(cors.New(config))

	// API routes
	api := router.Group("/api")
	{
		api.GET("/health", restaurantHandler.HealthCheck)
		api.GET("/search", restaurantHandler.SearchRestaurants)
		api.GET("/recommendations", restaurantHandler.GetRecommendations)
		api.GET("/restaurants/:id", restaurantHandler.GetRestaurant)
		api.POST("/import", restaurantHandler.ImportRestaurants)
	}

	// Start server
	log.Printf("Starting server on port %s", port)
	if err := router.Run(":" + port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}
