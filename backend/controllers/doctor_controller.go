package controllers

import (
	"log"
	"net/http"
	"strconv"
	"tivramedi/database"
	"tivramedi/models"

	"github.com/gin-gonic/gin"
)

func GetNearbyDoctors(c *gin.Context) {
	// Get latitude and longitude from query parameters
	lat, err := strconv.ParseFloat(c.DefaultQuery("lat", "0"), 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid latitude"})
		return
	}
	lng, err := strconv.ParseFloat(c.DefaultQuery("lng", "0"), 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid longitude"})
		return
	}

	// Fetch doctors from database (you can enhance this query for more complex searches)
	var doctors []models.Doctor
	err = database.DB.Where("ST_Distance(location, ST_SetSRID(ST_MakePoint(?, ?), 4326)) < 10000", lng, lat).Find(&doctors).Error
	if err != nil {
		log.Println("Error fetching doctors:", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch doctors"})
		return
	}

	c.JSON(http.StatusOK, doctors)
}
