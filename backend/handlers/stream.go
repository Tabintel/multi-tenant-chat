// handlers/stream.go - Stream Chat token endpoint
package handlers

import (
	"net/http"
	services "github.com/Tabintel/multi-tenant-chat/backend/services"
	"github.com/gin-gonic/gin"
)

func StreamToken(c *gin.Context) {
	userID := c.GetString("user_id")
	token, err := services.CreateStreamToken(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not create Stream token"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"token": token})
}
