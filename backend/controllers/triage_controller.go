package controllers

import (
	"io"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
)

func TriageProxy(c *gin.Context) {
	// Create HTTP client with timeout
	client := &http.Client{Timeout: 30 * time.Second}

	// Forward request to triage service
	resp, err := client.Post(
		"http://localhost:8000/triage",
		"application/json",
		c.Request.Body,
	)
	if err != nil {
		c.JSON(http.StatusBadGateway, gin.H{
			"error": "Triage service unavailable: " + err.Error(),
		})
		return
	}
	defer resp.Body.Close()

	// Copy response status and body
	c.Status(resp.StatusCode)
	io.Copy(c.Writer, resp.Body)
}
