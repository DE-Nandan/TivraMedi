package routes

import (
	// Replace with your module name

	"tivramedi/controllers"

	"github.com/gin-gonic/gin"
)

func RegisterRoutes(router *gin.Engine) {
	router.GET("/", controllers.Home)
	router.GET("/api/doctors", controllers.GetDoctors)
}
