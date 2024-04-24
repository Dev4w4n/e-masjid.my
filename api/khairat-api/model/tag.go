package model

import (
	gorm2 "github.com/go-saas/saas/gorm"
	"gorm.io/gorm"
)

type Tag struct {
	gorm.Model         `swaggerignore:"true"`
	Id                 int64  `gorm:"column:id;primaryKey" json:"id"`
	Name               string `gorm:"type:varchar(12)" json:"name"`
	gorm2.MultiTenancy `swaggerignore:"true"`
}

func (Tag) TableName() string {
	return "tags"
}
