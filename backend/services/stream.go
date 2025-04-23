package services

import (
	"os"
	"time"
	"context"
	"fmt"
	"log"
	"sync"
	stream "github.com/GetStream/stream-chat-go/v5"
	"github.com/google/uuid"
	"github.com/Tabintel/multi-tenant-chat/backend/models"
	"golang.org/x/crypto/bcrypt"
)

var streamClient *stream.Client
var once sync.Once

// GetStreamClient returns a singleton Stream Chat client
func GetStreamClient() *stream.Client {
	once.Do(func() {
		apiKey := os.Getenv("STREAM_API_KEY")
		apiSecret := os.Getenv("STREAM_API_SECRET")
		if apiKey == "" || apiSecret == "" {
			log.Fatal("STREAM_API_KEY and STREAM_API_SECRET must be set")
		}
		var err error
		streamClient, err = stream.NewClient(apiKey, apiSecret)
		if err != nil {
			log.Fatalf("Failed to initialize Stream Chat client: %v", err)
		}
	})
	return streamClient
}

// CreateStreamToken generates a Stream Chat token for a user
func CreateStreamToken(userID string) (string, error) {
	if userID == "" {
		return "", fmt.Errorf("userID is required for token generation")
	}
	c := GetStreamClient()
	token, err := c.CreateToken(userID, time.Now().Add(24*time.Hour))
	return token, err
}

func GenerateStreamToken(userID string) (string, error) {
	return CreateStreamToken(userID)
}

func CreateStreamUser(user models.User) error {
	client := GetStreamClient()
	_, err := client.UpsertUser(context.Background(), &stream.User{
		ID:   user.ID,
		Name: user.Name,
		Role: string(user.Role),
		ExtraData: map[string]interface{}{
			"tenant_id": user.TenantID,
			"email":     user.Email,
		},
	})
	return err
}

func CreateStreamChannel(channel models.Channel, creatorID string) (string, error) {
	client := GetStreamClient()
	channelID := channel.TenantID + "-" + uuid.New().String()
	ch, err := client.CreateChannel(
		context.Background(),
		"messaging",
		channelID,
		creatorID,
		&stream.ChannelRequest{
			Members: []string{creatorID},
			ExtraData: map[string]interface{}{
				"tenant_id": channel.TenantID,
				"name": channel.Name,
				"description": channel.Description,
			},
		},
	)
	if err != nil {
		return "", err
	}
	return ch.Channel.ID, nil // ch is *CreateChannelResponse
}

func GetTenantChannels(tenantID string) ([]models.Channel, error) {
	client := GetStreamClient()
	filter := map[string]interface{}{
		"tenant_id": tenantID,
		"type":      "messaging",
	}
	resp, err := client.QueryChannels(context.Background(), &stream.QueryOption{
		Filter: filter,
		Limit:  100,
	})
	if err != nil {
		return nil, err
	}
	result := make([]models.Channel, len(resp.Channels))
	for i, ch := range resp.Channels {
		name, _ := ch.ExtraData["name"].(string)
		description, _ := ch.ExtraData["description"].(string)
		createdBy := ""
		if ch.CreatedBy != nil {
			createdBy = ch.CreatedBy.ID
		}
		result[i] = models.Channel{
			ID:          ch.ID,
			Name:        name,
			Description: description,
			TenantID:    tenantID,
			CreatedBy:   createdBy,
		}
	}
	return result, nil
}

// HashPassword hashes a plaintext password using bcrypt
func HashPassword(password string) ([]byte, error) {
	return bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
}
