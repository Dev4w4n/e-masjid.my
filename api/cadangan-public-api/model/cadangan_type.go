package model

import (
	gorm2 "github.com/go-saas/saas/gorm"
	"gorm.io/gorm"
)

type CadanganType struct {
	gorm.Model         `swaggerignore:"true"`
	ID                 int    `gorm:"column:id;primaryKey" json:"id"`
	Name               string `gorm:"column:name" json:"name"`
	gorm2.MultiTenancy `swaggerignore:"true"`
}

func (CadanganType) TableName() string {
	return "cadangan_types"
}
