// backend/middleware/auth.go
package middleware

import "github.com/gin-gonic/gin"

func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Skip auth for local development
		c.Next()
	}
}
