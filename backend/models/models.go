// models/models.go - GORM models for multi-tenant chat
package models

type Role string

const (
	RoleAdmin     Role = "ADMIN"
	RoleModerator Role = "MODERATOR"
	RoleMember    Role = "MEMBER"
	RoleGuest     Role = "GUEST"
)

type Tenant struct {
	ID      string   `gorm:"type:uuid;default:gen_random_uuid();primaryKey"`
	Name    string   `gorm:"uniqueIndex;not null"`
}

type User struct {
	ID       string `gorm:"type:uuid;default:gen_random_uuid();primaryKey"`
	Email    string `gorm:"uniqueIndex;not null"`
	Name     string
	Password string `gorm:"not null"`
	Role     Role   `gorm:"default:MEMBER"`
	TenantID string
}

type Channel struct {
	ID          string `gorm:"type:uuid;default:gen_random_uuid();primaryKey"`
	Name        string
	Description string
	TenantID    string
	CreatedBy   string
}
