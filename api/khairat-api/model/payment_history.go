package model

import (
	gorm2 "github.com/go-saas/saas/gorm"
	"gorm.io/gorm"
)

type PaymentHistory struct {
	gorm.Model         `swaggerignore:"true"`
	Id                 int64  `gorm:"column:id;primaryKey" json:"id"`
	MemberId           int64  `gorm:"column:member_id;primaryKey" json:"-"`
	Member             Member `gorm:"foreignKey:MemberId" json:"member"`
	Amount             int64  `gorm:"column:amount" json:"amount"`
	PaymentDate        int64  `gorm:"column:payment_date" json:"paymentDate"`
	NoResit            string `gorm:"type:varchar(12)" json:"noResit"`
	gorm2.MultiTenancy `swaggerignore:"true"`
}

func (PaymentHistory) TableName() string {
	return "khairat_payment_history"
}
