package utils

import (
	"errors"
	"os"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v4"
	"github.com/Tabintel/multi-tenant-chat/backend/models"
)

type Claims struct {
	UserID   string `json:"user_id"`
	TenantID string `json:"tenant_id"`
	jwt.StandardClaims
}

func GenerateToken(user models.User) (string, error) {
	expirationTime := time.Now().Add(24 * time.Hour)
	claims := &Claims{
		UserID:   user.ID,
		TenantID: user.TenantID,
		StandardClaims: jwt.StandardClaims{
			ExpiresAt: expirationTime.Unix(),
		},
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString([]byte(os.Getenv("JWT_SECRET")))
	if err != nil {
		return "", err
	}
	return tokenString, nil
}

func GetUserIDFromContext(c *gin.Context) (string, error) {
	claims, exists := c.Get("claims")
	if !exists {
		return "", errors.New("no claims found in context")
	}
	userClaims, ok := claims.(*Claims)
	if !ok {
		return "", errors.New("invalid claims type")
	}
	return userClaims.UserID, nil
}

func GetTenantIDFromContext(c *gin.Context) (string, error) {
	claims, exists := c.Get("claims")
	if !exists {
		return "", errors.New("no claims found in context")
	}
	userClaims, ok := claims.(*Claims)
	if !ok {
		return "", errors.New("invalid claims type")
	}
	return userClaims.TenantID, nil
}
