package main

import (
	"bytes"
	"fmt"
	"os"
	"time"
	"tivramedi/database"
	"tivramedi/routes"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	// Initialize database
	database.ConnectDatabase()

	// Disable Gin's debug logging
	gin.SetMode(gin.ReleaseMode)
	gin.DefaultWriter = &bytes.Buffer{} // Discard Gin's logs

	// Create Gin router without any default middleware
	router := gin.New()

	// 1. Add your custom logging middleware as the very first middleware
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

	// 3. Add CORS middleware
	router.Use(cors.New(cors.Config{
		AllowOrigins: []string{
			"http://localhost:5173",
			"http://192.168.1.5:5173",
			"http://192.168.1.2:5173",
			"http://192.168.10.1:5173",
			"http://192.168.1.3:5173",
			"http://192.168.40.1:5173",
			"http://192.168.1.6:5173",
		},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * 60 * 60, // 12 hours
	}))

	// 4. Register routes
	routes.RegisterRoutes(router)

	// 5. Start server with proper logging
	fmt.Println("Starting server on :8080...")
	if err := router.Run("0.0.0.0:8080"); err != nil {
		fmt.Fprintf(os.Stderr, "Server failed: %v\n", err)
		os.Exit(1)
	}
}
