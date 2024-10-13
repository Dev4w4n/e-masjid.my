package models

import (
	gorm2 "github.com/go-saas/saas/gorm"
	"gorm.io/gorm"
)

type KariahDependent struct {
	ID                 uint `gorm:"column:id;primaryKey" json:"id"`
	PersonID           uint `gorm:"column:person_id" json:"personId"`
	HubunganTypeID     uint `gorm:"column:hubungan_type_id" json:"hubunganTypeId"`
	gorm.Model         `swaggerignore:"true"`
	gorm2.MultiTenancy `swaggerignore:"true"`
}

func (KariahDependent) TableName() string {
	return "kariah_dependents"
}
