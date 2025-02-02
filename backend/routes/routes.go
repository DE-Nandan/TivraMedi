package routes

import (
	// Replace with your module name

	"tivramedi/controllers"

	"github.com/gin-gonic/gin"
)

func RegisterRoutes(router *gin.Engine) {
	router.GET("/", controllers.Home)
	router.GET("/doctors", controllers.GetDoctors)
	router.GET("/doctors/nearby", controllers.GetNearbyDoctors)
	router.POST("/book", controllers.BookAppointment)
	router.GET("/events", gin.WrapH(controllers.BookingBroker))
}
