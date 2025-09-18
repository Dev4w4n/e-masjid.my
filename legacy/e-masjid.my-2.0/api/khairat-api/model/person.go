package model

import (
	gorm2 "github.com/go-saas/saas/gorm"
	"gorm.io/gorm"
)

type Person struct {
	gorm.Model         `swaggerignore:"true"`
	Id                 int64  `gorm:"column:id;primaryKey" json:"id"`
	Name               string `gorm:"type:varchar(128)" json:"name"`
	IcNumber           string `gorm:"type:varchar(12)" json:"icNumber"`
	Address            string `gorm:"type:varchar(256)" json:"address"`
	Phone              string `gorm:"type:varchar(12)" json:"phone"`
	gorm2.MultiTenancy `swaggerignore:"true"`
}

func (Person) TableName() string {
	return "person"
}
