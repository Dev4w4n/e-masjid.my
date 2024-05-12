package model

import (
	gorm2 "github.com/go-saas/saas/gorm"
	"gorm.io/gorm"
)

type Dependent struct {
	gorm.Model         `swaggerignore:"true"`
	Id                 int64  `gorm:"column:id;primaryKey" json:"id"`
	MemberId           int64  `gorm:"column:member_id;primaryKey" json:"-"`
	PersonId           int64  `gorm:"column:person_id" json:"-"`
	Person             Person `gorm:"foreignKey:PersonId" json:"person"`
	Member             Member `gorm:"foreignKey:MemberId" json:"-"`
	HubunganId         int    `gorm:"column:hubungan_id" json:"hubunganId"`
	gorm2.MultiTenancy `swaggerignore:"true"`
}

func (Dependent) TableName() string {
	return "khairat_dependents"
}
