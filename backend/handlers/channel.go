package handlers

import (
	"net/http"
	"github.com/gin-gonic/gin"
	"github.com/Tabintel/multi-tenant-chat/backend/db"
	"github.com/Tabintel/multi-tenant-chat/backend/models"
)

// CreateChannel creates a new channel (Admin/Moderator only)
// @Summary Create a channel
// @Description Creates a new chat channel for the tenant
// @Tags channels
// @Accept json
// @Produce json
// @Param channel body models.Channel true "Channel info"
// @Success 201 {object} models.Channel
// @Failure 400 {object} map[string]string
// @Failure 403 {object} map[string]string
// @Security ApiKeyAuth
// @Router /channels [post]
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
// @Summary List channels
// @Description Lists all chat channels for the tenant
// @Tags channels
// @Produce json
// @Success 200 {array} models.Channel
// @Failure 500 {object} map[string]string
// @Security ApiKeyAuth
// @Router /channels [get]
func ListChannels(c *gin.Context) {
	tenantID, _ := c.Get("tenant_id")
	var channels []models.Channel
	if err := db.DB.Where("tenant_id = ?", tenantID).Find(&channels).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not fetch channels"})
		return
	}
	c.JSON(http.StatusOK, channels)
}
