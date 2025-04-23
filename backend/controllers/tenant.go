package controllers

import (
	"net/http"
	"github.com/Tabintel/multi-tenant-chat/backend/db"
	"github.com/Tabintel/multi-tenant-chat/backend/models"
	"github.com/gin-gonic/gin"
)

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

func ListTenants(c *gin.Context) {
	var tenants []models.Tenant
	if err := db.DB.Find(&tenants).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not fetch tenants"})
		return
	}
	c.JSON(http.StatusOK, tenants)
}
