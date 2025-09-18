package model

import (
	gorm2 "github.com/go-saas/saas/gorm"
	"gorm.io/gorm"
)

type Post struct {
	gorm.Model
	Title       string `json:"title"`
	Description string `json:"description"`
	Summary     string `json:"summary"`
	gorm2.MultiTenancy
}
