package main

import (
	"tivramedi/database"
	"tivramedi/routes"

	"github.com/gin-gonic/gin"
)

func main() {
	database.ConnectDatabase()
	// Create a Gin router
	router := gin.Default()

	routes.RegisterRoutes(router)
	// Start the server on port 8080
	router.Run(":8080")
}
