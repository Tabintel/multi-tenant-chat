package handlers

import (
	"net/http"
	"github.com/gin-gonic/gin"
	"github.com/Tabintel/multi-tenant-chat/backend/db"
	"github.com/Tabintel/multi-tenant-chat/backend/models"
	"github.com/Tabintel/multi-tenant-chat/backend/services"
)

// --- TENANT HANDLERS ---

// CreateTenant creates a new tenant (Admin only)
func CreateTenant(c *gin.Context) {
	var req struct {
		Name string `json:"name" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}
	tenant := models.Tenant{Name: req.Name}
	if err := db.DB.Create(&tenant).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not create tenant"})
		return
	}
	c.JSON(http.StatusCreated, tenant)
}

// ListTenants lists all tenants (Admin only)
func ListTenants(c *gin.Context) {
	var tenants []models.Tenant
	if err := db.DB.Find(&tenants).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not fetch tenants"})
		return
	}
	c.JSON(http.StatusOK, tenants)
}

// --- USER HANDLERS ---

// CreateUser creates a new user in a tenant
func CreateUser(c *gin.Context) {
	var req struct {
		Name     string      `json:"name" binding:"required"`
		Email    string      `json:"email" binding:"required"`
		Password string      `json:"password" binding:"required"`
		Role     models.Role `json:"role" binding:"required"`
		TenantID string      `json:"tenant_id" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
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
		Role:     req.Role,
		TenantID: req.TenantID,
	}
	if err := db.DB.Create(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not create user"})
		return
	}
	if err := services.CreateStreamUser(user); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Stream user creation failed"})
		return
	}
	c.JSON(http.StatusCreated, user)
}

// ListUsers lists all users for a tenant
func ListUsers(c *gin.Context) {
	tenantID, _ := c.Get("tenant_id")
	var users []models.User
	if err := db.DB.Where("tenant_id = ?", tenantID).Find(&users).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not fetch users"})
		return
	}
	c.JSON(http.StatusOK, users)
}

// UpdateUser updates a user's info (Admin/Moderator only)
func UpdateUser(c *gin.Context) {
	userID := c.Param("id")
	var req struct {
		Name  *string      `json:"name"`
		Role  *models.Role `json:"role"`
		Email *string      `json:"email"`
	}
	var user models.User
	if err := db.DB.First(&user, "id = ?", userID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}
	if req.Name != nil {
		user.Name = *req.Name
	}
	if req.Role != nil {
		user.Role = *req.Role
	}
	if req.Email != nil {
		user.Email = *req.Email
	}
	if err := db.DB.Save(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not update user"})
		return
	}
	c.JSON(http.StatusOK, user)
}

// DeleteUser removes a user (Admin only)
func DeleteUser(c *gin.Context) {
	userID := c.Param("id")
	if err := db.DB.Delete(&models.User{}, "id = ?", userID).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not delete user"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"deleted": true})
}
