// db/db.go - GORM PostgreSQL connection
package db

import (
	"fmt"
	"log"
	"os"

	"github.com/Tabintel/multi-tenant-chat/backend/models"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var DB *gorm.DB

func Connect() {
	dsn := os.Getenv("DATABASE_URL")
	if dsn == "" {
		log.Fatal("DATABASE_URL environment variable is required")
	}
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	DB = db
	// Auto-migrate models
	err = db.AutoMigrate(&models.Tenant{}, &models.User{}, &models.Channel{})
	if err != nil {
		log.Fatalf("Failed to migrate database: %v", err)
	}
	fmt.Println("Database connected and migrated")
}
