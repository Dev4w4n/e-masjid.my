package model

import (
	gorm2 "github.com/go-saas/saas/gorm"
	"gorm.io/gorm"
)

type Member struct {
	gorm.Model         `swaggerignore:"true"`
	Id                 int64            `gorm:"column:id;primaryKey" json:"id"`
	PersonId           int64            `gorm:"column:person_id" json:"-"`
	Person             Person           `gorm:"foreignKey:PersonId" json:"person"`
	MemberTags         []MemberTag      `gorm:"foreignKey:MemberId" json:"memberTags"`
	Dependents         []Dependent      `gorm:"foreignKey:MemberId" json:"dependents"`
	PaymentHistory     []PaymentHistory `gorm:"foreignKey:MemberId" json:"paymentHistories"`
	gorm2.MultiTenancy `swaggerignore:"true"`
}

func (Member) TableName() string {
	return "khairat_members"
}
