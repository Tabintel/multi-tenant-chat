package middleware

import (
	"net/http"
	"github.com/gin-gonic/gin"
)

// RequireRole is middleware to enforce RBAC on endpoints
func RequireRole(roles ...string) gin.HandlerFunc {
	return func(c *gin.Context) {
		userRole, exists := c.Get("user_role")
		if !exists {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Missing user role"})
			return
		}
		for _, role := range roles {
			if userRole == role {
				c.Next()
				return
			}
		}
		c.AbortWithStatusJSON(http.StatusForbidden, gin.H{"error": "Insufficient permissions"})
	}
}
