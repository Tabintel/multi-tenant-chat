package services

import (
	"github.com/Tabintel/multi-tenant-chat/backend/db"
	"github.com/Tabintel/multi-tenant-chat/backend/models"
)

// SaveChannel persists a channel to the database
func SaveChannel(channel models.Channel) error {
	return db.DB.Create(&channel).Error
}
