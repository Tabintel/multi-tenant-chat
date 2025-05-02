// handlers/stream.go - Stream Chat token endpoint
package handlers

import (
	"context"
	"net/http"
	services "github.com/Tabintel/multi-tenant-chat/backend/services"
	"github.com/gin-gonic/gin"
	stream_chat "github.com/GetStream/stream-chat-go/v5"
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

// SendMessageRequest is the payload for sending a message
// @Summary Send a message to a Stream channel
// @Description Sends a message to a Stream channel as the authenticated user
// @Tags stream
// @Accept json
// @Produce json
// @Param message body SendMessageRequest true "Message info"
// @Success 200 {object} map[string]string
// @Failure 400 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Security ApiKeyAuth
// @Router /messages [post]
type SendMessageRequest struct {
	StreamID string `json:"stream_id" binding:"required"` // Stream channel ID
	Text     string `json:"text" binding:"required"`
}

func SendMessage(c *gin.Context) {
	var req SendMessageRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}
	userID := c.GetString("user_id")
	client := services.GetStreamClient()
	channel := client.Channel("messaging", req.StreamID)
	msg := &stream_chat.Message{
		Text: req.Text,
		User: &stream_chat.User{ID: userID},
	}
	_, err := channel.SendMessage(context.Background(), msg, userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to send message: " + err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"status": "Message sent"})
}

// GetMessages fetches messages from a Stream channel
// @Summary Get messages from a Stream channel
// @Description Retrieves the most recent messages from a Stream channel
// @Tags stream
// @Produce json
// @Param stream_id path string true "Stream channel ID"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Security ApiKeyAuth
// @Router /messages/{stream_id} [get]
func GetMessages(c *gin.Context) {
	streamID := c.Param("stream_id")
	client := services.GetStreamClient()
	channel := client.Channel("messaging", streamID)
	resp, err := channel.Query(context.Background(), nil)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch messages: " + err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"messages": resp.Messages})
}
