// handlers/stream.go - Stream Chat token endpoint
package handlers

import (
	"net/http"
	services "github.com/Tabintel/multi-tenant-chat/backend/services"
	"github.com/gin-gonic/gin"
)

// StreamToken issues a Stream Chat token for the authenticated user
// @Summary Get Stream Chat token
// @Description Issues a Stream Chat token for the authenticated user
// @Tags stream
// @Produce json
// @Success 200 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Security ApiKeyAuth
// @Router /stream/token [get]
func StreamToken(c *gin.Context) {
	userID := c.GetString("user_id")
	token, err := services.CreateStreamToken(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not create Stream token"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"token": token})
}
