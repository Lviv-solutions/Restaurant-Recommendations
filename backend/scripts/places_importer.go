package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"math"
	"net/http"
	"os"
	"strings"
	"time"

	"restaurant-recommendations/internal/models"
	"restaurant-recommendations/internal/weaviate"
)

// Google Places API structures
type PlacesSearchResponse struct {
	Results []PlaceResult `json:"results"`
	Status  string        `json:"status"`
}

type PlaceResult struct {
	PlaceID      string    `json:"place_id"`
	Name         string    `json:"name"`
	Rating       float64   `json:"rating"`
	PriceLevel   int       `json:"price_level"`
	Types        []string  `json:"types"`
	Geometry     Geometry  `json:"geometry"`
	BusinessStatus string  `json:"business_status"`
}

type Geometry struct {
	Location Location `json:"location"`
}

type Location struct {
	Lat float64 `json:"lat"`
	Lng float64 `json:"lng"`
}

type PlaceDetailsResponse struct {
	Result PlaceDetails `json:"result"`
	Status string       `json:"status"`
}

type PlaceDetails struct {
	PlaceID                string    `json:"place_id"`
	Name                   string    `json:"name"`
	FormattedAddress       string    `json:"formatted_address"`
	FormattedPhoneNumber   string    `json:"formatted_phone_number"`
	Rating                 float64   `json:"rating"`
	PriceLevel             int       `json:"price_level"`
	Types                  []string  `json:"types"`
	Geometry               Geometry  `json:"geometry"`
	Photos                 []Photo   `json:"photos"`
	OpeningHours           *Hours    `json:"opening_hours"`
	Website                string    `json:"website"`
	UserRatingsTotal       int       `json:"user_ratings_total"`
}

type Photo struct {
	PhotoReference string `json:"photo_reference"`
	Width          int    `json:"width"`
	Height         int    `json:"height"`
}

type Hours struct {
	OpenNow     bool     `json:"open_now"`
	WeekdayText []string `json:"weekday_text"`
}

// Configuration
type ImporterConfig struct {
	APIKey        string
	WeaviateURL   string
	SearchQueries []string
	Location      string // "lat,lng"
	Radius        int    // meters
	MaxResults    int
	BatchSize     int
}

type PlacesImporter struct {
	config       ImporterConfig
	client       *http.Client
	weaviate     weaviate.Client
	seenPlaces   map[string]bool
	importStats  ImportStats
}

type ImportStats struct {
	Searched    int
	Fetched     int
	Duplicates  int
	Imported    int
	Errors      int
	StartTime   time.Time
}

func main() {
	config := ImporterConfig{
		APIKey:     os.Getenv("GOOGLE_PLACES_API_KEY"),
		WeaviateURL: os.Getenv("WEAVIATE_URL"),
		SearchQueries: []string{
			"restaurant riyadh",
			"مطعم الرياض",
			"cafe riyadh",
			"مقهى الرياض",
			"fast food riyadh",
		},
		Location:   "24.7136,46.6753", // Riyadh center
		Radius:     50000, // 50km
		MaxResults: 200,
		BatchSize:  10,
	}

	if config.APIKey == "" {
		log.Fatal("GOOGLE_PLACES_API_KEY environment variable is required")
	}

	importer := NewPlacesImporter(config)
	
	ctx := context.Background()
	if err := importer.ImportRestaurants(ctx); err != nil {
		log.Fatalf("Import failed: %v", err)
	}
}

func NewPlacesImporter(config ImporterConfig) *PlacesImporter {
	weaviateClient, err := weaviate.NewClient(config.WeaviateURL)
	if err != nil {
		log.Fatalf("Failed to create Weaviate client: %v", err)
	}

	return &PlacesImporter{
		config:     config,
		client:     &http.Client{Timeout: 30 * time.Second},
		weaviate:   weaviateClient,
		seenPlaces: make(map[string]bool),
		importStats: ImportStats{
			StartTime: time.Now(),
		},
	}
}

func (p *PlacesImporter) ImportRestaurants(ctx context.Context) error {
	log.Println("🚀 Starting Google Places import...")
	
	// Initialize Weaviate schema
	if err := p.weaviate.InitializeSchema(ctx); err != nil {
		return fmt.Errorf("failed to initialize schema: %w", err)
	}

	var allRestaurants []models.Restaurant

	// Search for restaurants using different queries
	for _, query := range p.config.SearchQueries {
		log.Printf("🔍 Searching for: %s", query)
		
		places, err := p.searchPlaces(query)
		if err != nil {
			log.Printf("❌ Search failed for '%s': %v", query, err)
			p.importStats.Errors++
			continue
		}

		log.Printf("📍 Found %d places for query: %s", len(places), query)
		p.importStats.Searched += len(places)

		// Get detailed information for each place
		for _, place := range places {
			if p.seenPlaces[place.PlaceID] {
				p.importStats.Duplicates++
				continue
			}
			p.seenPlaces[place.PlaceID] = true

			restaurant, err := p.fetchPlaceDetails(place.PlaceID)
			if err != nil {
				log.Printf("❌ Failed to fetch details for %s: %v", place.Name, err)
				p.importStats.Errors++
				continue
			}

			if restaurant != nil {
				allRestaurants = append(allRestaurants, *restaurant)
				p.importStats.Fetched++
			}

			// Rate limiting
			time.Sleep(100 * time.Millisecond)
		}
	}

	// Remove near-duplicates
	uniqueRestaurants := p.removeDuplicates(allRestaurants)
	log.Printf("📊 Removed %d duplicates, %d unique restaurants remain", 
		len(allRestaurants)-len(uniqueRestaurants), len(uniqueRestaurants))

	// Import to Weaviate in batches
	if err := p.importToWeaviate(ctx, uniqueRestaurants); err != nil {
		return fmt.Errorf("failed to import to Weaviate: %w", err)
	}

	p.printStats()
	return nil
}

