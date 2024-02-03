package model

type MemberTag struct {
	Id       int64  `gorm:"column:id;primaryKey" json:"id"`
	MemberId int64  `gorm:"column:member_id" json:"-"`
	TagId    int64  `gorm:"column:tags_id" json:"-"`
	Member   Member `gorm:"foreignKey:MemberId" json:"-"`
	Tag      Tag    `gorm:"foreignKey:TagId" json:"tag"`
}

func (MemberTag) TableName() string {
	return "members_tags"
}
