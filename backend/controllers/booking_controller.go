package controllers

import (
	"net/http"
	"time"
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
		DoctorID:  bookingRequest.DoctorID,
		Customer:  "dummy_customer",
		TimeSlot:  bookingRequest.TimeSlot,
		CreatedAt: time.Now().Unix(), // Proper timestamp
	}

	// Save the booking to the database
	if err := database.DB.Create(&booking).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create booking"})
		return
	}

	//	cIP := c.ClientIP()

	// Send notification through broker
	//	msg := fmt.Sprintf("New booking for Doctor %d at %s by %s", booking.DoctorID, booking.TimeSlot, cIP)
	go func() {
		BookingBroker.UpdateDoctorAvailability(int(booking.DoctorID), false)
	}()

	c.JSON(http.StatusOK, gin.H{
		"message": "Booking created",
		"id":      booking.ID,
	})
}
