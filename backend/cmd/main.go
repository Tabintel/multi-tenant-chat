package main

import (
	"log"
	"os"

	"github.com/Tabintel/multi-tenant-chat/backend/handlers"
	"github.com/Tabintel/multi-tenant-chat/backend/middleware"
	"github.com/Tabintel/multi-tenant-chat/backend/db"
	"github.com/Tabintel/multi-tenant-chat/backend/models"
	_ "github.com/Tabintel/multi-tenant-chat/backend/docs"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	ginSwagger "github.com/swaggo/gin-swagger"
	swaggerFiles "github.com/swaggo/files"
	"github.com/gin-contrib/cors"
)

// @title Multi-Tenant Chat API
// @version 1.0
// @description API documentation for the Go + Stream multi-tenant chat system.
// @host localhost:8080
// @BasePath /
func main() {
	// Load environment variables
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, relying on environment variables")
	}

	// Connect to PostgreSQL or use mock mode
	db.Connect()

	// Configure CORS to allow Authorization header
	config := cors.DefaultConfig()
	config.AllowAllOrigins = true
	config.AllowHeaders = append(config.AllowHeaders, "Authorization")
	r := gin.Default()
	r.Use(cors.New(config))

	// Swagger docs endpoint
	r.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))

	// Auth endpoints
	r.POST("/auth/login", handlers.Login)
	r.POST("/auth/register", handlers.Register)

	// Stream Chat token endpoint (protected)
	r.GET("/stream/token", middleware.JWTAuth(), handlers.StreamToken)

	// Tenant endpoints
	r.POST("/tenants", middleware.JWTAuth(), middleware.RequireRole(string(models.RoleAdmin)), handlers.CreateTenant)
	// Make GET /tenants public for login/signup dropdown
	r.GET("/tenants", handlers.ListTenants)

	// User endpoints (Admin/Moderator for create/update, Admin for delete, all roles for list)
	r.POST("/users", middleware.JWTAuth(), middleware.RequireRole(string(models.RoleAdmin), string(models.RoleModerator)), handlers.CreateUser)
	r.GET("/users", middleware.JWTAuth(), handlers.ListUsers)
	r.PUT("/users/:id", middleware.JWTAuth(), middleware.RequireRole(string(models.RoleAdmin), string(models.RoleModerator)), handlers.UpdateUser)
	r.DELETE("/users/:id", middleware.JWTAuth(), middleware.RequireRole(string(models.RoleAdmin)), handlers.DeleteUser)

	// Channel endpoints (Admin/Moderator for create, all roles for list)
	r.POST("/channels", middleware.JWTAuth(), middleware.RequireRole(string(models.RoleAdmin), string(models.RoleModerator)), handlers.CreateChannel)
	r.GET("/channels", middleware.JWTAuth(), handlers.ListChannels)

	// Messages endpoint (all authenticated users)
	r.POST("/messages", middleware.JWTAuth(), handlers.SendMessage)
	r.GET("/messages/:stream_id", middleware.JWTAuth(), handlers.GetMessages)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	log.Printf("Starting server on :%s", port)
	r.Run(":" + port)
}
// Reminder: Set DATABASE_URL=mock in .env to activate mock mode. All endpoints and Swagger docs will be available, but no real DB operations will occur.
