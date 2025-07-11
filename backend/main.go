package main

import (
	"tivramedi/database"
	"tivramedi/routes"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {

	database.ConnectDatabase()
	// Create a Gin router
	router := gin.Default()

	// Add CORS middleware
	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:5173", "http://192.168.1.5:5173", "http://192.168.1.2:5173", "http://192.168.10.1:5173/"}, // Add your frontend's origin here
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
		AllowCredentials: true,
	}))

	routes.RegisterRoutes(router)
	// Start the server on port 8080
	router.Run("0.0.0.0:8080")
}
