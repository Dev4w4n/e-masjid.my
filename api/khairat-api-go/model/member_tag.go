package model

type MemberTag struct {
	MemberId int    `gorm:"column:member_id;primaryKey" json:"-"`
	TagId    int    `gorm:"column:tag_id;primaryKey" json:"-"`
	Member   Member `gorm:"foreignKey:MemberId" json:"member"`
	Tag      Tag    `gorm:"foreignKey:TagId" json:"tag"`
}

func (MemberTag) TableName() string {
	return "member_tags"
}
