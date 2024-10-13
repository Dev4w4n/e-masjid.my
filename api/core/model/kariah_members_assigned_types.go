package model

import (
	gorm2 "github.com/go-saas/saas/gorm"
	"gorm.io/gorm"
)

type KariahMemberAssignedType struct {
	ID                    uint   `gorm:"column:id;primaryKey" json:"id"`
	KariahMemberID        uint   `gorm:"column:kariah_member_id" json:"kariahMemberId"`
	TetapanTypesID        uint   `gorm:"column:tetapan_types_id" json:"tetapanTypesId"`
	TetapanTypesGroupName string `gorm:"column:tetapan_types_group_name" json:"tetapanTypesGroupName"`
	gorm.Model            `swaggerignore:"true"`
	gorm2.MultiTenancy    `swaggerignore:"true"`
}

func (KariahMemberAssignedType) TableName() string {
	return "kariah_members_assigned_types"
}
