// models/models.go - GORM models for multi-tenant chat
package models

import (
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Role string

const (
	RoleAdmin     Role = "ADMIN"
	RoleModerator Role = "MODERATOR"
	RoleMember    Role = "MEMBER"
	RoleGuest     Role = "GUEST"
)

type Tenant struct {
	ID   string `gorm:"type:uuid;primaryKey"`
	Name string `gorm:"uniqueIndex;not null"`
}

func (t *Tenant) BeforeCreate(tx *gorm.DB) (err error) {
	if t.ID == "" {
		t.ID = uuid.New().String()
	}
	return nil
}

// User represents a user in the system
// TenantID is set by backend logic, not by registration request
type User struct {
	ID       string `gorm:"type:uuid;primaryKey"`
	Email    string `gorm:"uniqueIndex;not null"`
	Name     string
	Password string `gorm:"not null"`
	Role     Role   `gorm:"default:MEMBER"`
	TenantID string
}

func (u *User) BeforeCreate(tx *gorm.DB) (err error) {
	if u.ID == "" {
		u.ID = uuid.New().String()
	}
	return nil
}

type Channel struct {
	ID          string `gorm:"type:uuid;primaryKey"`
	StreamID    string `gorm:"uniqueIndex;not null"`
	Name        string
	Description string
	TenantID    string
	CreatedBy   string
}

func (c *Channel) BeforeCreate(tx *gorm.DB) (err error) {
	if c.ID == "" {
		c.ID = uuid.New().String()
	}
	return nil
}
