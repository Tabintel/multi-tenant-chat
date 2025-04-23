package handlers

import (
	"net/http"
	"github.com/gin-gonic/gin"
	"github.com/Tabintel/multi-tenant-chat/backend/db"
	"github.com/Tabintel/multi-tenant-chat/backend/models"
)

// CreateChannel creates a new channel (Admin/Moderator only)
func CreateChannel(c *gin.Context) {
	var req struct {
		Name string `json:"name" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}
	userRole, _ := c.Get("user_role")
	if userRole != string(models.RoleAdmin) && userRole != string(models.RoleModerator) {
		c.JSON(http.StatusForbidden, gin.H{"error": "Insufficient permissions"})
		return
	}
	tenantID, _ := c.Get("tenant_id")
	channel := models.Channel{Name: req.Name, TenantID: tenantID.(string)}
	if err := db.DB.Create(&channel).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not create channel"})
		return
	}
	c.JSON(http.StatusCreated, channel)
}

// ListChannels lists all channels for a tenant
func ListChannels(c *gin.Context) {
	tenantID, _ := c.Get("tenant_id")
	var channels []models.Channel
	if err := db.DB.Where("tenant_id = ?", tenantID).Find(&channels).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not fetch channels"})
		return
	}
	c.JSON(http.StatusOK, channels)
}
