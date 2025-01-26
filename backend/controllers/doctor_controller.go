package controllers

import (
	"net/http"
	"tivramedi/database"
	"tivramedi/models"

	"github.com/gin-gonic/gin"
)

func GetDoctors(c *gin.Context) {
	var doctors []models.Doctor
	if err := database.DB.Find(&doctors).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch doctors"})
		return
	}

	c.JSON(http.StatusOK, doctors) // Return all doctors in JSON format
}

func GetNearbyDoctors(c *gin.Context) {
	userLatitude := c.Query("latitude")
	userLongitude := c.Query("longitude")

	var doctors []models.Doctor
	query := `
        SELECT id, name, specialty, latitude, longitude,
               ST_Distance(location, ST_SetSRID(ST_MakePoint(?, ?), 4326)) AS distance
        FROM doctors
        WHERE ST_Distance(location, ST_SetSRID(ST_MakePoint(?, ?), 4326)) < 10000
        ORDER BY distance ASC;
    `

	if err := database.DB.Raw(query, userLongitude, userLatitude, userLongitude, userLatitude).Scan(&doctors).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch nearby doctors"})
		return
	}

	c.JSON(http.StatusOK, doctors)
}
