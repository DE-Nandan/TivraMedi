package routes

import (
	// Replace with your module name

	"net/http"
	"tivramedi/controllers"
	"tivramedi/middleware"

	"github.com/gin-gonic/gin"
)

func RegisterRoutes(router *gin.Engine) {
	router.GET("/", controllers.Home)
	router.GET("/doctors", controllers.GetDoctors)
	router.GET("/doctors/nearby", controllers.GetNearbyDoctors)
	router.POST("/book", controllers.BookAppointment)
	// ADD: Handle CORS preflight for events endpoint
	router.OPTIONS("/events", func(c *gin.Context) {
		c.Header("Access-Control-Allow-Origin", "*")
		c.Header("Access-Control-Allow-Methods", "GET, OPTIONS")
		c.Header("Access-Control-Allow-Headers", "Cache-Control")
		c.Status(http.StatusOK)
	})
	router.GET("/events", gin.WrapH(controllers.BookingBroker))
	triageGroup := router.Group("/triage")
	{
		triageGroup.Use(middleware.AuthMiddleware())
		triageGroup.POST("/", controllers.TriageProxy)
	}
}