func (p *PlacesImporter) searchPlaces(query string) ([]PlaceResult, error) {
	url := fmt.Sprintf(
		"https://maps.googleapis.com/maps/api/place/textsearch/json?query=%s&location=%s&radius=%d&type=restaurant&key=%s",
		strings.ReplaceAll(query, " ", "+"),
		p.config.Location,
		p.config.Radius,
		p.config.APIKey,
	)

	resp, err := p.client.Get(url)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	var searchResp PlacesSearchResponse
	if err := json.NewDecoder(resp.Body).Decode(&searchResp); err != nil {
		return nil, err
	}

	if searchResp.Status != "OK" && searchResp.Status != "ZERO_RESULTS" {
		return nil, fmt.Errorf("API error: %s", searchResp.Status)
	}

	return searchResp.Results, nil
}

func (p *PlacesImporter) fetchPlaceDetails(placeID string) (*models.Restaurant, error) {
	fields := "place_id,name,formatted_address,formatted_phone_number,rating,price_level,types,geometry,photos,opening_hours,website,user_ratings_total"
	url := fmt.Sprintf(
		"https://maps.googleapis.com/maps/api/place/details/json?place_id=%s&fields=%s&key=%s",
		placeID, fields, p.config.APIKey,
	)

	resp, err := p.client.Get(url)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	var detailsResp PlaceDetailsResponse
	if err := json.NewDecoder(resp.Body).Decode(&detailsResp); err != nil {
		return nil, err
	}

	if detailsResp.Status != "OK" {
		return nil, fmt.Errorf("API error: %s", detailsResp.Status)
	}

	return p.convertToRestaurant(detailsResp.Result), nil
}

func (p *PlacesImporter) convertToRestaurant(place PlaceDetails) *models.Restaurant {
	// Skip if not a restaurant
	if !p.isRestaurant(place.Types) {
		return nil
	}

	restaurant := &models.Restaurant{
		ID:          place.PlaceID,
		Name:        place.Name,
		Description: p.generateDescription(place),
		Rating:      place.Rating,
		Location: models.Location{
			Latitude:  place.Geometry.Location.Lat,
			Longitude: place.Geometry.Location.Lng,
		},
		ImageURL: p.getPhotoURL(place.Photos),
	}

	// Normalize price tier
	restaurant.PriceTier = p.normalizePriceTier(place.PriceLevel)
	
	// Estimate average bill
	restaurant.AvgBillFor3 = p.estimateAvgBill(place.PriceLevel)

	// Extract cuisine types
	restaurant.Cuisine = p.extractCuisine(place.Types, place.Name)

	// Extract events/atmosphere
	restaurant.Events = p.extractEvents(place.Types, place.OpeningHours)

	return restaurant
}

func (p *PlacesImporter) isRestaurant(types []string) bool {
	restaurantTypes := map[string]bool{
		"restaurant": true, "food": true, "meal_takeaway": true,
		"meal_delivery": true, "cafe": true, "bakery": true,
	}

	for _, t := range types {
		if restaurantTypes[t] {
			return true
		}
	}
	return false
}

func (p *PlacesImporter) normalizePriceTier(priceLevel int) string {
	switch priceLevel {
	case 1:
		return "low"
	case 2:
		return "medium"
	case 3, 4:
		return "high"
	default:
		return "medium"
	}
}

func (p *PlacesImporter) estimateAvgBill(priceLevel int) float64 {
	switch priceLevel {
	case 1:
		return 90  // Budget: 30 SAR per person
	case 2:
		return 180 // Medium: 60 SAR per person
	case 3:
		return 300 // High: 100 SAR per person
	case 4:
		return 450 // Premium: 150 SAR per person
	default:
		return 180 // Default medium
	}
}

