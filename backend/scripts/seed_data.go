package main

import (
	"context"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"os"
	"time"

	"restaurant-recommendations/internal/models"
	"restaurant-recommendations/internal/weaviate"
)

func main() {
	// Get Weaviate URL from environment or use default
	weaviateURL := os.Getenv("WEAVIATE_URL")
	if weaviateURL == "" {
		weaviateURL = "http://localhost:8080"
	}

	// Initialize Weaviate client
	client, err := weaviate.NewClient(weaviateURL)
	if err != nil {
		log.Fatalf("Failed to create Weaviate client: %v", err)
	}

	// Wait for Weaviate to be ready
	log.Println("Waiting for Weaviate to be ready...")
	time.Sleep(5 * time.Second)

	ctx := context.Background()

	// Initialize schema
	if err := client.InitializeSchema(ctx); err != nil {
		log.Fatalf("Failed to initialize schema: %v", err)
	}

	// Load sample data
	dataFile := "data/sample_restaurants.json"
	if len(os.Args) > 1 {
		dataFile = os.Args[1]
	}

	log.Printf("Loading data from %s", dataFile)
	data, err := ioutil.ReadFile(dataFile)
	if err != nil {
		log.Fatalf("Failed to read data file: %v", err)
	}

	var restaurants []models.Restaurant
	if err := json.Unmarshal(data, &restaurants); err != nil {
		log.Fatalf("Failed to parse JSON data: %v", err)
	}

	// Import restaurants
	log.Printf("Importing %d restaurants...", len(restaurants))
	imported := 0
	for i, restaurant := range restaurants {
		if restaurant.Name == "" || restaurant.Description == "" {
			log.Printf("Skipping restaurant %d: missing name or description", i)
			continue
		}

		if err := client.AddRestaurant(ctx, &restaurant); err != nil {
			log.Printf("Failed to import restaurant %s: %v", restaurant.Name, err)
			continue
		}

		imported++
		log.Printf("Imported: %s", restaurant.Name)
	}

	log.Printf("Successfully imported %d out of %d restaurants", imported, len(restaurants))
	fmt.Printf("Data seeding completed!\n")
}
