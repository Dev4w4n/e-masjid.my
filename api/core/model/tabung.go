package model

import (
	gorm2 "github.com/go-saas/saas/gorm"
	"gorm.io/gorm"
)

type Tabung struct {
	gorm.Model         `swaggerignore:"true"`
	Id                 int64      `gorm:"column:id;primaryKey" json:"id"`
	Name               string     `gorm:"column:name" json:"name"`
	IsCents            bool       `gorm:"column:is_cents" json:"cents"`
	TabungTypeId       int64      `gorm:"column:tabung_types_id" json:"-"`
	TabungType         TabungType `gorm:"foreignKey:TabungTypeId" json:"tabungType"`
	gorm2.MultiTenancy `swaggerignore:"true"`
}

func (Tabung) TableName() string {
	return "tabung"
}