func (p *PlacesImporter) extractCuisine(types []string, name string) []string {
	cuisineMap := map[string]string{
		"italian": "Italian", "chinese": "Chinese", "japanese": "Japanese",
		"indian": "Indian", "mexican": "Mexican", "thai": "Thai",
		"french": "French", "american": "American", "mediterranean": "Mediterranean",
		"lebanese": "Lebanese", "turkish": "Turkish", "korean": "Korean",
	}

	var cuisines []string
	nameAndTypes := strings.ToLower(strings.Join(append(types, name), " "))

	for key, cuisine := range cuisineMap {
		if strings.Contains(nameAndTypes, key) {
			cuisines = append(cuisines, cuisine)
		}
	}

	// Default based on types
	for _, t := range types {
		switch t {
		case "cafe":
			cuisines = append(cuisines, "Cafe")
		case "bakery":
			cuisines = append(cuisines, "Bakery")
		case "meal_takeaway":
			cuisines = append(cuisines, "Fast Food")
		}
	}

	if len(cuisines) == 0 {
		cuisines = []string{"International"}
	}

	return p.removeDuplicateStrings(cuisines)
}

func (p *PlacesImporter) extractEvents(types []string, hours *Hours) []string {
	var events []string

	// Based on types
	for _, t := range types {
		switch t {
		case "night_club", "bar":
			events = append(events, "Nightlife")
		case "cafe":
			events = append(events, "Casual Dining")
		}
	}

	// Based on hours
	if hours != nil && hours.OpenNow {
		events = append(events, "Currently Open")
	}

	// Default events
	events = append(events, "Family Friendly", "Dine In")

	return p.removeDuplicateStrings(events)
}

func (p *PlacesImporter) generateDescription(place PlaceDetails) string {
	desc := fmt.Sprintf("Located at %s", place.FormattedAddress)
	
	if place.Rating > 0 {
		desc += fmt.Sprintf(" with a %v star rating", place.Rating)
	}
	
	if place.UserRatingsTotal > 0 {
		desc += fmt.Sprintf(" based on %d reviews", place.UserRatingsTotal)
	}

	return desc + "."
}

func (p *PlacesImporter) getPhotoURL(photos []Photo) string {
	if len(photos) == 0 {
		return "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=500"
	}

	// Use Google Photos API
	return fmt.Sprintf(
		"https://maps.googleapis.com/maps/api/place/photo?maxwidth=500&photo_reference=%s&key=%s",
		photos[0].PhotoReference, p.config.APIKey,
	)
}

func (p *PlacesImporter) removeDuplicates(restaurants []models.Restaurant) []models.Restaurant {
	var unique []models.Restaurant
	seen := make(map[string]bool)

	for _, r := range restaurants {
		key := p.generateDedupeKey(r)
		if !seen[key] {
			seen[key] = true
			unique = append(unique, r)
		}
	}

	return unique
}

func (p *PlacesImporter) generateDedupeKey(r models.Restaurant) string {
	// Normalize name and location for deduplication
	name := strings.ToLower(strings.TrimSpace(r.Name))
	lat := math.Round(r.Location.Latitude*1000) / 1000
	lng := math.Round(r.Location.Longitude*1000) / 1000
	
	return fmt.Sprintf("%s_%.3f_%.3f", name, lat, lng)
}

func (p *PlacesImporter) removeDuplicateStrings(slice []string) []string {
	seen := make(map[string]bool)
	var result []string
	
	for _, item := range slice {
		if !seen[item] {
			seen[item] = true
			result = append(result, item)
		}
	}
	
	return result
}

func (p *PlacesImporter) importToWeaviate(ctx context.Context, restaurants []models.Restaurant) error {
	log.Printf("📤 Importing %d restaurants to Weaviate...", len(restaurants))

	for i := 0; i < len(restaurants); i += p.config.BatchSize {
		end := i + p.config.BatchSize
		if end > len(restaurants) {
			end = len(restaurants)
		}

		batch := restaurants[i:end]
		for _, restaurant := range batch {
			if err := p.weaviate.AddRestaurant(ctx, &restaurant); err != nil {
				log.Printf("❌ Failed to import %s: %v", restaurant.Name, err)
				p.importStats.Errors++
			} else {
				p.importStats.Imported++
				log.Printf("✅ Imported: %s", restaurant.Name)
			}
		}

		// Rate limiting between batches
		time.Sleep(500 * time.Millisecond)
	}

	return nil
}

func (p *PlacesImporter) printStats() {
	duration := time.Since(p.importStats.StartTime)
	
	log.Println("\n📊 Import Statistics:")
	log.Printf("⏱️  Duration: %v", duration)
	log.Printf("🔍 Places searched: %d", p.importStats.Searched)
	log.Printf("📥 Details fetched: %d", p.importStats.Fetched)
	log.Printf("🔄 Duplicates removed: %d", p.importStats.Duplicates)
	log.Printf("✅ Successfully imported: %d", p.importStats.Imported)
	log.Printf("❌ Errors: %d", p.importStats.Errors)
	log.Printf("📈 Success rate: %.1f%%", 
		float64(p.importStats.Imported)/float64(p.importStats.Fetched)*100)
}
