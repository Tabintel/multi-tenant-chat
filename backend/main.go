// main.go - Entry point for the Go backend
package main

import (
	"log"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"

	"github.com/Tabintel/multi-tenant-chat/backend/controllers"
	"github.com/Tabintel/multi-tenant-chat/backend/middleware"
	"github.com/Tabintel/multi-tenant-chat/backend/db"
)

func main() {
	// Load environment variables
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, relying on environment variables")
	}

	// Connect to PostgreSQL
	db.Connect()

	r := gin.Default()

	// Auth endpoints
	r.POST("/auth/login", controllers.Login)

	// Stream Chat token endpoint (protected)
	r.GET("/stream/token", middleware.AuthMiddleware(), controllers.GetChatToken)

	// Tenant endpoints
	r.POST("/tenants", middleware.AuthMiddleware(), controllers.CreateTenant)
	r.GET("/tenants", middleware.AuthMiddleware(), controllers.ListTenants)

	// User endpoints
	r.POST("/users", middleware.AuthMiddleware(), controllers.CreateUser)
	r.GET("/users", middleware.AuthMiddleware(), controllers.ListUsers)
	r.PUT("/users/:id", middleware.AuthMiddleware(), controllers.UpdateUser)
	r.DELETE("/users/:id", middleware.AuthMiddleware(), controllers.DeleteUser)

	// Channel endpoints
	r.POST("/channels", middleware.AuthMiddleware(), controllers.CreateChannel)
	r.GET("/channels", middleware.AuthMiddleware(), controllers.GetChannels)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	log.Printf("Starting server on :%s", port)
	r.Run(":" + port)
}
