package controllers

import (
	"github.com/gin-gonic/gin"
)

func GetDoctors(c *gin.Context) {
	doctors := []gin.H{
		{"id": 1, "name": "Dr. Alice", "specialty": "Cardiology"},
		{"id": 2, "name": "Dr. Bob", "specialty": "Neurology"},
	}
	c.JSON(200, doctors)
}
