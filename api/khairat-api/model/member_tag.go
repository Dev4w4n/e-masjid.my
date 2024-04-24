package model

import (
	gorm2 "github.com/go-saas/saas/gorm"
	"gorm.io/gorm"
)

type MemberTag struct {
	gorm.Model         `swaggerignore:"true"`
	Id                 int64  `gorm:"column:id;primaryKey" json:"id"`
	MemberId           int64  `gorm:"column:member_id" json:"-"`
	TagId              int64  `gorm:"column:tags_id" json:"-"`
	Member             Member `gorm:"foreignKey:MemberId" json:"-"`
	Tag                Tag    `gorm:"foreignKey:TagId" json:"tag"`
	gorm2.MultiTenancy `swaggerignore:"true"`
}

func (MemberTag) TableName() string {
	return "members_tags"
}
