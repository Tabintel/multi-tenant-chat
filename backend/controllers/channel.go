package controllers

import (
	"net/http"
	"github.com/Tabintel/multi-tenant-chat/backend/models"
	"github.com/Tabintel/multi-tenant-chat/backend/services"
	"github.com/Tabintel/multi-tenant-chat/backend/utils"
	"github.com/gin-gonic/gin"
)

type CreateChannelRequest struct {
	Name        string `json:"name" binding:"required"`
	Description string `json:"description"`
}

// GetChannels returns all channels for the user's tenant
func GetChannels(c *gin.Context) {
	_, err := utils.GetUserIDFromContext(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	tenantID, err := utils.GetTenantIDFromContext(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	channels, err := services.GetTenantChannels(tenantID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get channels"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"channels": channels})
}

// CreateChannel creates a new channel
func CreateChannel(c *gin.Context) {
	var req CreateChannelRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	userID, err := utils.GetUserIDFromContext(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	tenantID, err := utils.GetTenantIDFromContext(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	channel := models.Channel{
		Name:        req.Name,
		Description: req.Description,
		TenantID:    tenantID,
		CreatedBy:   userID,
	}

	channelID, err := services.CreateStreamChannel(channel, userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create channel"})
		return
	}

	channel.ID = channelID
	// Save channel to DB
	if err := services.SaveChannel(channel); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save channel"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"channel": channel})
}
