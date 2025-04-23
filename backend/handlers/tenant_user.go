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
// @Summary Create tenant
// @Description Creates a new tenant (organization)
// @Tags tenants
// @Accept json
// @Produce json
// @Param tenant body models.Tenant true "Tenant info"
// @Success 201 {object} models.Tenant
// @Failure 400 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Security ApiKeyAuth
// @Router /tenants [post]
func CreateTenant(c *gin.Context) {
	var req models.Tenant
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}
	if err := db.DB.Create(&req).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not create tenant"})
		return
	}
	c.JSON(http.StatusCreated, req)
}

// ListTenants lists all tenants (Admin only)
// @Summary List tenants
// @Description Lists all tenants (organizations)
// @Tags tenants
// @Produce json
// @Success 200 {array} models.Tenant
// @Failure 500 {object} map[string]string
// @Security ApiKeyAuth
// @Router /tenants [get]
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
// @Summary Create user
// @Description Creates a new user in a tenant
// @Tags users
// @Accept json
// @Produce json
// @Param user body models.User true "User info"
// @Success 201 {object} models.User
// @Failure 400 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Security ApiKeyAuth
// @Router /users [post]
func CreateUser(c *gin.Context) {
	var req models.User
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}
	hash, err := services.HashPassword(req.Password)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not hash password"})
		return
	}
	req.Password = string(hash)
	if err := db.DB.Create(&req).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not create user"})
		return
	}
	if err := services.CreateStreamUser(req); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Stream user creation failed"})
		return
	}
	c.JSON(http.StatusCreated, req)
}

// ListUsers lists all users for a tenant
// @Summary List users
// @Description Lists all users for a tenant
// @Tags users
// @Produce json
// @Success 200 {array} models.User
// @Failure 500 {object} map[string]string
// @Security ApiKeyAuth
// @Router /users [get]
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
// @Summary Update user
// @Description Updates a user's info (Admin/Moderator only)
// @Tags users
// @Accept json
// @Produce json
// @Param id path string true "User ID"
// @Param user body models.User true "User info"
// @Success 200 {object} models.User
// @Failure 400 {object} map[string]string
// @Failure 404 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Security ApiKeyAuth
// @Router /users/{id} [put]
func UpdateUser(c *gin.Context) {
	userID := c.Param("id")
	var req models.User
	var user models.User
	if err := db.DB.First(&user, "id = ?", userID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}
	if req.Name != "" {
		user.Name = req.Name
	}
	if req.Role != "" {
		user.Role = req.Role
	}
	if req.Email != "" {
		user.Email = req.Email
	}
	if err := db.DB.Save(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not update user"})
		return
	}
	c.JSON(http.StatusOK, user)
}

// DeleteUser removes a user (Admin only)
// @Summary Delete user
// @Description Removes a user (Admin only)
// @Tags users
// @Param id path string true "User ID"
// @Success 200 {object} map[string]bool
// @Failure 500 {object} map[string]string
// @Security ApiKeyAuth
// @Router /users/{id} [delete]
func DeleteUser(c *gin.Context) {
	userID := c.Param("id")
	if err := db.DB.Delete(&models.User{}, "id = ?", userID).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not delete user"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"deleted": true})
}
