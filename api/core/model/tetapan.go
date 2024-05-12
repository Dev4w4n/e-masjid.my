package model

import (
	gorm2 "github.com/go-saas/saas/gorm"
	"gorm.io/gorm"
)

type Tetapan struct {
	gorm.Model         `swaggerignore:"true"`
	Kunci              string `gorm:"type:varchar(24);primary_key" json:"kunci"`
	Nilai              string `gorm:"type:varchar(256)" json:"nilai"`
	gorm2.MultiTenancy `swaggerignore:"true"`
}

func (Tetapan) TableName() string {
	return "tetapan"
}
