package model

import (
	"time"
)

type Tenant struct {
	ID               string       `gorm:"type:varchar(36)" json:"id"`
	Name             string       `gorm:"column:name;index;size:255;" json:"name"`
	Namespace        string       `gorm:"column:namespace;index;size:255;" json:"namespace"`
	ManagerRole      string       `gorm:"column:manager_role" json:"manager_role"`
	UserRole         string       `gorm:"column:user_role" json:"user_role"`
	KeycloakClientId string       `gorm:"column:keycloak_client_id" json:"keycloak_client_id"`
	KeycloakServer   string       `gorm:"column:keycloak_server" json:"keycloak_server"`
	KeycloakJwksUrl  string       `gorm:"column:keycloak_jwks_url" json:"keycloak_jwks_url"`
	CreatedAt        int64        `gorm:"column:created_at" json:"created_at"`
	Conn             []TenantConn `gorm:"foreignKey:TenantId"`
}

// TenantConn connection string info
type TenantConn struct {
	TenantId string `gorm:"column:tenant_id;primary_key;size:36;"`
	//key of connection string
	Key string `gorm:"column:key;primary_key;size:100;"`
	//connection string
	Value     string    `gorm:"column:value;size:1000;"`
	CreatedAt time.Time `gorm:"column:created_at;index;"`
	UpdatedAt time.Time `gorm:"column:updated_at;index;"`
}
