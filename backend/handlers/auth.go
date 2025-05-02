// handlers/auth.go - Authentication handlers
package handlers

import (
	"net/http"
	"os"
	"time"
	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/Tabintel/multi-tenant-chat/backend/db"
	"github.com/Tabintel/multi-tenant-chat/backend/models"
	"github.com/Tabintel/multi-tenant-chat/backend/services"
	"strings"
)

var jwtSecret = []byte(os.Getenv("JWT_SECRET"))

type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type LoginResponse struct {
	Token   string `json:"token"`
	Message string `json:"message"`
}

type RegisterRequest struct {
	Name     string `json:"name" binding:"required"`
	Email    string `json:"email" binding:"required"`
	Password string `json:"password" binding:"required"`
	Role     string `json:"role" binding:"required,oneof=ADMIN MODERATOR MEMBER GUEST"`
	OrgName  string `json:"org_name" binding:"required"`
}

type RegisterResponse struct {
	ID    string `json:"id"`
	Email string `json:"email"`
	Role  string `json:"role"`
	Token string `json:"token,omitempty"`
}

// Login authenticates a user and returns a JWT token
// @Summary Login
// @Description Authenticates a user and returns a JWT token
// @Tags auth
// @Accept json
// @Produce json
// @Param login body LoginRequest true "Login credentials"
// @Success 200 {object} LoginResponse
// @Failure 400 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /auth/login [post]
func Login(c *gin.Context) {
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}
	// Validate user (fetch from DB, check password)
	var user models.User
	if err := db.DB.Where("email = ?", req.Email).First(&user).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
		return
	}
	if err := services.CheckPassword(req.Password, user.Password); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
		return
	}
	// Issue JWT token with all required claims
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"user_id": user.ID,
		"email": user.Email,
		"role": user.Role,
		"tenant_id": user.TenantID,
		"exp": time.Now().Add(24 * time.Hour).Unix(),
	})
	tokenString, err := token.SignedString(jwtSecret)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not create token"})
		return
	}
	c.JSON(http.StatusOK, LoginResponse{
		Token:   tokenString,
		Message: "Successfully logged in to the multi-tenant chat",
	})
}

// Register handles user registration (sign up)
// @Summary Register a new user
// @Description Register a new user (admin, moderator, or user)
// @Tags auth
// @Accept json
// @Produce json
// @Param register body RegisterRequest true "Registration info"
// @Success 201 {object} RegisterResponse
// @Failure 400 {object} map[string]string
// @Router /auth/register [post]
func Register(c *gin.Context) {
	var req RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request: " + err.Error()})
		return
	}

	role := strings.ToUpper(req.Role)
	if role != "ADMIN" && role != "MODERATOR" && role != "MEMBER" && role != "GUEST" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid role: must be ADMIN, MODERATOR, MEMBER, or GUEST"})
		return
	}

	var tenant models.Tenant
	if req.OrgName != "" {
		tenant = models.Tenant{Name: req.OrgName}
		if err := db.DB.Create(&tenant).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not create tenant"})
			return
		}
	}

	hash, err := services.HashPassword(req.Password)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not hash password"})
		return
	}
	user := models.User{
		Name:     req.Name,
		Email:    req.Email,
		Password: string(hash),
		Role:     models.Role(role),
		TenantID: tenant.ID,
	}
	if err := db.DB.Create(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not create user"})
		return
	}

	// Issue JWT token on successful registration
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"user_id": user.ID,
		"email": user.Email,
		"role": user.Role,
		"tenant_id": user.TenantID,
		"exp": time.Now().Add(24 * time.Hour).Unix(),
	})
	tokenString, err := token.SignedString(jwtSecret)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not create token"})
		return
	}

	c.JSON(http.StatusCreated, RegisterResponse{
		ID:    user.ID,
		Email: user.Email,
		Role:  string(user.Role),
		Token: tokenString,
	})
}
