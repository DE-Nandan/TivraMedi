package routes

import (
	// Replace with your module name

	"tivramedi/controllers"
	"tivramedi/middleware"

	"github.com/gin-gonic/gin"
)

func RegisterRoutes(router *gin.Engine) {
	router.GET("/", controllers.Home)
	router.GET("/doctors", controllers.GetDoctors)
	router.GET("/doctors/nearby", controllers.GetNearbyDoctors)
	router.POST("/book", controllers.BookAppointment)
	router.GET("/events", gin.WrapH(controllers.BookingBroker))
	triageGroup := router.Group("/triage")
	{
		triageGroup.Use(middleware.AuthMiddleware())
		triageGroup.POST("/", controllers.TriageProxy)
	}
}
