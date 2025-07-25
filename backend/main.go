package main

import (
	"bytes"
	"fmt"
	"log"
	"os"
	"strings" // Add this missing import
	"time"
	"tivramedi/controllers"
	"tivramedi/database"
	"tivramedi/routes"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	// Initialize database
	database.ConnectDatabase()

	// Set Gin mode from environment variable, default to release
	ginMode := os.Getenv("GIN_MODE")
	if ginMode == "" {
		ginMode = gin.ReleaseMode
	}
	gin.SetMode(ginMode)

	// Only disable Gin's default logging in release mode
	if ginMode == gin.ReleaseMode {
		gin.DefaultWriter = &bytes.Buffer{}
	}

	// Create Gin router without any default middleware
	router := gin.New()

	// 1. Add custom logging middleware
	router.Use(func(c *gin.Context) {
		start := time.Now()
		fmt.Printf("\n[%s] --- Incoming Request ---\n", start.Format("2006/01/02 - 15:04:05"))
		fmt.Printf("From: %s\n", c.Request.RemoteAddr)
		fmt.Printf("Origin: %s\n", c.Request.Header.Get("Origin"))
		fmt.Printf("Method: %s\n", c.Request.Method)
		fmt.Printf("Path: %s\n", c.Request.URL.Path)

		// Log Authorization header safely
		if auth := c.Request.Header.Get("Authorization"); auth != "" {
			if len(auth) > 7 {
				fmt.Printf("Authorization: %s...\n", auth[:7])
			} else {
				fmt.Println("Authorization: [present]")
			}
		} else {
			fmt.Println("Authorization: [not present]")
		}

		c.Next()

		latency := time.Since(start)
		fmt.Printf("Status: %d\n", c.Writer.Status())
		fmt.Printf("Latency: %s\n", latency)
		fmt.Println("--- Request Completed ---")

		// Flush output immediately
		os.Stdout.Sync()
	})

	// 2. Add recovery middleware
	router.Use(gin.Recovery())

	// 3. Add CORS middleware with Docker-compatible origins
	corsConfig := cors.Config{
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * 60 * 60, // 12 hours
	}

	// Set allowed origins based on environment
	allowedOrigins := os.Getenv("ALLOWED_ORIGINS")
	if allowedOrigins != "" {
		// Parse comma-separated origins from environment variable
		corsConfig.AllowOrigins = strings.Split(allowedOrigins, ",")
	} else {
		// Default origins for different environments
		corsConfig.AllowOrigins = []string{
			"http://localhost:3000", // Docker frontend
			"http://localhost:5173", // Vite dev server
			"http://localhost:8080", // Self-reference
			"http://frontend:80",    // Docker Compose frontend service
		}
	}

	router.Use(cors.New(corsConfig))

	controllers.BookingBroker.StartHeartbeat()

	// 4. Add health check endpoint (important for Docker)
	router.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status":    "healthy",
			"timestamp": time.Now().UTC(),
			"service":   "tivramedi-backend",
		})
	})

	// 5. Register application routes
	routes.RegisterRoutes(router)

	// 6. Get port from environment variable with fallback
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	// 7. Start server with proper error handling
	fmt.Printf("Starting TivraMedi backend server on port %s...\n", port)
	fmt.Printf("Environment: %s\n", ginMode)
	fmt.Printf("CORS Origins: %v\n", corsConfig.AllowOrigins)

	if err := router.Run("0.0.0.0:" + port); err != nil {
		log.Fatalf("Failed to start server on port %s: %v", port, err)
	}
}
