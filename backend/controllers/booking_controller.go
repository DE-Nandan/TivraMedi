package controllers

import (
	"fmt"
	"net/http"
	"tivramedi/database"
	"tivramedi/models"

	"github.com/gin-gonic/gin"
)

func BookAppointment(c *gin.Context) {
	var bookingRequest struct {
		DoctorID uint   `json:"doctor_id" binding:"required"`
		TimeSlot string `json:"time_slot" binding:"required"`
	}

	if err := c.ShouldBindJSON(&bookingRequest); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err})
		return
	}

	// Creating a dummy booking (can replace this logic later with real user authentication)
	booking := models.Booking{
		DoctorID:   bookingRequest.DoctorID,
		CustomerID: 1, // dummy customer
		TimeSlot:   bookingRequest.TimeSlot,
		CreatedAt:  "gibberish",
		UpdatedAt:  "gib2", // Use real timestamp later
	}

	// Save the booking to the database
	if err := database.DB.Create(&booking).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create booking"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": fmt.Sprintf("Booking created for Doctor ID %d at %s", booking.DoctorID, booking.TimeSlot),
	})
}
