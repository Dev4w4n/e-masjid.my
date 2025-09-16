package model

import (
	gorm2 "github.com/go-saas/saas/gorm"
	"gorm.io/gorm"
)

type TabungType struct {
	gorm.Model         `swaggerignore:"true"`
	Id                 int64  `gorm:"column:id;primaryKey" json:"id"`
	Name               string `gorm:"column:name" json:"name"`
	gorm2.MultiTenancy `swaggerignore:"true"`
}

func (TabungType) TableName() string {
	return "tabung_types"
}
