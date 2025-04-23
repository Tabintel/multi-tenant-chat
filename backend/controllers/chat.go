package controllers

import (
	"net/http"
	"github.com/Tabintel/multi-tenant-chat/backend/services"
	"github.com/Tabintel/multi-tenant-chat/backend/utils"
	"github.com/gin-gonic/gin"
)

// GetChatToken generates a Stream Chat token for the authenticated user
func GetChatToken(c *gin.Context) {
	userID, err := utils.GetUserIDFromContext(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	token, err := services.GenerateStreamToken(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate chat token"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"token": token})
}
